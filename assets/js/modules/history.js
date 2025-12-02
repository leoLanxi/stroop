import { get } from './api.js'

export async function fetchAndRenderHistory(containerId) {
  const res = await get('/game/history')
  const el = document.getElementById(containerId)
  if (!res.ok) { el.textContent = '未登录'; return }
  const list = document.createElement('ul')
  list.className = 'stats__list'
  res.records.forEach(r => {
    const li = document.createElement('li')
    li.className = 'stats__item'
    const left = document.createElement('span')
    left.textContent = new Date(r.created_at).toLocaleString()
    const right = document.createElement('span')
    right.textContent = `${r.avg_reaction_time_ms} ms · 错误率 ${Math.round(r.error_rate*100)}%`
    li.appendChild(left); li.appendChild(right)
    list.appendChild(li)
  })
  el.innerHTML = ''
  const summary = document.createElement('div')
  summary.className = 'stats__summary'
  summary.textContent = `你的总体平均反应时间：${res.aggregates.overall_avg_reaction_time_ms} ms · 你的总体平均错误率：${Math.round(res.aggregates.overall_error_rate*100)}%`
  el.appendChild(summary)
  el.appendChild(list)
}

