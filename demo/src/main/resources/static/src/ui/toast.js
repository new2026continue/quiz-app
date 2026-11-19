// src/ui/Toast.js
// 轻量 toast：创建一个居中的提示条，几秒后自动消失

let _container = null;

let _timer = null;
let _toast = document.createElement('div');

function ensureContainer() {
  if (_container) return _container;
  _container = document.createElement('div');
  _container.className = 'toast-container';
  document.body.appendChild(_container);
  return _container;
}

/**
 * 显示一条 toast
 * @param {string} message - 提示文字
 * @param {'success'|'error'|'info'} type - 类型，决定颜色
 * @param {number} duration - 显示毫秒数
 */
export function showToast(message, type = 'info', duration = 1000) {
  const root = ensureContainer();


  _toast.className = `toast toast--${type}`;
  _toast.textContent = message;
  if(!root.querySelector('.toast')){
   root.appendChild(_toast);
  }
  
 if(!_toast.classList.contains('toast--visible')){
   requestAnimationFrame(() => {
    _toast.classList.add('toast--visible');
  });
 }
 
  clearTimeout(_timer)
  _timer = setTimeout(() => {
    _toast.classList.remove('toast--visible');
    _toast.addEventListener('transitionend', () => _toast.remove(), { once: true });
  }, duration);

 
}