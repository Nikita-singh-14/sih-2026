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
  Globe,
  HelpCircle,
  Layers,
  Lock,
  MapPin,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface StateAdminWorkspacesProps {
  currentUser: AuthUser
  activeSection: string
  onActionFeedback: (message: string) => void
  onNavigate: (section: string) => void
}

// Admin Mock Data
const adminCertificates = [
  { id: 'CERT-DEL-9982', certNo: 'LM-CERT-2024-9982', instrumentId: 'WM-DEL-01982', instrumentType: 'Heavy Weighbridge 60T', owner: 'Metro Cash & Carry', location: 'Okhla Phase II', district: 'South Delhi', issuedDate: '24 Sep 2024', expiryDate: '24 Sep 2025', status: 'Valid', officer: 'L. Mehta (LMO)' },
  { id: 'CERT-DEL-9176', certNo: 'LM-CERT-2024-9176', instrumentId: 'WM-DEL-01976', instrumentType: 'Fuel Dispenser', owner: 'Bharat Petroleum', location: 'Narela', district: 'North West Delhi', issuedDate: '18 Sep 2024', expiryDate: '18 Sep 2025', status: 'Valid', officer: 'S. K. Verma (LMO)' },
  { id: 'CERT-DEL-8812', certNo: 'LM-CERT-2023-8812', instrumentId: 'WM-DEL-01981', instrumentType: 'Platform Scale 500kg', owner: 'Anand Wholesale', location: 'Azadpur Mandi', district: 'North Delhi', issuedDate: '25 Sep 2023', expiryDate: '25 Sep 2024', status: 'Expiring Soon', officer: 'R. Iyer (LMO)' },
  { id: 'CERT-DEL-6611', certNo: 'LM-CERT-2023-6611', instrumentId: 'WM-DEL-01974', instrumentType: 'Counter Scale 15kg', owner: 'Sharma Grocers', location: 'Lajpat Nagar', district: 'South Delhi', issuedDate: '10 Aug 2023', expiryDate: '10 Aug 2024', status: 'Expired', officer: 'P. Sharma (LMO)' },
  { id: 'CERT-DEL-5544', certNo: 'LM-CERT-2024-5544', instrumentId: 'WM-DEL-01955', instrument: 'Tank Gauging System', owner: 'Indian Oil Depot', location: 'Bijwasan', district: 'South West Delhi', issuedDate: '12 Jul 2024', expiryDate: '12 Jul 2025', status: 'Valid', officer: 'A. K. Rai (LMO)' },
]

const adminFieldOperations = [
  { id: 'FO-101', officerName: 'L. Mehta', officerId: 'LMO-DEL-042', district: 'South Delhi', totalToday: 5, completedToday: 4, activeStatus: 'In Field Inspection', location: 'Okhla Industrial Area', phone: '+91 98109 87654' },
  { id: 'FO-102', officerName: 'R. Iyer', officerId: 'LMO-DEL-019', district: 'North Delhi', totalToday: 6, completedToday: 3, activeStatus: 'En Route', location: 'Azadpur Wholesale Mandi', phone: '+91 98712 34567' },
  { id: 'FO-103', officerName: 'S. K. Verma', officerId: 'LMO-DEL-088', district: 'North West Delhi', totalToday: 4, completedToday: 4, activeStatus: 'Completed Duties', location: 'Narela GATC Centre', phone: '+91 97111 22334' },
  { id: 'FO-104', officerName: 'P. Sharma', officerId: 'LMO-DEL-055', district: 'Central Delhi', totalToday: 5, completedToday: 2, activeStatus: 'Conducting Raid', location: 'Connaught Place Market', phone: '+91 99100 88776' },
]

