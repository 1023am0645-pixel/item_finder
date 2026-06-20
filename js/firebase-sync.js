/**
 * Supabase Cloud Sync - 그룹 기반 공유 구조
 * - 각자 카카오 계정으로 로그인하되, 같은 그룹 데이터를 공유
 * - 초대 코드로 그룹 합류 가능
 */

const SUPABASE_URL = 'https://koddftotebkjomwmauly.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r_2SdgNd8Rl5nHexSEGxAQ_KX-zJE2I';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
};

let currentUserId = null;
let currentGroupId = null;
let lastCloudSaveStatus = null;
let lastCloudReadStatus = null;

const SUPPORT_KAKAO_CUSTOMER_CENTER_URL = 'https://pf.kakao.com/_RexmbX/chat';
const SUPPORT_CHATBOT_URL = '';
const SUPPORT_CONTACT_LABEL = '물건어디 개발자';

// 랜덤 ID 생성
function generateId(length = 12) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

function getPersonalGroupId() {
    if (!currentUserId) return null;
    return `USR-${String(currentUserId).replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

async function safeJson(res) {
    try {
        return await res.json();
    } catch(e) {
        return null;
    }
}

function getItemTime(item) {
    const timeValue = item && (item.updatedAt || item.createdAt);
    const time = timeValue ? new Date(timeValue).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
}

function mergeItems(...itemLists) {
    const mergedMap = new Map();
    itemLists.flat().filter(Boolean).forEach(item => {
        if (!item || !item.id) return;
        const existing = mergedMap.get(item.id);
        if (!existing || getItemTime(item) >= getItemTime(existing)) {
            mergedMap.set(item.id, item);
        }
    });
    return Array.from(mergedMap.values());
}

function mergeStringLists(...lists) {
    const seen = new Set();
    lists.flat().filter(Boolean).forEach(value => {
        if (typeof value === 'string' && value.trim()) seen.add(value);
    });
    return Array.from(seen);
}

function normalizeRooms(rawRooms) {
    if (!rawRooms) return { list: [], zones: {} };
    if (Array.isArray(rawRooms)) return { list: rawRooms, zones: {} };
    return {
        list: Array.isArray(rawRooms.list) ? rawRooms.list : [],
        zones: rawRooms.zones && typeof rawRooms.zones === 'object' ? rawRooms.zones : {}
    };
}

function mergeZones(...zoneObjects) {
    const merged = {};
    zoneObjects.filter(Boolean).forEach(zones => {
        Object.entries(zones).forEach(([room, list]) => {
            merged[room] = mergeStringLists(merged[room] || [], Array.isArray(list) ? list : []);
        });
    });
    return merged;
}

function mergeBackups(...backupLists) {
    const mergedMap = new Map();
    backupLists.flat().filter(Boolean).forEach(backup => {
        if (!backup) return;
        const key = backup.id || `${backup.date || ''}-${backup.count || ''}`;
        if (!key) return;
        const existing = mergedMap.get(key);
        const backupTime = backup.date ? new Date(backup.date).getTime() : 0;
        const existingTime = existing && existing.date ? new Date(existing.date).getTime() : 0;
        if (!existing || backupTime >= existingTime) mergedMap.set(key, backup);
    });
    return Array.from(mergedMap.values()).sort((a, b) => {
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        return bTime - aTime;
    });
}

function buildLocalGroupPayload(groupId) {
    return {
        group_id: groupId,
        items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
        rooms: {
            list: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
            zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}')
        },
        backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
        theme: localStorage.getItem('itemFinder_theme') || 'light',
        updated_at: new Date().toISOString()
    };
}

async function fetchGroupById(groupId) {
    if (!groupId) return null;
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${encodeURIComponent(groupId)}&select=*`,
            { headers }
        );
        const data = await safeJson(res);
        if (!res.ok) {
            lastCloudReadStatus = {
                ok: false,
                status: res.status,
                message: data && (data.message || data.code) ? `${data.code || ''} ${data.message || ''}`.trim() : `HTTP ${res.status}`
            };
            return null;
        }
        lastCloudReadStatus = { ok: true, status: res.status, message: '읽기 성공' };
        if (!Array.isArray(data) || data.length === 0) return null;
        return data[0];
    } catch(e) {
        console.warn('[Supabase] 그룹 조회 실패:', e.message);
        lastCloudReadStatus = { ok: false, status: 0, message: e.message || '읽기 실패' };
        return null;
    }
}

