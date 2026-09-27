import React, { useState } from 'react'
import { Bell, Eye, FileText, Search } from 'lucide-react'
import type { AdminApplication, AdminApplicationStatus, AdminInstrument, AdminOfficer } from '../../features/admin/adminTypes'
import type { UpcomingVisit } from '../../types'
import { ApplicationDetailModal } from './ApplicationDetailModal'

interface StateAdminOverviewProps {
  applications: AdminApplication[]
  instruments: AdminInstrument[]
  officers: AdminOfficer[]
  upcomingVisitsList: UpcomingVisit[]
  onNavigateToApplications: (filterStatus?: string) => void
  onNavigateToInstruments: (filterStatus?: string) => void
  onNavigateToSection: (section: string) => void
  onUpdateStatus: (id: string, newStatus: AdminApplicationStatus, remarksText?: string) => void
  onAssignOfficer: (id: string, officerName: string) => void
  onAddRemark: (id: string, remarkText: string) => void
}

export const StateAdminOverview: React.FC<StateAdminOverviewProps> = ({
  applications,
  instruments,
  officers,
  upcomingVisitsList,
  onNavigateToApplications,
  onNavigateToInstruments,
  onNavigateToSection,
  onUpdateStatus,
  onAssignOfficer,
  onAddRemark,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null)

  // Calculations for KPI Cards
  const activeCount = instruments.filter((i) => i.status === 'Active').length
  const pendingCount = applications.filter((a) => a.status === 'Pending Review' || a.status === 'Under Review').length
  const verifiedCount = applications.filter((a) => a.status === 'Approved' || a.status === 'Verified').length
  const expiringCount = instruments.filter((i) => i.status === 'Expiring Soon' || i.status === 'Expired').length

  const filteredApps = applications.filter((app) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !q ||
      [app.id, app.instrumentId, app.instrument, app.applicant].some((val) => val.toLowerCase().includes(q))
    const matchesStatus =
      statusFilter === 'All statuses' ||
      app.status === statusFilter ||
      (statusFilter === 'Under review' && app.status === 'Under Review') ||
      (statusFilter === 'Verified' && (app.status === 'Verified' || app.status === 'Approved'))
    return matchesSearch && matchesStatus
  })

  const renderStatusBadge = (status: AdminApplicationStatus) => {
    switch (status) {
      case 'Approved':
      case 'Verified':
        return <span className="status-badge verified"><i /> {status}</span>
      case 'Rejected':
        return <span className="status-badge awaiting-documents"><i /> Rejected</span>
      case 'Returned for Correction':
        return <span className="status-badge under-review"><i /> Returned</span>
      default:
        return <span className="status-badge under-review"><i /> {status}</span>
    }
  }

  return (
    <div className="overview-container dashboard-view-fade">
      {/* 1. ACTIONABLE KPI CARDS GRID */}
      <section className="stats-grid" aria-label="Verification summary">
        {/* ACTIVE INSTRUMENTS */}
        <article
          className="stat-card stat-blue clickable-stat-card"
          tabIndex={0}
          role="button"
          onClick={() => onNavigateToInstruments('Active')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToInstruments('Active')}
          title="Click to view Active Instruments"
        >
          <div className="stat-icon">📊</div>
          <div className="stat-copy">
            <span>Active instruments</span>
            <strong>{activeCount.toLocaleString()}</strong>
            <small className="trend-up">+8.4% this month</small>
          </div>
        </article>

        {/* PENDING APPLICATIONS */}
        <article
          className="stat-card stat-amber clickable-stat-card"
          tabIndex={0}
          role="button"
          onClick={() => onNavigateToApplications('Pending Review')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToApplications('Pending Review')}
          title="Click to view Pending Applications"
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-copy">
            <span>Pending applications</span>
            <strong>{pendingCount.toLocaleString()}</strong>
            <small className="trend-neutral">Needs admin action</small>
          </div>
        </article>

        {/* VERIFIED THIS MONTH */}
        <article
          className="stat-card stat-teal clickable-stat-card"
          tabIndex={0}
          role="button"
          onClick={() => onNavigateToApplications('Approved')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToApplications('Approved')}
          title="Click to view Verified Records"
        >
          <div className="stat-icon">✓</div>
          <div className="stat-copy">
            <span>Verified this month</span>
            <strong>{verifiedCount.toLocaleString()}</strong>
            <small className="trend-up">+12.6% completed</small>
          </div>
        </article>

        {/* EXPIRING IN 30 DAYS */}
        <article
          className="stat-card stat-slate clickable-stat-card"
          tabIndex={0}
          role="button"
          onClick={() => onNavigateToInstruments('Expiring Soon')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToInstruments('Expiring Soon')}
          title="Click to view Expiring Instruments"
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-copy">
            <span>Expiring in 30 days</span>
            <strong>{expiringCount.toLocaleString()}</strong>
            <small className="trend-down">Renewal reminders due</small>
          </div>
        </article>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <section className="content-grid" style={{ marginTop: 24 }}>
        {/* RECENT APPLICATIONS WORK QUEUE */}
        <div className="panel applications-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">WORK QUEUE</p>
              <h2>Recent applications</h2>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigateToApplications('All')}
            >
              View all <span>→</span>
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Search applications"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by application or instrument ID"
              />
            </div>
            <select
              className="filter-button"
              aria-label="Filter applications by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Returned for Correction">Returned</option>
            </select>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Instrument</th>
                  <th>Applicant</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.slice(0, 6).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.id}</strong>
                      <span>{app.type}</span>
                    </td>
                    <td>
                      <strong>{app.instrumentId}</strong>
                      <span>{app.instrument}</span>
                    </td>
                    <td>{app.applicant}</td>
                    <td>{app.submitted}</td>
                    <td>{renderStatusBadge(app.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          onClick={() => setSelectedApp(app)}
                        >
                          <FileText size={12} /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && <p className="empty-state">No applications match your search.</p>}
          </div>
        </div>

        {/* UPCOMING VISITS FIELD OPS PANEL */}
        <aside className="panel visits-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FIELD OPERATIONS</p>
              <h2>Upcoming visits</h2>
            </div>
            <button
              className="btn-action-sm btn-view"
              type="button"
              onClick={() => onNavigateToSection('Field operations')}
            >
              View / Manage
            </button>
          </div>

          <div className="visits-list">
            {upcomingVisitsList.map((visit) => (
              <div className="visit-item" key={visit.time + visit.title}>
                <div className="date-tile">
                  <strong>{visit.day}</strong>
                  <span>{visit.month}</span>
                </div>
                <div className="visit-details">
                  <strong>{visit.title}</strong>
                  <span>
                    {visit.time} · {visit.location}
                  </span>
                  <small>{visit.officer}</small>
                </div>
              </div>
            ))}
          </div>

          <button
            className="secondary-button"
            type="button"
            style={{ margin: '14px 20px', width: 'calc(100% - 40px)' }}
            onClick={() => onNavigateToSection('Field operations')}
          >
            Manage Field Operations <span>→</span>
          </button>
        </aside>
      </section>

      {/* 3. EXPIRY ALERT BANNER */}
      <section className="notice-bar" style={{ marginTop: 20 }}>
        <div className="notice-icon">
          <Bell size={17} />
        </div>
        <div>
          <strong>{expiringCount} certificates or instruments expire in the next 30 days</strong>
          <span>Review certificates, track stamping renewals, and send enforcement reminders.</span>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => onNavigateToSection('Certificates')}
        >
          Review Certificates <span>→</span>
        </button>
      </section>

      {/* APPLICATION DETAIL MODAL */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          officers={officers}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={onUpdateStatus}
          onAssignOfficer={onAssignOfficer}
          onAddRemark={onAddRemark}
        />
      )}
    </div>
  )
}
