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

const SUPPORT_OPENCHAT_URL = '';
const SUPPORT_CHATBOT_URL = '';
const SUPPORT_CONTACT_LABEL = '물건어디 개발자';

// 랜덤 ID 생성
function generateId(length = 12) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
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

async function shareSupportReport() {
    const report = buildSupportReport();
    const directUrl = SUPPORT_CHATBOT_URL || SUPPORT_OPENCHAT_URL;
    if (directUrl) {
        await copyText(report).catch(() => {});
        window.open(directUrl, '_blank', 'noopener');
        return 'opened';
    }
    if (navigator.share) {
        await navigator.share({
            title: '물건어디 문의',
            text: report
        });
        return 'shared';
    }
    await copyText(report);
    return 'copied';
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
        const data = await res.json();

        if (data && data.length > 0) {
            currentGroupId = data[0].group_id;
            localStorage.setItem('kc_group_id', currentGroupId);
            // 저장된 닉네임이 있으면 자동 복원 (재로그인 시 닉네임 재입력 불필요)
            if (data[0].nickname && !localStorage.getItem('kc_nickname')) {
                localStorage.setItem('kc_nickname', data[0].nickname);
            }
            recordUsageEvent('visit').catch(() => {});
            return currentGroupId;
        }

        // 신규 그룹 생성
        const newGroupId = 'GRP-' + generateId();
        const nickname = localStorage.getItem('kc_nickname') || '회원';

        // groups 테이블에 그룹 생성
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: newGroupId,
                items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
                rooms: {
                    list: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
                    zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}')
                },
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                theme: localStorage.getItem('itemFinder_theme') || 'light',
                updated_at: new Date().toISOString()
            })
        });

        // user_groups 테이블에 사용자-그룹 연결
        await fetch(`${SUPABASE_URL}/rest/v1/user_groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: currentUserId,
                group_id: newGroupId,
                nickname,
                joined_at: new Date().toISOString()
            })
        });

        currentGroupId = newGroupId;
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
    if (!currentGroupId) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: currentGroupId,
                items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
                rooms: {
                    list: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
                    zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}')
                },
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                theme: localStorage.getItem('itemFinder_theme') || 'light',
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('[Supabase] 저장 실패:', e.message);
    }
}

// 백업만 클라우드에 저장
async function syncBackupsToCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: currentGroupId,
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('[Supabase] 백업 저장 실패:', e.message);
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
        const data = await res.json();

        if (!data || data.length === 0) {
            await syncToCloud();
            return false;
        }

        const cloud = data[0];
        const cloudItems = cloud.items || [];
        const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');

        // 클라우드 + 로컬 병합 (id 기준, createdAt 최신 우선)
        const mergedMap = new Map();
        localItems.forEach(item => mergedMap.set(item.id, item));
        cloudItems.forEach(item => {
            const local = mergedMap.get(item.id);
            if (!local || new Date(item.createdAt) >= new Date(local.createdAt)) {
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
    openChatUrl: SUPPORT_OPENCHAT_URL,
    chatbotUrl: SUPPORT_CHATBOT_URL,
    buildReport: buildSupportReport,
    copyReport: () => copyText(buildSupportReport()),
    shareReport: shareSupportReport
};

// 저장된 사용자/그룹 ID 복원
const storedUserId = localStorage.getItem('kc_user_id');
if (storedUserId) currentUserId = storedUserId;

const storedGroupId = localStorage.getItem('kc_group_id');
if (storedGroupId) currentGroupId = storedGroupId;

// URL에 초대 코드가 있으면 저장해두기
const urlParams = new URLSearchParams(window.location.search);
const inviteCode = urlParams.get('invite');
if (inviteCode) {
    localStorage.setItem('pending_invite_code', inviteCode);
}
