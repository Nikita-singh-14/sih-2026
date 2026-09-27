import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Flag,
  Gauge,
  Search,
  UserCheck,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { AdminInstrument, AdminInstrumentStatus, AdminOfficer } from '../../features/admin/adminTypes'
import { InstrumentDetailModal } from './InstrumentDetailModal'

interface StateAdminInstrumentsProps {
  instruments: AdminInstrument[]
  officers: AdminOfficer[]
  initialStatusFilter?: string
  onAssignLmo: (id: string, lmoName: string) => void
  onMarkInspection: (id: string, notes?: string) => void
  onFlagInstrument: (id: string, reason: string) => void
}

export const StateAdminInstruments: React.FC<StateAdminInstrumentsProps> = ({
  instruments,
  officers,
  initialStatusFilter = 'All',
  onAssignLmo,
  onMarkInspection,
  onFlagInstrument,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [districtFilter, setDistrictFilter] = useState<string>('All')
  const [officerFilter, setOfficerFilter] = useState<string>('All')
  const [selectedInst, setSelectedInst] = useState<AdminInstrument | null>(null)
  const [modalTab, setModalTab] = useState<'details' | 'history' | 'certificate'>('details')

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    return {
      total: instruments.length,
      active: instruments.filter((i) => i.status === 'Active').length,
      expiring: instruments.filter((i) => i.status === 'Expiring Soon').length,
      expired: instruments.filter((i) => i.status === 'Expired').length,
      flagged: instruments.filter((i) => i.isFlagged || i.status === 'Flagged').length,
      pending: instruments.filter((i) => i.status === 'Pending Verification').length,
    }
  }, [instruments])

  // Filtered Instruments List
  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        [inst.id, inst.type, inst.serialNumber, inst.manufacturer, inst.owner, inst.location].some((val) =>
          val.toLowerCase().includes(q)
        )

      const matchesStatus =
        statusFilter === 'All' ||
        inst.status === statusFilter ||
        (statusFilter === 'Flagged' && inst.isFlagged)

      const matchesType = typeFilter === 'All' || inst.type === typeFilter
      const matchesDistrict = districtFilter === 'All' || inst.district === districtFilter
      const matchesOfficer =
        officerFilter === 'All' ||
        (officerFilter === 'Unassigned' && (!inst.assignedLmo || inst.assignedLmo.includes('Unassigned'))) ||
        inst.assignedLmo === officerFilter

      return matchesSearch && matchesStatus && matchesType && matchesDistrict && matchesOfficer
    })
  }, [instruments, searchTerm, statusFilter, typeFilter, districtFilter, officerFilter])

  const openModal = (inst: AdminInstrument, tab: 'details' | 'history' | 'certificate' = 'details') => {
    setSelectedInst(inst)
    setModalTab(tab)
  }

  const renderStatusBadge = (status: AdminInstrumentStatus, isFlagged?: boolean) => {
    if (isFlagged) {
      return <span className="status-badge awaiting-documents"><Flag size={11} /> Flagged</span>
    }
    switch (status) {
      case 'Active':
        return <span className="status-badge verified"><CheckCircle2 size={11} /> Active & Stamped</span>
      case 'Expiring Soon':
        return <span className="status-badge under-review"><Clock size={11} /> Expiring Soon</span>
      case 'Expired':
        return <span className="status-badge awaiting-documents"><XCircle size={11} /> Expired</span>
      case 'Pending Verification':
        return <span className="status-badge scheduled"><Clock size={11} /> Pending Verification</span>
      default:
        return <span className="status-badge under-review">{status}</span>
    }
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO TITLE */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE INSTRUMENT REGISTRY & COMPLIANCE</span>
          <h2>Legal Metrology Instrument Management</h2>
          <p>Monitor, inspect, flag, reassign officers, and audit existing weighing & measuring instruments registered in the state.</p>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="kpi-cards-grid-6">
        <button
          type="button"
          className={`kpi-card-interactive ${statusFilter === 'All' ? 'active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <span className="kpi-label">Registered Fleet</span>
          <strong className="kpi-val">{metrics.total}</strong>
          <small>Total active units</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-green ${statusFilter === 'Active' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Active')}
        >
          <span className="kpi-label">Active & Stamped</span>
          <strong className="kpi-val text-green">{metrics.active}</strong>
          <small>Compliant units</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-amber ${statusFilter === 'Expiring Soon' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Expiring Soon')}
        >
          <span className="kpi-label">Expiring in 30 Days</span>
          <strong className="kpi-val text-amber">{metrics.expiring}</strong>
          <small>Renewal due</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Expired' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Expired')}
        >
          <span className="kpi-label">Expired Stamping</span>
          <strong className="kpi-val text-red">{metrics.expired}</strong>
          <small>Overdue inspection</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-red ${statusFilter === 'Flagged' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Flagged')}
        >
          <span className="kpi-label">Flagged / Complaints</span>
          <strong className="kpi-val text-red">{metrics.flagged}</strong>
          <small>Alerted units</small>
        </button>

        <button
          type="button"
          className={`kpi-card-interactive kpi-blue ${statusFilter === 'Pending Verification' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending Verification')}
        >
          <span className="kpi-label">Pending Verification</span>
          <strong className="kpi-val text-blue">{metrics.pending}</strong>
          <small>Verification in progress</small>
        </button>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">INSTRUMENT REGISTRY</span>
            <h2>Instrument Registry ({filteredInstruments.length} units)</h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <div className="search-field">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Instrument ID, Serial No, Owner, Location..."
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Verification Statuses</option>
            <option value="Active">Active & Stamped</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Flagged">Flagged Units</option>
            <option value="Pending Verification">Pending Verification</option>
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
            <option value="Jewellery High Precision Scale">Jewellery Precision Scale</option>
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

          <select
            className="filter-select"
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
          >
            <option value="All">All Assigned LMOs</option>
            {officers.map((off) => (
              <option key={off.id} value={off.name}>{off.name}</option>
            ))}
          </select>
        </div>

        {/* MAIN INSTRUMENTS TABLE */}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Instrument ID</th>
                <th>Instrument Category & Make</th>
                <th>Applicant / Business (Owner)</th>
                <th>Location / District</th>
                <th>Last Verified</th>
                <th>Next Due Date</th>
                <th>Assigned LMO</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.length > 0 ? (
                filteredInstruments.map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <strong>{inst.id}</strong>
                      <small className="cell-sub">SN: {inst.serialNumber}</small>
                    </td>
                    <td>
                      <strong>{inst.type}</strong>
                      <span className="cell-sub">{inst.manufacturer} {inst.model}</span>
                    </td>
                    <td>
                      <strong>{inst.owner}</strong>
                      <small className="cell-sub">{inst.ownerGstin || 'Registered Business'}</small>
                    </td>
                    <td>
                      <span>{inst.location}</span>
                      <small className="cell-sub">{inst.district}</small>
                    </td>
                    <td>{inst.lastVerification}</td>
                    <td>
                      <strong className={inst.status === 'Expiring Soon' ? 'text-amber' : inst.status === 'Expired' ? 'text-red' : ''}>
                        {inst.nextDue}
                      </strong>
                    </td>
                    <td>
                      {inst.assignedLmo ? (
                        <span className="officer-name-tag"><UserCheck size={12} /> {inst.assignedLmo}</span>
                      ) : (
                        <span className="unassigned-name-tag"><AlertCircle size={12} /> Unassigned</span>
                      )}
                    </td>
                    <td>{renderStatusBadge(inst.status, inst.isFlagged)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-btns">
                        <button
                          type="button"
                          className="btn-action-sm btn-view"
                          title="View Specs & Owner"
                          onClick={() => openModal(inst, 'details')}
                        >
                          <Eye size={13} /> View
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-review"
                          title="View Verification History"
                          onClick={() => openModal(inst, 'history')}
                        >
                          <Clock size={13} /> History
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-cert"
                          title="View Stamping Certificate"
                          onClick={() => openModal(inst, 'certificate')}
                        >
                          <FileCheck2 size={13} /> Certificate
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-assign"
                          title="Assign LMO"
                          onClick={() => openModal(inst, 'details')}
                        >
                          <UserCheck size={13} /> LMO
                        </button>

                        <button
                          type="button"
                          className="btn-action-sm btn-inspect"
                          title="Mark for Field Inspection"
                          onClick={() => {
                            onMarkInspection(inst.id, 'Marked for priority field inspection by State Admin')
                          }}
                        >
                          <Wrench size={13} /> Inspect
                        </button>

                        <button
                          type="button"
                          className={`btn-action-sm ${inst.isFlagged ? 'btn-flag-active' : 'btn-flag'}`}
                          title="Flag Instrument"
                          onClick={() => {
                            if (inst.isFlagged) {
                              onFlagInstrument(inst.id, '')
                            } else {
                              openModal(inst, 'details')
                            }
                          }}
                        >
                          <Flag size={13} /> {inst.isFlagged ? 'Flagged' : 'Flag'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No instruments match your selected search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedInst && (
        <InstrumentDetailModal
          instrument={selectedInst}
          officers={officers}
          initialTab={modalTab}
          onClose={() => setSelectedInst(null)}
          onAssignLmo={onAssignLmo}
          onMarkInspection={onMarkInspection}
          onFlagInstrument={onFlagInstrument}
        />
      )}
    </div>
  )
}
