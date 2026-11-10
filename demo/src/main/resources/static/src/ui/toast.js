let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * 显示一条 toast
 * @param {string} message - 提示文字
 * @param {'success'|'error'|'info'} type - 类型，决定颜色
 * @param {number} duration - 显示毫秒数
 */
export function showToast(message, type = 'info', duration = 2000) {
  const root = ensureContainer();

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);

  requestAnimationFrame(() => el.classList.add('toast--visible'));

  setTimeout(() => {
    el.classList.remove('toast--visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, duration);
}