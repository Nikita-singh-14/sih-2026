import type { ApplicationStatus } from '../../types'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const className = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-badge ${className}`}><i />{status}</span>
}