const adminStakeholders = [
  { id: 'STK-01', name: 'Mettler Toledo India Pvt Ltd', category: 'Manufacturer', licenseNo: 'LM-MFG-DEL-2020-004', contactPerson: 'Sanjay Deshmukh', email: 'sanjay.d@mt.com', phone: '+91 98200 12345', status: 'Active', district: 'South Delhi', instrumentsServed: 1420 },
  { id: 'STK-02', name: 'Precision Scale Care Pvt Ltd', category: 'Licensed Repairer', licenseNo: 'LM-REP-DEL-2022-048', contactPerson: 'Vikramjit Singh', email: 'service@precisionscalecare.com', phone: '+91 98112 99001', status: 'Active', district: 'South West Delhi', instrumentsServed: 680 },
  { id: 'STK-03', name: 'Metro Cash & Carry India', category: 'Commercial User', licenseNo: 'LM-USER-DEL-2021-998', contactPerson: 'Arun Verma', email: 'arun.verma@metrocash.in', phone: '+91 99100 11223', status: 'Active', district: 'South Delhi', instrumentsServed: 45 },
  { id: 'STK-04', name: 'Essae-Teraoka Ltd', category: 'Manufacturer', licenseNo: 'LM-MFG-DEL-2019-012', contactPerson: 'Rajeev Kumar', email: 'rajeev@essae.com', phone: '+91 98188 44332', status: 'Active', district: 'Central Delhi', instrumentsServed: 980 },
  { id: 'STK-05', name: 'Apex Calibration Services', category: 'Licensed Repairer', licenseNo: 'LM-REP-DEL-2023-104', contactPerson: 'Raman Gupta', email: 'info@apexcalib.in', phone: '+91 97115 66778', status: 'Under Review', district: 'East Delhi', instrumentsServed: 310 },
]