async function saveGroupPayload(payload) {
    const attempts = [
        {
            label: 'upsert',
            url: `${SUPABASE_URL}/rest/v1/groups?on_conflict=group_id`,
            method: 'POST',
            body: payload
        },
        {
            label: 'insert',
            url: `${SUPABASE_URL}/rest/v1/groups`,
            method: 'POST',
            body: payload
        },
        {
            label: 'patch',
            url: `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${encodeURIComponent(payload.group_id)}`,
            method: 'PATCH',
            body: {
                items: payload.items,
                rooms: payload.rooms,
                backups: payload.backups,
                theme: payload.theme,
                updated_at: payload.updated_at
            }
        }
    ];

    const errors = [];
    for (const attempt of attempts) {
        try {
            const res = await fetch(attempt.url, {
                method: attempt.method,
                headers,
                body: JSON.stringify(attempt.body)
            });
            if (res.ok) {
                lastCloudSaveStatus = {
                    ok: true,
                    method: attempt.label,
                    status: res.status,
                    message: '저장 성공'
                };
                return true;
            }
            const error = await safeJson(res);
            const message = error && (error.message || error.code)
                ? `${error.code || ''} ${error.message || ''}`.trim()
                : `HTTP ${res.status}`;
            errors.push(`${attempt.label}: ${message}`);
        } catch(e) {
            errors.push(`${attempt.label}: ${e.message || '요청 실패'}`);
        }
    }

    lastCloudSaveStatus = {
        ok: false,
        method: 'all',
        status: 0,
        message: errors.join(' / ')
    };
    console.warn('[Supabase] 그룹 저장 실패:', lastCloudSaveStatus.message);
    return false;
}

async function saveGroupPayloadLegacy(payload) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?on_conflict=group_id`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await safeJson(res);
            console.warn('[Supabase] 그룹 저장 실패:', error && (error.message || error.code) ? `${error.code || ''} ${error.message || ''}` : res.status);
            return false;
        }
        return true;
    } catch(e) {
        console.warn('[Supabase] 그룹 저장 실패:', e.message);
        return false;
    }
}

function mergeGroupPayload(targetGroupId, ...sources) {
    const local = buildLocalGroupPayload(targetGroupId);
    const normalizedRooms = sources.map(source => normalizeRooms(source && source.rooms));
    const payload = {
        group_id: targetGroupId,
        items: mergeItems(local.items, ...sources.map(source => source && Array.isArray(source.items) ? source.items : [])),
        rooms: {
            list: mergeStringLists(local.rooms.list, ...normalizedRooms.map(room => room.list)),
            zones: mergeZones(local.rooms.zones, ...normalizedRooms.map(room => room.zones))
        },
        backups: mergeBackups(local.backups, ...sources.map(source => source && Array.isArray(source.backups) ? source.backups : [])),
        theme: local.theme || (sources.find(source => source && source.theme) || {}).theme || 'light',
        updated_at: new Date().toISOString()
    };
    return payload;
}

function applyGroupPayloadToLocal(payload) {
    if (!payload) return;
    localStorage.setItem('itemFinder_data', JSON.stringify(Array.isArray(payload.items) ? payload.items : []));
    const rooms = normalizeRooms(payload.rooms);
    if (rooms.list.length > 0) localStorage.setItem('itemFinder_rooms', JSON.stringify(rooms.list));
    if (Object.keys(rooms.zones).length > 0) localStorage.setItem('itemFinder_zones', JSON.stringify(rooms.zones));
    if (Array.isArray(payload.backups) && payload.backups.length > 0) localStorage.setItem('itemFinder_backups', JSON.stringify(payload.backups));
    if (payload.theme) localStorage.setItem('itemFinder_theme', payload.theme);
}

function hasLocalCloudData() {
    const items = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
    const rooms = JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]');
    const zones = JSON.parse(localStorage.getItem('itemFinder_zones') || '{}');
    const backups = JSON.parse(localStorage.getItem('itemFinder_backups') || '[]');
    return items.length > 0 || rooms.length > 0 || Object.keys(zones).length > 0 || backups.length > 0;
}

async function ensureGroupRow(groupId, options = {}) {
    if (!groupId) return false;
    const allowEmptyCreate = options.allowEmptyCreate === true;

    try {
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${encodeURIComponent(groupId)}&select=group_id`,
            { headers }
        );
        const existing = await safeJson(checkRes);
        if (checkRes.ok && Array.isArray(existing) && existing.length > 0) return true;

        if (!allowEmptyCreate && !hasLocalCloudData()) return false;

        return await saveGroupPayload(buildLocalGroupPayload(groupId));
    } catch(e) {
        console.warn('[Supabase] 그룹 행 확인/생성 실패:', e.message);
        return false;
    }
}

