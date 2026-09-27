import React, { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Globe,
  KeyRound,
  Lock,
  MapPin,
  Save,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface StateAdminSettingsProps {
  currentUser: AuthUser
  onActionFeedback: (message: string) => void
}

export const StateAdminSettings: React.FC<StateAdminSettingsProps> = ({ currentUser, onActionFeedback }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'jurisdiction' | 'notifications' | 'security'>('profile')
  const [adminName, setAdminName] = useState(currentUser.name || 'Arjun Sharma')
  const [adminEmail, setAdminEmail] = useState(currentUser.email || 'admin.delhi@measuresure.gov.in')
  const [phone, setPhone] = useState('+91 98100 11223')
  const [assignedState, setAssignedState] = useState(currentUser.jurisdiction?.state || 'Delhi')

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    onActionFeedback('State Administrator portal settings updated successfully!')
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO HEADER */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">PORTAL CONFIGURATION & GOVERNANCE</span>
          <h2>State Administrator Settings</h2>
          <p>Manage administrative account profile, state jurisdiction parameters, security, and notification preferences.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="admin-modal-tabs" style={{ background: 'white', borderRadius: 8, padding: '6px 16px', border: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <UserCheck size={16} /> Admin Profile
        </button>
        <button
          type="button"
          className={activeTab === 'jurisdiction' ? 'active' : ''}
          onClick={() => setActiveTab('jurisdiction')}
        >
          <Globe size={16} /> State & Jurisdiction
        </button>
        <button
          type="button"
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} /> Notification Preferences
        </button>
        <button
          type="button"
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={16} /> Security & 2FA
        </button>
      </div>

      {/* SETTINGS CARD */}
      <div className="workspace-panel panel" style={{ padding: 28 }}>
        <form onSubmit={handleSaveSettings}>
          {activeTab === 'profile' && (
            <div className="modal-left-col" style={{ maxWidth: 640 }}>
              <div className="detail-card-panel">
                <h3><UserCheck size={16} /> Administrator Details</h3>
                <div className="add-remark-form" style={{ gap: 14 }}>
                  <label className="input-label">
                    Full Name
                    <input
                      type="text"
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </label>

                  <label className="input-label">
                    Official Email Address
                    <input
                      type="email"
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </label>

                  <label className="input-label">
                    Contact Phone Number
                    <input
                      type="text"
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>

                  <label className="input-label">
                    Official Designation
                    <input
                      type="text"
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      defaultValue="State Controller / Administrator (Legal Metrology)"
                      readOnly
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jurisdiction' && (
            <div className="modal-left-col" style={{ maxWidth: 640 }}>
              <div className="detail-card-panel">
                <h3><Globe size={16} /> State Jurisdiction Configuration</h3>
                <div className="add-remark-form" style={{ gap: 14 }}>
                  <label className="input-label">
                    Assigned State / Union Territory
                    <select
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      value={assignedState}
                      onChange={(e) => setAssignedState(e.target.value)}
                    >
                      <option value="Delhi">Delhi (NCT)</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </label>

                  <label className="input-label">
                    State Controller Headquarters Address
                    <input
                      type="text"
                      className="admin-select"
                      style={{ marginTop: 4 }}
                      defaultValue="Vikas Bhawan, I.P. Estate, New Delhi 110002"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="modal-left-col" style={{ maxWidth: 640 }}>
              <div className="detail-card-panel">
                <h3><Bell size={16} /> Automated Alert & Escalation Rules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Receive email notification on new high-priority enforcement complaints
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Daily summary digest of certificate expiry renewals
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Alert when an officer verification assignment exceeds SLA (48 hrs)
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="modal-left-col" style={{ maxWidth: 640 }}>
              <div className="detail-card-panel">
                <h3><Lock size={16} /> Security & Portal Access</h3>
                <div className="add-remark-form" style={{ gap: 14 }}>
                  <label className="input-label">
                    Current Password
                    <input type="password" className="admin-select" style={{ marginTop: 4 }} placeholder="••••••••" />
                  </label>

                  <label className="input-label">
                    New Password
                    <input type="password" className="admin-select" style={{ marginTop: 4 }} placeholder="Enter new password" />
                  </label>

                  <div className="officer-assigned-tag" style={{ marginTop: 10 }}>
                    <ShieldCheck size={16} /> Two-Factor Authentication (2FA) is Active (Govt NIC OTP Gate)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="primary-button">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
