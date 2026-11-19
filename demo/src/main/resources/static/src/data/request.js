




// 第一层：服务源（协议 + 主机 + 端口）
const API_ORIGIN = `http://${globalThis.location?.hostname ?? 'localhost'}:8080`;


// 第二层：API 根（含版本），所有接口共享
const API_BASE = `${API_ORIGIN}/api/v1`;

// 第三层：资源路径，只描述“哪个资源”
const QUESTIONS_PATH = `${API_BASE}/questions`;
const AUTH_PATH = `${API_BASE}/auth`;


const dropOneQuestionById = async (id) => {

    const response = await fetch(QUESTIONS_PATH+`/${id}`,{
      method:'delete',
      credentials: "include" ,
    })
   if (!response.ok) {
      throw new Error(`删除失败：${response.status}`);
    }
    // 204 没有响应体，不调 json()
    if (response.status === 204) {
      return null;
    }
    return response.json();

}
const updateOneQuestion = async (id,entry) => {
  const resp = await fetch(QUESTIONS_PATH+`/${id}`,{
    method:'put',
    headers:{
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body:JSON.stringify(entry)
  })
  if (!resp.ok) {
    throw new Error(`更新失败：${resp.status}`);
  }
  return resp.json();
}



 const addOneQuestion = async (data) => {

  const resp = await fetch(QUESTIONS_PATH,{
    method:'post',
    headers:{
      'Content-Type':'application/json',
    },
    credentials: "include" ,
    'body':JSON.stringify(data)
  })
  if (!resp.ok) {
    throw new Error(`添加失败：${resp.status}`);
  }
  return resp.json();
}

const fetchAllQuestionByBankName = async (bankName,username) => {
  const response = await fetch(QUESTIONS_PATH + `?bank=${encodeURIComponent(bankName)}&username=${username}`);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status} ${response.statusText}`);
  }
  return response.json();
}

const fetchAllBankName = async (username) => {
  const response = await fetch(`${API_BASE}/questions/banks?username=${username}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`获取题库列表失败：${response.status}`);
  }
  return response.json();
}

const fetchCurrentUserInfo = async () => {
  const res = await fetch(`${AUTH_PATH}/me`, { credentials: 'include' });
  if(res.status === 204){
    return null;
  }
if (res.ok) {
  const user = await res.json();
  return user;
}

throw new Error(`获取用户信息失败：${res.status}`);

}

const logout = async () => {
  const response = await fetch(`${AUTH_PATH}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if(!response.ok){
    throw new Error(`注销失败：${response.status}`);
  }
  if(response.status === 204){
    sessionStorage.removeItem('username')
    return null;
  }
  return response.json();
}
const login = async (username, password) => {
  const response = await fetch(`${AUTH_PATH}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(`登录失败：${response.status}`);
  }
  if (response.status === 204 || response.status === 200) {
    return null;
  }
  return response.json();
}
const register = async (username, password) => {
  const response = await fetch(`${AUTH_PATH}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(`注册失败：${response.status}`);
  }
  if (response.status === 204 || response.status === 200) {
    return null;
  }
  
}
export {
  dropOneQuestionById,
  addOneQuestion,
  fetchCurrentUserInfo,
  fetchAllQuestionByBankName,
  fetchAllBankName,
  updateOneQuestion,
  logout,
  login,
  register,
}