async function upsertUserGroup(groupId) {
    if (!currentUserId || !groupId) return false;
    const nickname = localStorage.getItem('kc_nickname') || '회원';
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${encodeURIComponent(currentUserId)}`, {
            method: 'DELETE',
            headers
        });
        const res = await fetch(`${SUPABASE_URL}/rest/v1/user_groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: currentUserId,
                group_id: groupId,
                nickname,
                joined_at: new Date().toISOString()
            })
        });
        if (!res.ok) {
            const error = await safeJson(res);
            console.warn('[Supabase] 사용자-그룹 연결 저장 실패:', error && (error.message || error.code) ? `${error.code || ''} ${error.message || ''}` : res.status);
        }
        return res.ok;
    } catch(e) {
        console.warn('[Supabase] 사용자-그룹 연결 저장 실패:', e.message);
        return false;
    }
}

async function chooseBestGroupMapping(groupRows) {
    if (!Array.isArray(groupRows) || groupRows.length === 0) return null;
    if (groupRows.length === 1) return groupRows[0];

    const scoredRows = [];
    for (const row of groupRows) {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${encodeURIComponent(row.group_id)}&select=group_id,items,updated_at`,
                { headers }
            );
            const data = await safeJson(res);
            const group = res.ok && Array.isArray(data) && data.length > 0 ? data[0] : null;
            const itemCount = group && Array.isArray(group.items) ? group.items.length : 0;
            const updatedAt = group && group.updated_at ? new Date(group.updated_at).getTime() : 0;
            scoredRows.push({
                row,
                itemCount,
                updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0
            });
        } catch(e) {
            scoredRows.push({ row, itemCount: 0, updatedAt: 0 });
        }
    }

    scoredRows.sort((a, b) => {
        if (b.itemCount !== a.itemCount) return b.itemCount - a.itemCount;
        return b.updatedAt - a.updatedAt;
    });
    return scoredRows[0].row;
}

function getCurrentAppVersion() {
    if (window.ITEM_FINDER_APP_VERSION) return window.ITEM_FINDER_APP_VERSION;
    const scriptTag = document.querySelector('script[src*="js/script.js"], script[src*="js/rooms.js"], script[src*="js/backup.js"]');
    if (!scriptTag) return 'unknown';
    try {
        const url = new URL(scriptTag.getAttribute('src'), window.location.href);
        const version = url.searchParams.get('v');
        return version ? `v${version}` : 'unknown';
    } catch(e) {
        return 'unknown';
    }
}

function getSupportContext() {
    const items = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
    const rooms = JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]');
    const zones = JSON.parse(localStorage.getItem('itemFinder_zones') || '{}');
    return {
        nickname: localStorage.getItem('kc_nickname') || '회원',
        userId: localStorage.getItem('kc_user_id') || currentUserId || '',
        groupId: localStorage.getItem('kc_group_id') || currentGroupId || '',
        appVersion: getCurrentAppVersion(),
        page: window.location.pathname.split('/').pop() || 'index.html',
        itemCount: Array.isArray(items) ? items.length : 0,
        roomCount: Array.isArray(rooms) ? rooms.length : 0,
        zoneCount: zones && typeof zones === 'object' ? Object.values(zones).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) : 0,
        theme: localStorage.getItem('itemFinder_theme') || 'light',
        userAgent: navigator.userAgent || '',
        createdAt: new Date().toLocaleString('ko-KR')
    };
}

function buildSupportReport() {
    const ctx = getSupportContext();
    return [
        '[물건어디 문의]',
        '',
        '1. 문의 종류: 오류 / 개선 요청 / 사용 질문 중 선택',
        '2. 어떤 화면에서 발생했나요?:',
        '3. 어떤 문제가 있었나요?:',
        '4. 가능하면 재현 순서:',
        '',
        '[자동 포함 정보]',
        `- 닉네임: ${ctx.nickname}`,
        `- 사용자 ID: ${ctx.userId || '없음'}`,
        `- 그룹 ID: ${ctx.groupId || '없음'}`,
        `- 앱 버전: ${ctx.appVersion}`,
        `- 현재 화면: ${ctx.page}`,
        `- 물건/방/구역 수: ${ctx.itemCount}개 / ${ctx.roomCount}개 / ${ctx.zoneCount}개`,
        `- 테마: ${ctx.theme}`,
        `- 작성 시각: ${ctx.createdAt}`,
        `- 기기 정보: ${ctx.userAgent}`
    ].join('\n');
}

async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
}

async function openSupportChannel() {
    const directUrl = SUPPORT_CHATBOT_URL || SUPPORT_KAKAO_CUSTOMER_CENTER_URL;
    if (directUrl) {
        window.open(directUrl, '_blank', 'noopener');
        return 'opened';
    }
    return 'missing-url';
}

async function recordUsageEvent(eventType = 'visit', options = {}) {
    if (!currentUserId && localStorage.getItem('kc_user_id')) currentUserId = localStorage.getItem('kc_user_id');
    if (!currentGroupId && localStorage.getItem('kc_group_id')) currentGroupId = localStorage.getItem('kc_group_id');
    if (!currentUserId) return false;

    const throttleKey = `itemFinder_usage_${eventType}`;
    const now = Date.now();
    const lastAt = Number(sessionStorage.getItem(throttleKey) || 0);
    if (!options.force && now - lastAt < 30 * 60 * 1000) return true;
    sessionStorage.setItem(throttleKey, String(now));

    const ctx = getSupportContext();
    const eventHeaders = { ...headers, Prefer: 'return=minimal' };
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/usage_events`, {
            method: 'POST',
            headers: eventHeaders,
            body: JSON.stringify({
                event_type: eventType,
                user_id: ctx.userId,
                nickname: ctx.nickname,
                group_id: ctx.groupId || null,
                app_version: ctx.appVersion,
                page: ctx.page,
                item_count: ctx.itemCount,
                room_count: ctx.roomCount,
                zone_count: ctx.zoneCount,
                user_agent: ctx.userAgent,
                created_at: new Date().toISOString()
            })
        });
        return res.ok;
    } catch(e) {
        console.warn('[Supabase] 사용 기록 저장 실패:', e.message);
        return false;
    }
}

