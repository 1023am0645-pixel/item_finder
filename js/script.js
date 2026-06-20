document.addEventListener('DOMContentLoaded', () => {
    const APP_UPDATE_HISTORY = [
        {
            version: 'v37',
            date: '2026.06.20.',
            items: [
                '모바일 기록 서버 업로드 복구',
                '서버 저장 실패 원인 표시'
            ]
        },
        {
            version: 'v36',
            date: '2026.06.20.',
            items: [
                '기기별 임시 그룹 자동 병합',
                '동기화 상태 확인 기능 추가'
            ]
        },
        {
            version: 'v35',
            date: '2026.06.20.',
            items: [
                '같은 계정의 저장 목록 불러오기 보강',
                '여러 기기 동기화 그룹 선택 오류 개선'
            ]
        },
        {
            version: 'v34',
            date: '2026.06.20.',
            items: [
                '기기 간 클라우드 불러오기 안정화',
                '모바일 로컬 기록 서버 반영 보강'
            ]
        },
        {
            version: 'v33',
            date: '2026.05.31.',
            items: [
                '기존 물건 정보 수정 기능 추가',
                '위치, 구역, 메모, 사진 변경 지원'
            ]
        },
        {
            version: 'v32',
            date: '2026.05.24.',
            items: [
                '카카오 계정 서버 연결 확인 보강',
                '관리자 사용자 목록 누락 방지'
            ]
        },
        {
            version: 'v31',
            date: '2026.05.24.',
            items: [
                '카카오톡 고객센터 1:1 채팅 연결'
            ]
        },
        {
            version: 'v30',
            date: '2026.05.24.',
            items: [
                '문의하기 메뉴명 정리',
                '카카오톡 고객센터 버튼으로 단순화'
            ]
        },
        {
            version: 'v29',
            date: '2026.05.24.',
            items: [
                '문의하기 기능 추가',
                '접속 기록 저장 준비',
                '관리자 페이지 설계 문서 추가'
            ]
        },
        {
            version: 'v28',
            date: '2026.05.20.',
            items: [
                '다크테마 선택 글자색 개선',
                '백업/복원 버튼명 정리'
            ]
        },
        {
            version: 'v27',
            date: '2026.05.20.',
            items: [
                '사용설명서 항목 정리',
                '세부 구역 추가 안내 보강',
                '물건 등록 입력칸 간격 조정'
            ]
        },
        {
            version: 'v26',
            date: '2026.05.20.',
            items: [
                '메인 화면 제목 위치 조정',
                '2페이지 제목 글씨체 복구',
                '2페이지 검색 입력 버튼 추가'
            ]
        },
        {
            version: 'v25',
            date: '2026.05.20.',
            items: [
                '닉네임 수정 팝업 디자인 개선',
                '카카오톡 초대 버튼과 설정 하위 메뉴 정리',
                '앱 제목 폰트와 사용설명서 가독성 개선'
            ]
        },
        {
            version: 'v24',
            date: '2026.05.20.',
            items: [
                '계정 관리 메뉴와 사용설명서 가독성 개선',
                '카카오톡 가족 초대 공유 방식 적용',
                '앱 제목과 백업센터 화면 정리'
            ]
        },
        {
            version: 'v23',
            date: '2026.05.20.',
            items: [
                '설정 화면 구성을 더 보기 쉽게 정리',
                '백업 기록에 백업자 표시 추가',
                '2페이지에서 바로 설정 열기 지원'
            ]
        },
        {
            version: 'v22',
            date: '2026.05.19.',
            items: [
                '2페이지 우측 상단에 설정 버튼 추가',
                '앱 사용설명서를 항목별 펼쳐보기 방식으로 개선',
                '앱 설치방법 안내와 설치 아이콘 표시 추가'
            ]
        },
        {
            version: 'v21',
            date: '2026.05.19.',
            items: [
                '최신버전 여부를 앱 접속 시 자동 확인',
                '최신버전이 아닐 때 업데이트 안내 팝업 표시',
                '업데이트 버튼으로 앱 새로고침 실행'
            ]
        },
        {
            version: 'v20',
            date: '2026.05.19.',
            items: [
                '배포 버전을 자동으로 읽어 업데이트 팝업과 설정 버전 표시 반영',
                '새 배포 시 업데이트 팝업이 자동으로 다시 표시되도록 개선',
                '업데이트 내역 보기에서도 최신 배포 버전이 자동으로 표시되도록 수정'
            ]
        },
        {
            version: 'v19',
            date: '2026.05.19.',
            items: [
                '모바일 보기 메뉴 수정사항이 업데이트 팝업에 표시되지 않던 문제 수정',
                '앱 설정의 업데이트 내역에서 최신 변경사항을 확인할 수 있도록 보정',
                '배포 캐시 버전과 앱 표시 버전이 어긋나던 문제 점검'
            ]
        },
        {
            version: 'v18',
            date: '2026.05.19.',
            items: [
                '모바일 2페이지 보기 메뉴 줄바꿈 개선',
                '좁은 화면에서는 모아/보기, 펼쳐/보기처럼 자연스럽게 표시',
                '넓은 화면과 가로보기에서는 기존처럼 한 줄 표시 유지'
            ]
        },
        {
            version: 'v17',
            date: '2026.05.18.',
            items: [
                '설정에서 업데이트 내역 다시보기 추가',
                '이탈리아/스위스 테마에서도 업데이트 화면 가독성 개선',
                '업데이트 화면을 불투명 배경과 고정 글자색으로 안정화'
            ]
        },
        {
            version: 'v16',
            date: '2026.05.18.',
            items: [
                '업데이트 상세 팝업을 Play스토어식 스크롤 화면으로 개선',
                '앱 설정에 사용설명서 추가',
                '설정 하단에 현재 버전과 최신 버전 상태 표시'
            ]
        },
        {
            version: 'v15',
            date: '2026.05.18.',
            items: [
                '로컬 백업 파일 백업하기/복원하기 추가',
                '백업 파일에 물건, 방, 구역, 테마 정보 포함',
                '앱 접속 시 최신 업데이트 안내 표시'
            ]
        },
        {
            version: 'v14',
            date: '2026.05.18.',
            items: [
                '구역 정보 즉시 클라우드 동기화',
                '닉네임 재로그인 자동 복원',
                '백업 생성/복원에 구역과 방 정보 포함'
            ]
        },
        {
            version: 'v13',
            date: '2026.05.18.',
            items: [
                '구역 데이터 백업/복원 및 클라우드 싱크 포함',
                '백업 센터 복원 시 구역 정보 함께 복원'
            ]
        },
        {
            version: 'v12',
            date: '2026.05.18.',
            items: [
                '방 관리 목록 렌더링 안정화',
                '서비스워커 캐시 갱신 안정화'
            ]
        },
        {
            version: 'v11',
            date: '2026.05.18.',
            items: [
                '방 관리 화면 캐시 갱신',
                '모바일/웹 최신 스크립트 강제 로드 처리'
            ]
        },
        {
            version: 'v10',
            date: '2026.05.18.',
            items: [
                '방 관리 목록 표시 오류 수정',
                '모바일 2열 레이아웃 및 가로보기 모드 지원'
            ]
        },
        {
            version: 'v9',
            date: '2026.05.18.',
            items: [
                '골라보기 탭 추가',
                '방별 구역 설정과 구역 배지 표시 추가'
            ]
        }
    ];

    function getDeployedAppVersion() {
        const scriptTag = document.querySelector('script[src*="js/script.js"]');
        if (!scriptTag) return APP_UPDATE_HISTORY[0].version;
        try {
            const url = new URL(scriptTag.getAttribute('src'), window.location.href);
            const version = url.searchParams.get('v');
            return version ? `v${version}` : APP_UPDATE_HISTORY[0].version;
        } catch(e) {
            return APP_UPDATE_HISTORY[0].version;
        }
    }

    function getTodayText() {
        const d = new Date();
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.`;
    }

    const APP_VERSION = getDeployedAppVersion();
    let appLatestVersion = APP_VERSION;
    let appLatestDate = '';
    const currentUpdate = APP_UPDATE_HISTORY.find(update => update.version === APP_VERSION) || {
        version: APP_VERSION,
        date: getTodayText(),
        items: [
            '새 버전 배포가 적용되었습니다.',
            '최신 파일과 화면 구성이 반영되었습니다.',
            '자세한 변경사항은 다음 업데이트 내역에 정리됩니다.'
        ]
    };
    const APP_RELEASE_DATE = currentUpdate.date;
    window.ITEM_FINDER_APP_VERSION = APP_VERSION;
    window.ITEM_FINDER_APP_RELEASE_DATE = APP_RELEASE_DATE;

    function getVersionNumber(version) {
        return parseInt(String(version || '').replace(/[^0-9]/g, ''), 10) || 0;
    }

    async function fetchLatestVersionInfo() {
        try {
            const res = await fetch(`version.json?ts=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return null;
            const info = await res.json();
            if (info && info.version) {
                appLatestVersion = info.version;
                appLatestDate = info.date || '';
                updateVersionStatus();
                return info;
            }
        } catch(e) {}
        return null;
    }

    function isCurrentVersionLatest() {
        return getVersionNumber(APP_VERSION) >= getVersionNumber(appLatestVersion);
    }

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
        updateAppTitle();
        if (window.restoreKakaoCloudIdentity) window.restoreKakaoCloudIdentity({ force: true }).catch(() => {});
        if (window.recordUsageEvent) window.recordUsageEvent('visit').catch(() => {});
        setTimeout(checkVersionAndShowStartupPopup, 300);
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

    function requestKakaoProfile() {
        return new Promise((resolve, reject) => {
            if (!window.Kakao || !window.Kakao.API) {
                reject(new Error('Kakao SDK is not ready'));
                return;
            }
            window.Kakao.API.request({
                url: '/v2/user/me',
                success: resolve,
                fail: reject
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
            if (window.recordUsageEvent) window.recordUsageEvent('login', { force: true }).catch(() => {});
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
                checkVersionAndShowStartupPopup();
            }, 400);
            (async () => {
                if (!localStorage.getItem('kc_user_id')) {
                    try {
                        const profile = await requestKakaoProfile();
                        if (profile && profile.id && window.setCloudUserId) window.setCloudUserId(profile.id);
                    } catch(e) {
                        console.warn('Kakao profile restore skipped:', e);
                    }
                }
                if (window.getOrCreateGroup) await window.getOrCreateGroup().catch(() => {});
                if (window.updateNicknameInCloud) await window.updateNicknameInCloud(finalNick).catch(() => {});
                if (window.syncToCloud) await window.syncToCloud().catch(() => {});
                if (window.recordUsageEvent) await window.recordUsageEvent('login', { force: true }).catch(() => {});
            })();
        };
    }

    // Basic elements
    const itemNameInput = document.getElementById('itemName');
    const roomSelectBtn = document.getElementById('btnSelectRoom');

    function escapeHTML(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

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
                t.innerHTML = `<span class="app-title-owner" style="color:${baseTextColor};"><span class="app-title-nickname">${escapeHTML(nick)}</span><span class="app-title-particle"> 의 </span></span><span class="app-title-brand" style="color:${baseTextColor};">물건어디</span><span class="app-title-question" style="color:${qColor}; margin-left:4px; font-size:1.02em; display:inline-block; transform:translateY(1px);">?</span>`;
            } else {
                if (isRoomsPage) {
                    t.innerHTML = `<span class="rooms-title-brand">Home item list</span>`;
                } else {
                    t.innerHTML = `<span class="app-title-brand" style="color:${baseTextColor};">물건어디</span><span class="app-title-question" style="color:${qColor}; margin-left:4px; font-size:1.02em; display:inline-block; transform:translateY(1px);">?</span>`;
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
    
    // 새로고침 버튼 (설정 안에 있음)
    const btnSyncRefresh = document.getElementById('btnSyncRefresh');
    if (btnSyncRefresh) {
        btnSyncRefresh.addEventListener('click', async () => {
            const icon = btnSyncRefresh.querySelector('svg') || btnSyncRefresh.querySelector('i');
            btnSyncRefresh.disabled = true;
            btnSyncRefresh.style.opacity = '0.6';
            if (icon) {
                icon.style.transition = 'transform 0.8s linear';
                icon.style.transform = 'rotate(360deg)';
            }
            showToast('☁️ 클라우드에서 데이터 불러오는 중...');

            if (window.restoreKakaoCloudIdentity) {
                await window.restoreKakaoCloudIdentity({ force: true }).catch(() => {});
            }
            if (window.loadFromCloud) {
                await window.loadFromCloud().catch(() => {});
            }
            showToast('✅ 완료! 화면을 새로고침합니다.');
            setTimeout(() => window.location.reload(), 1000);
        });
    }

    const btnSyncDiagnostics = document.getElementById('btnSyncDiagnostics');
    const syncDiagnosticsOutput = document.getElementById('syncDiagnosticsOutput');
    if (btnSyncDiagnostics && syncDiagnosticsOutput) {
        btnSyncDiagnostics.addEventListener('click', async () => {
            btnSyncDiagnostics.disabled = true;
            btnSyncDiagnostics.textContent = '확인 중...';
            try {
                if (!window.getCloudSyncDiagnostics || !window.formatCloudSyncDiagnostics) {
                    throw new Error('진단 기능을 불러오지 못했어요.');
                }
                const diagnostics = await window.getCloudSyncDiagnostics();
                const text = window.formatCloudSyncDiagnostics(diagnostics);
                syncDiagnosticsOutput.textContent = text;
                syncDiagnosticsOutput.style.display = 'block';
                await copyText(text).catch(() => false);
                showToast('동기화 상태를 확인했어요. 내용도 복사했습니다.');
            } catch(e) {
                syncDiagnosticsOutput.textContent = '동기화 상태 확인에 실패했어요.\n' + (e.message || e);
                syncDiagnosticsOutput.style.display = 'block';
                showToast('동기화 상태 확인에 실패했어요.');
            } finally {
                btnSyncDiagnostics.disabled = false;
                btnSyncDiagnostics.textContent = '동기화 상태 확인';
            }
        });
    }

    // Settings Overlay Logic
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const btnToggleAccountActions = document.getElementById('btnToggleAccountActions');
    const accountActionList = document.getElementById('accountActionList');
    const btnEditNickname = document.getElementById('btnEditNickname');
    const btnKakaoLogout = document.getElementById('btnKakaoLogout');
    const btnInviteFamily = document.getElementById('btnInviteFamily');

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

    if (btnInviteFamily) {
        btnInviteFamily.addEventListener('click', async () => {
            btnInviteFamily.disabled = true;
            btnInviteFamily.textContent = '초대 코드 생성 중...';

            const myNick = localStorage.getItem('kc_nickname') || '가족';
            let code = null;

            if (window.createInviteCode) {
                code = await window.createInviteCode();
            }

            btnInviteFamily.disabled = false;
            btnInviteFamily.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#000;"><path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.83 5.37 4.6 6.78-.3.97-1.12 3.65-1.14 3.75-.03.14.05.21.16.2.14-.02 3.86-2.58 5.34-3.6.35.04.7.07 1.04.07 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg> 카카오톡으로 가족 초대하기`;

            if (!code) { showToast('초대 코드 생성에 실패했어요. 다시 시도해주세요.'); return; }

            try {
                await shareInviteToKakao(code, myNick);
            } catch(e) {
                showToast('초대 공유를 완료하지 못했어요.');
            }
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

    function openSettingsOverlay() {
        if (!settingsOverlay) return;
            renderBackupList();
            settingsOverlay.style.display = 'flex';
            if(window.lucide) lucide.createIcons();
    }

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', openSettingsOverlay);
        btnCloseSettings.addEventListener('click', () => {
            settingsOverlay.style.display = 'none';
            if (window.location.hash === '#settings') {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        });
        if (btnToggleAccountActions && accountActionList) {
            btnToggleAccountActions.addEventListener('click', () => {
                accountActionList.style.display = accountActionList.style.display === 'flex' ? 'none' : 'flex';
            });
        }
        btnEditNickname.addEventListener('click', () => {
            openNicknameDialog(localStorage.getItem('kc_nickname') || '', nick => {
                localStorage.setItem('kc_nickname', nick);
                updateAppTitle();
                showToast('닉네임이 변경되었습니다.');
                if (window.updateNicknameInCloud) window.updateNicknameInCloud(nick).catch(() => {});
            });
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
    }

    const btnShareSupportReport = document.getElementById('btnShareSupportReport');
    if (btnShareSupportReport) {
        btnShareSupportReport.addEventListener('click', async () => {
            if (!window.itemFinderSupport) return;
            const originalHTML = btnShareSupportReport.innerHTML;
            btnShareSupportReport.disabled = true;
            btnShareSupportReport.textContent = '고객센터 여는 중...';
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
                btnShareSupportReport.disabled = false;
                btnShareSupportReport.innerHTML = originalHTML;
                if (window.lucide) lucide.createIcons();
            }
        });
    }

    if (window.location.hash === '#settings') {
        setTimeout(openSettingsOverlay, 250);
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
    // Structure: [{ id, name, room, zone, memo, photo, createdAt }]
    let savedItems = JSON.parse(localStorage.getItem('itemFinder_data')) || [];

    // State
    let currentSelectedRoom = null; // for adding items
    let currentSelectedZone = null; // for adding items (optional)

    function loadZoneData() {
        return JSON.parse(localStorage.getItem('itemFinder_zones') || '{}');
    }

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
            const author = b.authorNickname || b.createdByNickname || '기존 백업';
            row.innerHTML = `<div style="display:flex;flex-direction:column;gap:2px;min-width:0;">
                    <span style="font-size:0.85rem;color:var(--text-main);">${dateStr} (${b.count}개)</span>
                    <span style="font-size:0.72rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">백업자: ${author}</span>
                </div>
                <div style="display:flex;gap:4px;align-items:center;">
                    <button class="restore-backup-btn" data-index="${idx}" style="background:var(--primary-color);color:var(--primary-contrast);border:none;border-radius:6px;padding:4px 8px;font-size:0.8rem;cursor:pointer;">복원</button>
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
                    if (backups[idx].zones) localStorage.setItem('itemFinder_zones', JSON.stringify(backups[idx].zones));
                    if (backups[idx].rooms && backups[idx].rooms.length > 0) localStorage.setItem('itemFinder_rooms', JSON.stringify(backups[idx].rooms));
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

    function setupManualAndVersionInfo() {
        const manualBtn = document.getElementById('btnToggleManual');
        const manualPanel = document.getElementById('appManualPanel');
        const manualLabel = document.getElementById('manualToggleLabel');
        const manualIcon = document.getElementById('manualToggleIcon');
        if (manualBtn && manualPanel) {
            manualBtn.addEventListener('click', () => {
                const isOpen = manualPanel.style.display === 'block';
                manualPanel.style.display = isOpen ? 'none' : 'block';
                if (manualLabel) {
                    manualLabel.innerHTML = isOpen
                        ? '<i data-lucide="book-open" style="width:16px;height:16px;vertical-align:-3px;margin-right:5px;"></i>사용설명서 보기'
                        : '<i data-lucide="book-open" style="width:16px;height:16px;vertical-align:-3px;margin-right:5px;"></i>사용설명서 접기';
                }
                if (manualIcon) {
                    manualIcon.innerHTML = isOpen
                        ? '<i data-lucide="chevron-down" style="width:16px;height:16px;"></i>'
                        : '<i data-lucide="chevron-up" style="width:16px;height:16px;"></i>';
                }
                if (window.lucide) lucide.createIcons();
            });
        }
        document.querySelectorAll('.manual-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                if (!content || !content.classList.contains('manual-topic-content')) return;
                const isOpen = content.style.display === 'block';
                content.style.display = isOpen ? 'none' : 'block';
                const icon = btn.querySelector('i[data-lucide]');
                if (icon) icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
                if (window.lucide) lucide.createIcons();
            });
        });

        const versionText = document.getElementById('settingsVersionText');
        const versionStatus = document.getElementById('settingsVersionStatus');
        const btnOpenUpdateDetails = document.getElementById('btnOpenUpdateDetails');
        const btnAppUpdate = document.getElementById('btnAppUpdate');
        if (versionText) versionText.textContent = `${APP_VERSION} · ${APP_RELEASE_DATE}`;
        updateVersionStatus();
        if (btnOpenUpdateDetails) {
            btnOpenUpdateDetails.addEventListener('click', () => openUpdateDetails(false));
        }
        if (btnAppUpdate) {
            btnAppUpdate.addEventListener('click', refreshAppForUpdate);
        }
    }

    function updateVersionStatus() {
        const versionStatus = document.getElementById('settingsVersionStatus');
        if (!versionStatus) return;
        const isLatest = isCurrentVersionLatest();
        versionStatus.textContent = isLatest
            ? '최신버전입니다'
            : `최신버전(${appLatestVersion}${appLatestDate ? ' · ' + appLatestDate : ''})으로 업데이트가 필요합니다. 화면을 아래로 길게 당겨 앱 새로고침을 해 주세요`;
        versionStatus.style.color = isLatest ? 'var(--text-muted)' : '#ef4444';
    }

    function renderUpdateHistory() {
        const latestMeta = document.getElementById('latestUpdateMeta');
        const latestItems = document.getElementById('latestUpdateItems');
        const previousList = document.getElementById('previousUpdateList');
        if (latestMeta) latestMeta.textContent = `${currentUpdate.version} · ${currentUpdate.date}`;
        if (latestItems) {
            latestItems.innerHTML = currentUpdate.items
                .map((item, index) => `<p style="margin:0${index === currentUpdate.items.length - 1 ? '' : ' 0 0.55rem'};">• ${item}</p>`)
                .join('');
        }
        if (previousList) {
            const previousUpdates = APP_UPDATE_HISTORY.filter(update => update.version !== currentUpdate.version);
            previousList.innerHTML = previousUpdates.map(update => `
                <div>
                    <p style="margin:0 0 0.35rem;font-weight:800;">${update.version} · ${update.date}</p>
                    <p style="margin:0;color:#5f6368;">${update.items.map(item => `• ${item}`).join('<br>')}</p>
                </div>
            `).join('');
        }
    }

    function buildLocalBackupPayload() {
        return {
            app: 'item_finder',
            version: 1,
            exportedAt: new Date().toISOString(),
            data: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
            rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
            zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}'),
            backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
            theme: localStorage.getItem('itemFinder_theme') || 'light',
            nickname: localStorage.getItem('kc_nickname') || ''
        };
    }

    function exportLocalBackup() {
        const payload = buildLocalBackupPayload();
        const d = new Date();
        const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `item_finder_backup_${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('로컬 백업 파일을 내보냈습니다.');
        if (window.recordUsageEvent) window.recordUsageEvent('backup_export', { force: true }).catch(() => {});
    }

    async function importLocalBackupFile(file) {
        try {
            const text = await file.text();
            const payload = JSON.parse(text);
            if (payload.app !== 'item_finder' || !Array.isArray(payload.data)) {
                alert('물건어디 백업 파일이 아니거나 형식이 올바르지 않습니다.');
                return;
            }
            if (!confirm(`백업 파일의 데이터로 복원하시겠습니까?\n물건 ${payload.data.length}개와 방/구역 정보가 현재 기기에 적용됩니다.`)) return;

            localStorage.setItem('itemFinder_data', JSON.stringify(payload.data || []));
            localStorage.setItem('itemFinder_rooms', JSON.stringify(Array.isArray(payload.rooms) ? payload.rooms : []));
            localStorage.setItem('itemFinder_zones', JSON.stringify(payload.zones && typeof payload.zones === 'object' ? payload.zones : {}));
            if (Array.isArray(payload.backups)) localStorage.setItem('itemFinder_backups', JSON.stringify(payload.backups));
            if (payload.theme) localStorage.setItem('itemFinder_theme', payload.theme);
            if (payload.nickname) localStorage.setItem('kc_nickname', payload.nickname);
            if(window.syncToCloud) await window.syncToCloud().catch(() => {});

            showToast('로컬 백업 파일을 복원했습니다.');
            if (window.recordUsageEvent) window.recordUsageEvent('backup_import', { force: true }).catch(() => {});
            setTimeout(() => window.location.reload(), 700);
        } catch(e) {
            alert('백업 파일을 읽지 못했습니다. JSON 파일인지 확인해주세요.');
        }
    }

    const btnExportLocalBackupSettings = document.getElementById('btnExportLocalBackupSettings');
    const btnImportLocalBackupSettings = document.getElementById('btnImportLocalBackupSettings');
    const localBackupFileInputSettings = document.getElementById('localBackupFileInputSettings');
    if (btnExportLocalBackupSettings) btnExportLocalBackupSettings.addEventListener('click', exportLocalBackup);
    if (btnImportLocalBackupSettings && localBackupFileInputSettings) {
        btnImportLocalBackupSettings.addEventListener('click', () => localBackupFileInputSettings.click());
        localBackupFileInputSettings.addEventListener('change', () => {
            const file = localBackupFileInputSettings.files && localBackupFileInputSettings.files[0];
            if (file) importLocalBackupFile(file).finally(() => { localBackupFileInputSettings.value = ''; });
        });
    }

    function openUpdateDetails(markSeenOnClose) {
        const overlay = document.getElementById('updateOverlay');
        const closeBtn = document.getElementById('btnCloseUpdateOverlay');
        if (!overlay || !closeBtn) return;

        overlay.style.display = 'flex';
        const scrollArea = overlay.querySelector('div[style*="overflow-y:auto"]');
        if (scrollArea) scrollArea.scrollTop = 0;
        if (window.lucide) lucide.createIcons();
        closeBtn.onclick = () => {
            if (markSeenOnClose) {
                localStorage.setItem('itemFinder_seen_update_' + APP_VERSION, 'true');
            }
            overlay.style.display = 'none';
        };
    }

    function showLatestUpdatePopup() {
        const storageKey = 'itemFinder_seen_update_' + APP_VERSION;
        if (localStorage.getItem(storageKey) === 'true') return;
        openUpdateDetails(true);
    }

    function showOutdatedVersionPopup(latestInfo) {
        let overlay = document.getElementById('outdatedVersionOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'outdatedVersionOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.52);z-index:9700;display:none;align-items:center;justify-content:center;padding:1rem;';
            overlay.innerHTML = `
                <div style="width:100%;max-width:360px;background:#ffffff;color:#202124;border-radius:18px;padding:1.4rem;box-shadow:0 20px 40px rgba(15,23,42,0.22);">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.9rem;">
                        <div style="width:38px;height:38px;border-radius:12px;background:rgba(255,140,66,0.12);color:#ff8c42;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i data-lucide="refresh-cw" style="width:20px;height:20px;"></i>
                        </div>
                        <div>
                            <h2 style="margin:0;font-size:1.1rem;font-weight:800;color:#202124;">최신버전이 아닙니다</h2>
                            <p id="outdatedVersionMeta" style="margin:3px 0 0;color:#5f6368;font-size:0.78rem;"></p>
                        </div>
                    </div>
                    <p style="margin:0 0 1.2rem;color:#3c4043;font-size:0.94rem;line-height:1.55;">최신버전이 아닙니다. 업데이트 해 주세요.</p>
                    <button id="btnReloadForUpdate" style="width:100%;background:#ff8c42;color:white;border:none;border-radius:12px;padding:0.82rem;font-weight:800;cursor:pointer;font-size:0.95rem;">업데이트</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        const meta = document.getElementById('outdatedVersionMeta');
        if (meta) {
            meta.textContent = `현재 ${APP_VERSION} · 최신 ${latestInfo.version}${latestInfo.date ? ' · ' + latestInfo.date : ''}`;
        }
        const btnReload = document.getElementById('btnReloadForUpdate');
        if (btnReload) {
            btnReload.onclick = refreshAppForUpdate;
        }
        overlay.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    }

    async function refreshAppForUpdate() {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.update().catch(() => {})));
            }
        } catch(e) {}
        window.location.reload();
    }

    async function checkVersionAndShowStartupPopup() {
        const latestInfo = await fetchLatestVersionInfo();
        if (latestInfo && getVersionNumber(latestInfo.version) > getVersionNumber(APP_VERSION)) {
            showOutdatedVersionPopup(latestInfo);
            return;
        }
        showLatestUpdatePopup();
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
        currentSelectedZone = null;
        selectedRoomText.textContent = roomName;
        roomSelectBtn.classList.add('filled');
        if(roomDropdown) roomDropdown.classList.add('hidden');
        renderRooms();

        // 구역 드롭다운 처리
        const zones = loadZoneData();
        const roomZones = zones[roomName] || [];
        const zoneRow = document.getElementById('zoneSelectRow');
        const selectedZoneText = document.getElementById('selectedZoneText');
        const btnSelectZone = document.getElementById('btnSelectZone');
        if (zoneRow) {
            if (roomZones.length > 0) {
                zoneRow.style.display = 'block';
                if (selectedZoneText) selectedZoneText.textContent = '구역 선택 (선택사항)';
                if (btnSelectZone) btnSelectZone.classList.remove('filled');
                populateZoneDropdown(roomZones);
            } else {
                zoneRow.style.display = 'none';
            }
        }

        if(itemNameInput.value.trim() === '') {
            renderSearchResults(savedItems.filter(i => i.room === roomName));
        }
    }

    function populateZoneDropdown(zoneList) {
        const optList = document.getElementById('zoneOptionList');
        const zoneDropdownEl = document.getElementById('zoneDropdown');
        const btnSelectZone = document.getElementById('btnSelectZone');
        const selectedZoneText = document.getElementById('selectedZoneText');
        if (!optList) return;
        optList.innerHTML = '';

        const noneBtn = document.createElement('button');
        noneBtn.className = 'room-btn';
        noneBtn.textContent = '구역 없음';
        noneBtn.addEventListener('click', () => {
            currentSelectedZone = null;
            if (selectedZoneText) selectedZoneText.textContent = '구역 선택 (선택사항)';
            if (btnSelectZone) btnSelectZone.classList.remove('filled');
            if (zoneDropdownEl) zoneDropdownEl.classList.add('hidden');
        });
        optList.appendChild(noneBtn);

        zoneList.forEach(zone => {
            const btn = document.createElement('button');
            btn.className = 'room-btn';
            btn.textContent = zone;
            btn.addEventListener('click', () => {
                currentSelectedZone = zone;
                if (selectedZoneText) selectedZoneText.textContent = zone;
                if (btnSelectZone) btnSelectZone.classList.add('filled');
                if (zoneDropdownEl) zoneDropdownEl.classList.add('hidden');
            });
            optList.appendChild(btn);
        });
        if (window.lucide) lucide.createIcons();
    }

    const roomDropdown = document.getElementById('roomDropdown');
    const zoneDropdownEl = document.getElementById('zoneDropdown');
    const btnSelectZone = document.getElementById('btnSelectZone');

    // Room Select Button logic (Toggle Dropdown)
    roomSelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomDropdown.classList.toggle('hidden');
        if (zoneDropdownEl) zoneDropdownEl.classList.add('hidden');
    });

    if (btnSelectZone) {
        btnSelectZone.addEventListener('click', (e) => {
            e.stopPropagation();
            if (zoneDropdownEl) zoneDropdownEl.classList.toggle('hidden');
            roomDropdown.classList.add('hidden');
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!roomDropdown.contains(e.target) && !roomSelectBtn.contains(e.target)) {
            roomDropdown.classList.add('hidden');
        }
        if (zoneDropdownEl && btnSelectZone && !zoneDropdownEl.contains(e.target) && !btnSelectZone.contains(e.target)) {
            zoneDropdownEl.classList.add('hidden');
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
            zone: currentSelectedZone || null,
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
        currentSelectedZone = null;
        roomSelectBtn.classList.remove('filled');
        const zoneRowEl = document.getElementById('zoneSelectRow');
        const selZoneText = document.getElementById('selectedZoneText');
        if (zoneRowEl) zoneRowEl.style.display = 'none';
        if (selZoneText) selZoneText.textContent = '구역 선택 (선택사항)';
        if (btnSelectZone) btnSelectZone.classList.remove('filled');
        renderRooms();
        renderSearchResults([]);
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
                        ${item.zone ? `<span class="result-badge" style="background:rgba(99,102,241,0.1);color:#6366f1;border-color:rgba(99,102,241,0.3);">${item.zone}</span>` : ''}
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

    async function refreshCloudDataOnStartup() {
        if (!isKakaoLoggedIn) return;
        if (!window.loadFromCloud) return;

        const beforeItems = localStorage.getItem('itemFinder_data') || '[]';
        try {
            if (window.restoreKakaoCloudIdentity) {
                await window.restoreKakaoCloudIdentity({ force: true }).catch(() => {});
            }
            const loaded = await window.loadFromCloud().catch(() => false);
            if (!loaded) return;

            savedItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
            const cloudRooms = JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]');
            rooms = Array.isArray(cloudRooms) && cloudRooms.length > 0 ? cloudRooms : defaultRooms;
            renderRooms();

            const query = itemNameInput.value.trim().toLowerCase();
            if (query.length > 0) {
                renderSearchResults(savedItems.filter(item =>
                    (item.name && item.name.toLowerCase().includes(query)) ||
                    (item.memo && item.memo.toLowerCase().includes(query))
                ));
            } else if (currentSelectedRoom) {
                renderSearchResults(savedItems.filter(i => i.room === currentSelectedRoom));
            }

            const afterItems = localStorage.getItem('itemFinder_data') || '[]';
            if (beforeItems !== afterItems) {
                showToast('클라우드 데이터를 불러왔습니다.');
            }
        } catch(e) {
            console.warn('Startup cloud refresh skipped:', e);
        }
    }

    // Init
    renderRooms();
    setupManualAndVersionInfo();
    renderUpdateHistory();
    refreshCloudDataOnStartup();
    
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
                data: parsed,
                authorNickname: localStorage.getItem('kc_nickname') || '회원',
                authorUserId: localStorage.getItem('kc_user_id') || '',
                zones: JSON.parse(localStorage.getItem('itemFinder_zones') || '{}'),
                rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]')
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

});
