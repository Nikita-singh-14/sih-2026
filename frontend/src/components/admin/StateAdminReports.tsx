import React, { useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type {
  AdminApplication,
  AdminCertificate,
  AdminFieldInspection,
  AdminInstrument,
  AdminOfficer,
  ReportCategory,
} from '../../features/admin/adminTypes'

interface StateAdminReportsProps {
  applications: AdminApplication[]
  instruments: AdminInstrument[]
  certificates: AdminCertificate[]
  inspections: AdminFieldInspection[]
  officers: AdminOfficer[]
  jurisdictionState: string
}

export const StateAdminReports: React.FC<StateAdminReportsProps> = ({
  applications,
  instruments,
  certificates,
  inspections,
  officers,
  jurisdictionState,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('Application Report')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [officerFilter, setOfficerFilter] = useState('All')
  const [instrumentTypeFilter, setInstrumentTypeFilter] = useState('All')
  const [isGenerated, setIsGenerated] = useState(true)
  const [generatedTime, setGeneratedTime] = useState<string>(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  )

  const handleGenerateReport = () => {
    setIsGenerated(true)
    setGeneratedTime(
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    )
  }

  // Filter Data according to active Category & Filters
  const reportData = useMemo(() => {
    switch (selectedCategory) {
      case 'Application Report':
      case 'Pending Cases Report':
        return applications.filter((app) => {
          const matchDistrict = districtFilter === 'All' || app.district === districtFilter
          const matchStatus = statusFilter === 'All' || app.status === statusFilter
          const matchOfficer = officerFilter === 'All' || app.assignedOfficer === officerFilter
          const matchPendingOnly = selectedCategory === 'Pending Cases Report' ? (app.status === 'Pending Review' || app.status === 'Under Review') : true
          return matchDistrict && matchStatus && matchOfficer && matchPendingOnly
        })

      case 'Instrument Verification Report':
        return instruments.filter((inst) => {
          const matchDistrict = districtFilter === 'All' || inst.district === districtFilter
          const matchStatus = statusFilter === 'All' || inst.status === statusFilter
          const matchType = instrumentTypeFilter === 'All' || inst.type === instrumentTypeFilter
          return matchDistrict && matchStatus && matchType
        })

      case 'Inspection Report':
        return inspections.filter((insp) => {
          const matchDistrict = districtFilter === 'All' || insp.district === districtFilter
          const matchStatus = statusFilter === 'All' || insp.status === statusFilter
          const matchOfficer = officerFilter === 'All' || insp.lmoOfficer === officerFilter
          return matchDistrict && matchStatus && matchOfficer
        })

      case 'Certificate Report':
      case 'Expiring Certificates Report':
        return certificates.filter((cert) => {
          const matchDistrict = districtFilter === 'All' || cert.district === districtFilter
          const matchStatus = statusFilter === 'All' || cert.status === statusFilter
          const matchType = instrumentTypeFilter === 'All' || cert.instrumentType === instrumentTypeFilter
          const matchExpiringOnly = selectedCategory === 'Expiring Certificates Report' ? (cert.status === 'Expiring Soon' || cert.status === 'Expired') : true
          return matchDistrict && matchStatus && matchType && matchExpiringOnly
        })

      case 'Officer Activity Report':
        return officers.filter((off) => {
          const matchDistrict = districtFilter === 'All' || off.district === districtFilter
          return matchDistrict
        })

      default:
        return []
    }
  }, [selectedCategory, applications, instruments, certificates, inspections, officers, districtFilter, statusFilter, officerFilter, instrumentTypeFilter])

  const handleExportCSV = () => {
    const csvHeader = 'Report Category,Generated At,State,Total Records\n'
    const csvContent = `${selectedCategory},"${generatedTime}",${jurisdictionState},${reportData.length}\n`
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedCategory.replaceAll(' ', '_')}_${jurisdictionState}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-management-workspace dashboard-view-fade">
      {/* HERO HEADER */}
      <div className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">STATEWIDE METROLOGY ANALYTICS & GOVERNANCE</span>
          <h2>Legal Metrology Report Workspace ({jurisdictionState.toUpperCase()})</h2>
          <p>Generate, filter, preview, and export official administrative governance and audit compliance reports.</p>
        </div>
        <div className="table-action-btns">
          <button type="button" className="primary-button" onClick={handleGenerateReport}>
            <RefreshCw size={15} /> Generate Report
          </button>
          <button type="button" className="btn-admin-inspect" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV / PDF
          </button>
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="kpi-cards-grid-7">
        {[
          'Application Report',
          'Instrument Verification Report',
          'Inspection Report',
          'Certificate Report',
          'Officer Activity Report',
          'Pending Cases Report',
          'Expiring Certificates Report',
        ].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`kpi-card-interactive ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat as ReportCategory)}
          >
            <span className="kpi-label">{cat.replace(' Report', '')}</span>
            <strong className="kpi-val" style={{ fontSize: 16 }}>{cat.split(' ')[0]}</strong>
            <small>Click to select</small>
          </button>
        ))}
      </div>

      {/* FILTER CONTROLS */}
      <div className="workspace-panel panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">REPORT CONFIGURATION & FILTERS</span>
            <h2>{selectedCategory} Parameters</h2>
          </div>
        </div>

        <div className="filter-toolbar-grid">
          <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="Today">Date Range: Today</option>
            <option value="Last 7 Days">Date Range: Last 7 Days</option>
            <option value="Last 30 Days">Date Range: Last 30 Days</option>
            <option value="This Quarter">Date Range: This Quarter</option>
            <option value="Financial Year 2024-25">FY 2024-25</option>
          </select>

          <select className="filter-select" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="All">All District Locations</option>
            <option value="South Delhi">South Delhi</option>
            <option value="North Delhi">North Delhi</option>
            <option value="North West Delhi">North West Delhi</option>
            <option value="Central Delhi">Central Delhi</option>
            <option value="South West Delhi">South West Delhi</option>
          </select>

          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Approved">Approved / Verified / Active</option>
            <option value="Pending Review">Pending Review / Scheduled</option>
            <option value="Rejected">Rejected / Expired</option>
            <option value="Returned for Correction">Returned</option>
          </select>

          <select className="filter-select" value={officerFilter} onChange={(e) => setOfficerFilter(e.target.value)}>
            <option value="All">All Field Officers</option>
            {officers.map((off) => (
              <option key={off.id} value={off.name}>{off.name}</option>
            ))}
          </select>

          <select className="filter-select" value={instrumentTypeFilter} onChange={(e) => setInstrumentTypeFilter(e.target.value)}>
            <option value="All">All Instrument Categories</option>
            <option value="Heavy Weighbridge 60T">Heavy Weighbridge 60T</option>
            <option value="Platform Scale 500kg">Platform Scale 500kg</option>
            <option value="Fuel Dispenser Unit 4-Hose">Fuel Dispenser Unit</option>
            <option value="Retail Counter Scale 15kg">Retail Counter Scale</option>
          </select>
        </div>

        {/* REPORT SUMMARY HEADER */}
        {isGenerated && (
          <div className="report-display-container" style={{ padding: 24 }}>
            <div className="report-meta-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '2px solid #e2e8f0' }}>
              <div>
                <span className="panel-eyebrow">STATE ADMINISTRATOR OFFICIAL REPORT SHEET</span>
                <h3 style={{ margin: '4px 0', fontSize: 18, fontWeight: 700, color: '#143141' }}>
                  {selectedCategory} — State of {jurisdictionState}
                </h3>
                <small style={{ color: '#64748b' }}>
                  Generated at: <strong>{generatedTime}</strong> · Range: <strong>{dateRange}</strong> · Total Records: <strong className="text-teal">{reportData.length}</strong>
                </small>
              </div>
              <div className="table-action-btns">
                <button type="button" className="btn-action-sm btn-view" onClick={() => window.print()}>
                  <Printer size={14} /> Print Report
                </button>
                <button type="button" className="btn-action-sm btn-cert" onClick={handleExportCSV}>
                  <Download size={14} /> Download CSV Data
                </button>
              </div>
            </div>

            {/* REPORT TABLE DISPLAY */}
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Category / Entity</th>
                    <th>Location / District</th>
                    <th>Primary Party</th>
                    <th>Officer / Assigned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((item: any, index: number) => (
                      <tr key={item.id || index}>
                        <td><strong>{item.id || item.certNo || item.employeeId}</strong></td>
                        <td>{item.type || item.instrumentType || item.instrument || item.organization || item.gatcName || 'Legal Metrology Unit'}</td>
                        <td>{item.location || item.district}</td>
                        <td>{item.applicant || item.owner || item.name}</td>
                        <td>{item.assignedOfficer || item.issuedBy || item.lmoOfficer || item.name || 'Assigned Officer'}</td>
                        <td>
                          <span className="status-badge verified">
                            {item.status || 'Verified'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty-state">No report records match the specified filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