// 사용자 ID 설정 (카카오 로그인 후 호출)
function setCloudUserId(kakaoUserId) {
    currentUserId = String(kakaoUserId);
    localStorage.setItem('kc_user_id', currentUserId);
}

// 사용자의 그룹 ID 조회 또는 신규 생성
async function getOrCreateGroup() {
    if (!currentUserId) return null;

    try {
        // 초대 코드 우선 처리 (기존 그룹보다 먼저 확인)
        const pendingInvite = localStorage.getItem('pending_invite_code');
        if (pendingInvite) {
            const joined = await joinGroup(pendingInvite);
            if (joined) {
                localStorage.removeItem('pending_invite_code');
                return currentGroupId;
            }
            localStorage.removeItem('pending_invite_code');
        }

        // 기존 그룹 확인
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${currentUserId}&select=group_id,nickname`,
            { headers }
        );
        const data = await safeJson(res);

        if (res.ok && Array.isArray(data) && data.length > 0) {
            const bestGroup = await chooseBestGroupMapping(data);
            currentGroupId = bestGroup.group_id;
            localStorage.setItem('kc_group_id', currentGroupId);
            const existingGroup = await fetchGroupById(currentGroupId);
            if (!existingGroup && hasLocalCloudData()) {
                await saveGroupPayload(buildLocalGroupPayload(currentGroupId));
            }
            // 저장된 닉네임이 있으면 자동 복원 (재로그인 시 닉네임 재입력 불필요)
            if (bestGroup.nickname && !localStorage.getItem('kc_nickname')) {
                localStorage.setItem('kc_nickname', bestGroup.nickname);
            }
            recordUsageEvent('visit').catch(() => {});
            return currentGroupId;
        }

        if (!res.ok) {
            console.warn('[Supabase] 그룹 연결 조회 실패:', data && (data.message || data.code) ? `${data.code || ''} ${data.message || ''}` : res.status);
        }

        // 매핑이 없거나 조회가 막힌 경우에도 같은 카카오 계정은 같은 개인 그룹을 보게 한다.
        // 예전 버전에서 기기별 임시 그룹이 생겼다면 고정 개인 그룹으로 병합한다.
        const previousGroupId = currentGroupId || localStorage.getItem('kc_group_id') || null;
        const fallbackGroupId = getPersonalGroupId();
        if (!fallbackGroupId) return null;
        const previousGroup = previousGroupId && previousGroupId !== fallbackGroupId ? await fetchGroupById(previousGroupId) : null;
        const fallbackGroup = await fetchGroupById(fallbackGroupId);
        const mergedPayload = mergeGroupPayload(fallbackGroupId, fallbackGroup, previousGroup);
        if (hasLocalCloudData() || fallbackGroup || previousGroup) {
            await saveGroupPayload(mergedPayload);
            applyGroupPayloadToLocal(mergedPayload);
        } else {
            await ensureGroupRow(fallbackGroupId, { allowEmptyCreate: false });
        }
        await upsertUserGroup(fallbackGroupId);

        currentGroupId = fallbackGroupId;
        localStorage.setItem('kc_group_id', currentGroupId);
        recordUsageEvent('signup', { force: true }).catch(() => {});
        return currentGroupId;

    } catch (e) {
        console.warn('[Supabase] 그룹 조회/생성 실패:', e.message);
        return null;
    }
}

// 초대 코드로 그룹 합류
async function joinGroup(inviteCode) {
    if (!currentUserId) return false;
    try {
        // 초대 코드 조회
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/invite_codes?code=eq.${inviteCode}&select=group_id,expires_at`,
            { headers }
        );
        const data = await res.json();

        if (!data || data.length === 0) {
            alert('유효하지 않은 초대 코드예요.');
            return false;
        }

        const { group_id, expires_at } = data[0];
        if (new Date(expires_at) < new Date()) {
            alert('만료된 초대 코드예요. 새 초대 코드를 받아주세요.');
            return false;
        }

        const nickname = localStorage.getItem('kc_nickname') || '회원';

        // 기존 그룹 연결 삭제 후 새 그룹으로 연결
        await fetch(`${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${currentUserId}`, {
            method: 'DELETE',
            headers
        });

        await fetch(`${SUPABASE_URL}/rest/v1/user_groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: currentUserId,
                group_id,
                nickname,
                joined_at: new Date().toISOString()
            })
        });

        currentGroupId = group_id;
        localStorage.setItem('kc_group_id', currentGroupId);
        recordUsageEvent('join_group', { force: true }).catch(() => {});
        return true;

    } catch (e) {
        console.warn('[Supabase] 그룹 합류 실패:', e.message);
        return false;
    }
}

// 초대 코드 생성
async function createInviteCode() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return null;

    try {
        const code = generateId(8);
        await fetch(`${SUPABASE_URL}/rest/v1/invite_codes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                code,
                group_id: currentGroupId,
                created_by: currentUserId,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
        });
        recordUsageEvent('create_invite').catch(() => {});
        return code;
    } catch (e) {
        console.warn('[Supabase] 초대 코드 생성 실패:', e.message);
        return null;
    }
}

