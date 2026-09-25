import React, { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  MapPin,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react'
import type { AdminApplication, AdminApplicationStatus, AdminOfficer } from '../../features/admin/adminTypes'

interface ApplicationDetailModalProps {
  application: AdminApplication
  officers: AdminOfficer[]
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: AdminApplicationStatus, remarksText?: string) => void
  onAssignOfficer: (id: string, officerName: string) => void
  onAddRemark: (id: string, remarkText: string) => void
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  officers,
  onClose,
  onUpdateStatus,
  onAssignOfficer,
  onAddRemark,
}) => {
  const [selectedOfficer, setSelectedOfficer] = useState(application.assignedOfficer || '')
  const [newRemark, setNewRemark] = useState('')
  const [confirmationAction, setConfirmationAction] = useState<'Approved' | 'Rejected' | 'Returned for Correction' | null>(null)
  const [confirmationRemark, setConfirmationRemark] = useState('')

  const handleOfficerAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedOfficer(val)
    if (val) {
      onAssignOfficer(application.id, val)
    }
  }

  const handleAddRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRemark.trim()) return
    onAddRemark(application.id, newRemark.trim())
    setNewRemark('')
  }

  const handleConfirmAction = () => {
    if (!confirmationAction) return
    onUpdateStatus(application.id, confirmationAction, confirmationRemark)
    setConfirmationAction(null)
    setConfirmationRemark('')
  }

  const getStatusBadgeClass = (status: AdminApplicationStatus) => {
    switch (status) {
      case 'Approved':
      case 'Verified':
        return 'status-badge verified'
      case 'Rejected':
        return 'status-badge awaiting-documents'
      case 'Returned for Correction':
        return 'status-badge under-review'
      case 'Assigned':
      case 'Scheduled':
        return 'status-badge scheduled'
      default:
        return 'status-badge under-review'
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-box">
        {/* MODAL HEADER */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="title-row">
              <span className="panel-eyebrow">APPLICATION MANAGEMENT</span>
              <span className={getStatusBadgeClass(application.status)}>{application.status}</span>
            </div>
            <h2>{application.id} — {application.applicant}</h2>
            <p className="subtext">
              <Gauge size={14} style={{ display: 'inline', marginRight: 4 }} />
              {application.instrument} ({application.instrumentId}) · Submitted {application.submitted}
            </p>
          </div>
          <button type="button" className="icon-button close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="admin-modal-body">
          <div className="modal-columns">
            {/* LEFT COLUMN: APPLICATION DATA */}
            <div className="modal-left-col">
              {/* SECTION: APPLICANT DETAILS */}
              <div className="detail-card-panel">
                <h3><Building2 size={16} /> Applicant & Premises Details</h3>
                <div className="details-grid-2">
                  <div>
                    <label>Business Name</label>
                    <strong>{application.applicant}</strong>
                  </div>
                  <div>
                    <label>GSTIN</label>
                    <span>{application.applicantGstin || '07AAACM4821K1Z5'}</span>
                  </div>
                  <div>
                    <label>Contact Phone</label>
                    <span>{application.applicantPhone || '+91 99100 11223'}</span>
                  </div>
                  <div>
                    <label>Contact Email</label>
                    <span>{application.applicantEmail || 'contact@business.in'}</span>
                  </div>
                  <div className="grid-full">
                    <label>Premises Address</label>
                    <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{application.applicantAddress || application.location}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: INSTRUMENT DATA */}
              <div className="detail-card-panel">
                <h3><Gauge size={16} /> Instrument Specifications</h3>
                <div className="details-grid-2">
                  <div>
                    <label>Instrument ID</label>
                    <strong>{application.instrumentId}</strong>
                  </div>
                  <div>
                    <label>Category / Type</label>
                    <span>{application.instrument}</span>
                  </div>
                  <div>
                    <label>Application Type</label>
                    <span className="badge-pill-outline">{application.type}</span>
                  </div>
                  <div>
                    <label>District / Jurisdiction</label>
                    <span>{application.district}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: SUBMITTED DOCUMENTS */}
              <div className="detail-card-panel">
                <h3><FileText size={16} /> Submitted Documentation</h3>
                <div className="doc-list">
                  {application.documents && application.documents.length > 0 ? (
                    application.documents.map((doc) => (
                      <div className="doc-item" key={doc.id}>
                        <div className="doc-icon"><FileCheck2 size={18} /></div>
                        <div className="doc-meta">
                          <strong>{doc.name}</strong>
                          <small>{doc.type} · {doc.size} · Uploaded {doc.uploadedDate}</small>
                        </div>
                        <button type="button" className="btn-small-link" onClick={() => alert(`Opening ${doc.name}`)}>
                          <Download size={14} /> View
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-subtext">No documents attached.</p>
                  )}
                </div>
              </div>

              {/* SECTION: TIMELINE */}
              <div className="detail-card-panel">
                <h3><Clock size={16} /> Workflow Timeline</h3>
                <div className="timeline-list">
                  {application.history.map((hist) => (
                    <div className="timeline-item" key={hist.id}>
                      <div className="t-dot" />
                      <div className="t-content">
                        <strong>{hist.action}</strong>
                        <small>By {hist.by} · {hist.date}</small>
                        {hist.notes && <p className="t-notes">{hist.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ADMINISTRATIVE ACTION PANEL */}
            <div className="modal-right-col">
              {/* ASSIGN OFFICER CARD */}
              <div className="admin-action-card">
                <h4><UserCheck size={16} /> Assign / Reassign LMO</h4>
                <p className="card-hint">Select a Legal Metrology Officer to conduct field inspection or document verification.</p>
                <div className="form-group">
                  <label htmlFor="officerSelect">Assigned Officer</label>
                  <select
                    id="officerSelect"
                    className="admin-select"
                    value={selectedOfficer}
                    onChange={handleOfficerAssignChange}
                  >
                    <option value="">-- Unassigned --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.name}>
                        {off.name} ({off.district})
                      </option>
                    ))}
                  </select>
                </div>
                {application.assignedOfficer ? (
                  <div className="officer-assigned-tag">
                    <CheckCircle2 size={14} /> Currently assigned to <strong>{application.assignedOfficer}</strong>
                  </div>
                ) : (
                  <div className="officer-unassigned-tag">
                    <AlertCircle size={14} /> Unassigned application
                  </div>
                )}
              </div>

              {/* DECISION ACTIONS CARD */}
              <div className="admin-action-card">
                <h4><ShieldCheck size={16} /> Decision Actions</h4>
                <p className="card-hint">State Administrator can approve, reject, or request correction for this application.</p>

                <div className="action-button-stack">
                  <button
                    type="button"
                    className="btn-admin-approve"
                    disabled={application.status === 'Approved'}
                    onClick={() => setConfirmationAction('Approved')}
                  >
                    <CheckCircle2 size={16} /> Approve Application
                  </button>

                  <button
                    type="button"
                    className="btn-admin-return"
                    disabled={application.status === 'Returned for Correction'}
                    onClick={() => setConfirmationAction('Returned for Correction')}
                  >
                    <AlertTriangle size={16} /> Send Back for Correction
                  </button>

                  <button
                    type="button"
                    className="btn-admin-reject"
                    disabled={application.status === 'Rejected'}
                    onClick={() => setConfirmationAction('Rejected')}
                  >
                    <X size={16} /> Reject Application
                  </button>
                </div>
              </div>

              {/* REMARKS LOG & ADD REMARK */}
              <div className="admin-action-card">
                <h4><MessageSquare size={16} /> Remarks & Case Notes</h4>
                <div className="remarks-scroll">
                  {application.remarks && application.remarks.length > 0 ? (
                    application.remarks.map((rem) => (
                      <div className="remark-bubble" key={rem.id}>
                        <div className="rem-head">
                          <strong>{rem.author}</strong>
                          <small>{rem.date}</small>
                        </div>
                        <p>{rem.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-subtext">No remarks recorded yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddRemarkSubmit} className="add-remark-form">
                  <textarea
                    rows={2}
                    placeholder="Add an administrative remark or case note..."
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                  />
                  <button type="submit" className="btn-secondary-sm" disabled={!newRemark.trim()}>
                    + Add Remark
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL OVERLAY */}
      {confirmationAction && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>
                {confirmationAction === 'Approved' && 'Confirm Application Approval'}
                {confirmationAction === 'Rejected' && 'Confirm Application Rejection'}
                {confirmationAction === 'Returned for Correction' && 'Confirm Return for Correction'}
              </h3>
              <button type="button" className="icon-button" onClick={() => setConfirmationAction(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>
                Are you sure you want to mark application <strong>{application.id}</strong> as{' '}
                <span className="highlight-action">{confirmationAction}</span>?
              </p>

              <label className="input-label">Administrator Remarks / Justification</label>
              <textarea
                rows={3}
                placeholder="Enter justification or reason for this decision..."
                value={confirmationRemark}
                onChange={(e) => setConfirmationRemark(e.target.value)}
              />
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setConfirmationAction(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={
                  confirmationAction === 'Approved'
                    ? 'primary-button btn-confirm-approve'
                    : confirmationAction === 'Rejected'
                    ? 'primary-button btn-confirm-reject'
                    : 'primary-button btn-confirm-return'
                }
                onClick={handleConfirmAction}
              >
                Confirm {confirmationAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
