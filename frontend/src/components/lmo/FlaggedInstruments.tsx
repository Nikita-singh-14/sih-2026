import { useState } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  FileSpreadsheet,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  ShieldOff,
  Scale,
  FileWarning,
} from 'lucide-react'
import type { AuthUser } from '../../types'

interface FlaggedInstrumentsProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function FlaggedInstruments({ currentUser, onActionFeedback }: FlaggedInstrumentsProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const flaggedList = [
    {
      id: 'FLAG-2024-001',
      instrumentId: 'WM-DEL-01822',
      business: 'Metro Cash & Carry',
      location: 'Okhla Industrial Area, Delhi',
      type: 'Electronic Weighing Scale',
      reason: 'Broken Anti-Tamper Lead Seal',
      severity: 'HIGH',
      flaggedDate: '12 Aug 2024',
      details: 'Physical verification seal wire found snipped during routine inspection. Possible tampering with internal load cell calibration.',
    },
    {
      id: 'FLAG-2024-002',
      instrumentId: 'WM-DEL-01955',
      business: 'Bharat Petroleum Outlet',
      location: 'Sector 12 Main Road, Delhi',
      type: 'Fuel Dispensing Unit #4',
      reason: 'Repeated Calibration Failures (2x)',
      severity: 'HIGH',
      flaggedDate: '15 Jul 2024',
      details: 'Dispenser delivered -25ml short per 5-liter test measure in 2 consecutive quarterly audits.',
    },
    {
      id: 'FLAG-2024-003',
      instrumentId: 'WM-DEL-02104',
      business: 'Dairy Supply Point',
      location: 'Subdivision 4, Delhi',
      type: 'Milk Measuring Machine',
      reason: 'Manufacturer Serial Mismatch',
      severity: 'MEDIUM',
      flaggedDate: '10 Sep 2024',
      details: 'Physical serial number does not match National Portal import batch authorization clearance.',
    },
  ]

  const filtered = flaggedList.filter((item) => {
    const q = searchTerm.toLowerCase()
    return (
      !q ||
      item.instrumentId.toLowerCase().includes(q) ||
      item.business.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flagged-instruments-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">LEGAL METROLOGY / ENFORCEMENT</p>
          <h1>Flagged Instruments & Tamper Alerts</h1>
          <p className="heading-copy">Instruments flagged for broken seals, short-delivery, or illegal modifications.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          style={{ background: '#dc2626' }}
          onClick={() => handleFeedback('Initiating legal enforcement notice creation wizard...')}
        >
          <ShieldAlert size={15} /> Issue Enforcement Notice
        </button>
      </section>

      {/* Warning Banner */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '18px 24px',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
        }}
      >
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#991b1b', fontWeight: 700 }}>
            Mandatory Seal Audit Required on {flaggedList.length} Flagged Devices
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7f1d1d' }}>
            Officers must physically inspect lead seals and record photographic proof before issuing re-verification clearance.
          </p>
        </div>
      </section>

      {/* Flagged Instruments Grid */}
      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">ENFORCEMENT REGISTER</p>
            <h2>Flagged Instruments ({filtered.length})</h2>
          </div>
          <span className="queue-count">{filtered.length} flagged</span>
        </div>

        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Instrument ID, establishment, or flag reason..."
            />
          </div>
        </div>

        <div className="table-wrap lmo-table-wrap">
          <table className="lmo-table">
            <thead>
              <tr>
                <th>FLAG ID</th>
                <th>INSTRUMENT ID</th>
                <th>ESTABLISHMENT</th>
                <th>FLAG REASON</th>
                <th>SEVERITY</th>
                <th>FLAGGED DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="app-id-cell">
                    <strong>{item.id}</strong>
                  </td>
                  <td><strong>{item.instrumentId}</strong><span>{item.type}</span></td>
                  <td>
                    <strong>{item.business}</strong>
                    <span>{item.location}</span>
                  </td>
                  <td>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{item.reason}</span>
                  </td>
                  <td>
                    <span className="priority-badge high">{item.severity}</span>
                  </td>
                  <td className="time-cell">{item.flaggedDate}</td>
                  <td className="action-cell">
                    <button
                      className="lmo-action-btn secondary"
                      type="button"
                      onClick={() => handleFeedback(`Viewing detailed tamper history for ${item.instrumentId}`)}
                    >
                      View Dossier
                    </button>
                    <button
                      className="lmo-action-btn primary"
                      type="button"
                      style={{ background: '#dc2626' }}
                      onClick={() => handleFeedback(`Initiated seizure report for ${item.instrumentId}`)}
                    >
                      Seize Device
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
