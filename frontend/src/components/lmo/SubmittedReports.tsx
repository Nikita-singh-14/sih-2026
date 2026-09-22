import React, { useState, useMemo } from 'react'
import {
  FileCheck,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  FileText,
  Filter,
  X
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface SubmittedReportItem {
  id: string
  reportNo: string
  applicationId: string
  businessName: string
  location: string
  instrument: string
  serialNo: string
  sealNo: string
  feePaid: string
  submittedAt: string
  decision: 'PASSED' | 'FAILED'
  certificateNo?: string
}

interface SubmittedReportsProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function SubmittedReports({ currentUser, onActionFeedback }: SubmittedReportsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('All Outcomes')
  const [selectedReport, setSelectedReport] = useState<SubmittedReportItem | null>(null)

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  // Mock initial submitted reports list dynamically generated for current LMO
  const reports: SubmittedReportItem[] = useMemo(() => [
    {
      id: 'rep-1',
      reportNo: 'LMO-REP-2024-0091',
      applicationId: 'LM-2024-08910',
      businessName: 'Apex Wholesale Mart',
      location: `Okhla Phase III, ${jurisdictionDisplay}`,
      instrument: 'Electronic Counter Scale (30kg)',
      serialNo: 'SN-77819-APX',
      sealNo: 'SEAL-DEL-88219',
      feePaid: '₹ 1,200',
      submittedAt: 'Yesterday at 04:15 PM',
      decision: 'PASSED',
      certificateNo: 'CERT-LM-2024-09821'
    },
    {
      id: 'rep-2',
      reportNo: 'LMO-REP-2024-0090',
      applicationId: 'LM-2024-08872',
      businessName: 'Gupta Fuel Station',
      location: `Main Highway, ${jurisdictionDisplay}`,
      instrument: 'Multi-Nozzle Fuel Dispenser',
      serialNo: 'FD-2022-0918',
      sealNo: 'SEAL-DEL-88204',
      feePaid: '₹ 3,500',
      submittedAt: '21 Sep 2024, 11:30 AM',
      decision: 'PASSED',
      certificateNo: 'CERT-LM-2024-09804'
    },
    {
      id: 'rep-3',
      reportNo: 'LMO-REP-2024-0089',
      applicationId: 'LM-2024-08712',
      businessName: 'City Cold Storage & Dairy',
      location: `Industrial Area, ${jurisdictionDisplay}`,
      instrument: 'Platform Weighing Machine (500kg)',
      serialNo: 'CS-9912-FL',
      sealNo: 'REJECTED-UNSEALED',
      feePaid: '₹ 2,000',
      submittedAt: '19 Sep 2024, 02:45 PM',
      decision: 'FAILED'
    },
    {
      id: 'rep-4',
      reportNo: 'LMO-REP-2024-0088',
      applicationId: 'LM-2024-08655',
      businessName: 'Metro Supermarket',
      location: `Sector 5 Market, ${jurisdictionDisplay}`,
      instrument: 'Precision Jewelry Balance',
      serialNo: 'JB-500-2024',
      sealNo: 'SEAL-DEL-88155',
      feePaid: '₹ 1,500',
      submittedAt: '18 Sep 2024, 10:10 AM',
      decision: 'PASSED',
      certificateNo: 'CERT-LM-2024-09755'
    }
  ], [jurisdictionDisplay])

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [item.reportNo, item.applicationId, item.businessName, item.instrument, item.sealNo].some((v) =>
          v.toLowerCase().includes(q)
        )
      const matchesDecision =
        decisionFilter === 'All Outcomes' || item.decision === decisionFilter

      return matchesSearch && matchesDecision
    })
  }, [reports, searchTerm, decisionFilter])

  const summary = useMemo(() => {
    const total = reports.length
    const passed = reports.filter((r) => r.decision === 'PASSED').length
    const failed = reports.filter((r) => r.decision === 'FAILED').length
    return { total, passed, failed }
  }, [reports])

  const handleDownloadPDF = (report: SubmittedReportItem) => {
    onActionFeedback(`Downloading Official Verification Report & Stamping Certificate for ${report.reportNo}`)
  }

  return (
    <div className="lmo-subpage">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">AUDIT TRAIL / {jurisdictionDisplay}</p>
          <h1>Submitted Inspection & Verification Reports</h1>
          <p className="heading-copy">
            Permanent legal log of verified instruments, issued certificates, and rejections submitted by {currentUser.name}.
          </p>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <FileCheck size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Reports Submitted</span>
            <strong>{summary.total}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <Award size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Verification Certificates Issued</span>
            <strong>{summary.passed}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <XCircle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Rejections / Non-Compliant</span>
            <strong>{summary.failed}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <DollarSign size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Fees Verified</span>
            <strong>₹ 8,200</strong>
          </div>
        </article>
      </section>

      {/* Main Table */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">OFFICIAL LOG</p>
            <h2>Verification & Stamping Record</h2>
          </div>
          <span className="queue-count">{filteredReports.length} reports</span>
        </div>

        {/* Filters */}
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Report No, Application ID, Business Name, or Seal Number..."
            />
          </div>

          <div className="lmo-filter-selects">
            <select
              className="filter-button"
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
            >
              <option value="All Outcomes">All Outcomes</option>
              <option value="PASSED">Passed (Certificate Issued)</option>
              <option value="FAILED">Failed (Rejection Notice)</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>REPORT & APP ID</th>
                <th>ESTABLISHMENT</th>
                <th>INSTRUMENT & SERIAL</th>
                <th>SEAL NUMBER</th>
                <th>SUBMITTED AT</th>
                <th>DECISION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.reportNo}</strong>
                    <small style={{ display: 'block', color: '#64748b' }}>App: {report.applicationId}</small>
                  </td>
                  <td>
                    <strong>{report.businessName}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{report.location}</span>
                  </td>
                  <td>
                    <strong>{report.instrument}</strong>
                    <small style={{ display: 'block', color: '#64748b' }}>SN: {report.serialNo}</small>
                  </td>
                  <td>
                    <span className="verification-type-badge">{report.sealNo}</span>
                  </td>
                  <td>{report.submittedAt}</td>
                  <td>
                    <span className={`status-pill ${report.decision.toLowerCase()}`}>
                      {report.decision === 'PASSED' ? (
                        <>
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> PASSED
                        </>
                      ) : (
                        <>
                          <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> FAILED
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="secondary-button"
                        type="button"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleDownloadPDF(report)}
                      >
                        <Download size={12} /> Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={36} color="#94a3b8" />
              <h3>No submitted reports found</h3>
              <p>No reports match the active search or decision criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">SUBMITTED REPORT DETAILS</p>
                <h2>{selectedReport.reportNo}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f766e', fontSize: '0.85rem' }}>LEGAL METROLOGY VERIFICATION CERTIFICATE SUMMARY</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>Establishment:</strong> {selectedReport.businessName}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Location:</strong> {selectedReport.location}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Instrument:</strong> {selectedReport.instrument} ({selectedReport.serialNo})
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Stamping Seal Affixed:</strong> {selectedReport.sealNo}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Verification Fee:</strong> {selectedReport.feePaid}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Inspecting Officer:</strong> {currentUser.name} ({currentUser.email})
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="secondary-button" type="button" onClick={() => setSelectedReport(null)}>
                  Close
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    handleDownloadPDF(selectedReport)
                    setSelectedReport(null)
                  }}
                >
                  <Download size={14} /> Download Certificate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
