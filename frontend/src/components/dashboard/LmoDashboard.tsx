import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  CloudOff,
  Download,
  Filter,
  MapPin,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Wifi,
  WifiOff,
} from 'lucide-react'
import type { AuthUser, InspectionWorkspaceData, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer, lmoKpiStats, lmoReadinessItems } from '../../features/lmo/data'
import { offlineManager } from '../../features/lmo/offlineManager'
import { InspectionWorkspaceModal } from './InspectionWorkspaceModal'

interface LmoDashboardProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export function LmoDashboard({ currentUser, onActionFeedback }: LmoDashboardProps) {
  // State for assignments dynamically scoped to authenticated LMO
  const [assignments, setAssignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser)
  )

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('Today')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  // Offline manager state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [downloadingOffline, setDownloadingOffline] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  // Selected assignment for 15-section Inspection Workspace Modal
  const [activeWorkspaceAssignment, setActiveWorkspaceAssignment] = useState<LmoAssignment | null>(null)

  // Subscribe to offline manager
  useEffect(() => {
    const unsubscribe = offlineManager.subscribe((onlineStatus, pendingCount, syncing) => {
      setIsOnline(onlineStatus)
      setPendingSyncCount(pendingCount)
      setIsSyncing(syncing)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // Update assignments if current user changes
  useEffect(() => {
    setAssignments(getAssignmentsForOfficer(currentUser))
  }, [currentUser])

  // Feedback helper
  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  // Format jurisdiction header display dynamically
  const getJurisdictionDisplay = () => {
    const district = currentUser.jurisdiction?.district?.trim()
    const state = currentUser.jurisdiction?.state?.trim()
    if (district && state) return `${district.toUpperCase()}, ${state.toUpperCase()}`
    if (district) return district.toUpperCase()
    if (state) return state.toUpperCase()
    return 'Jurisdiction not assigned'
  }

  const jurisdictionDisplay = getJurisdictionDisplay()

  // Filter assignments for authenticated LMO & active filter controls
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      // 1. Officer account match check
      if (
        item.assignedOfficerEmail &&
        currentUser.email &&
        item.assignedOfficerEmail.toLowerCase() !== currentUser.email.toLowerCase()
      ) {
        return false
      }

      // 2. Search query match
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        [item.applicationId, item.business, item.location, item.instrument, item.verificationType].some((val) =>
          val.toLowerCase().includes(query)
        )

      // 3. Date filter
      const matchesDate =
        dateFilter === 'All Dates' || item.date.toLowerCase() === dateFilter.toLowerCase()

      // 4. Priority filter
      const matchesPriority =
        priorityFilter === 'All Priorities' || item.priority.toLowerCase() === priorityFilter.toLowerCase()

      // 5. Status filter
      const matchesStatus =
        statusFilter === 'All Statuses' || item.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesDate && matchesPriority && matchesStatus
    })
  }, [assignments, currentUser, searchTerm, dateFilter, priorityFilter, statusFilter])

  // Dynamic High-Risk cases detection
  const highRiskAssignments = useMemo(() => {
    return assignments.filter((item) => item.riskFactors && item.riskFactors.length > 0)
  }, [assignments])

  // Handle Download Offline Cases action
  const handleDownloadOfflineCases = () => {
    setDownloadingOffline(true)
    setDownloadProgress('Caching assigned cases locally...')
    setTimeout(() => {
      setDownloadProgress('Storing encrypted offline package...')
      setTimeout(() => {
        setDownloadingOffline(false)
        setDownloadProgress('')
        handleFeedback(`${assignments.length} assigned inspection cases saved offline`)
      }, 700)
    }, 700)
  }

  // Handle Manual Trigger Sync
  const handleManualSync = async () => {
    handleFeedback('Initiating offline queue synchronization...')
    const result = await offlineManager.syncPendingQueue()
    if (result.syncedCount > 0) {
      handleFeedback(`Synchronized ${result.syncedCount} offline inspection reports with central server`)
    } else if (result.errors > 0) {
      handleFeedback(`Sync finished with ${result.errors} network retries queued`)
    } else {
      handleFeedback('All local inspection reports are already up to date')
    }
  }

  // Handle Save Offline from Modal
  const handleSaveOfflineData = (data: InspectionWorkspaceData) => {
    offlineManager.saveInspectionOffline(data)
    handleFeedback(`Inspection report for ${data.applicationDetails.applicationNo} stored in local offline queue`)
    setActiveWorkspaceAssignment(null)
  }

  // Handle Submit Inspection from Modal
  const handleSubmitInspectionData = (data: InspectionWorkspaceData) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.applicationId === data.applicationDetails.applicationNo
          ? { ...item, status: data.decision === 'PASSED' ? 'Passed' : data.decision === 'FAILED' ? 'Failed' : 'Flagged' }
          : item
      )
    )
    handleFeedback(`Verification result (${data.decision}) submitted for ${data.applicationDetails.applicationNo}`)
    setActiveWorkspaceAssignment(null)
  }

  return (
    <div className="lmo-dashboard">
      {/* Offline Status & Pending Sync Indicator Bar */}
      <div className={`lmo-sync-status-bar ${isOnline ? 'online' : 'offline'}`}>
        <div className="sync-status-left">
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>
            {isOnline
              ? 'Network Active · Secure Session Validated'
              : 'Offline Mode Active · Inspection data saved locally'}
          </span>
        </div>

        <div className="sync-status-right">
          {pendingSyncCount > 0 && (
            <span className="pending-sync-badge">
              <CloudOff size={13} /> {pendingSyncCount} Pending Sync{pendingSyncCount > 1 ? 's' : ''}
            </span>
          )}
          {isOnline && pendingSyncCount > 0 && (
            <button
              type="button"
              className="sync-now-btn"
              disabled={isSyncing}
              onClick={handleManualSync}
            >
              <RefreshCw size={13} className={isSyncing ? 'spinning' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {/* Header Section */}
      <section className="page-heading lmo-heading">
        <div>
          <p className="eyebrow">LEGAL METROLOGY OFFICER / {jurisdictionDisplay}</p>
          <h1>Good morning, {currentUser.name}</h1>
          <p className="heading-copy">Here is your field inspection overview for today.</p>
        </div>
        <button
          className="primary-button lmo-start-button"
          type="button"
          onClick={() => {
            const firstAssigned = filteredAssignments[0] || assignments[0]
            if (firstAssigned) setActiveWorkspaceAssignment(firstAssigned)
          }}
        >
          <span className="play-icon-circle">
            <Play size={12} fill="currentColor" style={{ marginLeft: '1px' }} />
          </span>
          Start field inspection
        </button>
      </section>

      {/* 4 KPI Cards */}
      <section className="lmo-kpi-grid" aria-label="Field Inspection KPIs">
        {lmoKpiStats.map((kpi) => {
          let IconComponent = ClipboardList
          let iconClass = 'blue'

          if (kpi.type === 'due') {
            IconComponent = Calendar
            iconClass = 'amber'
          } else if (kpi.type === 'offline') {
            IconComponent = RefreshCw
            iconClass = 'teal'
          } else if (kpi.type === 'completed') {
            IconComponent = Check
            iconClass = 'green'
          }

          return (
            <article key={kpi.label} className="lmo-kpi-card">
              <div className={`lmo-kpi-icon ${iconClass}`}>
                <IconComponent size={19} />
              </div>
              <div className="lmo-kpi-copy">
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      {/* Dynamic High-Risk Inspection Alert Banner */}
      {highRiskAssignments.length > 0 && (
        <section className="lmo-high-risk-banner">
          <div className="risk-banner-icon-wrap">
            <ShieldAlert size={22} />
          </div>
          <div className="risk-banner-content">
            <span className="risk-tag">HIGH-RISK INSPECTION ALERT ({highRiskAssignments.length} INSTRUMENTS)</span>
            <h3 className="risk-title">
              {highRiskAssignments[0].applicationId} – {highRiskAssignments[0].business}, {highRiskAssignments[0].location}
            </h3>
            <p className="risk-description">
              {highRiskAssignments[0].riskFactors?.map((rf) => `${rf.label}: ${rf.detail}`).join(' | ')}
            </p>
          </div>
          <button
            className="risk-banner-action"
            type="button"
            onClick={() => setActiveWorkspaceAssignment(highRiskAssignments[0])}
          >
            View case <ArrowRight size={15} />
          </button>
        </section>
      )}

      {/* Main Content Grid: Assigned Inspections Table + Device & Resources */}
      <section className="lmo-content-grid">
        {/* Left Section: Today's Assigned Inspections Table & Filters */}
        <div className="panel lmo-assignments-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FIELD ASSIGNMENTS</p>
              <h2>Today’s Assigned Inspections</h2>
            </div>
            <button
              className="text-button lmo-route-link"
              type="button"
              onClick={() => handleFeedback('Opening full route map & GPS navigation')}
            >
              View full route <span>→</span>
            </button>
          </div>

          {/* 4 Interactive Filters: Search, Date, Priority, Status */}
          <div className="table-toolbar lmo-filter-toolbar">
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Search assigned inspections"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Application ID, Business, Location or Instrument..."
              />
            </div>

            <div className="lmo-filter-selects">
              <div className="filter-select-wrap">
                <Filter size={13} />
                <select
                  aria-label="Filter by Date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="All Dates">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                </select>
              </div>

              <select
                className="filter-button"
                aria-label="Filter by Priority"
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
                aria-label="Filter by Status"
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

          {/* Table displaying all 8 columns */}
          <div className="table-wrap lmo-table-wrap">
            <table className="lmo-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>APPLICATION ID</th>
                  <th>BUSINESS AND LOCATION</th>
                  <th>INSTRUMENT</th>
                  <th>VERIFICATION TYPE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="time-cell">{assignment.time}</td>
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
                        View Case
                      </button>
                      <button
                        className="lmo-action-btn primary"
                        type="button"
                        onClick={() => setActiveWorkspaceAssignment(assignment)}
                      >
                        Start Inspection
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredAssignments.length === 0 && (
              <div className="lmo-empty-state">
                <AlertTriangle size={32} color="#94a3b8" />
                <h3>No assigned inspections found</h3>
                <p>No inspection cases match your selected search, date, priority, or status filters.</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSearchTerm('')
                    setDateFilter('All Dates')
                    setPriorityFilter('All Priorities')
                    setStatusFilter('All Statuses')
                  }}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Device & Resources Panel */}
        <aside className="panel lmo-readiness-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FIELD READINESS</p>
              <h2>Device & Resources</h2>
            </div>
          </div>

          <div className="lmo-readiness-list">
            {lmoReadinessItems.map((item) => {
              let ItemIcon = MapPin
              if (item.type === 'camera') ItemIcon = Camera
              if (item.type === 'download') ItemIcon = Download
              if (item.type === 'kit') ItemIcon = Briefcase

              return (
                <div key={item.id} className="lmo-readiness-item">
                  <div className="readiness-icon-wrap">
                    <ItemIcon size={18} />
                  </div>
                  <div className="readiness-details">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                  <div className="readiness-check">
                    <CheckCircle2 size={18} fill="#10b981" color="#ffffff" />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            className="lmo-download-cases-btn"
            type="button"
            disabled={downloadingOffline}
            onClick={handleDownloadOfflineCases}
          >
            <Download size={16} className={downloadingOffline ? 'spinning' : ''} />
            {downloadingOffline ? downloadProgress : 'Download Assigned Cases'}
          </button>
        </aside>
      </section>

      {/* 15-Section Inspection Workspace Modal */}
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
