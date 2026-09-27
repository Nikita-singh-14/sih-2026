import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Filter,
  Eye,
  FileCheck2,
  FileText,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react'
import type { AdminApplication, AdminApplicationStatus, AdminOfficer } from '../../features/admin/adminTypes'
import { ApplicationDetailModal } from './ApplicationDetailModal'

interface StateAdminApplicationsProps {
  applications: AdminApplication[]
  officers: AdminOfficer[]
  initialStatusFilter?: string
  onUpdateStatus: (id: string, newStatus: AdminApplicationStatus, remarksText?: string) => void
  onAssignOfficer: (id: string, officerName: string) => void
  onAddRemark: (id: string, remarkText: string) => void
}

export const StateAdminApplications: React.FC<StateAdminApplicationsProps> = ({
  applications,
  officers,
  initialStatusFilter = 'All',
  onUpdateStatus,
  onAssignOfficer,
  onAddRemark,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [districtFilter, setDistrictFilter] = useState<string>('All')
  const [officerFilter, setOfficerFilter] = useState<string>('All')
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null)

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Pending Review').length,
      underReview: applications.filter((a) => a.status === 'Under Review').length,
      assigned: applications.filter((a) => a.status === 'Assigned' || a.status === 'Scheduled').length,
      approved: applications.filter((a) => a.status === 'Approved' || a.status === 'Verified').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
      returned: applications.filter((a) => a.status === 'Returned for Correction').length,
    }
  }, [applications])

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [app.id, app.applicant, app.instrumentId, app.instrument, app.location].some((val) =>
          val.toLowerCase().includes(q)
        )

      const matchesStatus =
        statusFilter === 'All' ||
        app.status === statusFilter ||
        (statusFilter === 'Pending Review' && app.status === 'Pending Review') ||
        (statusFilter === 'Approved' && (app.status === 'Approved' || app.status === 'Verified')) ||
        (statusFilter === 'Assigned' && (app.status === 'Assigned' || app.status === 'Scheduled'))

      const matchesType = typeFilter === 'All' || app.type === typeFilter
      const matchesDistrict = districtFilter === 'All' || app.district === districtFilter
      const matchesOfficer =
        officerFilter === 'All' ||
        (officerFilter === 'Unassigned' && (!app.assignedOfficer || app.assignedOfficer.includes('Unassigned'))) ||
        app.assignedOfficer === officerFilter

      return matchesSearch && matchesStatus && matchesType && matchesDistrict && matchesOfficer
    })
  }, [applications, searchTerm, statusFilter, typeFilter, districtFilter, officerFilter])

  const renderStatusBadge = (status: AdminApplicationStatus) => {
    switch (status) {
      case 'Approved':
      case 'Verified':
        return <span className="status-badge verified"><CheckCircle2 size={11} /> Approved</span>
      case 'Rejected':
        return <span className="status-badge awaiting-documents"><XCircle size={11} /> Rejected</span>
      case 'Returned for Correction':
        return <span className="status-badge under-review"><AlertTriangle size={11} /> Returned</span>
      case 'Assigned':
      case 'Scheduled':
        return <span className="status-badge scheduled"><UserCheck size={11} /> Assigned</span>
      case 'Under Review':
        return <span className="status-badge under-review"><Clock size={11} /> Under Review</span>
      default:
        return <span className="status-badge under-review"><Clock size={11} /> {status}</span>
    }
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO / TITLE */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE APPLICATION REGISTER & REVIEW</span>
          <h2>Verification Application Management</h2>
          <p>Review, assign officers, approve, reject, or return verification applications submitted across all state districts.</p>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="kpi-cards-grid-7">
        <button
          type="button"
          className={`kpi-card-interactive ${statusFilter === 'All' ? 'active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <span className="kpi-label">Total Applications</span>
          <strong className="kpi-val">{metrics.total}</strong>
          <small>All state records</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-amber ${statusFilter === 'Pending Review' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending Review')}
        >
          <span className="kpi-label">Pending Review</span>
          <strong className="kpi-val text-amber">{metrics.pending}</strong>
          <small>Needs admin action</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-blue ${statusFilter === 'Under Review' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Under Review')}
        >
          <span className="kpi-label">Under Review</span>
          <strong className="kpi-val text-blue">{metrics.underReview}</strong>
          <small>In review process</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-teal ${statusFilter === 'Assigned' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Assigned')}
        >
          <span className="kpi-label">Assigned</span>
          <strong className="kpi-val text-teal">{metrics.assigned}</strong>
          <small>Officer allocated</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-green ${statusFilter === 'Approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Approved')}
        >
          <span className="kpi-label">Approved</span>
          <strong className="kpi-val text-green">{metrics.approved}</strong>
          <small>Verification granted</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Rejected')}
        >
          <span className="kpi-label">Rejected</span>
          <strong className="kpi-val text-red">{metrics.rejected}</strong>
          <small>Applications denied</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-slate ${statusFilter === 'Returned for Correction' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Returned for Correction')}
        >
          <span className="kpi-label">Returned</span>
          <strong className="kpi-val">{metrics.returned}</strong>
          <small>Awaiting applicant edit</small>
        </button>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">APPLICATION WORK QUEUE</span>
            <h2>Applications ({filteredApplications.length} records)</h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Application ID, Applicant, Instrument ID..."
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Returned for Correction">Returned for Correction</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Application Types</option>
            <option value="Initial verification">Initial verification</option>
            <option value="Re-verification">Re-verification</option>
            <option value="After repair">After repair</option>
            <option value="Special inspection">Special inspection</option>
          </select>

          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="All">All Districts</option>
            <option value="South Delhi">South Delhi</option>
            <option value="North Delhi">North Delhi</option>
            <option value="North West Delhi">North West Delhi</option>
            <option value="Central Delhi">Central Delhi</option>
            <option value="South West Delhi">South West Delhi</option>
          </select>

          <select
            className="filter-select"
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
          >
            <option value="All">All Assigned Officers</option>
            <option value="Unassigned">Unassigned Only</option>
            {officers.map((off) => (
              <option key={off.id} value={off.name}>{off.name}</option>
            ))}
          </select>
        </div>

        {/* MAIN APPLICATIONS TABLE */}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant / Business</th>
                <th>Instrument</th>
                <th>Application Type</th>
                <th>Submitted Date</th>
                <th>Location / District</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.id}</strong>
                    </td>
                    <td>
                      <strong>{app.applicant}</strong>
                      <small className="cell-sub">{app.applicantGstin || 'GST Registered'}</small>
                    </td>
                    <td>
                      <strong>{app.instrumentId}</strong>
                      <span className="cell-sub">{app.instrument}</span>
                    </td>
                    <td>
                      <span className="badge-pill-outline">{app.type}</span>
                    </td>
                    <td>{app.submitted}</td>
                    <td>
                      <span>{app.location}</span>
                      <small className="cell-sub">{app.district}</small>
                    </td>
                    <td>
                      {app.assignedOfficer && !app.assignedOfficer.includes('Unassigned') ? (
                        <span className="officer-name-tag"><UserCheck size={12} /> {app.assignedOfficer}</span>
                      ) : (
                        <span className="unassigned-name-tag"><AlertCircle size={12} /> Unassigned</span>
                      )}
                    </td>
                    <td>{renderStatusBadge(app.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          title="View Application Details"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye size={13} /> View
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          title="Review & Take Decision"
                          onClick={() => setSelectedApp(app)}
                        >
                          <FileText size={13} /> Review
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-assign"
                          title="Assign Officer"
                          onClick={() => setSelectedApp(app)}
                        >
                          <UserCheck size={13} /> Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No verification applications match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
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
