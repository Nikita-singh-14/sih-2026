import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  Play,
  Calendar,
  Building,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText,
  ChevronRight,
} from 'lucide-react'
import type { AuthUser, InspectionWorkspaceData, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer } from '../../features/lmo/data'
import { offlineManager } from '../../features/lmo/offlineManager'
import { InspectionWorkspaceModal } from '../dashboard/InspectionWorkspaceModal'

interface MyAssignmentsProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function MyAssignments({ currentUser, onActionFeedback }: MyAssignmentsProps) {
  const [assignments, setAssignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser)
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('All Dates')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [activeWorkspaceAssignment, setActiveWorkspaceAssignment] = useState<LmoAssignment | null>(null)

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        [item.applicationId, item.business, item.location, item.instrument, item.verificationType].some((val) =>
          val.toLowerCase().includes(query)
        )

      const matchesDate =
        dateFilter === 'All Dates' || item.date.toLowerCase() === dateFilter.toLowerCase()

      const matchesPriority =
        priorityFilter === 'All Priorities' || item.priority.toLowerCase() === priorityFilter.toLowerCase()

      const matchesStatus =
        statusFilter === 'All Statuses' || item.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesDate && matchesPriority && matchesStatus
    })
  }, [assignments, searchTerm, dateFilter, priorityFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: assignments.length,
      highPriority: assignments.filter((a) => a.priority === 'High').length,
      inProgress: assignments.filter((a) => a.status === 'Inspection in progress').length,
      completed: assignments.filter((a) => a.status === 'Passed' || a.status === 'Failed').length,
    }
  }, [assignments])

  const handleSaveOfflineData = (data: InspectionWorkspaceData) => {
    offlineManager.saveInspectionOffline(data)
    handleFeedback(`Inspection report for ${data.applicationDetails.applicationNo} stored locally`)
    setActiveWorkspaceAssignment(null)
  }

  const handleSubmitInspectionData = (data: InspectionWorkspaceData) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.applicationId === data.applicationDetails.applicationNo
          ? { ...item, status: data.decision === 'PASSED' ? 'Passed' : data.decision === 'FAILED' ? 'Failed' : 'Flagged' }
          : item
      )
    )
    handleFeedback(`Inspection result (${data.decision}) submitted for ${data.applicationDetails.applicationNo}`)
    setActiveWorkspaceAssignment(null)
  }

  return (
    <div className="lmo-assignments-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">FIELD OFFICERS / ASSIGNMENTS</p>
          <h1>My Field Assignments</h1>
          <p className="heading-copy">Manage, inspect, and submit verification reports for your assigned cases.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            const first = filteredAssignments[0] || assignments[0]
            if (first) setActiveWorkspaceAssignment(first)
          }}
        >
          <Play size={15} fill="currentColor" /> Start Next Inspection
        </button>
      </section>

      {/* KPI Cards */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <FileText size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Assigned</span>
            <strong>{stats.total}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <ShieldAlert size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>High Priority</span>
            <strong>{stats.highPriority}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Clock size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </article>
      </section>

      {/* Assignments Main Panel */}
      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ASSIGNED CASES REGISTER</p>
            <h2>Inspection Cases ({filteredAssignments.length})</h2>
          </div>
          <span className="queue-count">{filteredAssignments.length} cases displayed</span>
        </div>

        {/* Toolbar & Filters */}
        <div className="table-toolbar lmo-filter-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              aria-label="Search assignments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Application ID, Business, Location, or Instrument..."
            />
          </div>
          <div className="lmo-filter-selects" style={{ display: 'flex', gap: '8px' }}>
            <select
              className="filter-button"
              aria-label="Date filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="All Dates">All Dates</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
            </select>
            <select
              className="filter-button"
              aria-label="Priority filter"
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
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inspection in progress">In Progress</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="table-wrap lmo-table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>TIME & DATE</th>
                <th>APPLICATION ID</th>
                <th>BUSINESS & LOCATION</th>
                <th>INSTRUMENT</th>
                <th>TYPE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="time-cell">
                    <strong>{assignment.time}</strong>
                    <span>{assignment.date}</span>
                  </td>
                  <td className="app-id-cell">
                    <strong>{assignment.applicationId}</strong>
                  </td>
                  <td>
                    <strong>{assignment.business}</strong>
                    <span>{assignment.location}</span>
                  </td>
                  <td className="instrument-cell">{assignment.instrument}</td>
                  <td>
                    <span className="verification-type-badge">{assignment.verificationType}</span>
                  </td>
                  <td>
                    <span className={`priority-badge ${assignment.priority.toLowerCase()}`}>
                      {assignment.priority === 'High' ? (
                        <>
                          <span className="priority-symbol">▲</span> High
                        </>
                      ) : assignment.priority === 'Medium' ? (
                        <>
                          <span className="priority-dot">●</span> Medium
                        </>
                      ) : (
                        <>
                          <span className="priority-dot">●</span> Low
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${assignment.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="lmo-action-btn secondary"
                      type="button"
                      onClick={() => setActiveWorkspaceAssignment(assignment)}
                    >
                      View
                    </button>
                    <button
                      className="lmo-action-btn primary"
                      type="button"
                      onClick={() => setActiveWorkspaceAssignment(assignment)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAssignments.length === 0 && (
            <div className="lmo-empty-state" style={{ padding: '32px', textAlign: 'center' }}>
              <AlertTriangle size={32} color="#94a3b8" />
              <h3 style={{ margin: '12px 0 6px', color: '#1e293b' }}>No assignments found</h3>
              <p style={{ color: '#64748b', fontSize: '12px' }}>Try resetting your search query or filters.</p>
              <button
                type="button"
                className="secondary-button"
                style={{ marginTop: '14px', display: 'inline-flex', width: 'auto' }}
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('All Dates')
                  setPriorityFilter('All Priorities')
                  setStatusFilter('All Statuses')
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      {activeWorkspaceAssignment && (
        <InspectionWorkspaceModal
          assignment={activeWorkspaceAssignment}
          onClose={() => setActiveWorkspaceAssignment(null)}
          onSaveOffline={handleSaveOfflineData}
          onSubmitInspection={handleSubmitInspectionData}
        />
      )}
    </div>
  )
}
