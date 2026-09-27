import React, { useState } from 'react'
import {
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  Flag,
  Gauge,
  MapPin,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react'
import type { AdminInstrument, AdminOfficer } from '../../features/admin/adminTypes'

interface InstrumentDetailModalProps {
  instrument: AdminInstrument
  officers: AdminOfficer[]
  initialTab?: 'details' | 'history' | 'certificate'
  onClose: () => void
  onAssignLmo: (id: string, lmoName: string) => void
  onMarkInspection: (id: string, notes?: string) => void
  onFlagInstrument: (id: string, reason: string) => void
}

export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  instrument,
  officers,
  initialTab = 'details',
  onClose,
  onAssignLmo,
  onMarkInspection,
  onFlagInstrument,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'certificate'>(initialTab)
  const [selectedLmo, setSelectedLmo] = useState(instrument.assignedLmo || '')
  const [showFlagPrompt, setShowFlagPrompt] = useState(false)
  const [flagReasonText, setFlagReasonText] = useState(instrument.flagReason || '')
  const [showInspectionPrompt, setShowInspectionPrompt] = useState(false)
  const [inspectionNotesText, setInspectionNotesText] = useState(instrument.inspectionNotes || '')

  const handleLmoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedLmo(val)
    if (val) {
      onAssignLmo(instrument.id, val)
    }
  }

  const handleConfirmFlag = () => {
    if (!flagReasonText.trim()) return
    onFlagInstrument(instrument.id, flagReasonText.trim())
    setShowFlagPrompt(false)
  }

  const handleConfirmInspection = () => {
    onMarkInspection(instrument.id, inspectionNotesText.trim())
    setShowInspectionPrompt(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-box">
        {/* MODAL HEADER */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="title-row">
              <span className="panel-eyebrow">INSTRUMENT REGISTRY & COMPLIANCE</span>
              <span className={`status-badge ${instrument.status.toLowerCase().replaceAll(' ', '-')}`}>
                {instrument.status}
              </span>
              {instrument.isFlagged && (
                <span className="status-badge awaiting-documents">
                  <Flag size={11} /> FLAGGED
                </span>
              )}
            </div>
            <h2>{instrument.id} — {instrument.type}</h2>
            <p className="subtext">
              Owner: <strong>{instrument.owner}</strong> · Serial {instrument.serialNumber} · District {instrument.district}
            </p>
          </div>
          <button type="button" className="icon-button close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div className="admin-modal-tabs">
          <button
            type="button"
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            <Gauge size={15} /> Specifications & Owner
          </button>
          <button
            type="button"
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={15} /> Verification History ({instrument.verificationHistory?.length || 0})
          </button>
          <button
            type="button"
            className={activeTab === 'certificate' ? 'active' : ''}
            onClick={() => setActiveTab('certificate')}
          >
            <FileCheck2 size={15} /> Stamping Certificate
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="admin-modal-body">
          {activeTab === 'details' && (
            <div className="modal-columns">
              <div className="modal-left-col">
                {/* SPECIFICATIONS */}
                <div className="detail-card-panel">
                  <h3><Wrench size={16} /> Technical Specifications</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Instrument ID</label>
                      <strong>{instrument.id}</strong>
                    </div>
                    <div>
                      <label>Category / Type</label>
                      <span>{instrument.type}</span>
                    </div>
                    <div>
                      <label>Manufacturer</label>
                      <span>{instrument.manufacturer}</span>
                    </div>
                    <div>
                      <label>Model Number</label>
                      <span>{instrument.model}</span>
                    </div>
                    <div>
                      <label>Serial Number</label>
                      <span>{instrument.serialNumber}</span>
                    </div>
                    <div>
                      <label>Accuracy Class</label>
                      <span>{instrument.accuracyClass || 'Class III Medium'}</span>
                    </div>
                    <div>
                      <label>Capacity / Range</label>
                      <span>{instrument.capacity || 'Standard Range'}</span>
                    </div>
                    <div>
                      <label>District Jurisdiction</label>
                      <span>{instrument.district}</span>
                    </div>
                  </div>
                </div>

                {/* OWNER DETAILS */}
                <div className="detail-card-panel">
                  <h3><Building2 size={16} /> Owner & Premises Information</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Owner / Business</label>
                      <strong>{instrument.owner}</strong>
                    </div>
                    <div>
                      <label>GSTIN Number</label>
                      <span>{instrument.ownerGstin || '07AAACM4821K1Z5'}</span>
                    </div>
                    <div>
                      <label>Contact Phone</label>
                      <span>{instrument.ownerContact || '+91 99100 11223'}</span>
                    </div>
                    <div>
                      <label>Contact Email</label>
                      <span>{instrument.ownerEmail || 'contact@business.in'}</span>
                    </div>
                    <div className="grid-full">
                      <label>Installation Location</label>
                      <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{instrument.location}</span>
                    </div>
                  </div>
                </div>

                {/* VERIFICATION & STAMPING SUMMARY */}
                <div className="detail-card-panel">
                  <h3><Award size={16} /> Stamping & Verification Status</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Current Status</label>
                      <span className={`status-badge ${instrument.status.toLowerCase().replaceAll(' ', '-')}`}>
                        {instrument.status}
                      </span>
                    </div>
                    <div>
                      <label>Certificate Number</label>
                      <strong>{instrument.certificateNo || 'LM-CERT-2024-PENDING'}</strong>
                    </div>
                    <div>
                      <label>Last Verification Date</label>
                      <span>{instrument.lastVerification}</span>
                    </div>
                    <div>
                      <label>Next Due Date</label>
                      <strong className="text-teal">{instrument.nextDue}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN ACTIONS */}
              <div className="modal-right-col">
                {/* ASSIGN LMO */}
                <div className="admin-action-card">
                  <h4><UserCheck size={16} /> Assign / Reassign LMO</h4>
                  <p className="card-hint">Assign a Legal Metrology Officer responsible for this instrument unit.</p>
                  <div className="form-group">
                    <label htmlFor="lmoSelect">Assigned Officer</label>
                    <select
                      id="lmoSelect"
                      className="admin-select"
                      value={selectedLmo}
                      onChange={handleLmoChange}
                    >
                      <option value="">-- Unassigned --</option>
                      {officers.map((off) => (
                        <option key={off.id} value={off.name}>
                          {off.name} ({off.district})
                        </option>
                      ))}
                    </select>
                  </div>
                  {instrument.assignedLmo && (
                    <div className="officer-assigned-tag">
                      <CheckCircle2 size={14} /> Assigned to <strong>{instrument.assignedLmo}</strong>
                    </div>
                  )}
                </div>

                {/* ADMINISTRATIVE ACTIONS */}
                <div className="admin-action-card">
                  <h4><ShieldAlert size={16} /> Administrative Actions</h4>

                  <div className="action-button-stack">
                    <button
                      type="button"
                      className="btn-admin-inspect"
                      onClick={() => setShowInspectionPrompt(true)}
                    >
                      <SearchIcon size={16} /> Mark for Field Inspection
                    </button>

                    <button
                      type="button"
                      className="btn-admin-flag"
                      onClick={() => setShowFlagPrompt(true)}
                    >
                      <Flag size={16} /> Flag Instrument / Seal Issue
                    </button>

                    <button
                      type="button"
                      className="btn-admin-cert"
                      onClick={() => setActiveTab('certificate')}
                    >
                      <FileCheck2 size={16} /> View Stamping Certificate
                    </button>
                  </div>
                </div>

                {/* CURRENT FLAGS & INSPECTION MARKS */}
                {(instrument.isFlagged || instrument.markedForInspection) && (
                  <div className="admin-action-card card-alert-highlight">
                    <h4><AlertTriangle size={16} /> Active Alerts</h4>
                    {instrument.isFlagged && (
                      <div className="alert-item red">
                        <strong>Flagged Unit:</strong> {instrument.flagReason || 'Flagged by State Administrator'}
                      </div>
                    )}
                    {instrument.markedForInspection && (
                      <div className="alert-item amber">
                        <strong>Marked for Inspection:</strong> {instrument.inspectionNotes || 'Marked for priority field audit'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab-content">
              <h3>Verification & Stamping Record History</h3>
              <p className="subtext">Historical record of all verification cycles, certificate issues, and officer approvals for {instrument.id}.</p>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Certificate No</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Outcome</th>
                    <th>Verified By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {instrument.verificationHistory && instrument.verificationHistory.length > 0 ? (
                    instrument.verificationHistory.map((vh) => (
                      <tr key={vh.id}>
                        <td><strong>{vh.certNo}</strong></td>
                        <td>{vh.issuedDate}</td>
                        <td>{vh.expiryDate}</td>
                        <td>
                          <span className={vh.outcome === 'Passed' ? 'status-badge verified' : 'status-badge awaiting-documents'}>
                            {vh.outcome}
                          </span>
                        </td>
                        <td>{vh.lmo}</td>
                        <td>{vh.remarks || 'Routine periodic verification passed'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4">No prior verification history recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="certificate-preview-box">
              <div className="cert-sheet">
                <div className="cert-header">
                  <div className="gov-emblem"><ShieldCheck size={32} /></div>
                  <div>
                    <span className="cert-eyebrow">GOVERNMENT OF NATIONAL CAPITAL TERRITORY OF DELHI</span>
                    <h2>DEPARTMENT OF LEGAL METROLOGY</h2>
                    <p>Certificate of Verification & Stamping (Under Section 24 of Legal Metrology Act, 2009)</p>
                  </div>
                  <div className="cert-qr"><QrCode size={48} /></div>
                </div>

                <div className="cert-body">
                  <div className="cert-no-row">
                    <span>CERTIFICATE NUMBER: <strong>{instrument.certificateNo || 'LM-CERT-2024-9982'}</strong></span>
                    <span>DATE OF ISSUE: <strong>{instrument.lastVerification}</strong></span>
                  </div>

                  <p className="cert-legal-text">
                    This is to certify that the weighing and measuring instrument described below belonging to{' '}
                    <strong>{instrument.owner}</strong> has been verified and stamped in accordance with the Legal Metrology General Rules.
                  </p>

                  <div className="cert-table-wrap">
                    <table className="cert-details-table">
                      <tbody>
                        <tr>
                          <td><strong>Instrument ID:</strong> {instrument.id}</td>
                          <td><strong>Category:</strong> {instrument.type}</td>
                        </tr>
                        <tr>
                          <td><strong>Manufacturer & Model:</strong> {instrument.manufacturer} ({instrument.model})</td>
                          <td><strong>Serial Number:</strong> {instrument.serialNumber}</td>
                        </tr>
                        <tr>
                          <td><strong>Capacity / Range:</strong> {instrument.capacity || 'Standard'}</td>
                          <td><strong>Accuracy Class:</strong> {instrument.accuracyClass || 'Class III'}</td>
                        </tr>
                        <tr>
                          <td><strong>Installation Location:</strong> {instrument.location}</td>
                          <td><strong>Valid Until:</strong> <strong className="text-teal">{instrument.nextDue}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="cert-footer">
                    <div className="cert-seal">
                      <ShieldCheck size={28} />
                      <small>LEGAL METROLOGY STAMP</small>
                    </div>
                    <div className="cert-signature">
                      <p className="sign-line">Signed digitally by</p>
                      <strong>{instrument.assignedLmo || 'Legal Metrology Officer'}</strong>
                      <small>Authorized Verification Officer · Delhi State</small>
                    </div>
                  </div>
                </div>

                <div className="cert-actions-bar">
                  <button type="button" className="primary-button" onClick={() => alert('Certificate downloaded as PDF!')}>
                    <Download size={15} /> Download PDF Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLAG PROMPT MODAL */}
      {showFlagPrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>Flag Instrument for Enforcement / Audit</h3>
              <button type="button" className="icon-button" onClick={() => setShowFlagPrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Flagging instrument <strong>{instrument.id}</strong> will alert field LMOs and prevent certificate issuance until cleared.</p>
              <label className="input-label">Reason for Flagging / Complaint Details</label>
              <textarea
                rows={3}
                placeholder="e.g. Consumer complaint, seal tampering detected, inaccurate measurements..."
                value={flagReasonText}
                onChange={(e) => setFlagReasonText(e.target.value)}
              />
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowFlagPrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button btn-confirm-reject" onClick={handleConfirmFlag}>
                Confirm Flag Instrument
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION PROMPT MODAL */}
      {showInspectionPrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>Mark Instrument for Field Inspection</h3>
              <button type="button" className="icon-button" onClick={() => setShowInspectionPrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Mark instrument <strong>{instrument.id}</strong> for an immediate field visit by assigned officer {instrument.assignedLmo || 'LMO'}.</p>
              <label className="input-label">Inspection Priority / Administrative Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Priority routine audit, surprise verification visit..."
                value={inspectionNotesText}
                onChange={(e) => setInspectionNotesText(e.target.value)}
              />
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowInspectionPrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmInspection}>
                Confirm Mark for Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIcon({ size }: { size: number }) {
  return <Wrench size={size} />
}
