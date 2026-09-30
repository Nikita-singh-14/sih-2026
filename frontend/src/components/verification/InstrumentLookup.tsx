import { ArrowLeft, BadgeCheck, Search, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'
import './InstrumentLookup.css'

interface PublicInstrument {
  instrumentId: string
  serialNumber: string
  type: string
  manufacturer: string
  model: string
  capacity: string | null
  location: string
  instrumentStatus: string
  lastVerified: string | null
  nextDue: string | null
  verificationStatus: string
  certificate: {
    certificateNo: string
    issuedDate: string
    expiryDate: string
    status: string
    issuedBy: string
    sealNumber: string
  } | null
}

export function InstrumentLookup() {
  const [identifier, setIdentifier] = useState('')
  const [results, setResults] = useState<PublicInstrument[]>([])
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ identifier: string; instrument?: PublicInstrument } | null>(null)
  const [reportCategory, setReportCategory] = useState<'CERTIFICATE_ISSUE' | 'SERIAL_MISMATCH'>('CERTIFICATE_ISSUE')
  const [reportError, setReportError] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportReceipt, setReportReceipt] = useState('')

  const search = async (value: string) => {
    const normalized = value.trim()
    if (!normalized) return
    setIdentifier(normalized)
    setError('')
    setLoading(true)
    setSearched(true)
    try {
      const result = await apiRequest<{ results: PublicInstrument[] }>(
        `/verification/lookup?identifier=${encodeURIComponent(normalized)}`
      )
      setResults(result.results)
    } catch (lookupError) {
      setResults([])
      setError(lookupError instanceof Error ? lookupError.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const certificate = new URLSearchParams(window.location.search).get('certificate')
    if (certificate) {
      setIdentifier(certificate)
      void search(certificate)
    }
  }, [])

  const submitComplaint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reportTarget) return
    const fields = new FormData(event.currentTarget)
    setReporting(true)
    setReportError('')
    try {
      const result = await apiRequest<{ complaint: { id: string } }>('/verification/complaints', {
        method: 'POST',
        body: JSON.stringify({
          category: reportCategory,
          searchedIdentifier: reportTarget.identifier,
          instrumentId: reportTarget.instrument?.instrumentId,
          certificateNo: reportTarget.instrument?.certificate?.certificateNo,
          reportedSerialNumber: fields.get('reportedSerialNumber'),
          reporterName: fields.get('reporterName'),
          reporterEmail: fields.get('reporterEmail'),
          description: fields.get('description'),
        }),
      })
      setReportReceipt(result.complaint.id.slice(0, 8).toUpperCase())
      setReportTarget(null)
    } catch (submitError) {
      setReportError(submitError instanceof Error ? submitError.message : 'Unable to submit the report')
    } finally {
      setReporting(false)
    }
  }

  return (
    <main className="verify-page">
      <header className="verify-topbar">
        <a href="/" aria-label="Return to MeasureSure"><ArrowLeft size={18} /> MeasureSure</a>
        <span>PUBLIC CERTIFICATE REGISTER</span>
      </header>
      <section className="verify-intro">
        <div className="verify-emblem"><ShieldCheck size={24} /></div>
        <p className="verify-kicker">LEGAL METROLOGY · AUTHENTICITY CHECK</p>
        <h1>Instrument verification</h1>
        <p>Check a certificate or instrument record using its certificate number, platform ID, or serial number.</p>
        <form className="verify-search" onSubmit={(event) => { event.preventDefault(); void search(identifier) }}>
          <Search size={19} />
          <input
            aria-label="Certificate number, platform ID, or serial number"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Enter certificate or serial number"
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Verify'}</button>
        </form>
      </section>
      <section className="verify-results" aria-live="polite">
        {error && <p className="verify-message verify-error" role="alert">{error}</p>}
        {!error && searched && !loading && results.length === 0 && (
          <div className="verify-message verify-no-match">
            <p>No registered instrument or certificate matched “{identifier}”. Check the number, or report a possible serial mismatch.</p>
            <button type="button" className="verify-report-button" onClick={() => { setReportReceipt(''); setReportTarget({ identifier }) }}>
              Report this problem
            </button>
          </div>
        )}
        {results.map((instrument) => {
          const valid = instrument.verificationStatus === 'VALID'
          return (
            <article className="verify-result" key={`${instrument.instrumentId}-${instrument.certificate?.certificateNo || 'none'}`}>
              <div className={`verify-result-status ${valid ? 'is-valid' : 'is-attention'}`}>
                {valid ? <BadgeCheck size={21} /> : <ShieldAlert size={21} />}
                <div>
                  <strong>{valid ? 'Certificate valid' : instrument.verificationStatus.replaceAll('_', ' ')}</strong>
                  <span>{instrument.certificate?.certificateNo || 'No certificate issued'}</span>
                </div>
              </div>
              <dl className="verify-facts">
                <div><dt>Instrument ID</dt><dd>{instrument.instrumentId}</dd></div>
                <div><dt>Serial number</dt><dd>{instrument.serialNumber}</dd></div>
                <div><dt>Instrument</dt><dd>{instrument.type}</dd></div>
                <div><dt>Manufacturer / model</dt><dd>{instrument.manufacturer} · {instrument.model}</dd></div>
                <div><dt>Capacity</dt><dd>{instrument.capacity || 'Not recorded'}</dd></div>
                <div><dt>Location</dt><dd>{instrument.location}</dd></div>
                <div><dt>Instrument status</dt><dd>{instrument.instrumentStatus}</dd></div>
                <div><dt>Security seal</dt><dd>{instrument.certificate?.sealNumber || 'Not issued'}</dd></div>
                <div><dt>Verified on</dt><dd>{instrument.certificate?.issuedDate || instrument.lastVerified || 'Not verified'}</dd></div>
                <div><dt>Valid until</dt><dd>{instrument.certificate?.expiryDate || instrument.nextDue || 'Not scheduled'}</dd></div>
                {instrument.certificate && <div><dt>Issuing officer</dt><dd>{instrument.certificate.issuedBy}</dd></div>}
              </dl>
              <p className="verify-disclaimer">This public check confirms the current registry record. It does not replace inspection of the physical instrument and seal.</p>
              <div className="verify-report-action">
                <span>Found an issue with this certificate or the instrument serial?</span>
                <button type="button" className="verify-report-button" onClick={() => { setReportReceipt(''); setReportTarget({ identifier, instrument }) }}>
                  Report a problem
                </button>
              </div>
            </article>
          )
        })}
        {reportReceipt && <p className="verify-message verify-report-success" role="status">Report received. Reference: {reportReceipt}. The Legal Metrology team will review it.</p>}
      </section>
      <footer className="verify-footer"><ShieldCheck size={15} /> MeasureSure · Legal Metrology verification register</footer>
      {reportTarget && (
        <div className="complaint-backdrop" role="presentation">
          <section className="complaint-modal" role="dialog" aria-modal="true" aria-labelledby="complaint-title">
            <header className="complaint-modal-header">
              <div><span className="verify-kicker">PUBLIC REPORT</span><h2 id="complaint-title">Report a certificate problem</h2></div>
              <button type="button" className="complaint-close" aria-label="Close report form" onClick={() => setReportTarget(null)}>×</button>
            </header>
            <p className="complaint-reference">Lookup reference: <strong>{reportTarget.identifier}</strong></p>
            <form className="complaint-form" onSubmit={submitComplaint}>
              <label>
                Problem type
                <select value={reportCategory} onChange={(event) => setReportCategory(event.target.value as typeof reportCategory)}>
                  <option value="CERTIFICATE_ISSUE">Certificate details or validity look incorrect</option>
                  <option value="SERIAL_MISMATCH">Serial number does not match the instrument</option>
                </select>
              </label>
              {reportCategory === 'SERIAL_MISMATCH' && <label>
                Serial number printed on the instrument
                <input name="reportedSerialNumber" required maxLength={120} defaultValue={reportTarget.instrument?.serialNumber || ''} />
              </label>}
              <label>
                What is wrong?
                <textarea name="description" required minLength={10} maxLength={2000} rows={4} placeholder="Describe the mismatch or certificate issue" />
              </label>
              <div className="complaint-form-contact">
                <label>Your name <input name="reporterName" maxLength={120} autoComplete="name" /></label>
                <label>Contact email <input name="reporterEmail" type="email" maxLength={254} autoComplete="email" /></label>
              </div>
              {reportError && <p className="verify-error" role="alert">{reportError}</p>}
              <div className="complaint-form-actions">
                <button type="button" className="complaint-cancel" onClick={() => setReportTarget(null)}>Cancel</button>
                <button type="submit" className="complaint-submit" disabled={reporting}>{reporting ? 'Submitting...' : 'Submit report'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}