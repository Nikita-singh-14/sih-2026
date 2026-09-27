import React, { useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Flag,
  Gauge,
  MapPin,
  ShieldCheck,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react'
import type { AdminFieldInspection, AdminOfficer } from '../../features/admin/adminTypes'

interface FieldInspectionDetailModalProps {
  inspection: AdminFieldInspection
  officers: AdminOfficer[]
  onClose: () => void
  onAssignLmo: (id: string, lmoName: string) => void
  onReschedule: (id: string, newDate: string, newTime: string) => void
  onReviewReport: (id: string, decision: 'PASSED' | 'FAILED' | 'FLAGGED', notes: string) => void
  onFlagInspection: (id: string, reason: string) => void
}

export const FieldInspectionDetailModal: React.FC<FieldInspectionDetailModalProps> = ({
  inspection,
  officers,
  onClose,
  onAssignLmo,
  onReschedule,
  onReviewReport,
  onFlagInspection,
}) => {
  const [selectedLmo, setSelectedLmo] = useState(inspection.lmoOfficer || '')
  const [rescheduleDate, setRescheduleDate] = useState(inspection.scheduledDate || '')
  const [rescheduleTime, setRescheduleTime] = useState(inspection.scheduledTime || '10:00 AM')
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false)
  const [showFlagPrompt, setShowFlagPrompt] = useState(false)
  const [flagReasonText, setFlagReasonText] = useState(inspection.flagReason || '')
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [reviewDecision, setReviewDecision] = useState<'PASSED' | 'FAILED' | 'FLAGGED'>('PASSED')
  const [reviewNotesText, setReviewNotesText] = useState('')

  const handleLmoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedLmo(val)
    if (val) {
      onAssignLmo(inspection.id, val)
    }
  }

  const handleConfirmReschedule = () => {
    if (!rescheduleDate) return
    onReschedule(inspection.id, rescheduleDate, rescheduleTime)
    setShowReschedulePrompt(false)
  }

  const handleConfirmFlag = () => {
    if (!flagReasonText.trim()) return
    onFlagInspection(inspection.id, flagReasonText.trim())
    setShowFlagPrompt(false)
  }

  const handleConfirmReview = () => {
    onReviewReport(inspection.id, reviewDecision, reviewNotesText.trim())
    setShowReviewPrompt(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-box">
        {/* HEADER */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="title-row">
              <span className="panel-eyebrow">FIELD OPERATIONS INSPECTION AUDIT</span>
              <span className={`status-badge ${inspection.status === 'Completed' ? 'verified' : inspection.status === 'In Progress' ? 'scheduled' : 'under-review'}`}>
                {inspection.status}
              </span>
              {inspection.isFlagged && (
                <span className="status-badge awaiting-documents">
                  <Flag size={11} /> FLAGGED
                </span>
              )}
            </div>
            <h2>{inspection.id} — {inspection.applicant}</h2>
            <p className="subtext">
              Instrument: <strong>{inspection.instrument}</strong> ({inspection.instrumentId}) · Scheduled: <strong>{inspection.scheduledDate} ({inspection.scheduledTime})</strong>
            </p>
          </div>
          <button type="button" className="icon-button close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="admin-modal-body">
          <div className="modal-columns">
            {/* LEFT COLUMN: INSPECTION DETAILS & TEST READINGS */}
            <div className="modal-left-col">
              {/* INSPECTION INFO */}
              <div className="detail-card-panel">
                <h3><Wrench size={16} /> Inspection Assignment Details</h3>
                <div className="details-grid-2">
                  <div>
                    <label>Inspection ID</label>
                    <strong>{inspection.id}</strong>
                  </div>
                  <div>
                    <label>Inspection Type</label>
                    <span className="badge-pill-outline">{inspection.inspectionType}</span>
                  </div>
                  <div>
                    <label>Assigned LMO Officer</label>
                    <strong>{inspection.lmoOfficer}</strong>
                  </div>
                  <div>
                    <label>District Jurisdiction</label>
                    <span>{inspection.district}</span>
                  </div>
                  <div className="grid-full">
                    <label>Field Site Location</label>
                    <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{inspection.location}</span>
                  </div>
                </div>
              </div>

              {/* REPORT SUMMARY & TEST READINGS */}
              <div className="detail-card-panel">
                <h3><FileText size={16} /> Field Test Readings & Report Summary</h3>
                {inspection.reportSummary ? (
                  <>
                    <div className="details-grid-2" style={{ marginBottom: 14 }}>
                      <div>
                        <label>Officer Decision</label>
                        <strong className={inspection.reportSummary.decision === 'PASSED' ? 'text-green' : 'text-red'}>
                          {inspection.reportSummary.decision}
                        </strong>
                      </div>
                      <div>
                        <label>Lead Seal Verification</label>
                        <span>{inspection.reportSummary.sealVerified ? '✓ Intact & Verified' : '⚠️ Seal Broken / Damaged'}</span>
                      </div>
                      <div className="grid-full">
                        <label>Officer Inspection Observations</label>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#334155' }}>{inspection.reportSummary.notes}</p>
                      </div>
                    </div>

                    <label className="input-label">Recorded Standard Mass Test Readings</label>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Load Applied</th>
                          <th>Recorded Error</th>
                          <th>Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspection.reportSummary.readings.map((r, idx) => (
                          <tr key={idx}>
                            <td><strong>{r.loadKg.toLocaleString()} kg</strong></td>
                            <td>{r.errorKg > 0 ? `+${r.errorKg}` : r.errorKg} kg</td>
                            <td>
                              <span className={r.passed ? 'status-badge verified' : 'status-badge awaiting-documents'}>
                                {r.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="empty-subtext">Inspection report not yet submitted by field officer.</p>
                )}
              </div>

              {/* HISTORY */}
              <div className="detail-card-panel">
                <h3><Clock size={16} /> Field Activity Audit History</h3>
                <div className="timeline-list">
                  {inspection.history.map((h) => (
                    <div className="timeline-item" key={h.id}>
                      <div className="t-dot" />
                      <div className="t-content">
                        <strong>{h.action}</strong>
                        <small>By {h.by} · {h.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: STATE ADMIN MANAGEMENT CONTROLS */}
            <div className="modal-right-col">
              {/* ASSIGN / REASSIGN LMO */}
              <div className="admin-action-card">
                <h4><UserCheck size={16} /> Assign / Reassign LMO</h4>
                <p className="card-hint">Reallocate field inspection duty to another Legal Metrology Officer.</p>
                <div className="form-group">
                  <label htmlFor="lmoSelect">Assigned Officer</label>
                  <select
                    id="lmoSelect"
                    className="admin-select"
                    value={selectedLmo}
                    onChange={handleLmoChange}
                  >
                    <option value="">-- Select LMO --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.name}>
                        {off.name} ({off.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ADMINISTRATIVE ACTIONS */}
              <div className="admin-action-card">
                <h4><ShieldCheck size={16} /> State Admin Actions</h4>
                <div className="action-button-stack">
                  <button
                    type="button"
                    className="btn-admin-approve"
                    onClick={() => setShowReviewPrompt(true)}
                  >
                    <FileCheck2 size={16} /> Review & Endorse Report
                  </button>

                  <button
                    type="button"
                    className="btn-admin-inspect"
                    onClick={() => setShowReschedulePrompt(true)}
                  >
                    <Calendar size={16} /> Reschedule Inspection Visit
                  </button>

                  <button
                    type="button"
                    className="btn-admin-flag"
                    onClick={() => setShowFlagPrompt(true)}
                  >
                    <Flag size={16} /> Flag Inspection Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESCHEDULE PROMPT */}
      {showReschedulePrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>Reschedule Field Inspection Visit</h3>
              <button type="button" className="icon-button" onClick={() => setShowReschedulePrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Reschedule inspection for <strong>{inspection.id}</strong> ({inspection.applicant}).</p>
              <div className="form-group">
                <label className="input-label">New Inspection Date</label>
                <input
                  type="date"
                  className="admin-select"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="input-label">Time Slot</label>
                <input
                  type="text"
                  className="admin-select"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 12:00 PM"
                />
              </div>
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowReschedulePrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmReschedule}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW REPORT PROMPT */}
      {showReviewPrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>State Admin Report Review & Endorsement</h3>
              <button type="button" className="icon-button" onClick={() => setShowReviewPrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Review and endorse field inspection report for <strong>{inspection.id}</strong>.</p>
              <div className="form-group">
                <label className="input-label">Administrative Decision</label>
                <select
                  className="admin-select"
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as 'PASSED' | 'FAILED' | 'FLAGGED')}
                >
                  <option value="PASSED">Approve & Endorse Inspection (PASSED)</option>
                  <option value="FAILED">Reject Inspection Outcome (FAILED)</option>
                  <option value="FLAGGED">Flag Case for Enforcement Audit</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="input-label">Administrator Endorsement Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter administrative review comments..."
                  value={reviewNotesText}
                  onChange={(e) => setReviewNotesText(e.target.value)}
                />
              </div>
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowReviewPrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button btn-confirm-approve" onClick={handleConfirmReview}>
                Confirm Endorsement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLAG PROMPT */}
      {showFlagPrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>Flag Field Inspection Case</h3>
              <button type="button" className="icon-button" onClick={() => setShowFlagPrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Flagging inspection <strong>{inspection.id}</strong> will trigger administrative audit.</p>
              <label className="input-label">Reason for Flagging</label>
              <textarea
                rows={3}
                placeholder="Enter flag reason or procedural discrepancy..."
                value={flagReasonText}
                onChange={(e) => setFlagReasonText(e.target.value)}
              />
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowFlagPrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button btn-confirm-reject" onClick={handleConfirmFlag}>
                Confirm Flag Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
