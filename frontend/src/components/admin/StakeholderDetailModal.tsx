import React from 'react'
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  Gauge,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import type {
  AdminApplicantStakeholder,
  AdminGatcOfficerStakeholder,
  AdminLmoOfficerStakeholder,
} from '../../features/admin/adminTypes'

interface StakeholderDetailModalProps {
  type: 'applicant' | 'lmo' | 'gatc'
  applicant?: AdminApplicantStakeholder
  lmo?: AdminLmoOfficerStakeholder
  gatc?: AdminGatcOfficerStakeholder
  onClose: () => void
  onNavigateToApplications?: (applicantName: string) => void
  onNavigateToInstruments?: (applicantName: string) => void
}

export const StakeholderDetailModal: React.FC<StakeholderDetailModalProps> = ({
  type,
  applicant,
  lmo,
  gatc,
  onClose,
  onNavigateToApplications,
  onNavigateToInstruments,
}) => {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-box">
        {/* HEADER */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="title-row">
              <span className="panel-eyebrow">
                {type === 'applicant' ? 'APPLICANT & BUSINESS PROFILE' : type === 'lmo' ? 'OFFICER PROFILE & ACTIVITY' : 'GATC TESTING CENTRE PROFILE'}
              </span>
              <span className="status-badge verified">
                {type === 'applicant' ? applicant?.status : type === 'lmo' ? lmo?.status : gatc?.status}
              </span>
            </div>
            <h2>
              {type === 'applicant' ? applicant?.name : type === 'lmo' ? lmo?.name : gatc?.name}
            </h2>
            <p className="subtext">
              {type === 'applicant' ? `GSTIN: ${applicant?.gstin} · District ${applicant?.district}` : type === 'lmo' ? `Officer ID: ${lmo?.employeeId} · District ${lmo?.district}` : `Centre: ${gatc?.gatcName}`}
            </p>
          </div>
          <button type="button" className="icon-button close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="admin-modal-body">
          {type === 'applicant' && applicant && (
            <div className="modal-columns">
              <div className="modal-left-col">
                <div className="detail-card-panel">
                  <h3><Building2 size={16} /> Organization Profile</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Business Name</label>
                      <strong>{applicant.name}</strong>
                    </div>
                    <div>
                      <label>Organization Category</label>
                      <span>{applicant.organization}</span>
                    </div>
                    <div>
                      <label>GSTIN Number</label>
                      <span>{applicant.gstin}</span>
                    </div>
                    <div>
                      <label>Contact Person</label>
                      <span>{applicant.contactPerson}</span>
                    </div>
                    <div>
                      <label>Email Address</label>
                      <span>{applicant.email}</span>
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <span>{applicant.phone}</span>
                    </div>
                    <div className="grid-full">
                      <label>Premises Address</label>
                      <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{applicant.location}, {applicant.district}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-card-panel">
                  <h3><Gauge size={16} /> Portfolio Metrics</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Total Applications Submitted</label>
                      <strong className="text-teal">{applicant.totalApplications} Requests</strong>
                    </div>
                    <div>
                      <label>Registered Fleet Instruments</label>
                      <strong className="text-blue">{applicant.totalInstruments} Units</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-right-col">
                <div className="admin-action-card">
                  <h4><ShieldCheck size={16} /> Quick Actions</h4>
                  <div className="action-button-stack">
                    <button
                      type="button"
                      className="btn-admin-approve"
                      onClick={() => onNavigateToApplications?.(applicant.name)}
                    >
                      <FileCheck2 size={16} /> View All Applications ({applicant.totalApplications})
                    </button>
                    <button
                      type="button"
                      className="btn-admin-inspect"
                      onClick={() => onNavigateToInstruments?.(applicant.name)}
                    >
                      <Gauge size={16} /> View Registered Fleet ({applicant.totalInstruments})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'lmo' && lmo && (
            <div className="modal-columns">
              <div className="modal-left-col">
                <div className="detail-card-panel">
                  <h3><UserCheck size={16} /> Officer Profile</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Officer Name</label>
                      <strong>{lmo.name}</strong>
                    </div>
                    <div>
                      <label>Employee ID</label>
                      <span>{lmo.employeeId}</span>
                    </div>
                    <div>
                      <label>Email Address</label>
                      <span>{lmo.email}</span>
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <span>{lmo.phone}</span>
                    </div>
                    <div className="grid-full">
                      <label>Assigned Zone / Office</label>
                      <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{lmo.location}, {lmo.district}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-card-panel">
                  <h3><CheckCircle2 size={16} /> Performance & Workload</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Current Active Cases</label>
                      <strong className="text-amber">{lmo.currentAssignments} Assigned</strong>
                    </div>
                    <div>
                      <label>Completed Inspections</label>
                      <strong className="text-green">{lmo.completedInspections} Audits</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-right-col">
                <div className="admin-action-card">
                  <h4><ShieldCheck size={16} /> Management Actions</h4>
                  <div className="action-button-stack">
                    <button type="button" className="btn-admin-approve" onClick={() => alert(`Showing active assignments for ${lmo.name}`)}>
                      <FileCheck2 size={16} /> View Current Assignments
                    </button>
                    <button type="button" className="btn-admin-cert" onClick={() => alert(`Showing activity log for ${lmo.name}`)}>
                      <Calendar size={16} /> View Inspection Activity Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'gatc' && gatc && (
            <div className="modal-columns">
              <div className="modal-left-col">
                <div className="detail-card-panel">
                  <h3><FlaskConical size={16} /> GATC Centre Profile</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Officer Name</label>
                      <strong>{gatc.name}</strong>
                    </div>
                    <div>
                      <label>GATC Centre Name</label>
                      <span>{gatc.gatcName}</span>
                    </div>
                    <div>
                      <label>Officer ID</label>
                      <span>{gatc.employeeId}</span>
                    </div>
                    <div>
                      <label>Contact Phone</label>
                      <span>{gatc.phone}</span>
                    </div>
                    <div className="grid-full">
                      <label>Laboratory Location</label>
                      <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{gatc.location}, {gatc.district}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-card-panel">
                  <h3><CheckCircle2 size={16} /> Testing Activity Summary</h3>
                  <div className="details-grid-2">
                    <div>
                      <label>Active Test Requests</label>
                      <strong className="text-blue">{gatc.assignedWork} Testing Cases</strong>
                    </div>
                    <div>
                      <label>Completed Lab Tests</label>
                      <strong className="text-green">{gatc.completedTests} Certificates</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-right-col">
                <div className="admin-action-card">
                  <h4><ShieldCheck size={16} /> Management Actions</h4>
                  <div className="action-button-stack">
                    <button type="button" className="btn-admin-approve" onClick={() => alert(`Showing active lab testing work for ${gatc.name}`)}>
                      <FileCheck2 size={16} /> View Allocated Testing Cases
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
