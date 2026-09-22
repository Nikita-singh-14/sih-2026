import React, { useState, useMemo } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CloudOff,
  Filter,
  Check,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface NotificationItem {
  id: string
  title: string
  detail: string
  time: string
  unread: boolean
  type: 'urgent' | 'schedule' | 'sync' | 'reminder'
  actionLabel?: string
}

interface NotificationsProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function LmoNotifications({ currentUser, onActionFeedback }: NotificationsProps) {
  const [filterType, setFilterType] = useState('all')
  const [items, setItems] = useState<NotificationItem[]>(() => [
    {
      id: 'notif-1',
      title: 'High-Risk Inspection Assigned',
      detail: `New verification application LM-2024-09121 at Metro Cash & Carry assigned in ${currentUser.jurisdiction?.district || 'your jurisdiction'}. Historical broken seal flagged.`,
      time: '10 minutes ago',
      unread: true,
      type: 'urgent',
      actionLabel: 'View Assignment'
    },
    {
      id: 'notif-2',
      title: 'Offline Queue Ready for Sync',
      detail: '3 inspection reports stored in local cache. Network connection established.',
      time: '1 hour ago',
      unread: true,
      type: 'sync',
      actionLabel: 'Sync Now'
    },
    {
      id: 'notif-3',
      title: 'Stamping Certificate Issued',
      detail: 'Verification certificate CERT-LM-2024-09821 successfully sent to Apex Wholesale Mart.',
      time: '3 hours ago',
      unread: true,
      type: 'reminder',
      actionLabel: 'View Certificate'
    },
    {
      id: 'notif-4',
      title: 'Tomorrow’s Field Visit Route Scheduled',
      detail: '4 platform scale re-verifications scheduled for APMC Grain Yard.',
      time: 'Yesterday',
      unread: false,
      type: 'schedule',
      actionLabel: 'View Route'
    }
  ])

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  const filteredItems = useMemo(() => {
    if (filterType === 'unread') return items.filter((i) => i.unread)
    if (filterType === 'urgent') return items.filter((i) => i.type === 'urgent')
    if (filterType === 'sync') return items.filter((i) => i.type === 'sync')
    return items
  }, [items, filterType])

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items])

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })))
    onActionFeedback('All notifications marked as read')
  }

  const handleToggleRead = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: !i.unread } : i)))
  }

  const handleNotificationAction = (item: NotificationItem) => {
    onActionFeedback(`Action triggered for: ${item.title}`)
  }

  return (
    <div className="lmo-subpage">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">NOTIFICATIONS & ALERTS / {jurisdictionDisplay}</p>
          <h1>Officer Activity & System Notifications</h1>
          <p className="heading-copy">
            Stay updated on new field assignments, high-risk cases, and offline queue status for {currentUser.name}.
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="secondary-button" type="button" onClick={handleMarkAllRead}>
            <Check size={15} /> Mark all as read
          </button>
        )}
      </section>

      {/* KPI Row */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <Bell size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Notifications</span>
            <strong>{items.length}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <AlertTriangle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Unread Messages</span>
            <strong>{unreadCount}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon red" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <ShieldAlert size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Urgent High-Risk Alerts</span>
            <strong>{items.filter((i) => i.type === 'urgent').length}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <CloudOff size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Offline Sync Notices</span>
            <strong>{items.filter((i) => i.type === 'sync').length}</strong>
          </div>
        </article>
      </section>

      {/* Main List Panel */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ACTIVITY STREAM</p>
            <h2>Notifications Log</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
              type="button"
              onClick={() => setFilterType('all')}
            >
              All ({items.length})
            </button>
            <button
              className={`filter-button ${filterType === 'unread' ? 'active' : ''}`}
              type="button"
              onClick={() => setFilterType('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-button ${filterType === 'urgent' ? 'active' : ''}`}
              type="button"
              onClick={() => setFilterType('urgent')}
            >
              Urgent Alerts
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {filteredItems.map((item) => {
            let IconComponent = Bell
            let iconBg = '#f1f5f9'
            let iconColor = '#475569'

            if (item.type === 'urgent') {
              IconComponent = ShieldAlert
              iconBg = '#fef2f2'
              iconColor = '#dc2626'
            } else if (item.type === 'sync') {
              IconComponent = CloudOff
              iconBg = '#ccfbf1'
              iconColor = '#0f766e'
            } else if (item.type === 'schedule') {
              IconComponent = Calendar
              iconBg = '#e0f2fe'
              iconColor = '#0284c7'
            }

            return (
              <div
                key={item.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  border: item.unread ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                  background: item.unread ? '#f0fdfa' : '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: iconBg,
                    color: iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <IconComponent size={19} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.time}</span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0.5rem', fontSize: '0.85rem', color: '#334155' }}>{item.detail}</p>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {item.actionLabel && (
                      <button
                        className="text-button"
                        type="button"
                        style={{ fontSize: '0.8rem', padding: 0 }}
                        onClick={() => handleNotificationAction(item)}
                      >
                        {item.actionLabel} <ArrowRight size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => handleToggleRead(item.id)}
                    >
                      {item.unread ? 'Mark as read' : 'Mark as unread'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
              <Bell size={36} color="#94a3b8" />
              <h3>No notifications in this filter</h3>
              <p>You have caught up with all activity notifications.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
