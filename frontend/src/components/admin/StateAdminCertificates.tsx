import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Flag,
  Gauge,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import type { AdminCertificate, CertificateStatus } from '../../features/admin/adminTypes'
import { CertificateDetailModal } from './CertificateDetailModal'

interface StateAdminCertificatesProps {
  certificates: AdminCertificate[]
  initialStatusFilter?: string
  onVerifyCertificate: (id: string) => void
  onFlagCertificate: (id: string, reason: string) => void
  onNavigateToInstruments: (instrumentId?: string) => void
}

export const StateAdminCertificates: React.FC<StateAdminCertificatesProps> = ({
  certificates,
  initialStatusFilter = 'All',
  onVerifyCertificate,
  onFlagCertificate,
  onNavigateToInstruments,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [districtFilter, setDistrictFilter] = useState<string>('All')
  const [selectedCert, setSelectedCert] = useState<AdminCertificate | null>(null)
  const [modalTab, setModalTab] = useState<'details' | 'history' | 'preview'>('details')

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    return {
      total: certificates.length,
      active: certificates.filter((c) => c.status === 'Active').length,
      expiring: certificates.filter((c) => c.status === 'Expiring Soon').length,
      expired: certificates.filter((c) => c.status === 'Expired').length,
      flagged: certificates.filter((c) => c.isFlagged || c.status === 'Flagged').length,
    }
  }, [certificates])

  // Filtered Certificates List
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [cert.certNo, cert.id, cert.instrumentId, cert.applicant, cert.location].some((val) =>
          val.toLowerCase().includes(q)
        )

      const matchesStatus =
        statusFilter === 'All' ||
        cert.status === statusFilter ||
        (statusFilter === 'Flagged' && cert.isFlagged)

      const matchesType = typeFilter === 'All' || cert.instrumentType === typeFilter
      const matchesDistrict = districtFilter === 'All' || cert.district === districtFilter

      return matchesSearch && matchesStatus && matchesType && matchesDistrict
    })
  }, [certificates, searchTerm, statusFilter, typeFilter, districtFilter])

  const openModal = (cert: AdminCertificate, tab: 'details' | 'history' | 'preview' = 'details') => {
    setSelectedCert(cert)
    setModalTab(tab)
  }

  const renderStatusBadge = (status: CertificateStatus, isFlagged?: boolean) => {
    if (isFlagged) {
      return <span className="status-badge awaiting-documents"><Flag size={11} /> Flagged</span>
    }
    switch (status) {
      case 'Active':
        return <span className="status-badge verified"><CheckCircle2 size={11} /> Active</span>
      case 'Expiring Soon':
        return <span className="status-badge under-review"><Clock size={11} /> Expiring Soon</span>
      case 'Expired':
        return <span className="status-badge awaiting-documents"><XCircle size={11} /> Expired</span>
      default:
        return <span className="status-badge under-review">{status}</span>
    }
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO TITLE */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE CERTIFICATE REGISTER</span>
          <h2>Legal Metrology Certificate Management</h2>
          <p>Monitor, verify authenticity, track renewals, and audit official verification stamping certificates across state districts.</p>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="kpi-cards-grid-6">
        <button
          type="button"
          className={`kpi-card-interactive ${statusFilter === 'All' ? 'active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <span className="kpi-label">Total Certificates</span>
          <strong className="kpi-val">{metrics.total}</strong>
          <small>Registered records</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-green ${statusFilter === 'Active' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Active')}
        >
          <span className="kpi-label">Active Valid</span>
          <strong className="kpi-val text-green">{metrics.active}</strong>
          <small>Compliant certificates</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-amber ${statusFilter === 'Expiring Soon' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Expiring Soon')}
        >
          <span className="kpi-label">Expiring Soon</span>
          <strong className="kpi-val text-amber">{metrics.expiring}</strong>
          <small>Renewals due</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Expired' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Expired')}
        >
          <span className="kpi-label">Expired</span>
          <strong className="kpi-val text-red">{metrics.expired}</strong>
          <small>Require re-stamping</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Flagged' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Flagged')}
        >
          <span className="kpi-label">Flagged</span>
          <strong className="kpi-val text-red">{metrics.flagged}</strong>
          <small>Discrepancies reported</small>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">CERTIFICATE REGISTER</span>
            <h2>Certificate Register ({filteredCertificates.length} records)</h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Certificate No, Instrument ID, Applicant..."
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Valid</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Flagged">Flagged</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Instrument Types</option>
            <option value="Heavy Weighbridge 60T">Heavy Weighbridge 60T</option>
            <option value="Platform Scale 500kg">Platform Scale 500kg</option>
            <option value="Fuel Dispenser Unit 4-Hose">Fuel Dispenser Unit</option>
            <option value="Retail Counter Scale 15kg">Retail Counter Scale</option>
            <option value="Storage Tank Gauging System">Tank Gauging System</option>
          </select>

          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="All">All Districts</option>
            <option value="South Delhi">South Delhi</option>
            <option value="North Delhi">North Delhi</option>
            <option value="North West Delhi">North West Delhi</option>
            <option value="Central Delhi">Central Delhi</option>
            <option value="South West Delhi">South West Delhi</option>
          </select>
        </div>

        {/* MAIN CERTIFICATES TABLE */}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Certificate ID / No</th>
                <th>Instrument ID</th>
                <th>Applicant / Business</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Issued By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id}>
                    <td>
                      <strong>{cert.certNo}</strong>
                      <small className="cell-sub">{cert.id}</small>
                    </td>
                    <td>
                      <strong>{cert.instrumentId}</strong>
                      <span className="cell-sub">{cert.instrumentType}</span>
                    </td>
                    <td>
                      <strong>{cert.applicant}</strong>
                      <small className="cell-sub">{cert.location}</small>
                    </td>
                    <td>{cert.issuedDate}</td>
                    <td>
                      <strong className={cert.status === 'Expiring Soon' ? 'text-amber' : cert.status === 'Expired' ? 'text-red' : ''}>
                        {cert.expiryDate}
                      </strong>
                    </td>
                    <td>{cert.issuedBy}</td>
                    <td>{renderStatusBadge(cert.status, cert.isFlagged)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          title="View Certificate Details"
                          onClick={() => openModal(cert, 'details')}
                        >
                          <Eye size={13} /> View
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          title="Verify Certificate Authenticity"
                          onClick={() => onVerifyCertificate(cert.id)}
                        >
                          <CheckCircle2 size={13} /> {cert.isVerified ? 'Verified' : 'Verify'}
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-cert"
                          title="View Instrument Record"
                          onClick={() => onNavigateToInstruments(cert.instrumentId)}
                        >
                          <Gauge size={13} /> Instrument
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-assign"
                          title="View Audit History Log"
                          onClick={() => openModal(cert, 'history')}
                        >
                          <Clock size={13} /> History
                        </button>

                        <button
                          type="button"
                          className={`btn-action-sm ${cert.isFlagged ? 'btn-flag-active' : 'btn-flag'}`}
                          title="Flag Certificate"
                          onClick={() => {
                            if (cert.isFlagged) {
                              onFlagCertificate(cert.id, '')
                            } else {
                              openModal(cert, 'details')
                            }
                          }}
                        >
                          <Flag size={13} /> {cert.isFlagged ? 'Flagged' : 'Flag'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No certificate records match your selected search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedCert && (
        <CertificateDetailModal
          certificate={selectedCert}
          initialTab={modalTab}
          onClose={() => setSelectedCert(null)}
          onVerifyCertificate={onVerifyCertificate}
          onFlagCertificate={onFlagCertificate}
          onViewInstrument={onNavigateToInstruments}
        />
      )}
    </div>
  )
}
