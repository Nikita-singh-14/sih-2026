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
          <p className="verify-message">No registered instrument or certificate matched “{identifier}”. Check the number and try again.</p>
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
            </article>
          )
        })}
      </section>
      <footer className="verify-footer"><ShieldCheck size={15} /> MeasureSure · Legal Metrology verification register</footer>
    </main>
  )
}