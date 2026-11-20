// src/main.js
// 入口：只负责组装，不写业务逻辑


import { Timer } from './core/Timer.js';
import { RecordView } from './ui/RecordView.js';
import { controller, refreshBankList, reloadBank, addBank } from './ui/controller.js';
import { fetchCurrentUserInfo } from './data/request.js';
import { showToast } from "./ui/toast.js";




// ===== 3. 视图层 =====
const template = document.getElementById('record-template');
const container = document.querySelector('.log-book__content');
const view = new RecordView(container, template);

// ===== 4. 控件层 =====



const timer = new Timer(controller.next, 3000);


 const recordEditorTemplate = document.getElementById('recordEditorTemplate')
 const recordEditorFragment = recordEditorTemplate.content   //获取增加视图的片段
 const recordFormContainer = document.createElement('section')
 recordFormContainer.classList.add('record-form-container')
 recordFormContainer.appendChild(recordEditorFragment)// 等依赖于片段的元素操作完后, 清空片段
 // 统一在入口处查询文档元素, 避免重复查询
const elements = {
  username: document.querySelector('.log-book__userInfo-username'),
  addBtn: document.getElementById("addBtn"),
  bankSelect: document.getElementById("bankSelect"),
  toggleAutoBtn: document.getElementById("toggleAutoBtn"),
  nextBtn: document.getElementById("nextBtn"),
  deleteCurrentBtn: document.getElementById("deleteCurrentBtn"),
  editCurrentBtn: document.getElementById("editCurrentBtn"),
  intervalInput: document.getElementById("intervalInput"),
  jumpInput: document.getElementById("jumpInput"),
  main: document.body.querySelector('.log-book__main'),
  controlsContainer: document.body.querySelector('.log-book__controls'),
  contentContainer: document.body.querySelector('.log-book__content'),
  autoToggleBtnText: document.getElementById("autoToggleBtnText"),
  recordFormContainer: recordFormContainer,
  logoutBtn: document.getElementById('logoutBtn'),
  bankNameInput: recordFormContainer.querySelector('#bankNameInput'),
  questionInput: recordFormContainer.querySelector('#questionInput'),
  answersInput: recordFormContainer.querySelector('#answersInput'),
  descriptionInput: recordFormContainer.querySelector('#descriptionInput'),
  submitSaveBtn: recordFormContainer.querySelector('#submitSaveBtn'),
  cancelSaveBtn: recordFormContainer.querySelector('#cancelSaveBtn'),
  recordEditorTitle: recordFormContainer.querySelector('#recordEditorTitle'),
};

// 给控制器注入依赖, 绑html元素
controller.init({timer, view, elements })
// 给控件元素绑处理器
controller.bindEventListenter();


// 初始化用户信息
try{
  const userInfo = await fetchCurrentUserInfo();
   // 已登录
    elements.username.textContent = userInfo.username
    showToast(`当前用户：${userInfo.username}`, 'success')
    sessionStorage.setItem('username', userInfo.username)

}catch(error){// 未登录
  showToast('获取用户信息失败', 'error')
  logoutBtn.style.visibility = 'hidden'
  addBtn.parentElement.style.visibility = 'hidden'
  deleteCurrentBtn.parentElement.style.visibility = 'hidden'
  editCurrentBtn.parentElement.style.visibility = 'hidden'
}


// 初始化题库列表建立各自的QuizEngine实例
await refreshBankList()

// ===== 5. 首次渲染 =====

controller.handlers.handleBankChange()

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    reloadBank(elements.bankSelect.value);   // 切回页面时重新拉一次
  }
});








