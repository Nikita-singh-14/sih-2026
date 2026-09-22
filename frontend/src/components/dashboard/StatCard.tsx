import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { DashboardStat } from '../../types'

const icons: Record<string, string> = { blue: '◒', teal: '✓', amber: '!', slate: '◷', green: '✓' }

export function StatCard({ label, value, trend, trendDirection, tone }: DashboardStat) {
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? ArrowDownRight : Minus
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icons[tone]}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={`trend ${trendDirection}`}><TrendIcon size={14} />{trend}</small></div></article>
}