import { useState } from 'react'
import {
  Search,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Building,
  Printer,
  Eye,
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface SubmittedReportsProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function SubmittedReports({ currentUser, onActionFeedback }: SubmittedReportsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes')

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const reports = [
    {
      id: 'REP-2024-8801',
      appId: 'LM-2024-09110',
      business: 'Mother Dairy Booth #442',
      location: 'Rohini Sector 7, Delhi',
      instrument: 'Milk Measuring Container & Scale',
      dateSubmitted: '23 Sep 2024, 04:30 PM',
      outcome: 'PASSED',
      certNumber: 'LM-CERT-2024-09110',
    },
    {
      id: 'REP-2024-8802',
      appId: 'LM-2024-09112',
      business: 'Indian Oil Fuel Hub',
      location: 'GT Karnal Road, Delhi',
      instrument: 'Multi-Product Fuel Dispenser',
      dateSubmitted: '22 Sep 2024, 02:15 PM',
      outcome: 'PASSED',
      certNumber: 'LM-CERT-2024-09112',
    },
    {
      id: 'REP-2024-8803',
      appId: 'LM-2024-09115',
      business: 'Subhash Grocery Store',
      location: 'Chandni Chowk, Delhi',
      instrument: 'Electronic Counter Scale',
      dateSubmitted: '20 Sep 2024, 11:00 AM',
      outcome: 'FAILED',
      reason: 'Excess error beyond MPE (+18g at 5kg)',
      certNumber: 'REJECTION-NOTICE-8803',
    },
    {
      id: 'REP-2024-8804',
      appId: 'LM-2024-09118',
      business: 'Apex Logistics Hub',
      location: 'Mayapuri Industrial Area, Delhi',
      instrument: 'Heavy Duty Weighbridge (60T)',
      dateSubmitted: '18 Sep 2024, 03:45 PM',
      outcome: 'PASSED',
      certNumber: 'LM-CERT-2024-09118',
    },
  ]

  const filtered = reports.filter((r) => {
    const q = searchTerm.toLowerCase()
    const matchesQuery =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.appId.toLowerCase().includes(q) ||
      r.business.toLowerCase().includes(q)
    const matchesOutcome = outcomeFilter === 'All Outcomes' || r.outcome === outcomeFilter
    return matchesQuery && matchesOutcome
  })

  return (
    <div className="submitted-reports-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">REPORTS & CERTIFICATES</p>
          <h1>Submitted Inspection Reports</h1>
          <p className="heading-copy">Archive of completed verification reports and issued legal metrology certificates.</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          style={{ width: 'auto' }}
          onClick={() => handleFeedback('Exported submitted reports summary (CSV)')}
        >
          <Download size={14} /> Export Summary (CSV)
        </button>
      </section>

      {/* KPI Stats */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <FileText size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Reports Filed</span>
            <strong>{reports.length} Reports</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Passed & Certified</span>
            <strong>{reports.filter((r) => r.outcome === 'PASSED').length}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <XCircle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Rejections Issued</span>
            <strong>{reports.filter((r) => r.outcome === 'FAILED').length}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <ShieldCheck size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Verification Rate</span>
            <strong>75% Pass Rate</strong>
          </div>
        </article>
      </section>

      {/* Reports Table */}
      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">VERIFICATION REGISTER</p>
            <h2>Completed Reports</h2>
          </div>
          <span className="queue-count">{filtered.length} reports</span>
        </div>

        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Report ID, Application ID or establishment..."
            />
          </div>
          <select
            className="filter-button"
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
          >
            <option value="All Outcomes">All Outcomes</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="table-wrap lmo-table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>APPLICATION NO</th>
                <th>ESTABLISHMENT</th>
                <th>INSTRUMENT</th>
                <th>SUBMITTED DATE</th>
                <th>OUTCOME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="app-id-cell">
                    <strong>{item.id}</strong>
                  </td>
                  <td>{item.appId}</td>
                  <td>
                    <strong>{item.business}</strong>
                    <span>{item.location}</span>
                  </td>
                  <td>{item.instrument}</td>
                  <td>{item.dateSubmitted}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: item.outcome === 'PASSED' ? '#ecfdf5' : '#fef2f2',
                        color: item.outcome === 'PASSED' ? '#047857' : '#dc2626',
                      }}
                    >
                      {item.outcome === 'PASSED' ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="lmo-action-btn secondary"
                      type="button"
                      onClick={() => handleFeedback(`Downloading PDF certificate for ${item.id}...`)}
                    >
                      <Download size={13} /> Certificate PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
