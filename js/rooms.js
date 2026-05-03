document.addEventListener('DOMContentLoaded', () => {
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

    // Update title logic
    function updateAppTitle() {
        const titles = document.querySelectorAll('.app-main-title');
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        
        let qColor = '#ff8c42';
        if(theme === 'dark') qColor = '#fef08a'; // Pastel yellow for dark
        else if(theme === 'alps') qColor = '#0ea5e9';
        else if(theme === 'positano') qColor = '#f59e0b';

        titles.forEach(t => {
            t.innerHTML = `<span style="font-family:'Nanum Pen Script', cursive; color:var(--text-main);">Home item list</span>`;
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
                data: parsed
            };
            
            backups.unshift(newBackup);
            localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
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

    function renderRoomManagerList() {
        if(!roomManagerList) return;
        roomManagerList.innerHTML = '';
        roomArray.forEach((room, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.padding = '6px 10px';
            row.style.background = 'var(--surface-color)';
            row.style.borderRadius = '8px';
            row.style.alignItems = 'center';
            row.innerHTML = `<span style="font-size:0.95rem;">${room}</span><button class="delete-room-btn" data-index="${index}" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>`;
            roomManagerList.appendChild(row);
        });
        roomManagerList.querySelectorAll('.delete-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if(confirm(`'${roomArray[idx]}' 방을 삭제하시겠습니까?\n(방 안에 있는 물건은 삭제되지 않습니다)`)) {
                    roomArray.splice(idx, 1);
                    saveRooms();
                    renderRoomManagerList();
                    renderRoomsContent();
                }
            });
        });
        if(window.lucide) lucide.createIcons();
    }
    
    // View state
    let currentViewMode = 'compact'; // compact, detail, flat
    let globalIsAllSelected = false;
    let allCheckboxesList = [];
    let searchQuery = '';

    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderRoomsContent();
        });
    }

    const viewCompactBtn = document.getElementById('viewCompactBtn');
    const viewDetailBtn = document.getElementById('viewDetailBtn');
    const viewFlatBtn = document.getElementById('viewFlatBtn');
    
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
        const activeStyle = { bg: 'var(--primary-color)', color: 'white' };
        const inactiveStyle = { bg: 'transparent', color: 'var(--text-muted)' };

        if(viewCompactBtn) {
            viewCompactBtn.style.background = currentViewMode === 'compact' ? activeStyle.bg : inactiveStyle.bg;
            viewCompactBtn.style.color = currentViewMode === 'compact' ? activeStyle.color : inactiveStyle.color;
        }
        if(viewDetailBtn) {
            viewDetailBtn.style.background = currentViewMode === 'detail' ? activeStyle.bg : inactiveStyle.bg;
            viewDetailBtn.style.color = currentViewMode === 'detail' ? activeStyle.color : inactiveStyle.color;
        }
        if(viewFlatBtn) {
            viewFlatBtn.style.background = currentViewMode === 'flat' ? activeStyle.bg : inactiveStyle.bg;
            viewFlatBtn.style.color = currentViewMode === 'flat' ? activeStyle.color : inactiveStyle.color;
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
    if(viewFlatBtn) viewFlatBtn.addEventListener('click', () => { currentViewMode = 'flat'; updateViewMode(); });

    // Collapsed state map (true = closed, false = open)
    let collapsedState = {};

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

        // --- 모아보기 (Compact): Room cards in a 3-per-row grid ---
        if (currentViewMode === 'compact') {
            allRoomsContainer.style.display = 'grid';
            allRoomsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
            allRoomsContainer.style.gap = '1rem';

            let renderedCount = 0;
            roomArray.forEach(room => {
                const roomItems = filteredItems.filter(i => i.room === room);
                if (searchQuery !== '' && roomItems.length === 0) return;
                renderedCount++;
                
                const roomCard = document.createElement('div');
                roomCard.style.background = 'var(--surface-color)';
                roomCard.style.border = '1px solid var(--border-color)';
                roomCard.style.borderRadius = '16px';
                roomCard.style.padding = '1.2rem 0.8rem';
                roomCard.style.textAlign = 'center';
                roomCard.style.cursor = 'pointer';
                roomCard.style.transition = 'all 0.2s';
                roomCard.style.boxShadow = 'var(--shadow-sm)';
                roomCard.id = `room-${room}`;

                roomCard.innerHTML = `
                    <div style="font-weight:700; font-size:1rem; color:var(--text-main); margin-bottom:6px;">
                        <i data-lucide="door-closed" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;color:var(--primary-color);"></i>${room}
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${roomItems.length}개 보관</div>
                `;

                roomCard.addEventListener('mouseover', () => {
                    roomCard.style.transform = 'translateY(-3px)';
                    roomCard.style.boxShadow = 'var(--shadow-md)';
                    roomCard.style.borderColor = 'var(--primary-color)';
                });
                roomCard.addEventListener('mouseout', () => {
                    roomCard.style.transform = '';
                    roomCard.style.boxShadow = 'var(--shadow-sm)';
                    roomCard.style.borderColor = 'var(--border-color)';
                });
                roomCard.addEventListener('click', () => {
                    currentViewMode = 'detail';
                    updateViewMode();
                    setTimeout(() => {
                        const el = document.getElementById(`room-${room}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                });

                allRoomsContainer.appendChild(roomCard);
            });

            if (renderedCount === 0) {
                allRoomsContainer.style.display = 'block';
                allRoomsContainer.innerHTML = '<p style="color:var(--text-muted); padding: 1rem; text-align:center;">검색결과가 없거나 저장된 물건이 없습니다.</p>';
            }

            if (window.lucide) lucide.createIcons();
            return;
        }

        // --- 전체보기 (Flat): All items as individual cards in 3-col grid with checkboxes ---
        if (currentViewMode === 'flat') {
            allRoomsContainer.style.display = 'grid';
            allRoomsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
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
        allRoomsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
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
            const newBackup = { id: Date.now().toString(), date: new Date().toISOString(), count: parsed.length, data: parsed };
            backups.unshift(newBackup);
            localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
            showToast('현재 물건 상태가 성공적으로 백업되었습니다!');
            if(window.lucide) {
                btnBackup.innerHTML = '<i data-lucide="check-circle" style="color:#22c55e;"></i>';
                lucide.createIcons();
                setTimeout(() => { btnBackup.innerHTML = '<i data-lucide="save"></i>'; lucide.createIcons(); }, 2000);
            }
        });
    }
});
