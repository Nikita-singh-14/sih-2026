import { AlertTriangle, CheckCircle2, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'
import './CertificateComplaints.css'

type ComplaintStatus = 'New' | 'Under review' | 'Escalated' | 'Resolved'

interface Complaint {
  id: string
  category: 'CERTIFICATE_ISSUE' | 'SERIAL_MISMATCH'
  searchedIdentifier: string
  instrumentId: string | null
  certificateNo: string | null
  reportedSerialNumber: string | null
  reporterName: string | null
  reporterEmail: string | null
  description: string
  status: ComplaintStatus
  resolution: string | null
  createdAt: string
  updatedAt: string
}

export function CertificateComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setError('')
    try {
      const result = await apiRequest<{ complaints: Complaint[] }>('/complaints')
      setComplaints(result.complaints)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 15000)
    return () => window.clearInterval(timer)
  }, [])

  const filtered = complaints.filter((complaint) => {
    const needle = query.trim().toLowerCase()
    const matchesQuery = !needle || [
      complaint.searchedIdentifier,
      complaint.instrumentId || '',
      complaint.certificateNo || '',
      complaint.reportedSerialNumber || '',
      complaint.reporterName || '',
      complaint.reporterEmail || '',
      complaint.description,
    ].some((field) => field.toLowerCase().includes(needle))
    return matchesQuery && (statusFilter === 'All' || complaint.status === statusFilter)
  })

  const openCount = complaints.filter((complaint) => complaint.status !== 'Resolved').length

  return (
    <section className="complaint-workspace dashboard-view-fade">
      <header className="complaint-workspace-header">
        <div>
          <span className="panel-eyebrow">PUBLIC VERIFICATION REPORTS</span>
          <h2>Certificate & serial complaints</h2>
          <p>Review certificate concerns and reported serial-number mismatches.</p>
        </div>
        <button className="complaint-refresh" type="button" onClick={() => void refresh()} aria-label="Refresh complaints">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="complaint-summary-row">
        <span><strong>{complaints.length}</strong> total reports</span>
        <span><strong>{openCount}</strong> open reports</span>
      </div>

      <div className="complaint-filters">
        <label className="complaint-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, serial, contact, or details" /></label>
        <select aria-label="Filter reports by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All statuses</option>
          <option value="New">New</option>
          <option value="Under review">Under review</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {error && <p className="complaint-alert" role="alert">{error}</p>}
      {loading ? <p className="complaint-empty">Loading reports...</p> : filtered.length === 0 ? (
        <p className="complaint-empty"><CheckCircle2 size={19} /> No reports match these filters.</p>
      ) : <div className="complaint-list">
        {filtered.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} onSaved={refresh} />)}
      </div>}
    </section>
  )
}

function ComplaintCard({ complaint, onSaved }: { complaint: Complaint; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status)
  const [notes, setNotes] = useState(complaint.resolution || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submitUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiRequest(`/complaints/${encodeURIComponent(complaint.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      })
      await onSaved()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update report')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="complaint-card">
      <div className="complaint-card-heading">
        <div>
          <span className={`complaint-type-tag ${complaint.category === 'SERIAL_MISMATCH' ? 'is-mismatch' : ''}`}>
            <AlertTriangle size={13} /> {complaint.category === 'SERIAL_MISMATCH' ? 'Serial mismatch' : 'Certificate issue'}
          </span>
          <h3>Lookup: {complaint.searchedIdentifier}</h3>
        </div>
        <span className={`complaint-status-tag status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
      </div>
      <div className="complaint-reference-grid">
        {complaint.certificateNo && <div><small>Certificate</small><strong>{complaint.certificateNo}</strong></div>}
        {complaint.instrumentId && <div><small>Instrument ID</small><strong>{complaint.instrumentId}</strong></div>}
        {complaint.reportedSerialNumber && <div><small>Serial on instrument</small><strong>{complaint.reportedSerialNumber}</strong></div>}
        <div><small>Submitted</small><strong>{new Date(complaint.createdAt).toLocaleString()}</strong></div>
      </div>
      <p className="complaint-description">{complaint.description}</p>
      <p className="complaint-contact">{complaint.reporterName || 'Anonymous'}{complaint.reporterEmail ? ` · ${complaint.reporterEmail}` : ''}</p>
      <form className="complaint-triage-form" onSubmit={submitUpdate}>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ComplaintStatus)}>
          <option>New</option><option>Under review</option><option>Escalated</option><option>Resolved</option>
        </select></label>
        <label className="complaint-notes-field">Triage / resolution note<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a note for the audit trail" required={status === 'Resolved'} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save update'}</button>
      </form>
      {error && <p className="complaint-alert" role="alert">{error}</p>}
    </article>
  )
}