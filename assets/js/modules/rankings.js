import { get } from './api.js'

export async function fetchAndRenderRankings() {
  const res = await get('/game/rankings')
  const modal = document.getElementById('rankingsModal')
  const list = document.getElementById('rankingsList')
  if (!modal || !list) return
  list.innerHTML = ''
  if (!res.ok) {
    const li = document.createElement('li')
    li.className = 'stats__item'
    li.textContent = '无法获取排名'
    list.appendChild(li)
  } else {
    (res.rankings || []).forEach((r, i) => {
      const li = document.createElement('li')
      li.className = 'stats__item'
      const left = document.createElement('span')
      left.textContent = `#${i+1} · ${r.username}`
      const right = document.createElement('span')
      right.textContent = `正确率：${Math.round((r.accuracy||0)*100)}% · 用时：${r.avg_reaction_time_ms} ms`
      li.appendChild(left); li.appendChild(right)
      list.appendChild(li)
    })
  }
  modal.classList.remove('is-hidden')
}

export function bindRankingsModal() {
  const modal = document.getElementById('rankingsModal')
  const closeBtn = document.getElementById('rankingsClose')
  if (!modal || !closeBtn) return
  closeBtn.addEventListener('click', () => { modal.classList.add('is-hidden') })
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('is-hidden')
  })
}
