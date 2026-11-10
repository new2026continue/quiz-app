// src/main.js
// 入口：只负责组装，不写业务逻辑
import { htmlElements } from './HTMLelements.js';
import { QuizEngine } from './core/QuizEngine.js';
import { Timer } from './core/Timer.js';
import { RecordView } from './ui/RecordView.js';
import { Controls } from './ui/Controls.js';


// ===== 1. 数据层 =====


// 第一层：服务源（协议 + 主机 + 端口）
// const API_ORIGIN = `http://${location.hostname}:8080`;
const API_ORIGIN = ``;
// 第二层：API 根（含版本），所有接口共享
const API_BASE = `${API_ORIGIN}/api/v1`;

// 第三层：资源路径，只描述“哪个资源”
const QUESTIONS_PATH = `${API_BASE}/questions`;
const AUTH_PATH = `${API_BASE}/auth`;
async function addOneEntry(data){
  const resp = await fetch(QUESTIONS_PATH,{
    method:'post',
    headers:{
      'Content-Type':'application/json',
    },
    credentials: "include" ,
    'body':JSON.stringify(data)
  })

  return resp;
}

async function fetchEntries(bankName) {
  const response = await fetch(QUESTIONS_PATH + `?bank=${encodeURIComponent(bankName)}`);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status} ${response.statusText}`);
  }
  return response.json();
}
const banks =await initBankSelect();

const engines = new Map();
for (const bankName of banks) {
  const entries = await fetchEntries(bankName);
  engines.set(bankName, new QuizEngine(entries,bankName));
}
const quizEngine = engines.get(banks[0]);

async function fetchBankNames() {
  const response = await fetch(`${API_BASE}/questions/banks`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`获取题库列表失败：${response.status}`);
  }
  return response.json();
}
async function initBankSelect() {
  const banks = await fetchBankNames();
  quizSelect.replaceChildren(
    ...banks.map(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      return option;
    })
  );
  return banks;
}
async function reloadBank(bankName) {
  const freshEntries = await fetchEntries(bankName);
  
  
  const freshEngine = new QuizEngine(freshEntries);console.log(freshEngine);
  engines.set(bankName, freshEngine);
  mainControls.setQuizEngine = freshEngine
  mainControls.next();
        const option = document.createElement('option');
      option.value = bankName
      option.textContent = bankName
  quizSelect.appendChild(option)
}
const refresh = async () => {
const entries = await fetchEntries(mainControls.quizEngine.bankName);

  mainControls.quizEngine.setEntries(entries)
}

// ===== 2. 业务层 =====




quizSelect.addEventListener('change', (e) => {
  const engine = engines.get(e.target.value);
  if (!engine) return;
  mainControls.setQuizEngine = engine;
  mainControls.next();
  
  
});
const res = await fetch(`${AUTH_PATH}/me`, { credentials: 'include' });
if (res.ok) {
  const user = await res.json();
  document.querySelector('.log-book__userInfo-username').textContent = user.username
}

logoutBtn.addEventListener('click', logout)
async function logout() {
  await fetch(`${AUTH_PATH}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  location.href = './auth.html';
}


// ===== 3. 视图层 =====
const template = document.getElementById('record-template');
const container = document.querySelector('.log-book__content');
const view = new RecordView(template, container);

// ===== 4. 控件层 =====
// 先声明 controls，Timer 回调闭包引用它，运行时已赋值
let mainControls;

const timer = new Timer(() => mainControls.next(), 3000);

const elements = {
  toggleBtn: document.getElementById('toggleBtn'),
  nextBtn: document.getElementById('nextBtn'),
  intervalInput: document.getElementById('intervalInput'),
  jumpInput: document.getElementById('jumpInput'),
  descEl: document.querySelector('.record__description'),
  addBtn: document.getElementById("addBtn"),
  cancelSaveBtn :htmlElements.cancelSaveBtn,
  submitSaveBtn :htmlElements.submitSaveBtn,
};

mainControls = new Controls({ "quizEngine":engines.get('english'), timer, view, elements });
mainControls.bindEventListenter();



// ===== 5. 首次渲染 =====
mainControls.next();


let addViewControls
// addViewControls = new Controls({})
export {fetchEntries, addOneEntry, refresh,reloadBank, fetchBankNames,QUESTIONS_PATH}
