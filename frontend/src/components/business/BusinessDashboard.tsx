import React, { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  HelpCircle,
  MapPin,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import type { AuthUser } from '../../types'
import {
  initialBusinessApplications,
  initialBusinessCertificates,
  initialBusinessInstruments,
  initialBusinessPremises,
  initialLicensedRepairers,
  initialScheduledInspections,
  type BusinessApplication,
  type BusinessCertificate,
  type BusinessInstrument,
} from '../../features/business/data'

interface BusinessDashboardProps {
  currentUser: AuthUser
  activeSection: string
  onActionFeedback: (message: string) => void
  onNavigate: (section: string) => void
}

export function BusinessDashboard({ currentUser, activeSection, onActionFeedback, onNavigate }: BusinessDashboardProps) {
  const [instruments, setInstruments] = useState<BusinessInstrument[]>(initialBusinessInstruments)
  const [applications, setApplications] = useState<BusinessApplication[]>(initialBusinessApplications)
  const [certificates] = useState<BusinessCertificate[]>(initialBusinessCertificates)
  const [inspections] = useState(initialScheduledInspections)
  const [premises] = useState(initialBusinessPremises)
  const [repairers] = useState(initialLicensedRepairers)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  // Modals
  const [showNewAppModal, setShowNewAppModal] = useState(false)
  const [showRegisterInstModal, setShowRegisterInstModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<BusinessCertificate | null>(null)
  const [selectedAppDetail, setSelectedAppDetail] = useState<BusinessApplication | null>(null)

  // Quick stats calculations
  const totalInstruments = instruments.length
  const activeInstruments = instruments.filter((i) => i.status === 'Active').length
  const pendingApps = applications.filter((a) => a.status !== 'Verified').length
  const validCerts = certificates.filter((c) => c.status === 'Valid').length
  const expiringSoon = instruments.filter((i) => i.status === 'Expired' || i.status === 'Pending Verification').length

  return (
    <div className="business-dashboard-container">
      {/* Top Header Banner for Business Account */}
      <section className="business-welcome-banner">
        <div className="welcome-main">
          <div className="company-badge">
            <Building2 size={24} />
          </div>
          <div>
            <div className="company-meta">
              <span className="business-tag">REGISTERED APPLICANT</span>
              <span className="registration-no">GSTIN: 07AAACM4821K1Z5 · LM-REG-DEL-2024-9912</span>
            </div>
            <h1>{currentUser.name}</h1>
            <p className="welcome-sub">
              Legal Metrology Compliance Portal · Central Dashboard for Instrument Verification, Certificates & Stamping Requests.
            </p>
          </div>
        </div>
        <div className="banner-actions">
          <button className="btn-secondary-light" type="button" onClick={() => setShowRegisterInstModal(true)}>
            <Gauge size={16} /> Register Instrument
          </button>
          <button className="btn-primary-glow" type="button" onClick={() => setShowNewAppModal(true)}>
            <Plus size={16} /> Apply for Verification
          </button>
        </div>
      </section>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'Overview' && (
        <div className="dashboard-view-fade">
          {/* Key Metrics Grid */}
          <div className="business-stats-row">
            <div className="b-stat-card stat-teal">
              <div className="b-stat-icon">
                <Gauge size={20} />
              </div>
              <div className="b-stat-data">
                <span className="b-stat-label">Registered Instruments</span>
                <strong className="b-stat-val">{totalInstruments}</strong>
                <small className="b-stat-sub text-teal">{activeInstruments} Active & Stamped</small>
              </div>
            </div>

            <div className="b-stat-card stat-amber">
              <div className="b-stat-icon">
                <FileText size={20} />
              </div>
              <div className="b-stat-data">
                <span className="b-stat-label">Active Applications</span>
                <strong className="b-stat-val">{pendingApps}</strong>
                <small className="b-stat-sub text-amber">In review or scheduled</small>
              </div>
            </div>

            <div className="b-stat-card stat-blue">
              <div className="b-stat-icon">
                <Award size={20} />
              </div>
              <div className="b-stat-data">
                <span className="b-stat-label">Valid Certificates</span>
                <strong className="b-stat-val">{validCerts}</strong>
                <small className="b-stat-sub text-blue">Verified by Legal Metrology</small>
              </div>
            </div>

            <div className="b-stat-card stat-rose">
              <div className="b-stat-icon">
                <AlertTriangle size={20} />
              </div>
              <div className="b-stat-data">
                <span className="b-stat-label">Action Required</span>
                <strong className="b-stat-val">{expiringSoon}</strong>
                <small className="b-stat-sub text-rose">Expired or due for re-stamping</small>
              </div>
            </div>
          </div>

          {/* Alert Notice Banner if any items need attention */}
          {expiringSoon > 0 && (
            <div className="business-alert-banner">
              <div className="alert-content">
                <AlertCircle size={20} className="alert-icon" />
                <div>
                  <strong>{expiringSoon} Verification Expiry Warning</strong>
                  <p>Instruments at Okhla and Lajpat Nagar depots require periodic re-verification within 15 days to remain compliant under Legal Metrology Act.</p>
                </div>
              </div>
              <button className="btn-alert-action" type="button" onClick={() => onNavigate('Applications')}>
                Submit Re-verification <span>→</span>
              </button>
            </div>
          )}

          {/* Quick Action Cards & Live Work Queue */}
          <div className="overview-dual-grid">
            {/* Left: Applications Table */}
            <div className="b-panel main-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">VERIFICATION WORKFLOW</span>
                  <h2>Recent Applications & Requests</h2>
                </div>
                <button className="text-link-btn" type="button" onClick={() => onNavigate('Applications')}>
                  View all applications ({applications.length}) <span>→</span>
                </button>
              </div>

              <div className="b-table-wrap">
                <table className="b-table">
                  <thead>
                    <tr>
                      <th>Application No</th>
                      <th>Instrument Name</th>
                      <th>Premises / Location</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 4).map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="cell-id">{app.applicationNo}</div>
                          <small className="cell-sub">{app.type}</small>
                        </td>
                        <td>
                          <strong>{app.instrumentName}</strong>
                          <small className="cell-sub">{app.instrumentId}</small>
                        </td>
                        <td>{app.location}</td>
                        <td>
                          <strong>₹{app.feeAmount.toLocaleString('en-IN')}</strong>
                          <small className="cell-sub">{app.feePaid ? 'Paid' : 'Unpaid'}</small>
                        </td>
                        <td>
                          <span className={`b-badge badge-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-table-action"
                            type="button"
                            onClick={() => {
                              setSelectedAppDetail(app)
                              onActionFeedback(`Viewing application ${app.applicationNo}`)
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Field Visits & Inspection Schedule */}
            <div className="b-panel side-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">FIELD VISIT TRACKER</span>
                  <h2>Upcoming Inspections</h2>
                </div>
              </div>

              <div className="scheduled-inspections-list">
                {inspections.map((insp) => (
                  <div className="inspection-card-item" key={insp.id}>
                    <div className="insp-time-badge">
                      <Calendar size={16} />
                      <span>{insp.scheduledDate}</span>
                    </div>
                    <div className="insp-details">
                      <strong>{insp.title}</strong>
                      <p className="insp-premises">
                        <MapPin size={13} /> {insp.premises}
                      </p>
                      <div className="insp-officer">
                        <UserCheck size={13} /> {insp.officerName} ({insp.officerDesignation})
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel-callout">
                <ShieldCheck size={18} />
                <span>Keep original certificates and test weights accessible on site prior to officer arrival.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: APPLICATIONS */}
      {activeSection === 'Applications' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">APPLICATION MANAGEMENT</span>
              <h2>Verification & Stamping Requests</h2>
              <p>Track progress of initial verification, re-verification, and post-repair inspection applications.</p>
            </div>
            <button className="btn-primary-glow" type="button" onClick={() => setShowNewAppModal(true)}>
              <Plus size={16} /> New Application
            </button>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="b-toolbar">
            <div className="b-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by Application No, Instrument, or Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="b-filter-group">
              <label>
                <Filter size={14} /> Type:
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Initial verification">Initial Verification</option>
                  <option value="Re-verification">Re-verification</option>
                  <option value="After repair">After Repair</option>
                  <option value="Special inspection">Special Inspection</option>
                </select>
              </label>

              <label>
                <Sliders size={14} /> Status:
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Under review">Under Review</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Verified">Verified</option>
                  <option value="Action required">Action Required</option>
                </select>
              </label>
            </div>
          </div>

          {/* Full Applications Table */}
          <div className="b-panel">
            <div className="b-table-wrap">
              <table className="b-table">
                <thead>
                  <tr>
                    <th>Application No</th>
                    <th>Verification Type</th>
                    <th>Instrument Details</th>
                    <th>Premises / Site</th>
                    <th>Assigned LMO Officer</th>
                    <th>Fee Status</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .filter((app) => {
                      const matchesSearch =
                        !searchQuery ||
                        app.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.location.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchesType = typeFilter === 'All' || app.type === typeFilter
                      const matchesStatus = statusFilter === 'All' || app.status === statusFilter
                      return matchesSearch && matchesType && matchesStatus
                    })
                    .map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.applicationNo}</strong>
                          <small className="cell-sub">Submitted {app.submittedDate}</small>
                        </td>
                        <td>
                          <span className="type-chip">{app.type}</span>
                        </td>
                        <td>
                          <strong>{app.instrumentName}</strong>
                          <small className="cell-sub">{app.instrumentId}</small>
                        </td>
                        <td>{app.location}</td>
                        <td>{app.assignedOfficer}</td>
                        <td>
                          <span className={app.feePaid ? 'text-teal' : 'text-rose'}>
                            ₹{app.feeAmount.toLocaleString('en-IN')} ({app.feePaid ? 'Paid' : 'Pending'})
                          </span>
                        </td>
                        <td>
                          <span className={`b-badge badge-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-table-action"
                            type="button"
                            onClick={() => {
                              setSelectedAppDetail(app)
                              onActionFeedback(`Viewing ${app.applicationNo}`)
                            }}
                          >
                            Track & View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: INSTRUMENTS */}
      {activeSection === 'Instruments' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">EQUIPMENT REGISTRY</span>
              <h2>Registered Weighing & Measuring Instruments</h2>
              <p>Fleet management of calibrated weighing scales, weighbridges, fuel dispensers, and volume measures.</p>
            </div>
            <button className="btn-primary-glow" type="button" onClick={() => setShowRegisterInstModal(true)}>
              <Plus size={16} /> Register New Instrument
            </button>
          </div>

          {/* Instruments Grid / Cards */}
          <div className="instruments-grid">
            {instruments.map((inst) => (
              <div className="instrument-card" key={inst.id}>
                <div className="inst-card-top">
                  <span className="inst-id-pill">{inst.id}</span>
                  <span className={`b-badge badge-${inst.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {inst.status}
                  </span>
                </div>
                <h3>{inst.type}</h3>
                <div className="inst-specs">
                  <p>
                    <strong>Make / Model:</strong> {inst.manufacturer} {inst.model}
                  </p>
                  <p>
                    <strong>Serial No:</strong> {inst.serialNumber}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {inst.capacity} ({inst.accuracyClass})
                  </p>
                  <p>
                    <strong>Location:</strong> {inst.location} ({inst.premises})
                  </p>
                </div>
                <div className="inst-dates-footer">
                  <div>
                    <small>Last Verified</small>
                    <strong>{inst.lastVerified}</strong>
                  </div>
                  <div>
                    <small>Next Due</small>
                    <strong className={inst.status === 'Expired' ? 'text-rose' : 'text-teal'}>{inst.nextDue}</strong>
                  </div>
                </div>
                <div className="inst-actions">
                  <button
                    className="btn-card-action"
                    type="button"
                    onClick={() => {
                      onActionFeedback(`Selected ${inst.id} for verification renewal`)
                      setShowNewAppModal(true)
                    }}
                  >
                    Request Re-verification
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: CERTIFICATES */}
      {activeSection === 'Certificates' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">DIGITAL CERTIFICATE REPOSITORY</span>
              <h2>Verification Certificates & Official Seals</h2>
              <p>Download legal metrology verification certificates, stamping seals, and QR-verifiable proof of accuracy.</p>
            </div>
          </div>

          <div className="certificates-grid">
            {certificates.map((cert) => (
              <div className="certificate-card" key={cert.id}>
                <div className="cert-header">
                  <div className="cert-badge">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="cert-title-wrap">
                    <span className="cert-no">{cert.certificateNo}</span>
                    <span className={`b-badge badge-${cert.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {cert.status}
                    </span>
                  </div>
                </div>
                <div className="cert-body">
                  <h4>{cert.instrumentName}</h4>
                  <p className="cert-inst-id">Instrument ID: {cert.instrumentId}</p>
                  <div className="cert-details-list">
                    <p>
                      <strong>Premises:</strong> {cert.premises}
                    </p>
                    <p>
                      <strong>Security Seal No:</strong> {cert.sealNumber}
                    </p>
                    <p>
                      <strong>Issued By:</strong> {cert.issuedBy}
                    </p>
                    <p>
                      <strong>Validity Period:</strong> {cert.issuedDate} — {cert.expiryDate}
                    </p>
                  </div>
                </div>
                <div className="cert-footer">
                  <button
                    className="btn-cert-download"
                    type="button"
                    onClick={() => {
                      setSelectedCertificate(cert)
                      onActionFeedback(`Opened certificate ${cert.certificateNo}`)
                    }}
                  >
                    <Download size={15} /> View & Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: FIELD OPERATIONS */}
      {activeSection === 'Field operations' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">ON-SITE VERIFICATION</span>
              <h2>Field Operations & Inspection Schedule</h2>
              <p>Monitor assigned Legal Metrology Officer (LMO) visits, site inspections, and stamping logistics.</p>
            </div>
          </div>

          <div className="field-ops-container">
            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">LIVE SCHEDULE</span>
                  <h2>Scheduled Premises Inspections</h2>
                </div>
              </div>

              <div className="inspection-detailed-cards">
                {inspections.map((insp) => (
                  <div className="insp-detail-box" key={insp.id}>
                    <div className="insp-box-top">
                      <div>
                        <span className="b-badge badge-scheduled">{insp.status}</span>
                        <h3>{insp.title}</h3>
                      </div>
                      <div className="insp-date-pill">
                        <Calendar size={15} /> {insp.scheduledDate} ({insp.timeSlot})
                      </div>
                    </div>
                    <div className="insp-box-grid">
                      <div>
                        <small>Location Premises</small>
                        <p>
                          <MapPin size={14} /> {insp.premises}
                        </p>
                      </div>
                      <div>
                        <small>Assigned Officer</small>
                        <p>
                          <UserCheck size={14} /> {insp.officerName}
                        </p>
                      </div>
                      <div>
                        <small>Officer Contact</small>
                        <p>
                          <Phone size={14} /> {insp.officerPhone}
                        </p>
                      </div>
                    </div>
                    <div className="insp-box-checklist">
                      <strong>Premises Readiness Checklist:</strong>
                      <ul>
                        <li>
                          <CheckCircle2 size={15} className="text-teal" /> Calibrated standard test weights available on site
                        </li>
                        <li>
                          <CheckCircle2 size={15} className="text-teal" /> Instrument power source & zero-point balance ready
                        </li>
                        <li>
                          <CheckCircle2 size={15} className="text-teal" /> Facility access clearance granted for inspection team
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: STAKEHOLDERS */}
      {activeSection === 'Stakeholders' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">STAKEHOLDER DIRECTORY</span>
              <h2>Premises, Facility Managers & Licensed Repairers</h2>
              <p>Directory of registered company premises, nominated compliance officers, and authorized repairers.</p>
            </div>
          </div>

          <div className="stakeholders-dual">
            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">OPERATIONAL SITES</span>
                  <h2>Registered Business Premises ({premises.length})</h2>
                </div>
              </div>
              <div className="premises-list">
                {premises.map((p) => (
                  <div className="premise-card" key={p.id}>
                    <div className="premise-top">
                      <h3>{p.name}</h3>
                      <span className="compliance-pill">Compliance: {p.complianceScore}%</span>
                    </div>
                    <p className="premise-addr">
                      <MapPin size={14} /> {p.address}
                    </p>
                    <div className="premise-meta">
                      <span>Manager: {p.managerName} ({p.managerPhone})</span>
                      <span>Instruments: {p.activeInstrumentsCount} Units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">AUTHORIZED SERVICE PARTNERS</span>
                  <h2>Licensed Repairers & Maintenance Partners</h2>
                </div>
              </div>
              <div className="repairers-list">
                {repairers.map((r) => (
                  <div className="repairer-card" key={r.id}>
                    <div className="repairer-top">
                      <div>
                        <h3>{r.name}</h3>
                        <small>License: {r.licenseNo}</small>
                      </div>
                      <span className="rating-tag">★ {r.rating}</span>
                    </div>
                    <p className="repairer-spec">
                      <Wrench size={14} /> {r.specialization}
                    </p>
                    <div className="repairer-contact">
                      <span><Phone size={13} /> {r.phone}</span>
                      <span>{r.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: REPORTS */}
      {activeSection === 'Reports' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">ANALYTICS & REPORTING</span>
              <h2>Compliance & Stamping Expenditure Reports</h2>
              <p>Audit reports, stamping fee statements, and annual Legal Metrology compliance metrics.</p>
            </div>
            <button
              className="btn-secondary-light"
              type="button"
              onClick={() => onActionFeedback('Exporting Compliance Audit PDF report...')}
            >
              <Download size={16} /> Export Annual Compliance Report (PDF)
            </button>
          </div>

          <div className="reports-analytics-grid">
            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">FINANCIAL SUMMARY</span>
                  <h2>Stamping & Verification Fees Paid (FY 2024-25)</h2>
                </div>
              </div>
              <div className="analytics-summary-box">
                <div className="analytic-item">
                  <span>Total Verification Fees Paid</span>
                  <strong>₹38,450</strong>
                </div>
                <div className="analytic-item">
                  <span>Average Processing Turnaround</span>
                  <strong>3.2 Days</strong>
                </div>
                <div className="analytic-item">
                  <span>Audit Pass Rate</span>
                  <strong className="text-teal">98.4%</strong>
                </div>
              </div>
            </div>

            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">COMPLIANCE REPORT GENERATOR</span>
                  <h2>Download Official Statements</h2>
                </div>
              </div>
              <div className="report-download-items">
                <div className="report-item">
                  <div>
                    <strong>Q3 Legal Metrology Audit Summary</strong>
                    <p>Complete breakdown of 25 instruments and active stamping validity.</p>
                  </div>
                  <button className="btn-table-action" type="button" onClick={() => onActionFeedback('Report downloaded')}>
                    <Download size={14} /> PDF
                  </button>
                </div>
                <div className="report-item">
                  <div>
                    <strong>Stamping Fee Tax Invoices</strong>
                    <p>Government receipt invoices for all 2024 verification transactions.</p>
                  </div>
                  <button className="btn-table-action" type="button" onClick={() => onActionFeedback('Invoices exported')}>
                    <Download size={14} /> ZIP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: SETTINGS */}
      {activeSection === 'Settings' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">ACCOUNT SETTINGS</span>
              <h2>Business Profile & Notification Preferences</h2>
              <p>Manage company details, Legal Metrology registration credentials, and alert triggers.</p>
            </div>
          </div>

          <div className="settings-panel-wrap b-panel">
            <div className="b-panel-header">
              <h2>Organization & License Details</h2>
            </div>
            <form
              className="settings-form"
              onSubmit={(e) => {
                e.preventDefault()
                onActionFeedback('Business settings saved successfully!')
              }}
            >
              <div className="form-row-dual">
                <label>
                  Company / Organization Name
                  <input type="text" defaultValue={currentUser.name} readOnly />
                </label>
                <label>
                  GSTIN Number
                  <input type="text" defaultValue="07AAACM4821K1Z5" />
                </label>
              </div>

              <div className="form-row-dual">
                <label>
                  Legal Metrology Registration No
                  <input type="text" defaultValue="LM-REG-DEL-2024-9912" />
                </label>
                <label>
                  Primary Email
                  <input type="email" defaultValue={currentUser.email} />
                </label>
              </div>

              <div className="form-row-dual">
                <label>
                  Corporate Head Office Address
                  <input type="text" defaultValue="Plot 48, Okhla Industrial Area Phase II, New Delhi 110020" />
                </label>
                <label>
                  Expiry Alert Lead Time
                  <select defaultValue="30">
                    <option value="60">60 Days Prior to Expiry</option>
                    <option value="30">30 Days Prior to Expiry</option>
                    <option value="15">15 Days Prior to Expiry</option>
                  </select>
                </label>
              </div>

              <button className="btn-primary-glow" type="submit">
                Save Settings & Preferences
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW VERIFICATION APPLICATION */}
      {showNewAppModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">NEW VERIFICATION REQUEST</span>
                <h2>Apply for Instrument Stamping</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowNewAppModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = new FormData(e.currentTarget)
                const newApp: BusinessApplication = {
                  id: `LM-2024-0${Math.floor(8422 + Math.random() * 500)}`,
                  applicationNo: `LM-2024-0${Math.floor(8422 + Math.random() * 500)}`,
                  type: form.get('type') as any,
                  instrumentId: form.get('instrumentId') as string,
                  instrumentName: form.get('instrumentName') as string,
                  location: form.get('location') as string,
                  submittedDate: 'Just now',
                  status: 'Under review',
                  assignedOfficer: 'Officer Allocation Pending',
                  feeAmount: Number(form.get('feeAmount')) || 1500,
                  feePaid: true,
                }
                setApplications([newApp, ...applications])
                setShowNewAppModal(false)
                onActionFeedback(`Application ${newApp.applicationNo} submitted successfully!`)
              }}
            >
              <label>
                Application Type
                <select name="type" required defaultValue="Re-verification">
                  <option value="Initial verification">Initial Verification</option>
                  <option value="Re-verification">Periodic Re-verification</option>
                  <option value="After repair">After Repair Verification</option>
                  <option value="Special inspection">Special Inspection</option>
                </select>
              </label>

              <label>
                Select Instrument ID
                <select name="instrumentId" required>
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} — {i.type} ({i.serialNumber})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Instrument Name / Description
                <input name="instrumentName" required placeholder="e.g. Electronic Weighbridge 60T" defaultValue="Electronic Heavy Weighbridge" />
              </label>

              <label>
                Inspection Premises Location
                <input name="location" required placeholder="e.g. Okhla Logistics Depot, Gate 2" defaultValue="Okhla Logistics Centre Phase II" />
              </label>

              <label>
                Estimated Stamping Fee (₹)
                <input name="feeAmount" type="number" required defaultValue={2400} />
              </label>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary-light" onClick={() => setShowNewAppModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow">
                  Submit & Pay Verification Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW INSTRUMENT */}
      {showRegisterInstModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">EQUIPMENT REGISTRATION</span>
                <h2>Register New Instrument</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowRegisterInstModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = new FormData(e.currentTarget)
                const newInst: BusinessInstrument = {
                  id: `WM-DEL-0${Math.floor(1985 + Math.random() * 100)}`,
                  type: form.get('type') as string,
                  manufacturer: form.get('manufacturer') as string,
                  model: form.get('model') as string,
                  serialNumber: form.get('serialNumber') as string,
                  capacity: form.get('capacity') as string,
                  location: form.get('location') as string,
                  premises: form.get('premises') as string,
                  status: 'Pending Verification',
                  lastVerified: 'Not yet verified',
                  nextDue: 'Immediate verification required',
                  certificateNo: 'Pending Registration',
                  sealNo: 'Unstamped',
                  accuracyClass: form.get('accuracyClass') as string || 'Class III',
                }
                setInstruments([newInst, ...instruments])
                setShowRegisterInstModal(false)
                onActionFeedback(`Instrument ${newInst.id} registered into business fleet!`)
              }}
            >
              <label>
                Instrument Type / Category
                <input name="type" required placeholder="e.g. Electronic Counter Scale, Weighbridge, Fuel Dispenser" />
              </label>

              <div className="form-row-dual">
                <label>
                  Manufacturer Name
                  <input name="manufacturer" required placeholder="e.g. Mettler Toledo, Essae, A&D" />
                </label>
                <label>
                  Model Number
                  <input name="model" required placeholder="e.g. GX-2000" />
                </label>
              </div>

              <div className="form-row-dual">
                <label>
                  Serial Number
                  <input name="serialNumber" required placeholder="e.g. SN-998821" />
                </label>
                <label>
                  Capacity / Range
                  <input name="capacity" required placeholder="e.g. 500 kg x 50g" />
                </label>
              </div>

              <div className="form-row-dual">
                <label>
                  Accuracy Class
                  <select name="accuracyClass" defaultValue="Class III">
                    <option value="Class I">Class I (Special Precision)</option>
                    <option value="Class II">Class II (High Precision)</option>
                    <option value="Class III">Class III (Medium Commercial)</option>
                    <option value="Class IIII">Class IIII (Ordinary)</option>
                  </select>
                </label>
                <label>
                  Facility Premises
                  <input name="premises" required defaultValue="Okhla Logistics Centre Phase II" />
                </label>
              </div>

              <label>
                Specific Location on Premises
                <input name="location" required placeholder="e.g. Packing Bay 3" />
              </label>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary-light" onClick={() => setShowRegisterInstModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow">
                  Save Instrument Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CERTIFICATE VIEW MODAL */}
      {selectedCertificate && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box cert-preview-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">GOVERNMENT OF NCT OF DELHI · DEPARTMENT OF LEGAL METROLOGY</span>
                <h2>Verification Certificate #{selectedCertificate.certificateNo}</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setSelectedCertificate(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="official-cert-body">
              <div className="cert-gov-header">
                <Shield size={36} className="text-teal" />
                <h3>CERTIFICATE OF VERIFICATION AND STAMPING</h3>
                <small>[Issued under Section 24 of The Legal Metrology Act, 2009]</small>
              </div>

              <div className="cert-official-table">
                <div className="cert-row">
                  <span>Certificate Number:</span>
                  <strong>{selectedCertificate.certificateNo}</strong>
                </div>
                <div className="cert-row">
                  <span>Instrument ID:</span>
                  <strong>{selectedCertificate.instrumentId}</strong>
                </div>
                <div className="cert-row">
                  <span>Instrument Description:</span>
                  <strong>{selectedCertificate.instrumentName}</strong>
                </div>
                <div className="cert-row">
                  <span>Owner / Applicant Premises:</span>
                  <strong>{selectedCertificate.premises}</strong>
                </div>
                <div className="cert-row">
                  <span>Security Lead Seal No:</span>
                  <strong>{selectedCertificate.sealNumber}</strong>
                </div>
                <div className="cert-row">
                  <span>Date of Verification:</span>
                  <strong>{selectedCertificate.issuedDate}</strong>
                </div>
                <div className="cert-row">
                  <span>Valid Until:</span>
                  <strong className="text-teal">{selectedCertificate.expiryDate}</strong>
                </div>
                <div className="cert-row">
                  <span>Verifying Officer:</span>
                  <strong>{selectedCertificate.issuedBy}</strong>
                </div>
              </div>

              <div className="cert-qr-footer">
                <img src={selectedCertificate.qrCodeUrl} alt="Verification QR Code" width={100} height={100} />
                <div>
                  <strong>Official Digital Verification QR</strong>
                  <p>Scan with Legal Metrology Inspection App to verify certificate authenticity on site.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary-light" onClick={() => setSelectedCertificate(null)}>
                Close Preview
              </button>
              <button
                type="button"
                className="btn-primary-glow"
                onClick={() => {
                  onActionFeedback(`Downloading Official Certificate ${selectedCertificate.certificateNo} (PDF)...`)
                  setSelectedCertificate(null)
                }}
              >
                <Download size={16} /> Download Official Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: APPLICATION TRACKING DETAILS */}
      {selectedAppDetail && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">APPLICATION TRACKER</span>
                <h2>Application #{selectedAppDetail.applicationNo}</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setSelectedAppDetail(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="app-detail-timeline">
              <div className="app-meta-summary">
                <p><strong>Type:</strong> {selectedAppDetail.type}</p>
                <p><strong>Instrument:</strong> {selectedAppDetail.instrumentName} ({selectedAppDetail.instrumentId})</p>
                <p><strong>Premises:</strong> {selectedAppDetail.location}</p>
                <p><strong>Assigned Officer:</strong> {selectedAppDetail.assignedOfficer}</p>
                <p><strong>Fee Status:</strong> ₹{selectedAppDetail.feeAmount} ({selectedAppDetail.feePaid ? 'Paid' : 'Unpaid'})</p>
              </div>

              <h3>Workflow Progress</h3>
              <div className="progress-steps">
                <div className="step-item step-completed">
                  <CheckCircle2 size={18} /> Application Submitted ({selectedAppDetail.submittedDate})
                </div>
                <div className="step-item step-completed">
                  <CheckCircle2 size={18} /> Verification Fee Payment Confirmed
                </div>
                <div className={`step-item ${selectedAppDetail.status === 'Under review' ? 'step-active' : 'step-completed'}`}>
                  <Clock size={18} /> Document & Document Review (LMO Officer)
                </div>
                <div className={`step-item ${selectedAppDetail.status === 'Scheduled' ? 'step-active' : ''}`}>
                  <Calendar size={18} /> Field Officer Visit & Physical Stamping
                </div>
                <div className={`step-item ${selectedAppDetail.status === 'Verified' ? 'step-completed' : ''}`}>
                  <Award size={18} /> Verification Certificate Generation
                </div>
              </div>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary-light" onClick={() => setSelectedAppDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
