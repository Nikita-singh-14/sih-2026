import { BadgeCheck, ClipboardCheck, RefreshCw, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'

interface ReviewApplication {
  id: string
  applicationNo: string
  type: string
  status: string
  createdAt: string
  instrumentName: string | null
  location: string | null
  instrument: {
    platformId: string
    serialNumber: string
    type: string
    manufacturer: string
    model: string
    location: string
  }
  applicant: { name: string; jurisdiction: string | null }
}

export function VerificationReviewQueue() {
  const [applications, setApplications] = useState<ReviewApplication[]>([])
  const [selected, setSelected] = useState<ReviewApplication | null>(null)
  const [decision, setDecision] = useState<'PASSED' | 'FAILED'>('PASSED')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const loadQueue = async () => {
    setError('')
    try {
      setApplications(await apiRequest<ReviewApplication[]>('/review/applications'))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load review queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadQueue() }, [])

  const submitDecision = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    const fields = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')
    try {
      const result = await apiRequest<{ certificate: { certificateNo: string } | null }>(
        `/review/applications/${encodeURIComponent(selected.id)}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision,
            sealNumber: fields.get('sealNumber'),
            validityMonths: Number(fields.get('validityMonths')),
            reason: fields.get('reason'),
          }),
        }
      )
      setNotice(result.certificate ? `Certificate ${result.certificate.certificateNo} issued.` : 'Application returned for corrective action.')
      setSelected(null)
      await loadQueue()
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Unable to save review decision')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-view-fade verification-review">
      <section className="section-hero-bar">
        <div>
          <span className="panel-eyebrow">LEGAL METROLOGY REVIEW</span>
          <h2>Verification applications</h2>
          <p>Record the inspection decision. A passed instrument receives a QR-verifiable certificate.</p>
        </div>
        <button className="btn-secondary-light" type="button" onClick={() => void loadQueue()} aria-label="Refresh review queue">
          <RefreshCw size={16} /> Refresh
        </button>
      </section>
      {notice && <p className="verify-review-notice" role="status">{notice}</p>}
      {error && <p className="verify-review-error" role="alert">{error}</p>}
      {loading ? <p className="verify-review-empty">Loading applications...</p> : applications.length === 0 ? (
        <p className="verify-review-empty"><ClipboardCheck size={20} /> No applications are waiting for review.</p>
      ) : applications.map((application) => (
        <article className="verify-review-item" key={application.id}>
          <div className="verify-review-main">
            <span className="panel-eyebrow">{application.applicationNo} · {application.status}</span>
            <h3>{application.instrumentName || application.instrument.type}</h3>
            <p>{application.instrument.platformId} · Serial {application.instrument.serialNumber}</p>
            <p>{application.instrument.manufacturer} {application.instrument.model} · {application.location || application.instrument.location}</p>
          </div>
          <div className="verify-review-meta">
            <span>{application.applicant.name}</span>
            <span>{application.type} · {new Date(application.createdAt).toLocaleDateString()}</span>
            <button className="btn-primary-glow" type="button" onClick={() => { setSelected(application); setDecision('PASSED') }}>
              <BadgeCheck size={16} /> Review result
            </button>
          </div>
        </article>
      ))}
      {selected && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content-box" role="dialog" aria-modal="true" aria-labelledby="review-dialog-title">
            <div className="modal-header">
              <div><span className="panel-eyebrow">INSPECTION DECISION</span><h2 id="review-dialog-title">{selected.applicationNo}</h2></div>
              <button className="btn-close" type="button" aria-label="Close review" onClick={() => setSelected(null)}>×</button>
            </div>
            <p>{selected.instrument.type} · {selected.instrument.platformId} · Serial {selected.instrument.serialNumber}</p>
            <form onSubmit={submitDecision}>
              <label>
                Result
                <select value={decision} onChange={(event) => setDecision(event.target.value as 'PASSED' | 'FAILED')}>
                  <option value="PASSED">Passed verification</option>
                  <option value="FAILED">Requires corrective action</option>
                </select>
              </label>
              {decision === 'PASSED' && <>
                <label>Official seal number<input name="sealNumber" required minLength={3} placeholder="e.g. LM-SEAL-2026-0142" /></label>
                <label>Certificate validity (months)<input name="validityMonths" type="number" min="1" max="60" defaultValue="12" required /></label>
              </>}
              <label>Inspection notes<textarea name="reason" rows={3} placeholder={decision === 'PASSED' ? 'Optional verification notes' : 'Explain the corrective action required'} required={decision === 'FAILED'} /></label>
              {error && <p className="verify-review-error" role="alert">{error}</p>}
              <div className="modal-footer-actions">
                <button className="btn-secondary-light" type="button" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn-primary-glow" type="submit" disabled={submitting}>
                  {decision === 'PASSED' ? <BadgeCheck size={16} /> : <ShieldAlert size={16} />}
                  {submitting ? 'Saving...' : decision === 'PASSED' ? 'Issue certificate' : 'Return for correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}