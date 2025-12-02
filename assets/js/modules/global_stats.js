import { get } from './api.js'

export async function fetchAndRenderGlobalStats(el) {
  const res = await get('/game/stats/global')
  if (!res.ok) { el.textContent = ''; return }
  const top = document.createElement('div')
  top.textContent = `所有玩家平均反应时间：${res.global_avg_reaction_time_ms} ms`
  const list = document.createElement('ul')
  list.className = 'stats__list'
  res.distribution.forEach(d => {
    const li = document.createElement('li')
    li.className = 'stats__item'
    const left = document.createElement('span')
    left.textContent = d.range
    const right = document.createElement('span')
    right.textContent = `${d.count} · ${Math.round(d.percentage*100)}%`
    li.appendChild(left); li.appendChild(right)
    list.appendChild(li)
  })
  el.innerHTML = ''
  el.appendChild(top)
  el.appendChild(list)
  const bars = document.getElementById('statsBars')
  if (bars) {
    bars.innerHTML = ''
    const segments = res.percent_bins || []
    segments.forEach(seg => {
      const wrap = document.createElement('div')
      wrap.style.display = 'grid'
      const bar = document.createElement('div')
      bar.className = 'bar-chart__bar'
      const fill = document.createElement('div')
      fill.className = 'bar-chart__fill'
      fill.style.height = `${Math.round((seg.percentage||0)*100)}%`
      bar.appendChild(fill)
      const label = document.createElement('div')
      label.className = 'bar-chart__label'
      label.textContent = `${seg.range} · ${Math.round((seg.percentage||0)*100)}%`
      wrap.appendChild(bar)
      wrap.appendChild(label)
      bars.appendChild(wrap)
    })
    const caption = document.createElement('div')
    caption.className = 'stats__global'
  }
}
