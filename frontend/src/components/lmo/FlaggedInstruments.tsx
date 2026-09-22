import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  Siren,
  X,
  FileWarning
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface FlaggedItem {
  id: string
  instrumentId: string
  instrumentName: string
  serialNo: string
  businessName: string
  location: string
  violationReason: string
  riskLevel: 'HIGH' | 'CRITICAL'
  flaggedDate: string
  reportedBy: string
}

interface FlaggedInstrumentsProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function FlaggedInstruments({ currentUser, onActionFeedback }: FlaggedInstrumentsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null)

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  // Mock flagged instruments list for current LMO jurisdiction
  const flaggedList: FlaggedItem[] = useMemo(() => [
    {
      id: 'flag-1',
      instrumentId: 'WM-DEL-01982',
      instrumentName: 'Electronic Weighing Scale (50kg)',
      serialNo: 'SN-2024-88419',
      businessName: 'Metro Cash & Carry',
      location: `Okhla Industrial Area, ${jurisdictionDisplay}`,
      violationReason: 'Broken Anti-Tamper Lead Seal & Negative Error Exceeding MPE (+18g at 10kg)',
      riskLevel: 'CRITICAL',
      flaggedDate: '12 Aug 2024',
      reportedBy: currentUser.name
    },
    {
      id: 'flag-2',
      instrumentId: 'FD-DEL-08412',
      instrumentName: 'Multi-Product Fuel Dispenser (Unit #3)',
      serialNo: 'FD-9981-XP',
      businessName: 'Bharat Petroleum Outlet',
      location: `Sector 12 Main Road, ${jurisdictionDisplay}`,
      violationReason: 'Repeated Calibration Failures (Failed 2 consecutive monthly checks)',
      riskLevel: 'HIGH',
      flaggedDate: '15 Jul 2024',
      reportedBy: 'System Automated Monitor'
    },
    {
      id: 'flag-3',
      instrumentId: 'WM-DEL-03110',
      instrumentName: 'Milk Measuring Dispenser',
      serialNo: 'MT-9912-DL',
      businessName: 'Dairy Supply Point',
      location: `Subdivision 4, ${jurisdictionDisplay}`,
      violationReason: 'Serial Number Mismatch vs National Portal Batch Entry',
      riskLevel: 'HIGH',
      flaggedDate: '10 Sep 2024',
      reportedBy: currentUser.name
    }
  ], [currentUser, jurisdictionDisplay])

  const filteredList = useMemo(() => {
    return flaggedList.filter((item) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [item.instrumentId, item.instrumentName, item.businessName, item.violationReason].some((v) =>
          v.toLowerCase().includes(q)
        )
      const matchesRisk =
        riskFilter === 'All Risk Levels' || item.riskLevel === riskFilter

      return matchesSearch && matchesRisk
    })
  }, [flaggedList, searchTerm, riskFilter])

  const summary = useMemo(() => {
    const total = flaggedList.length
    const critical = flaggedList.filter((f) => f.riskLevel === 'CRITICAL').length
    const high = flaggedList.filter((f) => f.riskLevel === 'HIGH').length
    return { total, critical, high }
  }, [flaggedList])

  const handleIssueNotice = (item: FlaggedItem) => {
    onActionFeedback(`Issued Formal Notice under Legal Metrology Act for ${item.instrumentId}`)
  }

  return (
    <div className="lmo-subpage">
      {/* Alert Banner */}
      <section className="lmo-high-risk-banner" style={{ marginBottom: '1.5rem' }}>
        <div className="risk-banner-icon-wrap">
          <Siren size={24} />
        </div>
        <div className="risk-banner-content">
          <span className="risk-tag">ENFORCEMENT WATCHLIST ({summary.critical} CRITICAL / {summary.total} TOTAL)</span>
          <h3 className="risk-title">Non-Compliant & Tampered Instrument Registry</h3>
          <p className="risk-description">
            Instruments flagged for seal tampering, MPE violation thresholds, or fraudulent software require immediate inspection.
          </p>
        </div>
      </section>

      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">ENFORCEMENT HUB / {jurisdictionDisplay}</p>
          <h1>Flagged Instruments & Violation Tracker</h1>
          <p className="heading-copy">
            Track, audit, and issue legal notices for non-compliant instruments in your jurisdiction.
          </p>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon red" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <ShieldAlert size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Critical Violation Cases</span>
            <strong>{summary.critical}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <AlertTriangle size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>High Risk Cases</span>
            <strong>{summary.high}</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <FileWarning size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Notices Issued</span>
            <strong>2 Notices</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Siren size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Seizure Orders</span>
            <strong>0 Pending</strong>
          </div>
        </article>
      </section>

      {/* Main Table */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ENFORCEMENT WATCHLIST</p>
            <h2>Flagged Instruments</h2>
          </div>
          <span className="queue-count">{filteredList.length} items flagged</span>
        </div>

        {/* Filters */}
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Instrument ID, Business Name, or Violation Reason..."
            />
          </div>

          <div className="lmo-filter-selects">
            <select
              className="filter-button"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All Risk Levels">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>INSTRUMENT ID</th>
                <th>ESTABLISHMENT</th>
                <th>VIOLATION REASON</th>
                <th>RISK LEVEL</th>
                <th>FLAGGED DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.instrumentId}</strong>
                    <small style={{ display: 'block', color: '#64748b' }}>{item.instrumentName}</small>
                  </td>
                  <td>
                    <strong>{item.businessName}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{item.location}</span>
                  </td>
                  <td>
                    <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 500 }}>
                      {item.violationReason}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.riskLevel === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                        color: item.riskLevel === 'CRITICAL' ? '#dc2626' : '#d97706',
                        border: `1px solid ${item.riskLevel === 'CRITICAL' ? '#fca5a5' : '#fcd34d'}`
                      }}
                    >
                      {item.riskLevel}
                    </span>
                  </td>
                  <td>{item.flaggedDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="secondary-button"
                        type="button"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={12} /> View File
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', background: '#dc2626' }}
                        onClick={() => handleIssueNotice(item)}
                      >
                        Issue Notice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertTriangle size={36} color="#94a3b8" />
              <h3>No flagged instruments match your search</h3>
              <p>Try resetting filters or searching with another keyword.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">ENFORCEMENT FILE</p>
                <h2>{selectedItem.instrumentId}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <strong style={{ color: '#dc2626', fontSize: '0.85rem' }}>LEGAL METROLOGY ACT VIOLATION DOSSIER</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>Instrument:</strong> {selectedItem.instrumentName} ({selectedItem.serialNo})
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Establishment:</strong> {selectedItem.businessName}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Address:</strong> {selectedItem.location}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#dc2626' }}>
                  <strong>Violation Findings:</strong> {selectedItem.violationReason}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Reported Date:</strong> {selectedItem.flaggedDate}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="secondary-button" type="button" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
                <button
                  className="primary-button"
                  type="button"
                  style={{ background: '#dc2626' }}
                  onClick={() => {
                    handleIssueNotice(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  Issue Formal Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
