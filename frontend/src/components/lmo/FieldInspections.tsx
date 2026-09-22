import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileText,
  Calendar,
  Building2,
  MapPin,
  RefreshCw,
  Eye
} from 'lucide-react'
import type { AuthUser, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer, getMockWorkspaceData } from '../../features/lmo/data'
import { InspectionWorkspaceModal } from '../dashboard/InspectionWorkspaceModal'
import { offlineManager } from '../../features/lmo/offlineManager'

interface FieldInspectionsProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function FieldInspections({ currentUser, onActionFeedback }: FieldInspectionsProps) {
  const [assignments, setAssignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser)
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('All Stages')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [activeModalAssignment, setActiveModalAssignment] = useState<LmoAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  const filteredInspections = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [item.applicationId, item.business, item.location, item.instrument].some((val) =>
          val.toLowerCase().includes(q)
        )
      const matchesStage =
        stageFilter === 'All Stages' || item.status.toLowerCase() === stageFilter.toLowerCase()
      const matchesType =
        typeFilter === 'All Types' || item.verificationType.toLowerCase() === typeFilter.toLowerCase()

      return matchesSearch && matchesStage && matchesType
    })
  }, [assignments, searchTerm, stageFilter, typeFilter])

  const stats = useMemo(() => {
    const total = assignments.length
    const inProgress = assignments.filter((a) => a.status === 'Inspection in progress').length
    const scheduled = assignments.filter((a) => a.status === 'Scheduled' || a.status === 'Assigned').length
    const highRisk = assignments.filter((a) => a.riskFactors && a.riskFactors.length > 0).length

    return { total, inProgress, scheduled, highRisk }
  }, [assignments])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAssignments(getAssignmentsForOfficer(currentUser))
      setIsLoading(false)
      onActionFeedback('Field inspection workspace updated')
    }, 500)
  }

  return (
    <div className="lmo-subpage">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">FIELD OPERATIONS / {jurisdictionDisplay}</p>
          <h1>Field Inspections Workspace</h1>
          <p className="heading-copy">
            Manage, execute, and verify legal metrology field inspections for {currentUser.name}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" type="button" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} /> Refresh
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              const first = filteredInspections[0] || assignments[0]
              if (first) setActiveModalAssignment(first)
            }}
          >
            <Play size={14} fill="currentColor" /> Launch Inspection
          </button>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <ShieldCheck size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Assigned Inspections</span>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <Calendar size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Scheduled & Pending</span>
            <strong>{stats.scheduled}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Play size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <AlertTriangle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>High Risk Flagged</span>
            <strong>{stats.highRisk}</strong>
          </div>
        </article>
      </section>

      {/* Main Table Panel */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">INSPECTION LOG</p>
            <h2>Active Field Inspection Cases</h2>
          </div>
          <span className="queue-count">{filteredInspections.length} cases found</span>
        </div>

        {/* Filters */}
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Application ID, Business Name, Location or Instrument..."
            />
          </div>

          <div className="lmo-filter-selects">
            <select
              className="filter-button"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="All Stages">All Stages</option>
              <option value="Assigned">Assigned</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inspection in progress">In Progress</option>
            </select>

            <select
              className="filter-button"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All Types">All Types</option>
              <option value="Re-verification">Re-verification</option>
              <option value="Initial verification">Initial verification</option>
              <option value="Special inspection">Special inspection</option>
              <option value="After repair">After repair</option>
            </select>
          </div>
        </div>

        {/* Skeleton or Table */}
        {isLoading ? (
          <div className="lmo-skeleton-wrap" style={{ padding: '2rem' }}>
            <div className="skeleton-line" style={{ height: '40px', marginBottom: '1rem', background: '#e2e8f0', borderRadius: '6px' }} />
            <div className="skeleton-line" style={{ height: '40px', marginBottom: '1rem', background: '#f1f5f9', borderRadius: '6px' }} />
            <div className="skeleton-line" style={{ height: '40px', background: '#e2e8f0', borderRadius: '6px' }} />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="lmo-table">
              <thead>
                <tr>
                  <th>APPLICATION ID</th>
                  <th>ESTABLISHMENT</th>
                  <th>INSTRUMENT</th>
                  <th>VERIFICATION TYPE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.applicationId}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>{item.date} · {item.time}</small>
                    </td>
                    <td>
                      <strong>{item.business}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{item.location}</span>
                    </td>
                    <td>
                      <strong>{item.instrument}</strong>
                    </td>
                    <td>
                      <span className="verification-type-badge">{item.verificationType}</span>
                    </td>
                    <td>
                      <span className={`priority-badge ${item.priority.toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="primary-button"
                        type="button"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setActiveModalAssignment(item)}
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} /> View & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInspections.length === 0 && (
              <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShieldCheck size={36} color="#94a3b8" />
                <h3>No inspection cases match your filter</h3>
                <p>Try clearing filters or searching with a different term.</p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setStageFilter('All Stages')
                    setTypeFilter('All Types')
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      {activeModalAssignment && (
        <InspectionWorkspaceModal
          assignment={activeModalAssignment}
          onClose={() => setActiveModalAssignment(null)}
          onSaveOffline={(data) => {
            offlineManager.saveInspectionOffline(data)
            onActionFeedback(`Inspection saved offline for ${data.applicationDetails.applicationNo}`)
            setActiveModalAssignment(null)
          }}
          onSubmitInspection={(data) => {
            setAssignments((prev) =>
              prev.map((a) =>
                a.applicationId === data.applicationDetails.applicationNo
                  ? { ...a, status: data.decision === 'PASSED' ? 'Passed' : 'Failed' }
                  : a
              )
            )
            onActionFeedback(`Verification submitted: ${data.decision} for ${data.applicationDetails.applicationNo}`)
            setActiveModalAssignment(null)
          }}
        />
      )}
    </div>
  )
}
