import React, { useState, useMemo } from 'react'
import {
  ClipboardCheck,
  Search,
  Filter,
  Eye,
  Play,
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react'
import type { AuthUser, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer } from '../../features/lmo/data'
import { InspectionWorkspaceModal } from '../dashboard/InspectionWorkspaceModal'
import { offlineManager } from '../../features/lmo/offlineManager'

interface MyAssignmentsProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function MyAssignments({ currentUser, onActionFeedback }: MyAssignmentsProps) {
  const [assignments, setAssignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser)
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [activeWorkspaceAssignment, setActiveWorkspaceAssignment] = useState<LmoAssignment | null>(null)

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  const filtered = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [item.applicationId, item.business, item.location, item.instrument].some((v) =>
          v.toLowerCase().includes(q)
        )
      const matchesPriority =
        priorityFilter === 'All Priorities' || item.priority.toLowerCase() === priorityFilter.toLowerCase()
      const matchesStatus =
        statusFilter === 'All Statuses' || item.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [assignments, searchTerm, priorityFilter, statusFilter])

  const counts = useMemo(() => {
    const total = assignments.length
    const highPriority = assignments.filter((a) => a.priority === 'High').length
    const scheduled = assignments.filter((a) => a.status === 'Scheduled').length
    const inProgress = assignments.filter((a) => a.status === 'Inspection in progress').length
    return { total, highPriority, scheduled, inProgress }
  }, [assignments])

  return (
    <div className="lmo-subpage">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">OFFICER ASSIGNMENTS / {jurisdictionDisplay}</p>
          <h1>My Assigned Verification Tasks</h1>
          <p className="heading-copy">
            Complete list of verification applications and field audits assigned to {currentUser.name}.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            const first = filtered[0] || assignments[0]
            if (first) setActiveWorkspaceAssignment(first)
          }}
        >
          <Play size={14} fill="currentColor" /> Start First Assignment
        </button>
      </section>

      {/* KPI Cards */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <ClipboardCheck size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Assigned Tasks</span>
            <strong>{counts.total}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <AlertTriangle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>High Priority Cases</span>
            <strong>{counts.highPriority}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Clock size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Scheduled Visits</span>
            <strong>{counts.scheduled}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <Play size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>In Progress</span>
            <strong>{counts.inProgress}</strong>
          </div>
        </article>
      </section>

      {/* Main Table */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ASSIGNMENT REGISTER</p>
            <h2>Field Tasks & Applications</h2>
          </div>
          <span className="queue-count">{filtered.length} tasks shown</span>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Application ID, Business Name, Location, or Instrument..."
            />
          </div>

          <div className="lmo-filter-selects">
            <select
              className="filter-button"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All Priorities">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              className="filter-button"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inspection in progress">In Progress</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>SCHEDULED TIME</th>
                <th>APPLICATION ID</th>
                <th>ESTABLISHMENT & LOCATION</th>
                <th>INSTRUMENT TYPE</th>
                <th>TYPE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.time}</strong>
                    <small style={{ display: 'block', color: '#64748b' }}>{item.date}</small>
                  </td>
                  <td>
                    <strong>{item.applicationId}</strong>
                  </td>
                  <td>
                    <strong>{item.business}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{item.location}</span>
                  </td>
                  <td>{item.instrument}</td>
                  <td>
                    <span className="verification-type-badge">{item.verificationType}</span>
                  </td>
                  <td>
                    <span className={`priority-badge ${item.priority.toLowerCase()}`}>{item.priority}</span>
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
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setActiveWorkspaceAssignment(item)}
                    >
                      Inspect Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
              <ClipboardCheck size={36} color="#94a3b8" />
              <h3>No assignments found</h3>
              <p>No field tasks match your search or filter selection.</p>
            </div>
          )}
        </div>
      </section>

      {/* Inspection Modal */}
      {activeWorkspaceAssignment && (
        <InspectionWorkspaceModal
          assignment={activeWorkspaceAssignment}
          onClose={() => setActiveWorkspaceAssignment(null)}
          onSaveOffline={(data) => {
            offlineManager.saveInspectionOffline(data)
            onActionFeedback(`Saved offline for ${data.applicationDetails.applicationNo}`)
            setActiveWorkspaceAssignment(null)
          }}
          onSubmitInspection={(data) => {
            setAssignments((prev) =>
              prev.map((a) =>
                a.applicationId === data.applicationDetails.applicationNo
                  ? { ...a, status: data.decision === 'PASSED' ? 'Passed' : 'Failed' }
                  : a
              )
            )
            onActionFeedback(`Submitted: ${data.decision} for ${data.applicationDetails.applicationNo}`)
            setActiveWorkspaceAssignment(null)
          }}
        />
      )}
    </div>
  )
}
