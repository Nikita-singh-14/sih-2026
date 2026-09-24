import { useState } from 'react'
import {
  Search,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileCheck,
  Building,
  Calendar,
  AlertTriangle,
  Camera,
  MapPin,
} from 'lucide-react'
import type { AuthUser, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer } from '../../features/lmo/data'
import { InspectionWorkspaceModal } from '../dashboard/InspectionWorkspaceModal'

interface FieldInspectionsProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function FieldInspections({ currentUser, onActionFeedback }: FieldInspectionsProps) {
  const [assignments, setAssignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser)
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [activeWorkspaceAssignment, setActiveWorkspaceAssignment] = useState<LmoAssignment | null>(null)

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const filtered = assignments.filter((item) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      !q ||
      item.applicationId.toLowerCase().includes(q) ||
      item.business.toLowerCase().includes(q) ||
      item.instrument.toLowerCase().includes(q)
    const matchesType = filterType === 'All Types' || item.verificationType === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="field-inspections-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">LEGAL METROLOGY / FIELD WORKSPACE</p>
          <h1>Field Inspections</h1>
          <p className="heading-copy">Conduct technical testing, visual checks, and issue official verification decisions.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            const pending = assignments.find((a) => a.status === 'Inspection in progress' || a.status === 'Assigned') || assignments[0]
            if (pending) setActiveWorkspaceAssignment(pending)
          }}
        >
          <Play size={15} fill="currentColor" /> Launch Inspection Workspace
        </button>
      </section>

      {/* Grid of Inspection Cards */}
      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">FIELD VERIFICATION REGISTRATION</p>
            <h2>All Inspection Cases</h2>
          </div>
          <span className="queue-count">{filtered.length} inspections</span>
        </div>

        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, establishment, or instrument type..."
            />
          </div>
          <select
            className="filter-button"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All Types">All Types</option>
            <option value="Initial verification">Initial Verification</option>
            <option value="Re-verification">Re-verification</option>
            <option value="Special inspection">Special Inspection</option>
          </select>
        </div>

        <div className="table-wrap lmo-table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>BUSINESS NAME</th>
                <th>INSTRUMENT TYPE</th>
                <th>VERIFICATION TYPE</th>
                <th>SCHEDULED TIME</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="app-id-cell">
                    <strong>{item.applicationId}</strong>
                  </td>
                  <td>
                    <strong>{item.business}</strong>
                    <span>{item.location}</span>
                  </td>
                  <td>{item.instrument}</td>
                  <td>
                    <span className="verification-type-badge">{item.verificationType}</span>
                  </td>
                  <td className="time-cell">{item.time} ({item.date})</td>
                  <td>
                    <span className={`status-pill ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="lmo-action-btn primary"
                      type="button"
                      onClick={() => setActiveWorkspaceAssignment(item)}
                    >
                      {item.status === 'Passed' || item.status === 'Failed' ? 'Review Report' : 'Open Workspace'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeWorkspaceAssignment && (
        <InspectionWorkspaceModal
          assignment={activeWorkspaceAssignment}
          onClose={() => setActiveWorkspaceAssignment(null)}
          onSaveOffline={(data) => {
            handleFeedback(`Inspection data for ${data.applicationDetails.applicationNo} saved offline.`)
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
            handleFeedback(`Inspection ${data.decision} submitted for ${data.applicationDetails.applicationNo}`)
            setActiveWorkspaceAssignment(null)
          }}
        />
      )}
    </div>
  )
}
