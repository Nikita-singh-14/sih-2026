import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Flag,
  Gauge,
  MapPin,
  Search,
  UserCheck,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { AdminFieldInspection, AdminOfficer, InspectionStatusType } from '../../features/admin/adminTypes'
import { FieldInspectionDetailModal } from './FieldInspectionDetailModal'

interface StateAdminFieldOperationsProps {
  inspections: AdminFieldInspection[]
  officers: AdminOfficer[]
  initialStatusFilter?: string
  onAssignLmo: (id: string, lmoName: string) => void
  onReschedule: (id: string, newDate: string, newTime: string) => void
  onReviewReport: (id: string, decision: 'PASSED' | 'FAILED' | 'FLAGGED', notes: string) => void
  onFlagInspection: (id: string, reason: string) => void
}

export const StateAdminFieldOperations: React.FC<StateAdminFieldOperationsProps> = ({
  inspections,
  officers,
  initialStatusFilter = 'All',
  onAssignLmo,
  onReschedule,
  onReviewReport,
  onFlagInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [officerFilter, setOfficerFilter] = useState<string>('All')
  const [districtFilter, setDistrictFilter] = useState<string>('All')
  const [selectedInspection, setSelectedInspection] = useState<AdminFieldInspection | null>(null)

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    return {
      todaysVisits: inspections.filter((i) => i.scheduledDate === '2024-09-25' || i.scheduledDate === new Date().toISOString().split('T')[0]).length,
      scheduled: inspections.filter((i) => i.status === 'Scheduled').length,
      inProgress: inspections.filter((i) => i.status === 'In Progress').length,
      completed: inspections.filter((i) => i.status === 'Completed').length,
      pendingReview: inspections.filter((i) => i.status === 'Pending Review').length,
      flagged: inspections.filter((i) => i.isFlagged || i.status === 'Flagged').length,
    }
  }, [inspections])

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [insp.id, insp.instrumentId, insp.instrument, insp.applicant, insp.location, insp.lmoOfficer].some(
          (val) => val.toLowerCase().includes(q)
        )

      const matchesStatus =
        statusFilter === 'All' ||
        insp.status === statusFilter ||
        (statusFilter === 'Flagged' && insp.isFlagged)

      const matchesOfficer = officerFilter === 'All' || insp.lmoOfficer === officerFilter
      const matchesDistrict = districtFilter === 'All' || insp.district === districtFilter

      return matchesSearch && matchesStatus && matchesOfficer && matchesDistrict
    })
  }, [inspections, searchTerm, statusFilter, officerFilter, districtFilter])

  const renderStatusBadge = (status: InspectionStatusType, isFlagged?: boolean) => {
    if (isFlagged) {
      return <span className="status-badge awaiting-documents"><Flag size={11} /> Flagged</span>
    }
    switch (status) {
      case 'Completed':
        return <span className="status-badge verified"><CheckCircle2 size={11} /> Completed</span>
      case 'In Progress':
        return <span className="status-badge scheduled"><Clock size={11} /> In Progress</span>
      case 'Scheduled':
        return <span className="status-badge scheduled"><Calendar size={11} /> Scheduled</span>
      case 'Pending Review':
        return <span className="status-badge under-review"><Clock size={11} /> Pending Review</span>
      default:
        return <span className="status-badge under-review">{status}</span>
    }
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO TITLE */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE FIELD OPERATIONS & INSPECTIONS</span>
          <h2>Field Inspection Management</h2>
          <p>Assign LMO officers, schedule inspection visits, audit field report findings, and endorse verification outcomes.</p>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="kpi-cards-grid-6">
        <button
          type="button"
          className={`kpi-card-interactive ${statusFilter === 'Today' ? 'active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <span className="kpi-label">Today's Visits</span>
          <strong className="kpi-val text-blue">{metrics.todaysVisits}</strong>
          <small>Active for today</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-teal ${statusFilter === 'Scheduled' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Scheduled')}
        >
          <span className="kpi-label">Scheduled</span>
          <strong className="kpi-val text-teal">{metrics.scheduled}</strong>
          <small>Visits lined up</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-blue ${statusFilter === 'In Progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('In Progress')}
        >
          <span className="kpi-label">In Progress</span>
          <strong className="kpi-val text-blue">{metrics.inProgress}</strong>
          <small>LMO on site</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-green ${statusFilter === 'Completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Completed')}
        >
          <span className="kpi-label">Completed</span>
          <strong className="kpi-val text-green">{metrics.completed}</strong>
          <small>Reports submitted</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-amber ${statusFilter === 'Pending Review' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending Review')}
        >
          <span className="kpi-label">Pending Review</span>
          <strong className="kpi-val text-amber">{metrics.pendingReview}</strong>
          <small>Needs Admin review</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Flagged' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Flagged')}
        >
          <span className="kpi-label">Flagged Cases</span>
          <strong className="kpi-val text-red">{metrics.flagged}</strong>
          <small>Enforcement raids</small>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">FIELD INSPECTION WORK QUEUE</span>
            <h2>Inspection Schedule & Audits ({filteredInspections.length} cases)</h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Inspection ID, Instrument, Officer, Applicant..."
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Inspection Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged Cases</option>
          </select>

          <select
            className="filter-select"
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
          >
            <option value="All">All Field LMOs</option>
            {officers.map((off) => (
              <option key={off.id} value={off.name}>{off.name}</option>
            ))}
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
        </div>

        {/* MAIN TABLE */}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Instrument</th>
                <th>Applicant / Business</th>
                <th>Assigned LMO</th>
                <th>Scheduled Date & Time</th>
                <th>Location / District</th>
                <th>Inspection Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.length > 0 ? (
                filteredInspections.map((insp) => (
                  <tr key={insp.id}>
                    <td><strong>{insp.id}</strong></td>
                    <td>
                      <strong>{insp.instrumentId}</strong>
                      <span className="cell-sub">{insp.instrument}</span>
                    </td>
                    <td>
                      <strong>{insp.applicant}</strong>
                    </td>
                    <td>
                      <span className="officer-name-tag"><UserCheck size={12} /> {insp.lmoOfficer}</span>
                    </td>
                    <td>
                      <strong>{insp.scheduledDate}</strong>
                      <small className="cell-sub">{insp.scheduledTime}</small>
                    </td>
                    <td>
                      <span>{insp.location}</span>
                      <small className="cell-sub">{insp.district}</small>
                    </td>
                    <td>
                      <span className="badge-pill-outline">{insp.inspectionType}</span>
                    </td>
                    <td>{renderStatusBadge(insp.status, insp.isFlagged)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          title="View Inspection Details"
                          onClick={() => setSelectedInspection(insp)}
                        >
                          <Eye size={13} /> View
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          title="Review Report & Endorse"
                          onClick={() => setSelectedInspection(insp)}
                        >
                          <FileText size={13} /> Review Report
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-assign"
                          title="Assign / Reassign LMO"
                          onClick={() => setSelectedInspection(insp)}
                        >
                          <UserCheck size={13} /> Assign
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-inspect"
                          title="Reschedule Visit"
                          onClick={() => setSelectedInspection(insp)}
                        >
                          <Calendar size={13} /> Reschedule
                        </button>

                        <button
                          type="button"
                          className={`btn-action-sm ${insp.isFlagged ? 'btn-flag-active' : 'btn-flag'}`}
                          title="Flag Inspection Case"
                          onClick={() => setSelectedInspection(insp)}
                        >
                          <Flag size={13} /> {insp.isFlagged ? 'Flagged' : 'Flag'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No field inspections match your selected search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedInspection && (
        <FieldInspectionDetailModal
          inspection={selectedInspection}
          officers={officers}
          onClose={() => setSelectedInspection(null)}
          onAssignLmo={onAssignLmo}
          onReschedule={onReschedule}
          onReviewReport={onReviewReport}
          onFlagInspection={onFlagInspection}
        />
      )}
    </div>
  )
}
