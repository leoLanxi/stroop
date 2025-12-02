import { get, post } from './api.js'
import { refs, setUserName } from './dom.js'

function showAuth() {
  document.getElementById('auth').classList.remove('is-hidden')
  refs.testCard.classList.add('is-hidden')
  document.querySelector('.guide').classList.add('is-hidden')
  document.getElementById('stats').classList.add('is-hidden')
}

function showApp() {
  document.getElementById('auth').classList.add('is-hidden')
  refs.testCard.classList.remove('is-hidden')
  document.querySelector('.guide').classList.remove('is-hidden')
}

export async function checkAuthOnLoad() {
  // OFFLINE: 显示游戏并设置游客用户名
  setUserName('游客')
  showApp()
  // 隐藏与后端相关按钮
  const hideIds = ['logoutBtn','historyBtn','rankBtn']
  hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('is-hidden') })
}

export function bindAuth() {
  const tabLogin = document.getElementById('tabLogin')
  const tabRegister = document.getElementById('tabRegister')
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const loginMsg = document.getElementById('loginMsg')
  const regMsg = document.getElementById('regMsg')
  const card = document.querySelector('.auth__card')
  tabLogin.addEventListener('click', () => { loginForm.classList.remove('is-hidden'); registerForm.classList.add('is-hidden') })
  tabRegister.addEventListener('click', () => { registerForm.classList.remove('is-hidden'); loginForm.classList.add('is-hidden') })
  if (card) { card.classList.add('auth__card--login'); card.classList.remove('auth__card--register') }
  tabLogin.addEventListener('click', () => { if (card) { card.classList.add('auth__card--login'); card.classList.remove('auth__card--register') } })
  tabRegister.addEventListener('click', () => { if (card) { card.classList.add('auth__card--register'); card.classList.remove('auth__card--login') } })
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const username = document.getElementById('loginUsername').value.trim()
    const password = document.getElementById('loginPassword').value
    // OFFLINE: 直接显示游戏并设定用户名
    setUserName(username || '游客')
    loginMsg.textContent = '登录成功（离线模式）'
    showApp()
  })
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const username = document.getElementById('regUsername').value.trim()
    const password = document.getElementById('regPassword').value
    // OFFLINE: 直接提示并切换到登录
    regMsg.textContent = '注册成功（离线模式），请登录'
    loginForm.classList.remove('is-hidden'); registerForm.classList.add('is-hidden')
  })
}

export async function logoutAndShowAuth() {
  // OFFLINE: 切回游客并保持游戏界面
  setUserName('游客')
  showApp()
  const loginMsg = document.getElementById('loginMsg')
  if (loginMsg) loginMsg.textContent = '已切换为游客（离线模式）'
}
