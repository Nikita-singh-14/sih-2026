import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Clock,
  Trash2,
  MailOpen,
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface NotificationsProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function Notifications({ currentUser, onActionFeedback }: NotificationsProps) {
  const [list, setList] = useState([
    {
      id: '1',
      title: 'New Inspection Assignment Assigned',
      detail: 'Metro Cash & Carry (Re-verification) assigned for today at 09:00 AM.',
      time: '10 mins ago',
      unread: true,
      type: 'assignment',
    },
    {
      id: '2',
      title: 'High-Risk Device Alert',
      detail: 'Previous broken seal reported for WM-DEL-01822 in your jurisdiction.',
      time: '1 hour ago',
      unread: true,
      type: 'alert',
    },
    {
      id: '3',
      title: 'Offline Inspection Queue Ready',
      detail: '3 pending inspection reports recorded offline are waiting for sync.',
      time: '3 hours ago',
      unread: false,
      type: 'sync',
    },
    {
      id: '4',
      title: 'Quarterly Target Update',
      detail: 'You have completed 46 of 50 field inspections for this month.',
      time: 'Yesterday',
      unread: false,
      type: 'info',
    },
  ])

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const markAllRead = () => {
    setList((prev) => prev.map((item) => ({ ...item, unread: false })))
    handleFeedback('All notifications marked as read')
  }

  const clearAll = () => {
    setList([])
    handleFeedback('Notification center cleared')
  }

  return (
    <div className="notifications-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">COMMUNICATIONS</p>
          <h1>Officer Notifications & System Alerts</h1>
          <p className="heading-copy">Updates regarding assignments, tamper flags, sync alerts, and schedule changes.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ width: 'auto', margin: 0 }}
            onClick={markAllRead}
          >
            <MailOpen size={14} /> Mark All as Read
          </button>
          <button
            className="secondary-button"
            type="button"
            style={{ width: 'auto', margin: 0, color: '#dc2626', borderColor: '#fecaca' }}
            onClick={clearAll}
          >
            <Trash2 size={14} /> Clear Notifications
          </button>
        </div>
      </section>

      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">SYSTEM NOTIFICATIONS</p>
            <h2>Inbox ({list.filter((i) => i.unread).length} Unread)</h2>
          </div>
        </div>

        <div style={{ padding: '16px 24px', display: 'grid', gap: '12px' }}>
          {list.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'start',
                gap: '14px',
                padding: '16px',
                borderRadius: '8px',
                border: item.unread ? '1px solid #70d8c9' : '1px solid #e2e9eb',
                background: item.unread ? '#f0fdfa' : '#fff',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: item.type === 'alert' ? '#fee2e2' : item.type === 'assignment' ? '#e0f2fe' : '#f0fdfa',
                  color: item.type === 'alert' ? '#dc2626' : item.type === 'assignment' ? '#0284c7' : '#0c8d83',
                  flexShrink: 0,
                }}
              >
                {item.type === 'alert' ? <AlertTriangle size={18} /> : <Bell size={18} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: '#173b52' }}>{item.title}</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.time}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{item.detail}</p>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              <Bell size={32} color="#94a3b8" />
              <p style={{ marginTop: '8px', fontSize: '13px' }}>Your notification inbox is clean!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
