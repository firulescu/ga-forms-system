// ============================================================
// GA FORMS SYSTEM - Shared UI Utilities
// ============================================================

const UI = {
  // Toast notifications
  toast(msg, type = 'success', duration = 3500) {
    const existing = document.getElementById('toast-container');
    if (!existing) {
      const cont = document.createElement('div');
      cont.id = 'toast-container';
      cont.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(cont);
    }
    const toast = document.createElement('div');
    const colors = { success: '#00C896', error: '#FF4757', warning: '#FF6B35', info: '#7B61FF' };
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.style.cssText = `
      background:#0A0E1A;color:white;padding:14px 20px;border-radius:10px;
      border-left:4px solid ${colors[type]};font-family:'Space Mono',monospace;
      font-size:13px;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.3);
      display:flex;align-items:center;gap:10px;animation:slideIn 0.3s ease;
      opacity:1;transition:opacity 0.3s ease;
    `;
    toast.innerHTML = `<span style="color:${colors[type]};font-size:16px;">${icons[type]}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
  },

  // Format date nicely
  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  formatDateShort(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  // Time ago
  timeAgo(iso) {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 7) return this.formatDateShort(iso);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  },

  // Status badge
  badge(text, color) {
    return `<span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;">${text}</span>`;
  },

  // Compliance color
  complianceColor(plant) {
    if (!plant.lastInspected) return '#FF4757';
    const diff = Date.now() - new Date(plant.lastInspected).getTime();
    const hours = diff / 3600000;
    if (hours < 24) return '#00C896';
    if (hours < 168) return '#FF6B35';
    return '#FF4757';
  },

  complianceLabel(plant) {
    if (!plant.lastInspected) return 'NEVER INSPECTED';
    const diff = Date.now() - new Date(plant.lastInspected).getTime();
    const hours = diff / 3600000;
    if (hours < 24) return 'COMPLIANT';
    if (hours < 168) return 'NEEDS ATTENTION';
    return 'OVERDUE';
  },

  // Modal
  modal(title, content, actions = '') {
    const existing = document.getElementById('modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div style="background:#111827;border:1px solid #1F2937;border-radius:16px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 25px 80px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('modal-overlay').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#6B7280;font-size:20px;cursor:pointer;">✕</button>
        <h2 style="font-family:'Space Mono',monospace;color:white;margin:0 0 20px;font-size:20px;">${title}</h2>
        <div style="color:#9CA3AF;">${content}</div>
        ${actions ? `<div style="display:flex;gap:12px;margin-top:24px;justify-content:flex-end;">${actions}</div>` : ''}
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    return overlay;
  },

  closeModal() {
    const m = document.getElementById('modal-overlay');
    if (m) m.remove();
  },

  // Nav active state
  setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  },

  // Animate number counter
  animateCounter(el, target, duration = 1200) {
    const start = parseInt(el.textContent) || 0;
    const range = target - start;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  // Confirm dialog
  confirm(msg, onConfirm) {
    UI.modal(
      'Confirm Action',
      `<p style="color:#E5E7EB;margin:0;">${msg}</p>`,
      `<button onclick="UI.closeModal()" style="${UI.btnStyle('secondary')}">Cancel</button>
       <button onclick="UI.closeModal();(${onConfirm.toString()})()" style="${UI.btnStyle('danger')}">Confirm</button>`
    );
  },

  btnStyle(type = 'primary') {
    const styles = {
      primary: 'background:#00C896;color:#0A0E1A;border:none;padding:10px 20px;border-radius:8px;font-family:Space Mono,monospace;font-weight:700;font-size:13px;cursor:pointer;',
      secondary: 'background:transparent;color:#9CA3AF;border:1px solid #374151;padding:10px 20px;border-radius:8px;font-family:Space Mono,monospace;font-size:13px;cursor:pointer;',
      danger: 'background:#FF4757;color:white;border:none;padding:10px 20px;border-radius:8px;font-family:Space Mono,monospace;font-weight:700;font-size:13px;cursor:pointer;',
    };
    return styles[type] || styles.primary;
  }
};

// Global keyframe injection
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; } 
  ::-webkit-scrollbar-track { background: #0A0E1A; } 
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
`;
document.head.appendChild(styleSheet);