export function StateAdminWorkspaces({ currentUser, activeSection, onActionFeedback, onNavigate }: StateAdminWorkspacesProps) {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [selectedCert, setSelectedCert] = useState<typeof adminCertificates[0] | null>(null)
  const [showIssueCertModal, setShowIssueCertModal] = useState(false)
  const [showAddStakeholderModal, setShowAddStakeholderModal] = useState(false)

  return (
    <div className="admin-workspace-container">
      {/* 1. CERTIFICATES WORKSPACE */}
      {activeSection === 'Certificates' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">STATEWIDE CERTIFICATE REGISTER</span>
              <h2>Legal Metrology Certificates & Stamping Records</h2>
              <p>Monitor, issue, verify, and manage official verification certificates across all Delhi districts.</p>
            </div>
            <button className="btn-primary-glow" type="button" onClick={() => setShowIssueCertModal(true)}>
              <Plus size={16} /> Issue Stamping Certificate
            </button>
          </div>

          {/* Certificate Metrics */}
          <div className="business-stats-row">
            <div className="b-stat-card stat-teal">
              <div className="b-stat-icon"><FileCheck2 size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Total Active Certificates</span>
                <strong className="b-stat-val">14,280</strong>
                <small className="b-stat-sub text-teal">98.2% Compliance Rate</small>
              </div>
            </div>
            <div className="b-stat-card stat-amber">
              <div className="b-stat-icon"><Clock size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Expiring in 30 Days</span>
                <strong className="b-stat-val">412</strong>
                <small className="b-stat-sub text-amber">Renewal Notices Sent</small>
              </div>
            </div>
            <div className="b-stat-card stat-rose">
              <div className="b-stat-icon"><AlertTriangle size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Expired / Unstamped</span>
                <strong className="b-stat-val">68</strong>
                <small className="b-stat-sub text-rose">Flagged for Field Enforcement</small>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="b-toolbar" style={{ marginTop: '1.2rem' }}>
            <div className="b-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search Certificate No, Instrument ID, Owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="b-filter-group">
              <label>
                <MapPin size={14} /> District:
                <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                  <option value="All">All Districts</option>
                  <option value="South Delhi">South Delhi</option>
                  <option value="North Delhi">North Delhi</option>
                  <option value="North West Delhi">North West Delhi</option>
                  <option value="Central Delhi">Central Delhi</option>
                </select>
              </label>

              <label>
                <Sliders size={14} /> Status:
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Valid">Valid</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              </label>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="b-panel">
            <div className="b-table-wrap">
              <table className="b-table">
                <thead>
                  <tr>
                    <th>Certificate No</th>
                    <th>Instrument ID & Type</th>
                    <th>Owner / Premises</th>
                    <th>Jurisdiction District</th>
                    <th>Issued / Expiry</th>
                    <th>Verifying LMO</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCertificates
                    .filter((c) => {
                      const matchesSearch =
                        !searchTerm ||
                        c.certNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.instrumentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.owner.toLowerCase().includes(searchTerm.toLowerCase())
                      const matchesDistrict = districtFilter === 'All' || c.district === districtFilter
                      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
                      return matchesSearch && matchesDistrict && matchesStatus
                    })
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.certNo}</strong>
                        </td>
                        <td>
                          <strong>{c.instrumentId}</strong>
                          <small className="cell-sub">{c.instrumentType}</small>
                        </td>
                        <td>
                          <strong>{c.owner}</strong>
                          <small className="cell-sub">{c.location}</small>
                        </td>
                        <td>{c.district}</td>
                        <td>
                          <span>{c.issuedDate}</span>
                          <small className="cell-sub">Expires {c.expiryDate}</small>
                        </td>
                        <td>{c.officer}</td>
                        <td>
                          <span className={`b-badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-table-action"
                            type="button"
                            onClick={() => {
                              setSelectedCert(c)
                              onActionFeedback(`Viewing Certificate ${c.certNo}`)
                            }}
                          >
                            View & Download
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

      {/* 2. FIELD OPERATIONS WORKSPACE */}
      {activeSection === 'Field operations' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">FIELD ENFORCEMENT & INSPECTION NETWORK</span>
              <h2>Field Operations & LMO Dispatch Operations</h2>
              <p>Real-time monitoring of Legal Metrology Officers, premises raids, and field verification routes.</p>
            </div>
            <button
              className="btn-primary-glow"
              type="button"
              onClick={() => onActionFeedback('Dispatched emergency inspection team to Azadpur Mandi')}
            >
              <ShieldAlert size={16} /> Dispatch Raid Team
            </button>
          </div>

          {/* Operational Metrics */}
          <div className="business-stats-row">
            <div className="b-stat-card stat-teal">
              <div className="b-stat-icon"><UserCheck size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Active Field Officers</span>
                <strong className="b-stat-val">48</strong>
                <small className="b-stat-sub text-teal">Across 11 Delhi Districts</small>
              </div>
            </div>
            <div className="b-stat-card stat-blue">
              <div className="b-stat-icon"><MapPin size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Today's Inspections</span>
                <strong className="b-stat-val">124</strong>
                <small className="b-stat-sub text-blue">96 Inspections Completed</small>
              </div>
            </div>
            <div className="b-stat-card stat-rose">
              <div className="b-stat-icon"><ShieldAlert size={20} /></div>
              <div className="b-stat-data">
                <span className="b-stat-label">Seizure & Raids Conducted</span>
                <strong className="b-stat-val">12</strong>
                <small className="b-stat-sub text-rose">Unstamped Scales Seized</small>
              </div>
            </div>
          </div>

          {/* Active Officers Roster */}
          <div className="b-panel" style={{ marginTop: '1.2rem' }}>
            <div className="b-panel-header">
              <div>
                <span className="panel-eyebrow">LIVE ROSTER</span>
                <h2>District Field Officers & Deployment Status</h2>
              </div>
            </div>
            <div className="b-table-wrap">
              <table className="b-table">
                <thead>
                  <tr>
                    <th>Officer Name & ID</th>
                    <th>Assigned District</th>
                    <th>Current Location / Site</th>
                    <th>Today's Target</th>
                    <th>Live Operational Status</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminFieldOperations.map((fo) => (
                    <tr key={fo.id}>
                      <td>
                        <strong>{fo.officerName}</strong>
                        <small className="cell-sub">{fo.officerId}</small>
                      </td>
                      <td>{fo.district}</td>
                      <td>
                        <MapPin size={13} className="text-blue" /> {fo.location}
                      </td>
                      <td>
                        <strong>{fo.completedToday} / {fo.totalToday}</strong> Inspections
                      </td>
                      <td>
                        <span className="b-badge badge-active">{fo.activeStatus}</span>
                      </td>
                      <td>{fo.phone}</td>
                      <td>
                        <button
                          className="btn-table-action"
                          type="button"
                          onClick={() => onActionFeedback(`Connecting to ${fo.officerName}...`)}
                        >
                          Contact Officer
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

      {/* 3. STAKEHOLDERS WORKSPACE */}
      {activeSection === 'Stakeholders' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">STATEWIDE STAKEHOLDER DIRECTORY</span>
              <h2>Manufacturers, Licensed Repairers & Commercial Users</h2>
              <p>Registry of authorized legal metrology license holders, equipment manufacturers, and commercial users.</p>
            </div>
            <button className="btn-primary-glow" type="button" onClick={() => setShowAddStakeholderModal(true)}>
              <Plus size={16} /> Add Stakeholder Licensee
            </button>
          </div>

          <div className="b-panel">
            <div className="b-table-wrap">
              <table className="b-table">
                <thead>
                  <tr>
                    <th>Stakeholder Name</th>
                    <th>Category</th>
                    <th>License Number</th>
                    <th>Contact Person</th>
                    <th>District</th>
                    <th>Instruments Managed</th>
                    <th>License Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStakeholders.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <span className="type-chip">{s.category}</span>
                      </td>
                      <td>
                        <strong className="cell-id">{s.licenseNo}</strong>
                      </td>
                      <td>
                        {s.contactPerson}
                        <small className="cell-sub">{s.phone}</small>
                      </td>
                      <td>{s.district}</td>
                      <td>
                        <strong>{s.instrumentsServed}</strong> Units
                      </td>
                      <td>
                        <span className={`b-badge badge-${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-table-action"
                          type="button"
                          onClick={() => onActionFeedback(`Viewing profile of ${s.name}`)}
                        >
                          View License
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

      {/* 4. REPORTS WORKSPACE */}
      {activeSection === 'Reports' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">STATEWIDE ANALYTICS & AUDIT REPORTS</span>
              <h2>Departmental Performance & Revenue Analytics</h2>
              <p>Statewide revenue collection, verification audit metrics, and compliance export reports.</p>
            </div>
            <button
              className="btn-secondary-light"
              type="button"
              onClick={() => onActionFeedback('Exporting Statewide Annual Legal Metrology Report (PDF)...')}
            >
              <Download size={16} /> Download Full Statewide Audit (PDF)
            </button>
          </div>

          <div className="reports-analytics-grid">
            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">REVENUE COLLECTION SUMMARY</span>
                  <h2>Verification & Stamping Fee Revenue (FY 2024-25)</h2>
                </div>
              </div>
              <div className="analytics-summary-box">
                <div className="analytic-item">
                  <span>Total Revenue Collected</span>
                  <strong>₹1.48 Crore</strong>
                </div>
                <div className="analytic-item">
                  <span>Total Verification Stamps</span>
                  <strong>14,280</strong>
                </div>
                <div className="analytic-item">
                  <span>Statewide Pass Rate</span>
                  <strong className="text-teal">98.2%</strong>
                </div>
              </div>
            </div>

            <div className="b-panel">
              <div className="b-panel-header">
                <div>
                  <span className="panel-eyebrow">EXPORT CENTER</span>
                  <h2>Download Departmental Analytics Reports</h2>
                </div>
              </div>
              <div className="report-download-items">
                <div className="report-item">
                  <div>
                    <strong>Q3 Statewide Verification Audit Report</strong>
                    <p>District-wise breakdown of initial, re-verification, and seizure statistics.</p>
                  </div>
                  <button className="btn-table-action" type="button" onClick={() => onActionFeedback('Audit Report downloaded')}>
                    <Download size={14} /> PDF
                  </button>
                </div>
                <div className="report-item">
                  <div>
                    <strong>Stamping Revenue Financial Statement (Excel)</strong>
                    <p>Treasury fee collection breakdown for all 11 Delhi zones.</p>
                  </div>
                  <button className="btn-table-action" type="button" onClick={() => onActionFeedback('Financial Excel downloaded')}>
                    <Download size={14} /> XLSX
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS WORKSPACE */}
      {activeSection === 'Settings' && (
        <div className="dashboard-view-fade">
          <div className="section-hero-bar">
            <div>
              <span className="panel-eyebrow">DEPARTMENTAL CONFIGURATION</span>
              <h2>Legal Metrology System Administration Settings</h2>
              <p>Configure officer access control, fee tariffs, security policies, and automated reminders.</p>
            </div>
          </div>

          <div className="settings-panel-wrap b-panel">
            <div className="b-panel-header">
              <h2>State Administrator Portal Settings</h2>
            </div>
            <form
              className="settings-form"
              onSubmit={(e) => {
                e.preventDefault()
                onActionFeedback('System settings updated successfully!')
              }}
            >
              <div className="form-row-dual">
                <label>
                  Department Title
                  <input type="text" defaultValue="Department of Legal Metrology, Government of NCT of Delhi" readOnly />
                </label>
                <label>
                  State Admin Account
                  <input type="email" defaultValue={currentUser.email} readOnly />
                </label>
              </div>

              <div className="form-row-dual">
                <label>
                  Stamping Fee Auto-Calculation
                  <select defaultValue="enabled">
                    <option value="enabled">Enabled (Standard Legal Metrology Act Schedule)</option>
                    <option value="manual">Manual Officer Override Allowed</option>
                  </select>
                </label>
                <label>
                  Automated Verification Expiry Warning
                  <select defaultValue="30">
                    <option value="60">60 Days Prior to Expiry</option>
                    <option value="30">30 Days Prior to Expiry</option>
                  </select>
                </label>
              </div>

              <button className="btn-primary-glow" type="submit">
                Save Departmental Configurations
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CERTIFICATE DETAIL MODAL */}
      {selectedCert && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box cert-preview-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">DEPARTMENT OF LEGAL METROLOGY · GOVT OF NCT OF DELHI</span>
                <h2>Verification Certificate #{selectedCert.certNo}</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setSelectedCert(null)}>
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
                  <strong>{selectedCert.certNo}</strong>
                </div>
                <div className="cert-row">
                  <span>Instrument ID & Category:</span>
                  <strong>{selectedCert.instrumentId} ({selectedCert.instrumentType})</strong>
                </div>
                <div className="cert-row">
                  <span>Owner / Premises:</span>
                  <strong>{selectedCert.owner} ({selectedCert.location})</strong>
                </div>
                <div className="cert-row">
                  <span>Jurisdiction District:</span>
                  <strong>{selectedCert.district}</strong>
                </div>
                <div className="cert-row">
                  <span>Date of Issue / Expiry:</span>
                  <strong>{selectedCert.issuedDate} — <span className="text-teal">{selectedCert.expiryDate}</span></strong>
                </div>
                <div className="cert-row">
                  <span>Verifying LMO Officer:</span>
                  <strong>{selectedCert.officer}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary-light" onClick={() => setSelectedCert(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-primary-glow"
                onClick={() => {
                  onActionFeedback(`Downloaded official PDF for ${selectedCert.certNo}`)
                  setSelectedCert(null)
                }}
              >
                <Download size={16} /> Download Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE STAMPING CERTIFICATE */}
      {showIssueCertModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">OFFICIAL STAMPING</span>
                <h2>Issue Verification Certificate</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowIssueCertModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowIssueCertModal(false)
                onActionFeedback('New Stamping Certificate issued and logged into state register!')
              }}
            >
              <label>
                Instrument ID
                <input required placeholder="e.g. WM-DEL-01999" />
              </label>
              <label>
                Owner / Business Name
                <input required placeholder="e.g. Metro Logistics Pvt Ltd" />
              </label>
              <label>
                Verifying Officer Name
                <input required defaultValue={currentUser.name} />
              </label>
              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary-light" onClick={() => setShowIssueCertModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow">
                  Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAKEHOLDER */}
      {showAddStakeholderModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box">
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">STAKEHOLDER REGISTRATION</span>
                <h2>Register New Licensee</h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowAddStakeholderModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowAddStakeholderModal(false)
                onActionFeedback('New Stakeholder Licensee added to state directory!')
              }}
            >
              <label>
                Organization / Stakeholder Name
                <input required placeholder="e.g. Acme Scale Manufactures Ltd" />
              </label>
              <label>
                Category
                <select defaultValue="Manufacturer">
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Licensed Repairer">Licensed Repairer</option>
                  <option value="Dealer">Dealer / Stockist</option>
                  <option value="Commercial User">Commercial User</option>
                </select>
              </label>
              <label>
                License Number
                <input required placeholder="e.g. LM-MFG-DEL-2024-881" />
              </label>
              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary-light" onClick={() => setShowAddStakeholderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow">
                  Save Licensee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
