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
  X,
} from 'lucide-react'
import type { AdminCertificate } from '../../features/admin/adminTypes'

interface CertificateDetailModalProps {
  certificate: AdminCertificate
  initialTab?: 'details' | 'history' | 'preview'
  onClose: () => void
  onVerifyCertificate: (id: string) => void
  onFlagCertificate: (id: string, reason: string) => void
  onViewInstrument: (instrumentId: string) => void
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  certificate,
  initialTab = 'details',
  onClose,
  onVerifyCertificate,
  onFlagCertificate,
  onViewInstrument,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'preview'>(initialTab)
  const [showFlagPrompt, setShowFlagPrompt] = useState(false)
  const [flagReasonText, setFlagReasonText] = useState(certificate.flagReason || '')

  const handleConfirmFlag = () => {
    if (!flagReasonText.trim()) return
    onFlagCertificate(certificate.id, flagReasonText.trim())
    setShowFlagPrompt(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-box">
        {/* MODAL HEADER */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="title-row">
              <span className="panel-eyebrow">CERTIFICATE & STAMPING RECORD</span>
              <span className={`status-badge ${certificate.status === 'Active' ? 'verified' : certificate.status === 'Expiring Soon' ? 'under-review' : 'awaiting-documents'}`}>
                {certificate.status}
              </span>
              {certificate.isVerified && (
                <span className="status-badge verified">
                  <CheckCircle2 size={11} /> VERIFIED
                </span>
              )}
            </div>
            <h2>{certificate.certNo}</h2>
            <p className="subtext">
              Instrument ID: <strong>{certificate.instrumentId}</strong> ({certificate.instrumentType}) · Applicant: <strong>{certificate.applicant}</strong>
            </p>
          </div>
          <button type="button" className="icon-button close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* MODAL TABS */}
        <div className="admin-modal-tabs">
          <button
            type="button"
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            <FileCheck2 size={15} /> Certificate & Verification Details
          </button>
          <button
            type="button"
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={15} /> Audit History ({certificate.history?.length || 0})
          </button>
          <button
            type="button"
            className={activeTab === 'preview' ? 'active' : ''}
            onClick={() => setActiveTab('preview')}
          >
            <Award size={15} /> Certificate Document Sheet
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="admin-modal-body">
          {activeTab === 'details' && (
            <div className="modal-columns">
              <div className="modal-left-col">
                {/* CERTIFICATE INFO */}
                <div className="detail-card-panel">
                  <h3><Award size={16} /> Stamping Certificate Summary</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Certificate No</label>
                      <strong>{certificate.certNo}</strong>
                    </div>
                    <div>
                      <label>Record ID</label>
                      <span>{certificate.id}</span>
                    </div>
                    <div>
                      <label>Issue Date</label>
                      <span>{certificate.issuedDate}</span>
                    </div>
                    <div>
                      <label>Expiry Date</label>
                      <strong className={certificate.status === 'Expiring Soon' ? 'text-amber' : certificate.status === 'Expired' ? 'text-red' : 'text-teal'}>
                        {certificate.expiryDate}
                      </strong>
                    </div>
                    <div>
                      <label>Issuing LMO Officer</label>
                      <span>{certificate.issuedBy}</span>
                    </div>
                    <div>
                      <label>Lead Seal Number</label>
                      <span>{certificate.sealNo || 'LM-SEAL-2024'}</span>
                    </div>
                  </div>
                </div>

                {/* INSTRUMENT & APPLICANT */}
                <div className="detail-card-panel">
                  <h3><Gauge size={16} /> Associated Instrument & Owner</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Instrument ID</label>
                      <strong>{certificate.instrumentId}</strong>
                    </div>
                    <div>
                      <label>Instrument Type</label>
                      <span>{certificate.instrumentType}</span>
                    </div>
                    <div>
                      <label>Accuracy Class</label>
                      <span>{certificate.accuracyClass || 'Class III Medium'}</span>
                    </div>
                    <div>
                      <label>District Jurisdiction</label>
                      <span>{certificate.district}</span>
                    </div>
                    <div className="grid-full">
                      <label>Applicant / Business</label>
                      <strong>{certificate.applicant}</strong>
                    </div>
                    <div className="grid-full">
                      <label>Premises Location</label>
                      <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{certificate.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ADMINISTRATIVE ACTION PANEL */}
              <div className="modal-right-col">
                <div className="admin-action-card">
                  <h4><ShieldCheck size={16} /> State Admin Action Panel</h4>
                  <p className="card-hint">Administrative tools to verify authenticity, flag discrepancies, or navigate to instrument record.</p>

                  <div className="action-button-stack">
                    <button
                      type="button"
                      className="btn-admin-approve"
                      onClick={() => onVerifyCertificate(certificate.id)}
                    >
                      <CheckCircle2 size={16} /> {certificate.isVerified ? 'Re-Verify Certificate' : 'Verify Certificate Authenticity'}
                    </button>

                    <button
                      type="button"
                      className="btn-admin-flag"
                      onClick={() => setShowFlagPrompt(true)}
                    >
                      <Flag size={16} /> Flag Certificate / Discrepancy
                    </button>

                    <button
                      type="button"
                      className="btn-admin-inspect"
                      onClick={() => onViewInstrument(certificate.instrumentId)}
                    >
                      <Gauge size={16} /> View Instrument Record →
                    </button>

                    <button
                      type="button"
                      className="btn-admin-cert"
                      onClick={() => setActiveTab('history')}
                    >
                      <Clock size={16} /> View Audit History Log
                    </button>
                  </div>
                </div>

                {certificate.isFlagged && (
                  <div className="admin-action-card card-alert-highlight">
                    <h4><AlertTriangle size={16} /> Certificate Alert</h4>
                    <div className="alert-item red">
                      <strong>Flagged Discrepancy:</strong> {certificate.flagReason || 'Flagged by State Administrator'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab-content">
              <h3>Certificate Audit & Issuance Log</h3>
              <table className="admin-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action Taken</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {certificate.history && certificate.history.length > 0 ? (
                    certificate.history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.date}</td>
                        <td><strong>{h.action}</strong></td>
                        <td>{h.by}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="text-center p-4">No audit history recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'preview' && (
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
                    <span>CERTIFICATE NO: <strong>{certificate.certNo}</strong></span>
                    <span>ISSUED DATE: <strong>{certificate.issuedDate}</strong></span>
                  </div>

                  <p className="cert-legal-text">
                    Verified and stamped in full compliance with Legal Metrology General Rules for instrument ID{' '}
                    <strong>{certificate.instrumentId}</strong> owned by <strong>{certificate.applicant}</strong>.
                  </p>

                  <div className="cert-footer">
                    <div className="cert-seal">
                      <ShieldCheck size={28} />
                      <small>VERIFIED STAMP</small>
                    </div>
                    <div className="cert-signature">
                      <p className="sign-line">Issuing Officer Signature</p>
                      <strong>{certificate.issuedBy}</strong>
                      <small>Legal Metrology Officer · {certificate.district}</small>
                    </div>
                  </div>
                </div>

                <div className="cert-actions-bar">
                  <button type="button" className="primary-button" onClick={() => alert('Certificate PDF downloaded!')}>
                    <Download size={15} /> Download PDF Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLAG PROMPT */}
      {showFlagPrompt && (
        <div className="nested-modal-backdrop">
          <div className="nested-modal-box">
            <div className="nested-header">
              <h3>Flag Certificate Discrepancy</h3>
              <button type="button" className="icon-button" onClick={() => setShowFlagPrompt(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="nested-body">
              <p>Flagging certificate <strong>{certificate.certNo}</strong> will mark it under review across state registers.</p>
              <label className="input-label">Discrepancy Details / Flag Reason</label>
              <textarea
                rows={3}
                placeholder="Enter discrepancy reason or complaint notes..."
                value={flagReasonText}
                onChange={(e) => setFlagReasonText(e.target.value)}
              />
            </div>
            <div className="nested-footer">
              <button type="button" className="secondary-button" onClick={() => setShowFlagPrompt(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button btn-confirm-reject" onClick={handleConfirmFlag}>
                Confirm Flag Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
