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
  const res = await get('/me')
  if (res.ok) { setUserName(res.user && res.user.username); showApp() } else { setUserName(null); showAuth() }
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
    const res = await post('/login', { username, password })
    if (res.ok) { loginMsg.textContent = '登录成功'; setUserName(res.user && res.user.username); showApp() } else {
      loginMsg.textContent = res.error ? `登录失败：${res.error}` : '登录失败'
    }
  })
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const username = document.getElementById('regUsername').value.trim()
    const password = document.getElementById('regPassword').value
    const res = await post('/register', { username, password })
    if (res.ok) { regMsg.textContent = '注册成功，请登录' }
    else { regMsg.textContent = res.error ? `注册失败：${res.error}` : '注册失败' }
  })
}

export async function logoutAndShowAuth() {
  const res = await post('/logout', {})
  setUserName(null)
  showAuth()
  const loginMsg = document.getElementById('loginMsg')
  if (loginMsg) loginMsg.textContent = res.ok ? '已登出，请重新登录' : '登出失败'
}

