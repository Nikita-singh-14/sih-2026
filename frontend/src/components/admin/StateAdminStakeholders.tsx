import React, { useState } from 'react'
import {
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileCheck2,
  FlaskConical,
  Gauge,
  MapPin,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import type {
  AdminApplicantStakeholder,
  AdminGatcOfficerStakeholder,
  AdminLmoOfficerStakeholder,
} from '../../features/admin/adminTypes'
import { StakeholderDetailModal } from './StakeholderDetailModal'

interface StateAdminStakeholdersProps {
  applicants: AdminApplicantStakeholder[]
  lmoOfficers: AdminLmoOfficerStakeholder[]
  gatcOfficers: AdminGatcOfficerStakeholder[]
  onNavigateToApplications: (applicantName: string) => void
  onNavigateToInstruments: (applicantName: string) => void
}

export const StateAdminStakeholders: React.FC<StateAdminStakeholdersProps> = ({
  applicants,
  lmoOfficers,
  gatcOfficers,
  onNavigateToApplications,
  onNavigateToInstruments,
}) => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'lmo' | 'gatc'>('applicants')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStakeholder, setSelectedStakeholder] = useState<{
    type: 'applicant' | 'lmo' | 'gatc'
    applicant?: AdminApplicantStakeholder
    lmo?: AdminLmoOfficerStakeholder
    gatc?: AdminGatcOfficerStakeholder
  } | null>(null)

  const filteredApplicants = applicants.filter((a) => {
    const q = searchTerm.trim().toLowerCase()
    return !q || [a.name, a.organization, a.gstin, a.contactPerson, a.location].some((v) => v.toLowerCase().includes(q))
  })

  const filteredLmos = lmoOfficers.filter((l) => {
    const q = searchTerm.trim().toLowerCase()
    return !q || [l.name, l.employeeId, l.district, l.location].some((v) => v.toLowerCase().includes(q))
  })

  const filteredGatcs = gatcOfficers.filter((g) => {
    const q = searchTerm.trim().toLowerCase()
    return !q || [g.name, g.gatcName, g.employeeId, g.district].some((v) => v.toLowerCase().includes(q))
  })

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO TITLE */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE STAKEHOLDER DIRECTORY</span>
          <h2>Legal Metrology Network Stakeholders</h2>
          <p>Monitor profiles, active workloads, assignments, and compliance records across businesses, LMO officers, and GATC labs.</p>
        </div>
      </div>

      {/* STAKEHOLDER TABS */}
      <div className="admin-modal-tabs" style={{ background: 'white', borderRadius: 8, padding: '6px 16px', border: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className={activeTab === 'applicants' ? 'active' : ''}
          onClick={() => { setActiveTab('applicants'); setSearchTerm('') }}
        >
          <Building2 size={16} /> Applicants & Businesses ({applicants.length})
        </button>
        <button
          type="button"
          className={activeTab === 'lmo' ? 'active' : ''}
          onClick={() => { setActiveTab('lmo'); setSearchTerm('') }}
        >
          <UserCheck size={16} /> LMO Field Officers ({lmoOfficers.length})
        </button>
        <button
          type="button"
          className={activeTab === 'gatc' ? 'active' : ''}
          onClick={() => { setActiveTab('gatc'); setSearchTerm('') }}
        >
          <FlaskConical size={16} /> GATC Testing Officers ({gatcOfficers.length})
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">DIRECTORY REGISTER</span>
            <h2>
              {activeTab === 'applicants' && `Registered Applicants & Businesses (${filteredApplicants.length})`}
              {activeTab === 'lmo' && `Legal Metrology Field Officers (${filteredLmos.length})`}
              {activeTab === 'gatc' && `GATC Testing Laboratory Officers (${filteredGatcs.length})`}
            </h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, ID, Organization, District..."
            />
          </div>
        </div>

        {/* TAB 1: APPLICANTS & BUSINESSES */}
        {activeTab === 'applicants' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business Name & Category</th>
                  <th>GSTIN Number</th>
                  <th>Contact Person</th>
                  <th>Location / District</th>
                  <th>Applications</th>
                  <th>Instruments Fleet</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.name}</strong>
                      <small className="cell-sub">{app.organization}</small>
                    </td>
                    <td>{app.gstin}</td>
                    <td>
                      <span>{app.contactPerson}</span>
                      <small className="cell-sub">{app.phone}</small>
                    </td>
                    <td>
                      <span>{app.location}</span>
                      <small className="cell-sub">{app.district}</small>
                    </td>
                    <td><strong className="text-teal">{app.totalApplications} Requests</strong></td>
                    <td><strong className="text-blue">{app.totalInstruments} Units</strong></td>
                    <td>
                      <span className={app.status === 'Active' ? 'status-badge verified' : 'status-badge under-review'}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          onClick={() => setSelectedStakeholder({ type: 'applicant', applicant: app })}
                        >
                          <Eye size={13} /> View Profile
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          onClick={() => onNavigateToApplications(app.name)}
                        >
                          <FileCheck2 size={13} /> View Applications
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-cert"
                          onClick={() => onNavigateToInstruments(app.name)}
                        >
                          <Gauge size={13} /> View Instruments
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: LMO OFFICERS */}
        {activeTab === 'lmo' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Employee ID</th>
                  <th>Zone / District Office</th>
                  <th>Current Active Assignments</th>
                  <th>Completed Inspections</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLmos.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.name}</strong>
                      <small className="cell-sub">{l.email}</small>
                    </td>
                    <td>{l.employeeId}</td>
                    <td>
                      <span>{l.location}</span>
                      <small className="cell-sub">{l.district}</small>
                    </td>
                    <td><strong className="text-amber">{l.currentAssignments} Assigned</strong></td>
                    <td><strong className="text-green">{l.completedInspections} Audits</strong></td>
                    <td>
                      <span className="status-badge verified"><CheckCircle2 size={11} /> {l.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          onClick={() => setSelectedStakeholder({ type: 'lmo', lmo: l })}
                        >
                          <Eye size={13} /> View Profile
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          onClick={() => setSelectedStakeholder({ type: 'lmo', lmo: l })}
                        >
                          <UserCheck size={13} /> View Assignments
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: GATC OFFICERS */}
        {activeTab === 'gatc' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>GATC Officer Name</th>
                  <th>GATC Testing Laboratory</th>
                  <th>Employee ID</th>
                  <th>Location / District</th>
                  <th>Active Test Workload</th>
                  <th>Completed Lab Tests</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGatcs.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.name}</strong>
                      <small className="cell-sub">{g.email}</small>
                    </td>
                    <td><strong>{g.gatcName}</strong></td>
                    <td>{g.employeeId}</td>
                    <td>
                      <span>{g.location}</span>
                      <small className="cell-sub">{g.district}</small>
                    </td>
                    <td><strong className="text-blue">{g.assignedWork} Testing Cases</strong></td>
                    <td><strong className="text-green">{g.completedTests} Certificates</strong></td>
                    <td>
                      <span className="status-badge verified"><CheckCircle2 size={11} /> {g.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          onClick={() => setSelectedStakeholder({ type: 'gatc', gatc: g })}
                        >
                          <Eye size={13} /> View Profile
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          onClick={() => setSelectedStakeholder({ type: 'gatc', gatc: g })}
                        >
                          <FlaskConical size={13} /> View Lab Work
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedStakeholder && (
        <StakeholderDetailModal
          type={selectedStakeholder.type}
          applicant={selectedStakeholder.applicant}
          lmo={selectedStakeholder.lmo}
          gatc={selectedStakeholder.gatc}
          onClose={() => setSelectedStakeholder(null)}
          onNavigateToApplications={onNavigateToApplications}
          onNavigateToInstruments={onNavigateToInstruments}
        />
      )}
    </div>
  )
}
