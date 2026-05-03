document.addEventListener('DOMContentLoaded', () => {
    // Kakao Auth Initialization & Login Gate
    if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('aba8aed2de3168350dd5fdf66f95820c');
    }

    const loginOverlay = document.getElementById('loginOverlay');
    const btnKakaoLogin = document.getElementById('btnKakaoLogin');
    
    // Check if already authenticated
    const isKakaoLoggedIn = localStorage.getItem('kc_logged_in') === 'true';
    if (isKakaoLoggedIn && loginOverlay) {
        loginOverlay.style.display = 'none';
        // 자동 로그인 시 클라우드 데이터 동기화 (세션당 1회만 새로고침)
        const cloudSynced = sessionStorage.getItem('cloud_synced');
        if (!cloudSynced && window.loadFromCloud) {
            sessionStorage.setItem('cloud_synced', 'true');
            window.loadFromCloud().then((loaded) => {
                if (loaded) {
                    window.location.reload();
                } else {
                    updateAppTitle();
                }
            }).catch(() => { updateAppTitle(); });
        } else {
            updateAppTitle();
        }
    }

    if (btnKakaoLogin) {
        btnKakaoLogin.addEventListener('click', () => {
            if (!window.Kakao) {
                alert('카카오 로그인 스크립트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
                return;
            }
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init('aba8aed2de3168350dd5fdf66f95820c');
            }
            window.Kakao.Auth.login({
                success: function(authObj) {
                    window.Kakao.API.request({
                        url: '/v2/user/me',
                        success: function(res) {
                            let kakaoNick = '회원';
                            if (res.properties && res.properties.nickname) {
                                kakaoNick = res.properties.nickname;
                            }
                            // Save Kakao user ID for cloud sync
                            if (res.id && window.setCloudUserId) {
                                window.setCloudUserId(res.id);
                            }
                            proceedToNicknameStep(kakaoNick);
                        },
                        fail: function(error) {
                            proceedToNicknameStep('회원');
                        }
                    });
                },
                fail: function(err) {
                    proceedToNicknameStep('회원');
                }
            });
        });
    }

    async function proceedToNicknameStep(suggestedNick) {
        const nickInputStep = document.getElementById('nicknameInputStep');
        const loginNickname = document.getElementById('loginNickname');
        const btnStartWithNickname = document.getElementById('btnStartWithNickname');
        
        // Load cloud data first
        if (window.loadFromCloud) {
            try {
                await window.loadFromCloud();
            } catch(e) { console.warn('Cloud load skipped:', e); }
        }

        // Only show nickname input if we don't have one stored (first time user)
        const storedNick = localStorage.getItem('kc_nickname');
        if (storedNick) {
            localStorage.setItem('kc_logged_in', 'true');
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                // 새로고침으로 클라우드 데이터를 화면에 반영
                window.location.reload();
            }, 400);
            return;
        }

        if (suggestedNick && suggestedNick !== '회원') {
            loginNickname.value = suggestedNick;
        }
        
        btnKakaoLogin.style.display = 'none';
        nickInputStep.style.display = 'flex';
        
        btnStartWithNickname.onclick = () => {
            const finalNick = loginNickname.value.trim() || '회원';
            localStorage.setItem('kc_logged_in', 'true');
            localStorage.setItem('kc_nickname', finalNick);
            updateAppTitle();
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                showToast(`환영합니다, ${finalNick}님!`);
            }, 400);
            // 백그라운드에서 클라우드 싱크 (화면 전환 블로킹 없음)
            if (window.syncToCloud) {
                window.syncToCloud().catch(() => {});
            }
        };
    }

    // Basic elements
    const itemNameInput = document.getElementById('itemName');
    const roomSelectBtn = document.getElementById('btnSelectRoom');

    function updateAppTitle() {
        const nick = localStorage.getItem('kc_nickname');
        const titles = document.querySelectorAll('.app-main-title');
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        const isRoomsPage = document.body.querySelector('.is-rooms-page') !== null;
        
        let qColor = '#ff8c42';
        if(theme === 'dark') qColor = '#fef08a';
        else if(theme === 'alps') qColor = '#0ea5e9';
        else if(theme === 'positano') qColor = '#f59e0b';

        titles.forEach(t => {
            const isInOverlay = t.closest('#loginOverlay') !== null;
            
            // Text color based on theme
            let baseTextColor = 'var(--text-main)';
            if(theme === 'dark' && !isInOverlay) baseTextColor = '#e2e8f0';

            if (nick && !isInOverlay && !isRoomsPage) {
                const nickHtml = `<span class="nickname-container" style="position:relative; display:inline-block; margin-right:4px; vertical-align:middle; line-height:1; letter-spacing:-1.5px;">
                     <span style="position:relative; z-index:1; font-family:'Gaegu', cursive; font-size:1.05em; color:${theme === 'dark' ? '#e2e8f0' : '#333'}; font-weight:700;">${nick}</span>
                     <span style="position:absolute; bottom:0; left:0; width:100%; height:1px; background-color:${theme === 'dark' ? 'rgba(226,232,240,0.5)' : 'rgba(100,100,100,0.5)'}; z-index:0;"></span>
                   </span>`;
                t.innerHTML = `${nickHtml} <span style="font-family:'Nanum Pen Script', cursive; vertical-align:middle; color:${baseTextColor}; font-size:0.95em;">물건어디</span><span style="color:${qColor}; font-family:'Nanum Pen Script', cursive; margin-left:4px; font-weight:900; font-size:1.3em; display:inline-block; transform:translateY(2px);">?</span>`;
            } else {
                if (isRoomsPage) {
                    t.innerHTML = `<span style="font-family:'Nanum Pen Script', cursive; color:var(--text-main); opacity:0.7;">Home item list</span>`;
                } else {
                    t.innerHTML = `<span style="font-family:'Nanum Pen Script', cursive; color:${baseTextColor};">물건어디</span><span style="color:${qColor}; font-family:'Nanum Pen Script', cursive; margin-left:4px; font-weight:900; font-size:1.3em; display:inline-block; transform:translateY(2px);">?</span>`;
                }
            }
        });
        if(window.lucide) lucide.createIcons();

        const nicknameDisplay = document.getElementById('settingsNicknameDisplay');
        if (nicknameDisplay) {
            nicknameDisplay.textContent = nick || '회원';
        }
    }
    updateAppTitle(); // Call on load too
    
    // 새로고침 버튼
    const btnSyncRefresh = document.getElementById('btnSyncRefresh');
    if (btnSyncRefresh) {
        btnSyncRefresh.addEventListener('click', async () => {
            const icon = btnSyncRefresh.querySelector('i');
            icon.style.transition = 'transform 0.6s';
            icon.style.transform = 'rotate(360deg)';
            setTimeout(() => { icon.style.transition = ''; icon.style.transform = ''; }, 600);

            if (window.loadFromCloud) {
                const loaded = await window.loadFromCloud().catch(() => false);
                if (loaded) {
                    showToast('최신 데이터로 업데이트됐어요!');
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    showToast('이미 최신 상태예요!');
                }
            }
        });
    }

    // Settings Overlay Logic
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const btnEditNickname = document.getElementById('btnEditNickname');
    const btnKakaoLogout = document.getElementById('btnKakaoLogout');
    const btnInviteFamily = document.getElementById('btnInviteFamily');

    if (btnInviteFamily) {
        btnInviteFamily.addEventListener('click', async () => {
            btnInviteFamily.disabled = true;
            btnInviteFamily.textContent = '초대 코드 생성 중...';

            const myNick = localStorage.getItem('kc_nickname') || '가족';
            const baseUrl = 'https://1023am0645-pixel.github.io/item_finder/';
            let code = null;

            if (window.createInviteCode) {
                code = await window.createInviteCode();
            }

            btnInviteFamily.disabled = false;
            btnInviteFamily.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#000;"><path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.83 5.37 4.6 6.78-.3.97-1.12 3.65-1.14 3.75-.03.14.05.21.16.2.14-.02 3.86-2.58 5.34-3.6.35.04.7.07 1.04.07 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg> 카카오톡으로 가족 초대하기`;

            if (!code) { showToast('초대 코드 생성에 실패했어요. 다시 시도해주세요.'); return; }

            const inviteUrl = `${baseUrl}?invite=${code}`;
            const message = `${myNick}님이 '물건어디' 앱에 초대했어요! 📦\n\n우리 가족 물건 위치를 함께 관리해요.\n아래 링크로 접속 후 카카오 로그인하면 데이터가 바로 공유돼요 😊\n\n👉 ${inviteUrl}\n\n(초대 코드: ${code} / 7일간 유효)`;

            navigator.clipboard.writeText(message).then(() => {
                showToast('초대 메시지가 복사됐어요! 카카오톡에 붙여넣기 해주세요 😊');
            }).catch(() => {
                alert(message);
            });
        });
    }

    // 초대 코드 직접 입력으로 그룹 합류
    const btnJoinGroup = document.getElementById('btnJoinGroup');
    if (btnJoinGroup) {
        btnJoinGroup.addEventListener('click', async () => {
            const code = prompt('받은 초대 코드를 입력해주세요:');
            if (!code || !code.trim()) return;
            btnJoinGroup.disabled = true;
            btnJoinGroup.textContent = '합류 중...';
            if (window.joinGroup) {
                const joined = await window.joinGroup(code.trim().toUpperCase());
                if (joined) {
                    showToast('그룹에 합류했어요! 데이터를 불러올게요.');
                    localStorage.removeItem('kc_group_id');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast('초대 코드가 유효하지 않아요. 다시 확인해주세요.');
                }
            }
            btnJoinGroup.disabled = false;
            btnJoinGroup.textContent = '초대 코드로 합류하기';
        });
    }

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
            renderBackupList();
            settingsOverlay.style.display = 'flex';
            if(window.lucide) lucide.createIcons();
        });
        btnCloseSettings.addEventListener('click', () => {
            settingsOverlay.style.display = 'none';
        });
        btnEditNickname.addEventListener('click', () => {
            let nick = prompt('새로운 닉네임을 입력해주세요:', localStorage.getItem('kc_nickname') || '');
            if (nick && nick.trim() !== '') {
                localStorage.setItem('kc_nickname', nick.trim());
                updateAppTitle();
                showToast('닉네임이 변경되었습니다.');
            }
        });
        btnKakaoLogout.addEventListener('click', () => {
            if(confirm('정말 로그아웃 하시겠습니까? 닉네임과 로그인 정보가 초기화됩니다.')) {
                localStorage.removeItem('kc_logged_in');
                localStorage.removeItem('kc_nickname');
                if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
                    window.Kakao.Auth.logout(() => {
                        window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            }
        });

        const btnKakaoSwitchAccount = document.getElementById('btnKakaoSwitchAccount');
        if (btnKakaoSwitchAccount) {
            btnKakaoSwitchAccount.addEventListener('click', () => {
                const currentNick = localStorage.getItem('kc_nickname') || '';
                let keepNickname = true;
                
                if (currentNick) {
                    const choice = confirm(`현재 닉네임: "${currentNick}"\n\n닉네임을 유지하시겠습니까?\n\n[확인] = 닉네임 유지\n[취소] = 닉네임 변경`);
                    if (!choice) {
                        const newNick = prompt('새로운 닉네임을 입력해주세요:', '');
                        if (newNick === null) return; // 완전 취소
                        if (newNick.trim() !== '') {
                            localStorage.setItem('kc_nickname', newNick.trim());
                        } else {
                            localStorage.removeItem('kc_nickname');
                        }
                    }
                }

                localStorage.removeItem('kc_logged_in');
                if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
                    window.Kakao.Auth.logout(() => {
                        window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            });
        }
    }

    // Theme logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    const savedTheme = localStorage.getItem('itemFinder_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('itemFinder_theme', theme);
        });
    });
    const selectedRoomText = document.getElementById('selectedRoomText');
    const itemMemoInput = document.getElementById('itemMemo');
    const btnSave = document.getElementById('btnSave');
    const roomGrid = document.getElementById('roomGrid');
    const searchResults = document.getElementById('searchResults');
    const bottomRoomGrid = document.getElementById('bottomRoomGrid');

    // Room List Data (안방, 방1, 방2 적용)
    const defaultRooms = ["현관펜트리", "신발장", "공용욕실", "거실", "안방", "방1", "방2", "알파룸", "주방펜트리", "다용도실", "안방베란다", "드레스룸", "화장대"];
    let rooms = JSON.parse(localStorage.getItem('itemFinder_rooms'));
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        rooms = defaultRooms;
    }

    function saveRooms() {
        localStorage.setItem('itemFinder_rooms', JSON.stringify(rooms));
    }

    // LocalStorage for saved items
    // Structure: [{ id, name, room, memo, date }]
    let savedItems = JSON.parse(localStorage.getItem('itemFinder_data')) || [];

    // State
    let currentSelectedRoom = null; // for adding items

    // 1. Render Rooms Grid
    function renderRooms() {
        roomGrid.innerHTML = '';
        if (bottomRoomGrid) bottomRoomGrid.innerHTML = '';
        
        rooms.forEach(room => {
            const btn = document.createElement('button');
            btn.className = 'room-btn';
            btn.textContent = room;
            
            // Highlight if selected
            if (currentSelectedRoom === room) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                selectRoom(room);
                btn.classList.add('selected');
            });

            roomGrid.appendChild(btn);

            // Bottom Nav Grid Button
            if (bottomRoomGrid) {
                const navBtn = document.createElement('button');
                navBtn.className = 'room-btn';
                navBtn.textContent = room;
                navBtn.addEventListener('click', () => {
                    window.location.href = 'rooms.html#room-' + encodeURIComponent(room);
                });
                bottomRoomGrid.appendChild(navBtn);
            }
        });

        // Add Room Button in bottom grid
        if (bottomRoomGrid) {
            const addNavBtn = document.createElement('button');
            addNavBtn.className = 'room-btn add-btn';
            addNavBtn.innerHTML = '<i data-lucide="plus" style="width:16px;height:16px;margin-right:4px;"></i>방 추가';
            addNavBtn.addEventListener('click', () => promptAddRoom());
            bottomRoomGrid.appendChild(addNavBtn);
        }

        // (Room management in settings was removed, moved to rooms.js)

        // Add Room Button (Dropdown)
        const addBtn = document.createElement('button');
        addBtn.className = 'room-btn add-btn';
        addBtn.textContent = '+ 방 추가';
        addBtn.addEventListener('click', () => promptAddRoom());
        roomGrid.appendChild(addBtn);
    }
    
    function renderBackupList() {
        const listContainer = document.getElementById('settingsBackupList');
        if(!listContainer) return;
        listContainer.innerHTML = '';
        let backups = JSON.parse(localStorage.getItem('itemFinder_backups')) || [];
        if(backups.length === 0) {
            listContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:10px;">백업 기록이 없습니다. 하단 백업버튼을 눌러 백업하세요.</div>';
            return;
        }
        backups.forEach((b, idx) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.padding = '8px 10px';
            row.style.background = 'var(--surface-color)';
            row.style.borderRadius = '8px';
            row.style.alignItems = 'center';
            const dateStr = new Date(b.date).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'numeric', minute:'numeric' });
            row.innerHTML = `<span style="font-size:0.85rem;">${dateStr} (${b.count}개)</span>
                <div style="display:flex;gap:4px;align-items:center;">
                    <button class="restore-backup-btn" data-index="${idx}" style="background:var(--primary-color);color:white;border:none;border-radius:6px;padding:4px 8px;font-size:0.8rem;cursor:pointer;">복원</button>
                    <button class="delete-backup-btn" data-index="${idx}" style="background:transparent;color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:4px 6px;font-size:0.8rem;cursor:pointer;line-height:1;"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
                </div>`;
            listContainer.appendChild(row);
        });
        if(window.lucide) lucide.createIcons();

        listContainer.querySelectorAll('.restore-backup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if(confirm('이 시점으로 기기 데이터를 복원하시겠습니까? (현재 기록은 삭제됩니다)')) {
                    localStorage.setItem('itemFinder_data', JSON.stringify(backups[idx].data));
                    if(window.syncToCloud) syncToCloud();
                    showToast('데이터가 성공적으로 복원되었습니다.');
                    setTimeout(() => window.location.reload(), 1000);
                }
            });
        });

        listContainer.querySelectorAll('.delete-backup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if(confirm('백업 기록을 삭제하시겠습니까?')) {
                    backups.splice(idx, 1);
                    localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
                    if(window.syncBackupsToCloud) window.syncBackupsToCloud().catch(() => {});
                    showToast('백업 기록이 삭제되었습니다.');
                    renderBackupList();
                }
            });
        });
    }

    function promptAddRoom() {
        const newRoom = prompt("새로운 방의 이름을 입력해주세요:");
        if (newRoom && newRoom.trim() !== '') {
            rooms.push(newRoom.trim());
            saveRooms();
            renderRooms();
            showToast(`'${newRoom.trim()}' 방이 추가되었습니다.`);
        }
    }

        function selectRoom(roomName) {
        currentSelectedRoom = roomName;
        selectedRoomText.textContent = roomName;
        roomSelectBtn.classList.add('filled');
        if(roomDropdown) roomDropdown.classList.add('hidden'); // Close dropdown
        renderRooms(); // Re-render to update selected UI class
        
        // Also perform search filtering by room if the input is empty
        if(itemNameInput.value.trim() === '') {
            renderSearchResults(savedItems.filter(i => i.room === roomName));
        }
    }

    const roomDropdown = document.getElementById('roomDropdown');

    // Room Select Button logic (Toggle Dropdown)
    roomSelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!roomDropdown.contains(e.target) && !roomSelectBtn.contains(e.target)) {
            roomDropdown.classList.add('hidden');
        }
    });

    // 2. Save Item logic
    btnSave.addEventListener('click', () => {
        const name = itemNameInput.value.trim();
        const memo = itemMemoInput.value.trim();
        const room = currentSelectedRoom;

        if (!name) {
            showToast("저장할 물건 이름을 입력해주세요.");
            itemNameInput.focus();
            return;
        }
        if (!room) {
            showToast("방 위치를 선택해주세요. (아래 목록 클릭)");
            return;
        }

        const newItem = {
            id: Date.now().toString(),
            name: name,
            room: room,
            memo: memo,
            photo: currentPhotoBase64,
            createdAt: new Date().toISOString()
        };

        savedItems.push(newItem);
        localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
        if(window.syncToCloud) syncToCloud();
        
        showToast('물건을 안전하게 보관했습니다!');
        
        // 입력 폼 초기화
        itemNameInput.value = '';
        itemMemoInput.value = '';
        selectedRoomText.textContent = '위치(방) 선택';
        
        // 사진 초기화
        currentPhotoBase64 = null;
        if(photoPreview) {
            photoPreview.style.display = 'none';
            photoPreviewImg.src = '';
            itemPhotoInput.value = '';
        }

        currentSelectedRoom = null;
        roomSelectBtn.classList.remove('filled');
        renderRooms(); // To clear selection
        renderSearchResults([]); // Clear search view
    });

    // 3. Search / Input Filter Logic
    itemNameInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length > 0) {
            // Find matches
            const filtered = savedItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.memo && item.memo.toLowerCase().includes(query))
            );
            renderSearchResults(filtered);
        } else {
            // Clear search results if empty and not selecting a room
            if(currentSelectedRoom) {
               renderSearchResults(savedItems.filter(i => i.room === currentSelectedRoom));
            } else {
               searchResults.classList.add('hidden');
            }
        }
    });

    function renderSearchResults(items) {
        searchResults.innerHTML = '';
        if (items.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        searchResults.classList.remove('hidden');
        
        const title = document.createElement('h3');
        title.style.fontSize = '0.95rem';
        title.style.color = 'var(--text-muted)';
        title.textContent = `찾은 물건 (${items.length})`;
        searchResults.appendChild(title);

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            
            div.innerHTML = `
                <div class="result-info">
                    <h4>${item.name}</h4>
                    <div>
                        <span class="result-badge">${item.room}</span>
                        ${item.memo ? `<p class="result-memo">📝 ${item.memo}</p>` : ''}
                    </div>
                </div>
                <button class="result-delete" data-id="${item.id}" title="삭제">
                    <i data-lucide="trash-2" style="width:18px;height:18px;"></i>
                </button>
            `;

            // Delete logic
            div.querySelector('.result-delete').addEventListener('click', () => {
                if(confirm(`'${item.name}' 기록을 삭제하시겠습니까?`)) {
                    savedItems = savedItems.filter(i => i.id !== item.id);
                    localStorage.setItem('itemFinder_data', JSON.stringify(savedItems));
                    if(window.syncToCloud) syncToCloud();
                    // re-trigger the input event to refresh list
                    itemNameInput.dispatchEvent(new Event('input'));
                    showToast("삭제되었습니다.");
                }
            });

            searchResults.appendChild(div);
        });
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Toast UI
    function showToast(msg) {
        const container = document.getElementById('toastContainer');
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

    // Init
    renderRooms();
    
    // Init Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Title Navigation
    const myRoomsTitle = document.getElementById('myRoomsTitle');
    if (myRoomsTitle) {
        myRoomsTitle.addEventListener('click', () => {
            window.location.href = 'rooms.html';
        });
    }

    // Backup Logic
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
                id: Date.now().toString(),
                date: new Date().toISOString(),
                count: parsed.length,
                data: parsed
            };
            
            backups.unshift(newBackup);
            localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
            if (window.syncBackupsToCloud) window.syncBackupsToCloud().catch(() => {});
            showToast('현재 물건 상태가 성공적으로 백업되었습니다!');
            
            if(window.lucide) {
                btnBackup.innerHTML = '<i data-lucide="check-circle" style="color:#22c55e;"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    btnBackup.innerHTML = '<i data-lucide="save"></i>';
                    lucide.createIcons();
                }, 2000);
            }
        });
    }
    
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
    
    // Re-apply on theme change
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(applyFloatingButtonTheme, 50);
            setTimeout(updateAppTitle, 50);
        });
    });
    
    // Camera upload logic
    let currentPhotoBase64 = null;
    const btnCamera = document.getElementById('btnCamera');
    const itemPhotoInput = document.getElementById('itemPhotoInput');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');

    if(btnCamera && itemPhotoInput) {
        btnCamera.addEventListener('click', () => itemPhotoInput.click());
        
        itemPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400; // Resize to save localStorage
                    let scaleSize = MAX_WIDTH / img.width;
                    if(scaleSize > 1) scaleSize = 1;
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    currentPhotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    
                    if(photoPreviewImg && photoPreview) {
                        photoPreviewImg.src = currentPhotoBase64;
                        photoPreview.style.display = 'block';
                    }
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        });
        
        if(btnRemovePhoto) {
            btnRemovePhoto.addEventListener('click', () => {
                currentPhotoBase64 = null;
                photoPreview.style.display = 'none';
                photoPreviewImg.src = '';
                itemPhotoInput.value = '';
            });
        }
    }

    // Share Logic
    const btnShareApp = document.getElementById('btnShareApp');
    if (btnShareApp) {
        btnShareApp.addEventListener('click', async () => {
            if(window.location.protocol === 'file:') {
                showToast('현재 컴퓨터 내부(로컬)에서 실행 중입니다. 안전한 링크 공유를 위해 알림 가이드를 따라 호스팅 서버에 먼저 배포해주세요!');
                return;
            }
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: '물건어디? - 스마트 홈 인벤토리',
                        text: '우리집 구석구석 숨어있는 물건들, 여기서 한눈에 쉽게 기록하고 찾아보세요!',
                        url: window.location.href,
                    });
                } catch (err) {
                    console.error('공유 취소 또는 실패:', err);
                }
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('링크가 클립보드에 복사되었습니다! 카카오톡이나 메시지에 붙여넣으세요.');
                });
            }
        });
    }
});