// 그룹 데이터를 클라우드에 저장
async function syncToCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return false;

    try {
        return await saveGroupPayload(buildLocalGroupPayload(currentGroupId));
    } catch (e) {
        console.warn('[Supabase] 저장 실패:', e.message);
        return false;
    }
}

// 백업만 클라우드에 저장
async function syncBackupsToCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return false;

    try {
        const existing = await fetchGroupById(currentGroupId);
        const payload = mergeGroupPayload(currentGroupId, existing);
        payload.backups = JSON.parse(localStorage.getItem('itemFinder_backups') || '[]');
        payload.updated_at = new Date().toISOString();
        return await saveGroupPayload(payload);
    } catch (e) {
        console.warn('[Supabase] 백업 저장 실패:', e.message);
        return false;
    }
}

// 클라우드에서 그룹 데이터 불러오기
async function loadFromCloud() {
    // 항상 Supabase에서 최신 그룹ID 확인 (캐시 무시)
    await getOrCreateGroup();
    if (!currentGroupId) return false;

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${currentGroupId}&select=*`,
            { headers }
        );
        const data = await safeJson(res);

        if (!res.ok || !data || data.length === 0) {
            await syncToCloud();
            return false;
        }

        const cloud = data[0];
        const cloudItems = cloud.items || [];
        const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
        const cloudItemsJson = JSON.stringify(cloudItems);

        // 클라우드 + 로컬 병합 (id 기준, updatedAt/createdAt 최신 우선)
        const mergedMap = new Map();
        localItems.forEach(item => mergedMap.set(item.id, item));
        cloudItems.forEach(item => {
            const local = mergedMap.get(item.id);
            if (!local || getItemTime(item) >= getItemTime(local)) {
                mergedMap.set(item.id, item);
            }
        });
        const merged = Array.from(mergedMap.values());
        localStorage.setItem('itemFinder_data', JSON.stringify(merged));

        // 방 목록 + 구역 정의 - 클라우드 우선
        const cloudRoomsRaw = cloud.rooms;
        if (cloudRoomsRaw) {
            if (Array.isArray(cloudRoomsRaw)) {
                // 구버전 포맷 (rooms가 배열)
                if (cloudRoomsRaw.length > 0) localStorage.setItem('itemFinder_rooms', JSON.stringify(cloudRoomsRaw));
            } else {
                // 신버전 포맷 (rooms가 {list, zones} 객체)
                if (cloudRoomsRaw.list && cloudRoomsRaw.list.length > 0) localStorage.setItem('itemFinder_rooms', JSON.stringify(cloudRoomsRaw.list));
                if (cloudRoomsRaw.zones && Object.keys(cloudRoomsRaw.zones).length > 0) localStorage.setItem('itemFinder_zones', JSON.stringify(cloudRoomsRaw.zones));
            }
        }

        // 테마
        if (cloud.theme) localStorage.setItem('itemFinder_theme', cloud.theme);

        // 백업 - 클라우드 우선
        const cloudBackups = cloud.backups || [];
        if (cloudBackups.length > 0) {
            localStorage.setItem('itemFinder_backups', JSON.stringify(cloudBackups));
        }

        if (JSON.stringify(merged) !== cloudItemsJson) {
            await syncToCloud();
        }

        return true;

    } catch (e) {
        console.warn('[Supabase] 불러오기 실패:', e.message);
        return false;
    }
}

// 닉네임을 Supabase user_groups에 저장
async function updateNicknameInCloud(nickname) {
    if (!currentUserId) return;
    try {
        await fetch(
            `${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${currentUserId}`,
            { method: 'PATCH', headers, body: JSON.stringify({ nickname }) }
        );
    } catch (e) {
        console.warn('[Supabase] 닉네임 업데이트 실패:', e.message);
    }
}

async function getCloudSyncDiagnostics() {
    if (window.restoreKakaoCloudIdentity) {
        await restoreKakaoCloudIdentity({ force: true }).catch(() => {});
    } else {
        await getOrCreateGroup().catch(() => {});
    }

    const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
    const localRooms = JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]');
    const localZones = JSON.parse(localStorage.getItem('itemFinder_zones') || '{}');
    const personalGroupId = getPersonalGroupId();
    let mappings = [];
    let groups = [];

    if (currentUserId) {
        try {
            const mappingRes = await fetch(
                `${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${encodeURIComponent(currentUserId)}&select=group_id,nickname,joined_at`,
                { headers }
            );
            const mappingData = await safeJson(mappingRes);
            mappings = mappingRes.ok && Array.isArray(mappingData) ? mappingData : [];
        } catch(e) {
            mappings = [];
        }
    }

    const groupIds = Array.from(new Set([
        currentGroupId,
        localStorage.getItem('kc_group_id'),
        personalGroupId,
        ...mappings.map(row => row.group_id)
    ].filter(Boolean)));

    if (currentGroupId && hasLocalCloudData()) {
        const currentGroup = await fetchGroupById(currentGroupId);
        if (!currentGroup) {
            await saveGroupPayload(buildLocalGroupPayload(currentGroupId));
        }
    }

    for (const groupId of groupIds) {
        const group = await fetchGroupById(groupId);
        groups.push({
            groupId,
            exists: !!group,
            itemCount: group && Array.isArray(group.items) ? group.items.length : 0,
            roomCount: group ? normalizeRooms(group.rooms).list.length : 0,
            zoneCount: group ? Object.values(normalizeRooms(group.rooms).zones).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) : 0,
            updatedAt: group && group.updated_at ? group.updated_at : ''
        });
    }

    return {
        userId: currentUserId || localStorage.getItem('kc_user_id') || '',
        currentGroupId: currentGroupId || '',
        storedGroupId: localStorage.getItem('kc_group_id') || '',
        personalGroupId: personalGroupId || '',
        localItemCount: Array.isArray(localItems) ? localItems.length : 0,
        localRoomCount: Array.isArray(localRooms) ? localRooms.length : 0,
        localZoneCount: localZones && typeof localZones === 'object' ? Object.values(localZones).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) : 0,
        lastRead: lastCloudReadStatus,
        lastSave: lastCloudSaveStatus,
        mappings,
        groups
    };
}

function formatCloudSyncDiagnostics(diag) {
    const groupLines = (diag.groups || []).map(group =>
        `- ${group.groupId}: ${group.exists ? `서버 물건 ${group.itemCount}개 / 방 ${group.roomCount}개 / 구역 ${group.zoneCount}개 / ${group.updatedAt || '날짜 없음'}` : '서버에 없음'}`
    ).join('\n') || '- 확인된 서버 그룹 없음';
    return [
        '[동기화 상태]',
        `카카오 사용자 ID: ${diag.userId || '없음'}`,
        `현재 그룹 ID: ${diag.currentGroupId || '없음'}`,
        `저장된 그룹 ID: ${diag.storedGroupId || '없음'}`,
        `고정 개인 그룹 ID: ${diag.personalGroupId || '없음'}`,
        '',
        `[이 기기 로컬 데이터]`,
        `물건 ${diag.localItemCount}개 / 방 ${diag.localRoomCount}개 / 구역 ${diag.localZoneCount}개`,
        '',
        '[서버 그룹 데이터]',
        groupLines,
        '',
        '[최근 서버 통신 결과]',
        `읽기: ${diag.lastRead ? (diag.lastRead.ok ? '성공' : '실패') + ` (${diag.lastRead.message})` : '기록 없음'}`,
        `저장: ${diag.lastSave ? (diag.lastSave.ok ? '성공' : '실패') + ` (${diag.lastSave.message})` : '기록 없음'}`
    ].join('\n');
}

window.getCloudSyncDiagnostics = getCloudSyncDiagnostics;
window.formatCloudSyncDiagnostics = formatCloudSyncDiagnostics;

// 전역 노출
window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
window.setCloudUserId = setCloudUserId;
window.syncBackupsToCloud = syncBackupsToCloud;
window.createInviteCode = createInviteCode;
window.joinGroup = joinGroup;
window.getOrCreateGroup = getOrCreateGroup;
window.updateNicknameInCloud = updateNicknameInCloud;
window.recordUsageEvent = recordUsageEvent;
window.itemFinderSupport = {
    contactLabel: SUPPORT_CONTACT_LABEL,
    kakaoCustomerCenterUrl: SUPPORT_KAKAO_CUSTOMER_CENTER_URL,
    chatbotUrl: SUPPORT_CHATBOT_URL,
    buildReport: buildSupportReport,
    openChannel: openSupportChannel
};

// 저장된 사용자/그룹 ID 복원
const storedUserId = localStorage.getItem('kc_user_id');
if (storedUserId) currentUserId = storedUserId;

const storedGroupId = localStorage.getItem('kc_group_id');
if (storedGroupId) currentGroupId = storedGroupId;

async function restoreKakaoCloudIdentity(options = {}) {
    const force = options.force === true;
    if ((!force && currentUserId) || localStorage.getItem('kc_logged_in') !== 'true') return false;
    if (!window.Kakao || !window.Kakao.API) return false;

    try {
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init('aba8aed2de3168350dd5fdf66f95820c');
        }

        const profile = await new Promise((resolve, reject) => {
            window.Kakao.API.request({
                url: '/v2/user/me',
                success: resolve,
                fail: reject
            });
        });

        if (!profile || !profile.id) return false;
        const previousUserId = currentUserId;
        if (previousUserId && String(previousUserId) !== String(profile.id)) {
            currentGroupId = null;
            localStorage.removeItem('kc_group_id');
        }
        setCloudUserId(profile.id);
        if (profile.properties && profile.properties.nickname && !localStorage.getItem('kc_nickname')) {
            localStorage.setItem('kc_nickname', profile.properties.nickname);
        }
        await getOrCreateGroup();
        if (localStorage.getItem('kc_nickname')) {
            await updateNicknameInCloud(localStorage.getItem('kc_nickname'));
        }
        await recordUsageEvent('visit', { force: true });
        return true;
    } catch(e) {
        console.warn('[Supabase] 카카오 사용자 ID 복원 실패:', e.message || e);
        return false;
    }
}

window.restoreKakaoCloudIdentity = restoreKakaoCloudIdentity;

if (localStorage.getItem('kc_logged_in') === 'true' && !currentUserId) {
    setTimeout(() => {
        restoreKakaoCloudIdentity().catch(() => {});
    }, 500);
}

// URL에 초대 코드가 있으면 저장해두기
const urlParams = new URLSearchParams(window.location.search);
const inviteCode = urlParams.get('invite');
if (inviteCode) {
    localStorage.setItem('pending_invite_code', inviteCode);
}
