
// ========== TOAST NOTIFICATION SYSTEM ==========
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  const styles = {
    success: 'background:#A0522D; color:#F5F0E6;',
    error: 'background:#B71C1C; color:#fff;',
    info: 'background:#3E2723; color:#F5F0E6;'
  };
  toast.style.cssText = `
    ${styles[type] || styles.success}
    padding: 15px 25px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-weight: 600;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease-out;
    max-width: 350px;
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// CSS keyframes for toast animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  #toastContainer {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;
document.head.appendChild(styleSheet);

// Assure container exists on first use
window.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
});
