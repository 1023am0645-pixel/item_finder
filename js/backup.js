document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('itemFinder_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

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

    const backupContainer = document.getElementById('backupContainer');
    
    function renderBackups() {
        let backups = JSON.parse(localStorage.getItem('itemFinder_backups')) || [];
        backupContainer.innerHTML = '';
        
        if(backups.length === 0) {
            backupContainer.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:3rem 0;background:var(--bg-color);border-radius:var(--radius-xl);border:1px dashed var(--border-color);"><i data-lucide="hard-drive" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3;"></i><br>저장된 백업 기록이 없습니다.</div>';
            if(window.lucide) lucide.createIcons();
            return;
        }
        
        backups.forEach((b, index) => {
            const card = document.createElement('div');
            card.style.background = 'var(--bg-color)';
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = 'var(--radius-md)';
            card.style.padding = '1.2rem';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '0.8rem';

            const d = new Date(b.date);
            const localDateStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:nowrap; overflow:hidden;">
                    ${index === 0 ? '<span style="flex-shrink:0; background:var(--primary-color);color:white;font-size:0.7rem;padding:2px 7px;border-radius:10px;white-space:nowrap;">최근</span>' : ''}
                    <span style="font-weight:700; color:var(--text-main); font-size:1rem; white-space:nowrap;">${localDateStr}</span>
                    <span style="color:var(--text-muted); font-size:0.85rem; white-space:nowrap; margin-left:auto; flex-shrink:0;"><i data-lucide="box" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"></i>${b.count}개</span>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-restore" style="flex:1; background:var(--primary-color); color:white; border:none; padding:0.6rem 0; border-radius:12px; font-weight:600; cursor:pointer; font-size:0.9rem;"><i data-lucide="download" style="width:15px;height:15px;vertical-align:middle;margin-right:4px;"></i>이 상태로 복구</button>
                    <button class="btn-delete" style="flex-shrink:0; background:rgba(239,68,68,0.1); color:#ef4444; border:none; padding:0.6rem 1rem; border-radius:12px; font-weight:600; cursor:pointer;"><i data-lucide="trash-2" style="width:15px;height:15px;vertical-align:middle;"></i></button>
                </div>
            `;
            
            card.querySelector('.btn-restore').addEventListener('hover', function() { this.style.transform = 'translateY(-2px)'; });
            card.querySelector('.btn-restore').addEventListener('click', () => {
                if(confirm(`'${localDateStr}' 백업 지점으로 전체 물건 데이터를 복구하시겠습니까?\n(현재의 기록된 물건들은 이 백업본으로 덮어씌워집니다)`)) {
                    localStorage.setItem('itemFinder_data', JSON.stringify(b.data));
                    showToast('데이터가 완벽하게 복구되었습니다!');
                }
            });
            
            card.querySelector('.btn-delete').addEventListener('click', () => {
                if(confirm('이 백업 기록을 삭제하시겠습니까?')) {
                    backups = backups.filter(bk => bk.id !== b.id);
                    localStorage.setItem('itemFinder_backups', JSON.stringify(backups));
                    renderBackups();
                    showToast('백업 기록이 삭제되었습니다.');
                }
            });
            
            backupContainer.appendChild(card);
        });
        
        if(window.lucide) lucide.createIcons();
    }
    
    renderBackups();
});
