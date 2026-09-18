import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { DashboardStat } from '../../types'

const icons = { blue: '◒', teal: '✓', amber: '!', slate: '◷' }

export function StatCard({ label, value, trend, trendDirection, tone }: DashboardStat) {
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? ArrowDownRight : Minus
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icons[tone]}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={`trend ${trendDirection}`}><TrendIcon size={14} />{trend}</small></div></article>
}