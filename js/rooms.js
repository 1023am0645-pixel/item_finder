document.addEventListener('DOMContentLoaded', () => {
    window.ITEM_FINDER_APP_VERSION = window.ITEM_FINDER_APP_VERSION || 'v31';
    window.ITEM_FINDER_APP_RELEASE_DATE = window.ITEM_FINDER_APP_RELEASE_DATE || '2026.05.24.';
    if (window.recordUsageEvent) window.recordUsageEvent('visit').catch(() => {});

    // 새로고침 버튼
    const btnSyncRefresh = document.getElementById('btnSyncRefresh');
    if (btnSyncRefresh) {
        btnSyncRefresh.addEventListener('click', async () => {
            const icon = btnSyncRefresh.querySelector('svg') || btnSyncRefresh.querySelector('i');
            if (icon) {
                icon.style.transition = 'transform 0.6s';
                icon.style.transform = 'rotate(360deg)';
            }
            if (window.loadFromCloud) {
                await window.loadFromCloud().catch(() => {});
            }
            setTimeout(() => window.location.reload(), 800);
        });
    }

    // Theme logic reuse
    const themeBtns = document.querySelectorAll('.theme-btn');
    const savedTheme = localStorage.getItem('itemFinder_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('itemFinder_theme', theme);
            setTimeout(updateAppTitle, 50);
            setTimeout(applyFloatingButtonTheme, 50);
        });
    });

    // Subtle theme for floating buttons
    const applyFloatingButtonTheme = () => {
        const btns = document.querySelectorAll('.floating-action-btn');
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        btns.forEach(btn => {
            if(theme === 'dark') {
               btn.style.background = 'rgba(255,255,255,0.1)';
               btn.style.borderColor = 'rgba(255,255,255,0.1)';
               btn.style.color = '#fff';
            } else {
               btn.style.background = 'rgba(255,255,255,0.85)';
               btn.style.borderColor = 'rgba(0,0,0,0.05)';
               btn.style.color = 'var(--text-muted)';
            }
        });
    };
    applyFloatingButtonTheme();

    function escapeHTML(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    // Update title logic
    function updateAppTitle() {
        const titles = document.querySelectorAll('.app-main-title');
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        
        let qColor = '#ff8c42';
        if(theme === 'dark') qColor = '#fef08a'; // Pastel yellow for dark
        else if(theme === 'alps') qColor = '#0ea5e9';
        else if(theme === 'positano') qColor = '#f59e0b';

        titles.forEach(t => {
            t.innerHTML = `<span class="rooms-title-brand">Home item list</span>`;
        });
        
        // Update search bar wrapper color
        const searchWrapper = document.getElementById('globalSearchWrapper');
        if(searchWrapper) {
            searchWrapper.style.background = 'var(--bg-color)';
            if(theme === 'dark') searchWrapper.style.borderColor = 'rgba(254, 240, 138, 0.3)';
            else searchWrapper.style.borderColor = 'var(--border-color)';
        }
        
        if(window.lucide) lucide.createIcons();
    }
    updateAppTitle();

    // Settings overlay on rooms page
    const btnOpenRoomsSettings = document.getElementById('btnOpenRoomsSettings');
    const roomsSettingsOverlay = document.getElementById('roomsSettingsOverlay');
    const btnCloseRoomsSettings = document.getElementById('btnCloseRoomsSettings');
    const roomsSettingsNicknameDisplay = document.getElementById('roomsSettingsNicknameDisplay');
    const btnToggleRoomsAccountActions = document.getElementById('btnToggleRoomsAccountActions');
    const roomsAccountActionList = document.getElementById('roomsAccountActionList');
    const btnRoomsEditNickname = document.getElementById('btnRoomsEditNickname');
    const btnRoomsInviteFamily = document.getElementById('btnRoomsInviteFamily');
    const btnRoomsJoinGroup = document.getElementById('btnRoomsJoinGroup');
    const btnRoomsLogout = document.getElementById('btnRoomsLogout');
    const btnRoomsSettingsRefresh = document.getElementById('btnRoomsSettingsRefresh');
    const btnRoomsAppUpdate = document.getElementById('btnRoomsAppUpdate');
    const btnRoomsOpenUpdateDetails = document.getElementById('btnRoomsOpenUpdateDetails');
    const roomsUpdateDetailsPanel = document.getElementById('roomsUpdateDetailsPanel');
    const btnRoomsShareSupportReport = document.getElementById('btnRoomsShareSupportReport');

    function openRoomsSettings() {
        if (!roomsSettingsOverlay) return;
        if (roomsSettingsNicknameDisplay) roomsSettingsNicknameDisplay.textContent = localStorage.getItem('kc_nickname') || '회원';
        roomsSettingsOverlay.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    }

    async function reloadForAppUpdate() {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.update().catch(() => {})));
            }
        } catch(e) {}
        window.location.reload();
    }

    function ensureKakaoReady() {
        if (!window.Kakao) return false;
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init('aba8aed2de3168350dd5fdf66f95820c');
        }
        return window.Kakao.isInitialized();
    }

    async function fallbackShareInvite(message, inviteUrl) {
        if (navigator.share) {
            await navigator.share({
                title: '물건어디 가족 초대',
                text: message,
                url: inviteUrl
            });
            return;
        }
        await navigator.clipboard.writeText(message);
        showToast('카카오톡 공유가 어려워 초대 메시지를 복사했어요.');
    }

    async function shareInviteToKakao(code, myNick) {
        const inviteUrl = `https://1023am0645-pixel.github.io/item_finder/?invite=${code}`;
        const message = `${myNick}님이 '물건어디' 앱에 초대했어요!\n\n가족과 같은 물건 목록을 함께 관리해요.\n\n가족 초대코드: ${code}\n초대 링크: ${inviteUrl}`;
        const imageUrl = 'https://1023am0645-pixel.github.io/item_finder/assets/hero.png';

        if (ensureKakaoReady() && window.Kakao.Link && window.Kakao.Link.sendDefault) {
            window.Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: '물건어디 가족 초대',
                    description: `가족 초대코드: ${code}`,
                    imageUrl,
                    link: {
                        mobileWebUrl: inviteUrl,
                        webUrl: inviteUrl
                    }
                },
                buttons: [
                    {
                        title: '물건어디 열기',
                        link: {
                            mobileWebUrl: inviteUrl,
                            webUrl: inviteUrl
                        }
                    }
                ]
            });
            showToast('카카오톡 공유창을 열었어요.');
            return;
        }

        if (ensureKakaoReady() && window.Kakao.Share && window.Kakao.Share.sendDefault) {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '물건어디 가족 초대',
                    description: `가족 초대코드: ${code}`,
                    imageUrl,
                    link: {
                        mobileWebUrl: inviteUrl,
                        webUrl: inviteUrl
                    }
                },
                buttons: [
                    {
                        title: '물건어디 열기',
                        link: {
                            mobileWebUrl: inviteUrl,
                            webUrl: inviteUrl
                        }
                    }
                ]
            });
            showToast('카카오톡 공유창을 열었어요.');
            return;
        }

        await fallbackShareInvite(message, inviteUrl);
    }

    function openNicknameDialog(currentNick, onSave) {
        const overlay = document.createElement('div');
        overlay.className = 'nickname-dialog-overlay';
        overlay.innerHTML = `
            <div class="nickname-dialog" role="dialog" aria-modal="true" aria-labelledby="nicknameDialogTitle">
                <button type="button" class="nickname-dialog-close" aria-label="닫기"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
                <div class="nickname-dialog-icon"><i data-lucide="sparkles" style="width:22px;height:22px;"></i></div>
                <h3 id="nicknameDialogTitle">닉네임 수정</h3>
                <p>앱에서 보여질 이름을 입력해주세요.</p>
                <input type="text" id="nicknameDialogInput" maxlength="16" value="${escapeHTML(currentNick)}" placeholder="닉네임">
                <div class="nickname-dialog-actions">
                    <button type="button" class="nickname-dialog-cancel">취소</button>
                    <button type="button" class="nickname-dialog-save">저장</button>
                </div>
            </div>
        `;

        const close = () => {
            document.removeEventListener('keydown', handleKeydown);
            overlay.remove();
        };
        const save = () => {
            const input = overlay.querySelector('#nicknameDialogInput');
            const nextNick = input.value.trim();
            if (!nextNick) {
                input.focus();
                return;
            }
            onSave(nextNick);
            close();
        };
        const handleKeydown = event => {
            if (event.key === 'Escape') close();
            if (event.key === 'Enter') save();
        };

        overlay.addEventListener('click', event => {
            if (event.target === overlay) close();
        });
        overlay.querySelector('.nickname-dialog-close').addEventListener('click', close);
        overlay.querySelector('.nickname-dialog-cancel').addEventListener('click', close);
        overlay.querySelector('.nickname-dialog-save').addEventListener('click', save);
        document.addEventListener('keydown', handleKeydown);
        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            const input = overlay.querySelector('#nicknameDialogInput');
            input.focus();
            input.select();
        }, 30);
    }

    if (btnOpenRoomsSettings) btnOpenRoomsSettings.addEventListener('click', openRoomsSettings);
    if (btnCloseRoomsSettings) btnCloseRoomsSettings.addEventListener('click', () => { roomsSettingsOverlay.style.display = 'none'; });
    if (btnToggleRoomsAccountActions && roomsAccountActionList) {
        btnToggleRoomsAccountActions.addEventListener('click', () => {
            roomsAccountActionList.style.display = roomsAccountActionList.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    if (btnRoomsEditNickname) {
        btnRoomsEditNickname.addEventListener('click', () => {
            openNicknameDialog(localStorage.getItem('kc_nickname') || '', nick => {
                localStorage.setItem('kc_nickname', nick);
                if (roomsSettingsNicknameDisplay) roomsSettingsNicknameDisplay.textContent = nick;
                if (window.updateNicknameInCloud) window.updateNicknameInCloud(nick).catch(() => {});
                showToast('닉네임이 변경되었습니다.');
            });
        });
    }
    if (btnRoomsInviteFamily) {
        btnRoomsInviteFamily.addEventListener('click', async () => {
            btnRoomsInviteFamily.disabled = true;
            btnRoomsInviteFamily.textContent = '초대 코드 생성 중...';
            const myNick = localStorage.getItem('kc_nickname') || '가족';
            const code = window.createInviteCode ? await window.createInviteCode() : null;
            btnRoomsInviteFamily.disabled = false;
            btnRoomsInviteFamily.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#000;"><path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.83 5.37 4.6 6.78-.3.97-1.12 3.65-1.14 3.75-.03.14.05.21.16.2.14-.02 3.86-2.58 5.34-3.6.35.04.7.07 1.04.07 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg> 카카오톡으로 가족 초대하기`;
            if (!code) { showToast('초대 코드 생성에 실패했어요.'); return; }
            try {
                await shareInviteToKakao(code, myNick);
            } catch(e) {
                showToast('초대 공유를 완료하지 못했어요.');
            }
        });
    }
    if (btnRoomsJoinGroup) {
        btnRoomsJoinGroup.addEventListener('click', async () => {
            const code = prompt('받은 초대 코드를 입력해주세요:');
            if (!code || !code.trim()) return;
            const joined = window.joinGroup ? await window.joinGroup(code.trim().toUpperCase()) : false;
            if (joined) {
                showToast('그룹에 합류했어요. 데이터를 불러올게요.');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast('초대 코드가 유효하지 않아요.');
            }
        });
    }
    if (btnRoomsLogout) {
        btnRoomsLogout.addEventListener('click', () => {
            localStorage.removeItem('kc_logged_in');
            localStorage.removeItem('kc_nickname');
            window.location.href = 'index.html';
        });
    }
    document.querySelectorAll('.rooms-theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('itemFinder_theme', theme);
            updateAppTitle();
            applyFloatingButtonTheme();
        });
    });
    if (btnRoomsSettingsRefresh) {
        btnRoomsSettingsRefresh.addEventListener('click', async () => {
            btnRoomsSettingsRefresh.textContent = '불러오는 중...';
            if (window.loadFromCloud) await window.loadFromCloud().catch(() => {});
            window.location.reload();
        });
    }
    if (btnRoomsAppUpdate) btnRoomsAppUpdate.addEventListener('click', reloadForAppUpdate);
    if (btnRoomsOpenUpdateDetails) {
        btnRoomsOpenUpdateDetails.addEventListener('click', () => {
            if (!roomsUpdateDetailsPanel) return;
            roomsUpdateDetailsPanel.style.display = roomsUpdateDetailsPanel.style.display === 'block' ? 'none' : 'block';
        });
    }
    if (btnRoomsShareSupportReport) {
        btnRoomsShareSupportReport.addEventListener('click', async () => {
            if (!window.itemFinderSupport) return;
            const originalHTML = btnRoomsShareSupportReport.innerHTML;
            btnRoomsShareSupportReport.disabled = true;
            btnRoomsShareSupportReport.textContent = '고객센터 여는 중...';
            try {
                const result = await window.itemFinderSupport.openChannel();
                if (result === 'opened') {
                    showToast('카카오톡 고객센터를 열었어요.');
                    if (window.recordUsageEvent) window.recordUsageEvent('support_open', { force: true }).catch(() => {});
                } else {
                    showToast('카카오톡 고객센터 링크가 아직 설정되지 않았어요.');
                }
            } catch(e) {
                showToast('카카오톡 고객센터를 열지 못했어요.');
            } finally {
                btnRoomsShareSupportReport.disabled = false;
                btnRoomsShareSupportReport.innerHTML = originalHTML;
                if (window.lucide) lucide.createIcons();
            }
        });
    }
    document.querySelectorAll('.rooms-manual-topic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            if (!content || !content.classList.contains('rooms-manual-topic-content')) return;
            const isOpen = content.style.display === 'block';
            content.style.display = isOpen ? 'none' : 'block';
            const icon = btn.querySelector('i[data-lucide]');
            if (icon) icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
            if (window.lucide) lucide.createIcons();
        });
    });

    // Toast UI
    function showToast(msg) {
        let container = document.getElementById('toastContainer');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="check-circle" style="width:18px;height:18px;color:#22c55e;vertical-align:middle;margin-right:6px;"></i><span style="vertical-align:middle;">${msg}</span>`;
        container.appendChild(toast);
        if(window.lucide) lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Backup Logic
    const btnBackupTop = document.getElementById('btnBackupTop');
    if (btnBackupTop) {
        btnBackupTop.addEventListener('click', () => {
            const currentData = localStorage.getItem('itemFinder_data') || '[]';
            const parsed = JSON.parse(currentData);
            if(parsed.length === 0) {
                showToast('백업할 데이터가 없습니다.');
                return;
            }
            
            let backups = JSON.parse(localStorage.getItem('itemFinder_backups')) || [];
            const newBackup = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                count: parsed.length,
                data: parsed,
                authorNickname: localStorage.getItem('kc_nickname') || '회원',
                authorUserId: localStorage.getItem('kc_user_id') || '',
                zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}'),
                rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]')
            };

            backups.unshift(newBackup);
            localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
            if(window.syncBackupsToCloud) syncBackupsToCloud();
            showToast('현재 물건 상태가 성공적으로 백업되었습니다!');
            
            if(window.lucide) {
                btnBackupTop.innerHTML = '<i data-lucide="check-circle" style="color:#22c55e;width:22px;height:22px;"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    btnBackupTop.innerHTML = '<i data-lucide="save" style="width:22px;height:22px;"></i>';
                    lucide.createIcons();
                }, 2000);
            }
        });
    }

    // Content logic
    const allRoomsContainer = document.getElementById('allRoomsContainer');
    let savedItems = JSON.parse(localStorage.getItem('itemFinder_data')) || [];
    
    // Default rooms from index
    let defaultRooms = JSON.parse(localStorage.getItem('itemFinder_rooms'));
    if (!defaultRooms || !Array.isArray(defaultRooms) || defaultRooms.length === 0) {
        defaultRooms = ["현관펜트리", "신발장", "공용욕실", "거실", "안방", "방1", "방2", "알파룸", "주방펜트리", "다용도실", "안방베란다", "드레스룸", "화장대"];
    }

    let allRooms = new Set(defaultRooms);
    savedItems.forEach(item => {
        if (item.room) allRooms.add(item.room);
    });
    let roomArray = Array.from(allRooms);
    
    // Room Manager Logic
    const btnManageRoomsInRooms = document.getElementById('btnManageRoomsInRooms');
    const roomManagerOverlay = document.getElementById('roomManagerOverlay');
    const btnCloseRoomManager = document.getElementById('btnCloseRoomManager');
    const btnAddNewRoom = document.getElementById('btnAddNewRoom');
    const roomManagerList = document.getElementById('roomManagerList');

    if (btnManageRoomsInRooms) {
        btnManageRoomsInRooms.addEventListener('click', () => {
            renderRoomManagerList();
            roomManagerOverlay.style.display = 'flex';
            if(window.lucide) lucide.createIcons();
        });
        btnCloseRoomManager.addEventListener('click', () => {
            roomManagerOverlay.style.display = 'none';
        });
        btnAddNewRoom.addEventListener('click', () => {
            const newRoom = prompt("새로운 방의 이름을 입력해주세요:");
            if (newRoom && newRoom.trim() !== '') {
                roomArray.push(newRoom.trim());
                saveRooms();
                renderRoomManagerList();
                renderRoomsContent();
                showToast(`'${newRoom.trim()}' 방이 추가되었습니다.`);
            }
        });
    }

    function saveRooms() {
        localStorage.setItem('itemFinder_rooms', JSON.stringify(roomArray));
    }

    function loadZones() {
        return JSON.parse(localStorage.getItem('itemFinder_zones') || '{}');
    }
    function saveZones(zones) {
        localStorage.setItem('itemFinder_zones', JSON.stringify(zones));
        if (window.syncToCloud) syncToCloud().catch(() => {});
    }

    function renderRoomManagerList() {
        if (!roomManagerList) return;
        while (roomManagerList.firstChild) roomManagerList.removeChild(roomManagerList.firstChild);
        const zones = loadZones();

        roomArray.forEach((room, index) => {
            const roomZones = zones[room] || [];

            const row = document.createElement('div');
            row.style.cssText = 'border-radius:10px;border:1px solid var(--border-color);background:var(--surface-color);margin-bottom:8px;';

            // 헤더: 방 이름 + 삭제 버튼
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;';

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size:0.95rem;font-weight:700;color:var(--text-main);';
            nameSpan.textContent = room;

            const delRoomBtn = document.createElement('button');
            delRoomBtn.style.cssText = 'background:none;border:1px solid rgba(239,68,68,0.4);border-radius:8px;color:#ef4444;cursor:pointer;font-size:0.78rem;padding:3px 8px;font-weight:600;';
            delRoomBtn.textContent = '삭제';
            delRoomBtn.addEventListener('click', () => {
                if (confirm(room + ' 방을 삭제하시겠습니까?\n(물건 기록은 유지됩니다)')) {
                    roomArray.splice(index, 1);
                    saveRooms();
                    renderRoomManagerList();
                    renderRoomsContent();
                }
            });

            header.appendChild(nameSpan);
            header.appendChild(delRoomBtn);
            row.appendChild(header);

            // 구역 섹션
            const zoneSection = document.createElement('div');
            zoneSection.style.cssText = 'padding:6px 14px 12px;border-top:1px solid var(--border-color);';

            const zoneTitle = document.createElement('div');
            zoneTitle.style.cssText = 'font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;';
            zoneTitle.textContent = '구역 설정';
            zoneSection.appendChild(zoneTitle);

            const zoneWrap = document.createElement('div');
            zoneWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;';

            roomZones.forEach((zoneName, zi) => {
                const chip = document.createElement('span');
                chip.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:20px;padding:3px 10px;font-size:0.8rem;color:#6366f1;';

                const chipText = document.createElement('span');
                chipText.textContent = zoneName;
                chipText.style.color = '#6366f1';
                chip.appendChild(chipText);

                const delZoneBtn = document.createElement('button');
                delZoneBtn.style.cssText = 'background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.75rem;padding:0 0 0 2px;line-height:1;';
                delZoneBtn.textContent = 'x';
                delZoneBtn.addEventListener('click', () => {
                    const zz = loadZones();
                    if (zz[room]) {
                        zz[room].splice(zi, 1);
                        if (zz[room].length === 0) delete zz[room];
                        saveZones(zz);
                    }
                    renderRoomManagerList();
                });
                chip.appendChild(delZoneBtn);
                zoneWrap.appendChild(chip);
            });

            const addZoneBtn = document.createElement('button');
            addZoneBtn.style.cssText = 'background:none;border:1px dashed var(--text-muted);border-radius:20px;padding:3px 10px;font-size:0.78rem;cursor:pointer;color:var(--text-muted);';
            addZoneBtn.textContent = '+ 추가';
            addZoneBtn.addEventListener('click', () => {
                const newZone = prompt(room + ' 방의 구역 이름을 입력하세요 (예: A-1, 상단 선반)');
                if (newZone && newZone.trim()) {
                    const zz = loadZones();
                    if (!zz[room]) zz[room] = [];
                    zz[room].push(newZone.trim());
                    saveZones(zz);
                    renderRoomManagerList();
                }
            });

            zoneWrap.appendChild(addZoneBtn);
            zoneSection.appendChild(zoneWrap);
            row.appendChild(zoneSection);

            roomManagerList.appendChild(row);
        });
    }
    
    // View state
    let currentViewMode = 'compact'; // compact, detail, pick, flat
    let globalIsAllSelected = false;
    let allCheckboxesList = [];
    let searchQuery = '';
    let pickedRooms = null; // null = 미초기화, Set으로 선택된 방 관리

    const globalSearchInput = document.getElementById('globalSearchInput');
    const btnGlobalSearchSubmit = document.getElementById('btnGlobalSearchSubmit');
    function applyGlobalSearch() {
        if (!globalSearchInput) return;
        searchQuery = globalSearchInput.value.toLowerCase().trim();
        renderRoomsContent();
    }
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') applyGlobalSearch();
        });
        globalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyGlobalSearch();
        });
    }
    if (btnGlobalSearchSubmit) btnGlobalSearchSubmit.addEventListener('click', applyGlobalSearch);

    const viewCompactBtn = document.getElementById('viewCompactBtn');
    const viewDetailBtn = document.getElementById('viewDetailBtn');
    const viewPickBtn = document.getElementById('viewPickBtn');
    const viewFlatBtn = document.getElementById('viewFlatBtn');
    const pickRoomFilterBar = document.getElementById('pickRoomFilterBar');
    
    const globalSelectAllBtn = document.getElementById('globalSelectAllBtn');
    const globalActionContainer = document.getElementById('globalActionContainer');
    const globalDeleteBtn = document.getElementById('globalDeleteBtn');

    if (globalSelectAllBtn) {
        globalSelectAllBtn.addEventListener('click', () => {
            globalIsAllSelected = !globalIsAllSelected;
            allCheckboxesList.forEach(cb => {
                cb.checked = globalIsAllSelected;
                cb.dispatchEvent(new Event('change'));
            });
            globalSelectAllBtn.innerHTML = globalIsAllSelected 
                ? '<i data-lucide="x-square" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"></i>모든 방 선택해제'
                : '<i data-lucide="check-square" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"></i>모든 방 전체선택';
            if(window.lucide) lucide.createIcons();
        });
    }

    if (globalDeleteBtn) {
        globalDeleteBtn.addEventListener('click', () => {
            const selectedIds = allCheckboxesList.filter(c => c.checked).map(c => c.getAttribute('data-id'));
            if(selectedIds.length === 0) return;
            
            if (confirm(`정말로 모든 방을 통틀어 선택한 ${selectedIds.length}개의 물건을 일괄 삭제하시겠습니까?`)) {
                savedItems = savedItems.filter(i => !selectedIds.includes(i.id));
                localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                if(window.syncToCloud) syncToCloud();
                showToast(`총 ${selectedIds.length}개의 물건이 삭제되었습니다.`);
                globalIsAllSelected = false; // reset
                if(globalSelectAllBtn) {
                    globalSelectAllBtn.innerHTML = '<i data-lucide="check-square" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"></i>모든 방 전체선택';
                }
                renderRoomsContent();
            }
        });
    }

    function syncGlobalAction() {
        const anyGlobalChecked = allCheckboxesList.some(cb => cb.checked);
        if (globalActionContainer) {
            globalActionContainer.style.display = anyGlobalChecked ? 'block' : 'none';
        }
    }

    function updateViewMode() {
        const activeStyle = { bg: 'var(--primary-color)', color: 'var(--primary-contrast)' };
        const inactiveStyle = { bg: 'transparent', color: 'var(--text-muted)' };

        if(viewCompactBtn) {
            viewCompactBtn.style.background = currentViewMode === 'compact' ? activeStyle.bg : inactiveStyle.bg;
            viewCompactBtn.style.color = currentViewMode === 'compact' ? activeStyle.color : inactiveStyle.color;
        }
        if(viewDetailBtn) {
            viewDetailBtn.style.background = currentViewMode === 'detail' ? activeStyle.bg : inactiveStyle.bg;
            viewDetailBtn.style.color = currentViewMode === 'detail' ? activeStyle.color : inactiveStyle.color;
        }
        if(viewPickBtn) {
            viewPickBtn.style.background = currentViewMode === 'pick' ? activeStyle.bg : inactiveStyle.bg;
            viewPickBtn.style.color = currentViewMode === 'pick' ? activeStyle.color : inactiveStyle.color;
        }
        if(viewFlatBtn) {
            viewFlatBtn.style.background = currentViewMode === 'flat' ? activeStyle.bg : inactiveStyle.bg;
            viewFlatBtn.style.color = currentViewMode === 'flat' ? activeStyle.color : inactiveStyle.color;
        }
        if(pickRoomFilterBar) {
            pickRoomFilterBar.style.display = currentViewMode === 'pick' ? 'block' : 'none';
        }

        if(globalSelectAllBtn) {
            globalSelectAllBtn.style.display = 'flex';
            globalSelectAllBtn.innerHTML = '<i data-lucide="check-square" style="width:18px;height:18px;vertical-align:-3px;margin-right:4px;"></i>모든 방 전체선택';
        }
        if(globalActionContainer) globalActionContainer.style.display = 'none';
        globalIsAllSelected = false;
        
        renderRoomsContent();
    }

    if(viewCompactBtn) viewCompactBtn.addEventListener('click', () => { currentViewMode = 'compact'; updateViewMode(); });
    if(viewDetailBtn) viewDetailBtn.addEventListener('click', () => { currentViewMode = 'detail'; updateViewMode(); });
    if(viewPickBtn) viewPickBtn.addEventListener('click', () => {
        currentViewMode = 'pick';
        if(pickedRooms === null) pickedRooms = new Set(roomArray);
        updateViewMode();
    });
    if(viewFlatBtn) viewFlatBtn.addEventListener('click', () => { currentViewMode = 'flat'; updateViewMode(); });

    function renderPickFilterBar() {
        if (!pickRoomFilterBar) return;
        pickRoomFilterBar.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;gap:8px;align-items:center;padding-bottom:4px;';

        // 전체선택/해제 토글
        const allChecked = roomArray.length > 0 && roomArray.every(r => pickedRooms.has(r));
        const allBtn = document.createElement('button');
        allBtn.style.cssText = `display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;border:1px solid ${allChecked ? 'var(--primary-color)' : 'var(--border-color)'};background:${allChecked ? 'var(--primary-color)' : 'var(--bg-color)'};color:${allChecked ? 'white' : 'var(--text-muted)'};font-weight:600;cursor:pointer;font-size:0.83rem;white-space:nowrap;flex-shrink:0;transition:all 0.15s;`;
        allBtn.textContent = allChecked ? '전체해제' : '전체선택';
        allBtn.addEventListener('click', () => {
            if (allChecked) { pickedRooms.clear(); } else { roomArray.forEach(r => pickedRooms.add(r)); }
            renderPickFilterBar();
            renderRoomsContent();
        });
        wrapper.appendChild(allBtn);

        const divider = document.createElement('div');
        divider.style.cssText = 'width:1px;height:22px;background:var(--border-color);flex-shrink:0;';
        wrapper.appendChild(divider);

        roomArray.forEach(room => {
            const count = savedItems.filter(i => i.room === room).length;
            const isChecked = pickedRooms.has(room);

            const pill = document.createElement('button');
            pill.style.cssText = `display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:20px;border:1px solid ${isChecked ? 'var(--primary-color)' : 'var(--border-color)'};background:${isChecked ? 'rgba(255,140,66,0.12)' : 'var(--bg-color)'};color:${isChecked ? 'var(--primary-color)' : 'var(--text-muted)'};font-weight:${isChecked ? '700' : '500'};cursor:pointer;font-size:0.85rem;white-space:nowrap;flex-shrink:0;transition:all 0.15s;`;
            const checkSvg = isChecked
                ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect width="13" height="13" rx="4" fill="var(--primary-color)"/><path d="M3 6.5l2.5 2.5 4.5-4.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect width="13" height="13" rx="4" stroke="var(--border-color)" stroke-width="1.5"/></svg>`;
            pill.innerHTML = `${checkSvg}<span>${room}</span><span style="font-size:0.72rem;opacity:0.6;">${count}</span>`;

            pill.addEventListener('click', () => {
                if (pickedRooms.has(room)) { pickedRooms.delete(room); } else { pickedRooms.add(room); }
                renderPickFilterBar();
                renderRoomsContent();
            });
            wrapper.appendChild(pill);
        });

        pickRoomFilterBar.appendChild(wrapper);
    }

    // Collapsed state map (true = closed, false = open)
    let collapsedState = {};

    function getGridCols() {
        if (window.innerWidth <= 540) return 2;
        if (window.innerWidth <= 900) return 2;
        return 3;
    }

    function renderRoomsContent() {
        allRoomsContainer.innerHTML = '';
        allCheckboxesList = []; // reset
        syncGlobalAction();
        
        let filteredItems = savedItems;
        if (searchQuery !== '') {
            filteredItems = savedItems.filter(i => 
                (i.name && i.name.toLowerCase().includes(searchQuery)) || 
                (i.memo && i.memo.toLowerCase().includes(searchQuery)) ||
                (i.room && i.room.toLowerCase().includes(searchQuery))
            );
        }

        // --- 모아보기 (Compact): 방 별 아코디언 모아보기 ---
        if (currentViewMode === 'compact') {
            allRoomsContainer.style.display = 'flex';
            allRoomsContainer.style.flexDirection = 'column';
            allRoomsContainer.style.gap = '0.7rem';

            let renderedCount = 0;
            roomArray.forEach(room => {
                const roomItems = filteredItems.filter(i => i.room === room);
                if (searchQuery !== '' && roomItems.length === 0) return;
                renderedCount++;

                const isExpanded = !!collapsedState[room];

                const roomCard = document.createElement('div');
                roomCard.style.background = 'var(--surface-color)';
                roomCard.style.border = '1px solid var(--border-color)';
                roomCard.style.borderRadius = '16px';
                roomCard.style.overflow = 'hidden';
                roomCard.style.boxShadow = 'var(--shadow-sm)';
                roomCard.style.transition = 'box-shadow 0.2s, border-color 0.2s';
                roomCard.id = `room-${room}`;

                let itemsHtml = '';
                if (roomItems.length > 0) {
                    itemsHtml = roomItems.map(item => {
                        const photoTag = item.photo
                            ? `<img src="${item.photo}" class="item-pic-zoom" style="width:26px;height:26px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid var(--border-color);flex-shrink:0;">`
                            : '';
                        return `
                            <div style="display:flex;align-items:center;gap:8px;padding:8px 1.2rem;border-top:1px solid var(--border-color);background:var(--bg-color);">
                                <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary-color);flex-shrink:0;">
                                <span style="flex:1;color:var(--text-main);font-weight:500;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</span>
                                ${item.zone ? `<span style="font-size:0.7rem;color:#6366f1;background:rgba(99,102,241,0.1);padding:1px 6px;border-radius:8px;border:1px solid rgba(99,102,241,0.2);flex-shrink:0;white-space:nowrap;">${item.zone}</span>` : ''}
                                ${item.memo ? `<span style="font-size:0.75rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px;flex-shrink:0;">${item.memo}</span>` : ''}
                                ${photoTag}
                                <button class="item-delete-btn" data-id="${item.id}" data-name="${item.name}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;opacity:0.35;transition:opacity 0.2s;flex-shrink:0;" title="삭제">
                                    <i data-lucide="x" style="width:13px;height:13px;"></i>
                                </button>
                            </div>
                        `;
                    }).join('');
                } else {
                    itemsHtml = `<div style="padding:12px 1.2rem;text-align:center;font-size:0.83rem;color:var(--text-muted);border-top:1px solid var(--border-color);background:var(--bg-color);">비어있음</div>`;
                }

                roomCard.innerHTML = `
                    <div class="room-card-header" style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;cursor:pointer;user-select:none;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <i data-lucide="door-closed" style="width:18px;height:18px;color:var(--primary-color);flex-shrink:0;"></i>
                            <span style="font-weight:700;font-size:1rem;color:var(--text-main);">${room}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.82rem;color:var(--text-muted);background:var(--bg-color);padding:2px 10px;border-radius:20px;border:1px solid var(--border-color);">${roomItems.length}개</span>
                            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" style="width:18px;height:18px;color:var(--text-muted);"></i>
                        </div>
                    </div>
                    <div class="room-items-accordion" style="display:${isExpanded ? 'block' : 'none'};">
                        ${itemsHtml}
                    </div>
                `;

                roomCard.querySelector('.room-card-header').addEventListener('click', () => {
                    collapsedState[room] = !collapsedState[room];
                    renderRoomsContent();
                });

                setTimeout(() => {
                    roomCard.querySelectorAll('.item-checkbox').forEach(cb => {
                        allCheckboxesList.push(cb);
                        cb.addEventListener('change', () => syncGlobalAction());
                    });
                    roomCard.querySelectorAll('.item-delete-btn').forEach(delBtn => {
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const id = delBtn.getAttribute('data-id');
                            const name = delBtn.getAttribute('data-name');
                            if (confirm(`'${name}' 기록을 삭제하시겠습니까?`)) {
                                savedItems = savedItems.filter(i => i.id !== id);
                                localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                                if (window.syncToCloud) syncToCloud();
                                showToast('물건 기록이 삭제되었습니다.');
                                renderRoomsContent();
                            }
                        });
                    });
                }, 0);

                allRoomsContainer.appendChild(roomCard);
            });

            if (renderedCount === 0) {
                allRoomsContainer.style.display = 'block';
                allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 1rem; text-align:center;">검색결과가 없거나 저장된 물건이 없습니다.</p>';
            }

            if (window.lucide) lucide.createIcons();
            attachZoomLogic();
            return;
        }

        // --- 골라보기 (Pick): 원하는 방만 선택해서 펼쳐보기 ---
        if (currentViewMode === 'pick') {
            if (pickedRooms === null) pickedRooms = new Set(roomArray);
            renderPickFilterBar();

            const selectedRooms = roomArray.filter(r => pickedRooms.has(r));

            if (selectedRooms.length === 0) {
                allRoomsContainer.style.display = 'block';
                allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 2rem; text-align:center;">위에서 보고 싶은 방을 선택해주세요.</p>';
                if (window.lucide) lucide.createIcons();
                return;
            }

            allRoomsContainer.style.display = 'grid';
            allRoomsContainer.style.gridTemplateColumns = `repeat(${getGridCols()}, 1fr)`;
            allRoomsContainer.style.gap = '1rem';

            selectedRooms.forEach(room => {
                const roomItems = filteredItems.filter(i => i.room === room);

                const roomCard = document.createElement('div');
                roomCard.style.background = 'var(--surface-color)';
                roomCard.style.border = '1px solid var(--border-color)';
                roomCard.style.borderRadius = '16px';
                roomCard.style.padding = '1rem 0.8rem';
                roomCard.style.boxShadow = 'var(--shadow-sm)';
                roomCard.style.transition = 'all 0.2s';
                roomCard.id = `room-${room}`;

                let itemListHtml = '';
                if (roomItems.length > 0) {
                    itemListHtml = '<div style="margin-top:10px; display:flex; flex-direction:column; gap:4px; text-align:left;">';
                    roomItems.forEach(item => {
                        const photoTag = item.photo ? `<img src="${item.photo}" class="item-pic-zoom" style="width:20px;height:20px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--border-color);">` : '';
                        itemListHtml += `
                            <div style="display:flex; align-items:center; gap:6px; padding:4px 6px; background:var(--bg-color); border-radius:8px; font-size:0.85rem;">
                                <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary-color);flex-shrink:0;">
                                <span style="flex:1; color:var(--text-main); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
                                ${item.zone ? `<span style="font-size:0.7rem;color:#6366f1;background:rgba(99,102,241,0.1);padding:1px 6px;border-radius:8px;border:1px solid rgba(99,102,241,0.2);flex-shrink:0;white-space:nowrap;">${item.zone}</span>` : ''}
                                ${photoTag}
                                <button class="item-delete-btn" data-id="${item.id}" data-name="${item.name}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:2px;opacity:0.4;transition:opacity 0.2s;flex-shrink:0;" title="삭제">
                                    <i data-lucide="x" style="width:12px;height:12px;"></i>
                                </button>
                            </div>
                        `;
                    });
                    itemListHtml += '</div>';
                } else {
                    itemListHtml = '<div style="margin-top:10px; font-size:0.8rem; color:var(--text-muted); text-align:center;">비어있음</div>';
                }

                roomCard.innerHTML = `
                    <div style="text-align:center; margin-bottom:4px;">
                        <div style="font-weight:700; font-size:1rem; color:var(--text-main);">
                            <i data-lucide="door-closed" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;color:var(--primary-color);"></i>${room}
                        </div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${roomItems.length}개 보관</div>
                    </div>
                    ${itemListHtml}
                `;

                roomCard.addEventListener('mouseover', () => {
                    roomCard.style.transform = 'translateY(-3px)';
                    roomCard.style.boxShadow = 'var(--shadow-md)';
                    roomCard.style.borderColor = 'var(--primary-color)';
                    roomCard.querySelectorAll('.item-delete-btn').forEach(b => b.style.opacity = '1');
                });
                roomCard.addEventListener('mouseout', () => {
                    roomCard.style.transform = '';
                    roomCard.style.boxShadow = 'var(--shadow-sm)';
                    roomCard.style.borderColor = 'var(--border-color)';
                    roomCard.querySelectorAll('.item-delete-btn').forEach(b => b.style.opacity = '0.4');
                });

                setTimeout(() => {
                    roomCard.querySelectorAll('.item-checkbox').forEach(cb => {
                        allCheckboxesList.push(cb);
                        cb.addEventListener('change', () => syncGlobalAction());
                    });
                    roomCard.querySelectorAll('.item-delete-btn').forEach(delBtn => {
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const id = delBtn.getAttribute('data-id');
                            const name = delBtn.getAttribute('data-name');
                            if(confirm(`'${name}' 기록을 삭제하시겠습니까?`)) {
                                savedItems = savedItems.filter(i => i.id !== id);
                                localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                                if(window.syncToCloud) syncToCloud();
                                showToast('물건 기록이 삭제되었습니다.');
                                renderRoomsContent();
                            }
                        });
                    });
                }, 0);

                allRoomsContainer.appendChild(roomCard);
            });

            if (allRoomsContainer.childElementCount === 0) {
                allRoomsContainer.style.display = 'block';
                allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 1rem; text-align:center;">검색결과가 없습니다.</p>';
            }

            if (window.lucide) lucide.createIcons();
            attachZoomLogic();
            return;
        }

        // --- 전체보기 (Flat): All items as individual cards in 3-col grid with checkboxes ---
        if (currentViewMode === 'flat') {
            allRoomsContainer.style.display = 'grid';
            allRoomsContainer.style.gridTemplateColumns = `repeat(${getGridCols()}, 1fr)`;
            allRoomsContainer.style.gap = '1rem';

            const sortedItems = [...filteredItems].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
            
            if (sortedItems.length === 0) {
                allRoomsContainer.style.display = 'block';
                allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 1rem; text-align:center;">검색결과가 없거나 저장된 물건이 없습니다.</p>';
                return;
            }

            sortedItems.forEach(item => {
                const card = document.createElement('div');
                card.style.background = 'var(--surface-color)';
                card.style.border = '1px solid var(--border-color)';
                card.style.borderRadius = '16px';
                card.style.padding = '1rem 0.8rem';
                card.style.textAlign = 'center';
                card.style.boxShadow = 'var(--shadow-sm)';
                card.style.transition = 'all 0.2s';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.alignItems = 'center';
                card.style.gap = '6px';
                card.style.position = 'relative';

                let photoHtml = item.photo ? `<img src="${item.photo}" class="item-pic-zoom" style="width:36px;height:36px;object-fit:cover;border-radius:8px;cursor:pointer;border:1px solid var(--border-color);">` : '';

                card.innerHTML = `
                    <div style="position:absolute; top:8px; left:8px;">
                        <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary-color);">
                    </div>
                    <div style="position:absolute; top:6px; right:6px;">
                        <button class="item-delete-btn" data-id="${item.id}" data-name="${item.name}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;opacity:0.5;transition:opacity 0.2s;" title="삭제">
                            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                        </button>
                    </div>
                    <div style="font-weight:700; font-size:0.95rem; color:var(--text-main); word-break:keep-all; margin-top:20px;">${item.name}</div>
                    ${item.memo ? `<div style="font-size:0.75rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%;">${item.memo}</div>` : ''}
                    ${photoHtml}
                    <span style="font-size:0.7rem; color:var(--primary-color); background:rgba(255,140,66,0.1); padding:2px 8px; border-radius:6px; font-weight:600; margin-top:2px;">${item.room || '미지정'}</span>
                    ${item.zone ? `<span style="font-size:0.7rem; color:#6366f1; background:rgba(99,102,241,0.1); padding:2px 8px; border-radius:6px; font-weight:600;">${item.zone}</span>` : ''}
                `;

                card.addEventListener('mouseover', () => {
                    card.style.transform = 'translateY(-3px)';
                    card.style.boxShadow = 'var(--shadow-md)';
                    card.style.borderColor = 'var(--primary-color)';
                    const delBtn = card.querySelector('.item-delete-btn');
                    if(delBtn) delBtn.style.opacity = '1';
                });
                card.addEventListener('mouseout', () => {
                    card.style.transform = '';
                    card.style.boxShadow = 'var(--shadow-sm)';
                    card.style.borderColor = 'var(--border-color)';
                    const delBtn = card.querySelector('.item-delete-btn');
                    if(delBtn) delBtn.style.opacity = '0.5';
                });

                // Wire up checkbox
                setTimeout(() => {
                    const cb = card.querySelector('.item-checkbox');
                    if (cb) {
                        allCheckboxesList.push(cb);
                        cb.addEventListener('change', () => syncGlobalAction());
                    }
                    const delBtn = card.querySelector('.item-delete-btn');
                    if (delBtn) {
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const id = delBtn.getAttribute('data-id');
                            const name = delBtn.getAttribute('data-name');
                            if(confirm(`'${name}' 기록을 삭제하시겠습니까?`)) {
                                savedItems = savedItems.filter(i => i.id !== id);
                                localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                                if(window.syncToCloud) syncToCloud();
                                showToast('물건 기록이 삭제되었습니다.');
                                renderRoomsContent();
                            }
                        });
                    }
                }, 0);

                allRoomsContainer.appendChild(card);
            });

            if (window.lucide) lucide.createIcons();
            attachZoomLogic();
            return;
        }

        // --- 펼쳐보기 (Detail): Room cards in 3-col grid, each showing its items with checkboxes ---
        allRoomsContainer.style.display = 'grid';
        allRoomsContainer.style.gridTemplateColumns = `repeat(${getGridCols()}, 1fr)`;
        allRoomsContainer.style.gap = '1rem';

        roomArray.forEach(room => {
            const roomItems = filteredItems.filter(i => i.room === room);
            if (searchQuery !== '' && roomItems.length === 0) return;
            
            const roomCard = document.createElement('div');
            roomCard.style.background = 'var(--surface-color)';
            roomCard.style.border = '1px solid var(--border-color)';
            roomCard.style.borderRadius = '16px';
            roomCard.style.padding = '1rem 0.8rem';
            roomCard.style.boxShadow = 'var(--shadow-sm)';
            roomCard.style.transition = 'all 0.2s';
            roomCard.id = `room-${room}`;

            // Room header
            let itemListHtml = '';
            if (roomItems.length > 0) {
                itemListHtml = '<div style="margin-top:10px; display:flex; flex-direction:column; gap:4px; text-align:left;">';
                roomItems.forEach(item => {
                    let photoTag = item.photo ? `<img src="${item.photo}" class="item-pic-zoom" style="width:20px;height:20px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--border-color);">` : '';
                    itemListHtml += `
                        <div style="display:flex; align-items:center; gap:6px; padding:4px 6px; background:var(--bg-color); border-radius:8px; font-size:0.85rem;">
                            <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary-color);flex-shrink:0;">
                            <span style="flex:1; color:var(--text-main); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
                            ${item.zone ? `<span style="font-size:0.7rem;color:#6366f1;background:rgba(99,102,241,0.1);padding:1px 6px;border-radius:8px;border:1px solid rgba(99,102,241,0.2);flex-shrink:0;white-space:nowrap;">${item.zone}</span>` : ''}
                            ${photoTag}
                            <button class="item-delete-btn" data-id="${item.id}" data-name="${item.name}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:2px;opacity:0.4;transition:opacity 0.2s;flex-shrink:0;" title="삭제">
                                <i data-lucide="x" style="width:12px;height:12px;"></i>
                            </button>
                        </div>
                    `;
                });
                itemListHtml += '</div>';
            } else {
                itemListHtml = '<div style="margin-top:10px; font-size:0.8rem; color:var(--text-muted); text-align:center;">비어있음</div>';
            }

            roomCard.innerHTML = `
                <div style="text-align:center; margin-bottom:4px;">
                    <div style="font-weight:700; font-size:1rem; color:var(--text-main);">
                        <i data-lucide="door-closed" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;color:var(--primary-color);"></i>${room}
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${roomItems.length}개 보관</div>
                </div>
                ${itemListHtml}
            `;

            roomCard.addEventListener('mouseover', () => {
                roomCard.style.transform = 'translateY(-3px)';
                roomCard.style.boxShadow = 'var(--shadow-md)';
                roomCard.style.borderColor = 'var(--primary-color)';
                roomCard.querySelectorAll('.item-delete-btn').forEach(b => b.style.opacity = '1');
            });
            roomCard.addEventListener('mouseout', () => {
                roomCard.style.transform = '';
                roomCard.style.boxShadow = 'var(--shadow-sm)';
                roomCard.style.borderColor = 'var(--border-color)';
                roomCard.querySelectorAll('.item-delete-btn').forEach(b => b.style.opacity = '0.4');
            });

            // Wire up checkboxes and delete buttons
            setTimeout(() => {
                roomCard.querySelectorAll('.item-checkbox').forEach(cb => {
                    allCheckboxesList.push(cb);
                    cb.addEventListener('change', () => syncGlobalAction());
                });
                roomCard.querySelectorAll('.item-delete-btn').forEach(delBtn => {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = delBtn.getAttribute('data-id');
                        const name = delBtn.getAttribute('data-name');
                        if(confirm(`'${name}' 기록을 삭제하시겠습니까?`)) {
                            savedItems = savedItems.filter(i => i.id !== id);
                            localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                            if(window.syncToCloud) syncToCloud();
                            showToast('물건 기록이 삭제되었습니다.');
                            renderRoomsContent();
                        }
                    });
                });
            }, 0);

            allRoomsContainer.appendChild(roomCard);
        });

        if (allRoomsContainer.childElementCount === 0) {
            allRoomsContainer.style.display = 'block';
            allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 1rem; text-align:center;">검색결과가 없거나 저장된 물건이 없습니다.</p>';
        }

        if (window.lucide) lucide.createIcons();
        attachZoomLogic();
    }

    function attachZoomLogic() {
        document.querySelectorAll('.item-pic-zoom').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                const overlay = document.getElementById('photoOverlay');
                const fullImg = document.getElementById('photoFullView');
                if (overlay && fullImg) {
                    fullImg.src = img.src;
                    overlay.style.display = 'flex';
                }
            });
        });
    }

    // Initial render
    updateViewMode();
    
    // Hash routing
    if (window.location.hash) {
        setTimeout(() => {
            try {
                const targetId = decodeURIComponent(window.location.hash);
                const el = document.querySelector(targetId);
                if (el) {
                    el.scrollIntoView({behavior: 'smooth', block: 'start'});
                    const originalBorder = el.style.borderColor;
                    el.style.borderColor = 'var(--primary-color)';
                    el.style.boxShadow = '0 0 0 4px rgba(255, 140, 66, 0.2)';
                    setTimeout(() => {
                        el.style.borderColor = originalBorder;
                        el.style.boxShadow = '';
                    }, 2000);
                }
            } catch(e) {}
        }, 150);
    }

    // Backup button logic on rooms page
    const btnBackup = document.getElementById('btnBackup');
    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            const currentData = localStorage.getItem('itemFinder_data') || '[]';
            const parsed = JSON.parse(currentData);
            if(parsed.length === 0) {
                showToast('백업할 데이터가 없습니다.');
                return;
            }
            let backups = JSON.parse(localStorage.getItem('itemFinder_backups')) || [];
            const newBackup = {
                id: Date.now().toString(), date: new Date().toISOString(), count: parsed.length, data: parsed,
                authorNickname: localStorage.getItem('kc_nickname') || '회원',
                authorUserId: localStorage.getItem('kc_user_id') || '',
                zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}'),
                rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]')
            };
            backups.unshift(newBackup);
            localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
            if(window.syncBackupsToCloud) syncBackupsToCloud();
            showToast('현재 물건 상태가 성공적으로 백업되었습니다!');
            if(window.lucide) {
                btnBackup.innerHTML = '<i data-lucide="check-circle" style="color:#22c55e;"></i>';
                lucide.createIcons();
                setTimeout(() => { btnBackup.innerHTML = '<i data-lucide="save"></i>'; lucide.createIcons(); }, 2000);
            }
        });
    }
});
