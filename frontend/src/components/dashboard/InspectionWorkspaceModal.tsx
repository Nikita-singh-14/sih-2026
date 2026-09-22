import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileText,
  History,
  MapPin,
  PenTool,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Upload,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import type { InspectionWorkspaceData, LmoAssignment } from '../../types'
import { getMockWorkspaceData } from '../../features/lmo/data'

interface InspectionWorkspaceModalProps {
  assignment: LmoAssignment
  onClose: () => void
  onSaveOffline: (data: InspectionWorkspaceData) => void
  onSubmitInspection: (data: InspectionWorkspaceData) => void
}

export function InspectionWorkspaceModal({
  assignment,
  onClose,
  onSaveOffline,
  onSubmitInspection,
}: InspectionWorkspaceModalProps) {
  const [data, setData] = useState<InspectionWorkspaceData>(() => getMockWorkspaceData(assignment))
  const [activeTab, setActiveTab] = useState<'details' | 'testing' | 'media' | 'decision'>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingOffline, setIsSavingOffline] = useState(false)
  const [gpsRefreshing, setGpsRefreshing] = useState(false)
  const [officerSigType, setOfficerSigType] = useState<'typed' | 'drawn'>('drawn')

  // Signature canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0c8d83'
  }, [activeTab])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.beginPath()
    setData((prev) => ({ ...prev, officerSignature: canvas.toDataURL() }))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setData((prev) => ({ ...prev, officerSignature: undefined }))
  }

  // Handle Checklist item toggle
  const toggleChecklist = (id: string) => {
    setData((prev) => ({
      ...prev,
      testChecklist: prev.testChecklist.map((item) =>
        item.id === id ? { ...item, passed: !item.passed } : item
      ),
    }))
  }

  // Handle Reading Entry update
  const updateReading = (id: string, field: 'instrumentReadingKg', val: number) => {
    setData((prev) => ({
      ...prev,
      readings: prev.readings.map((r) => {
        if (r.id !== id) return r
        const errorKg = Math.abs(Number((val - r.loadAppliedKg).toFixed(4)))
        const passed = errorKg <= r.maxPermissibleErrorKg
        return { ...r, instrumentReadingKg: val, errorKg, passed }
      }),
    }))
  }

  // Handle Refresh GPS
  const handleRefreshGps = () => {
    setGpsRefreshing(true)
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        gpsCapture: {
          lat: 28.5356,
          lng: 77.2614,
          accuracyMeters: 2.5,
          timestamp: new Date().toLocaleString(),
        },
      }))
      setGpsRefreshing(false)
    }, 800)
  }

  // Save Offline Action
  const handleSaveOffline = () => {
    setIsSavingOffline(true)
    setTimeout(() => {
      setIsSavingOffline(false)
      onSaveOffline(data)
    }, 600)
  }

  // Submit Action
  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSubmitInspection(data)
    }, 1000)
  }

  // Calculate overall tolerance status
  const allReadingsPassed = data.readings.every((r) => r.passed)

  return (
    <div className="modal-backdrop inspection-workspace-backdrop" role="presentation">
      <div className="modal inspection-workspace-modal" role="dialog" aria-modal="true">
        {/* Workspace Header */}
        <div className="workspace-header">
          <div className="workspace-title-group">
            <div className="workspace-badge">
              <ShieldCheck size={18} />
              <span>FIELD VERIFICATION WORKSPACE</span>
            </div>
            <h2>
              Inspection: {data.applicationDetails.applicationNo} – {data.businessDetails.name}
            </h2>
            <p>
              {data.instrumentSpecs.type} · Serial {data.instrumentSpecs.serialNumber} · {data.applicationDetails.jurisdiction}
            </p>
          </div>
          <button className="icon-button close-workspace-btn" type="button" aria-label="Close workspace" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="workspace-tabs">
          <button
            type="button"
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            1. Overview & Details
          </button>
          <button
            type="button"
            className={activeTab === 'testing' ? 'active' : ''}
            onClick={() => setActiveTab('testing')}
          >
            2. Testing & Readings {!allReadingsPassed && <span className="warning-dot">!</span>}
          </button>
          <button
            type="button"
            className={activeTab === 'media' ? 'active' : ''}
            onClick={() => setActiveTab('media')}
          >
            3. Photos & Evidence
          </button>
          <button
            type="button"
            className={activeTab === 'decision' ? 'active' : ''}
            onClick={() => setActiveTab('decision')}
          >
            4. Decision & Sign
          </button>
        </div>

        {/* Workspace Body Content */}
        <div className="workspace-body">
          {/* TAB 1: OVERVIEW & DETAILS (Sections 1-5) */}
          {activeTab === 'details' && (
            <div className="workspace-tab-content">
              {/* High Risk Alert Banner inside workspace if present */}
              {assignment.riskFactors && assignment.riskFactors.length > 0 && (
                <div className="workspace-alert-box">
                  <ShieldAlert size={20} color="#dc2626" />
                  <div>
                    <strong>HIGH-RISK INSTRUMENT DETECTED</strong>
                    <p>{assignment.riskFactors.map((r) => r.detail).join(' ')}</p>
                  </div>
                </div>
              )}

              <div className="workspace-grid-2col">
                {/* 1. Application Details */}
                <div className="workspace-card">
                  <div className="card-heading">
                    <FileText size={16} />
                    <h3>1. Application Details</h3>
                  </div>
                  <dl className="details-list">
                    <div>
                      <dt>Application No</dt>
                      <dd>
                        <strong>{data.applicationDetails.applicationNo}</strong>
                      </dd>
                    </div>
                    <div>
                      <dt>Submission Date</dt>
                      <dd>{data.applicationDetails.submittedDate}</dd>
                    </div>
                    <div>
                      <dt>Verification Type</dt>
                      <dd>
                        <span className="type-tag">{data.applicationDetails.type}</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Assigned Officer</dt>
                      <dd>{data.applicationDetails.officerAssigned}</dd>
                    </div>
                    <div>
                      <dt>Fee Payment</dt>
                      <dd className="paid-tag">{data.applicationDetails.feeStatus}</dd>
                    </div>
                  </dl>
                </div>

                {/* 2. Business Details */}
                <div className="workspace-card">
                  <div className="card-heading">
                    <UserCheck size={16} />
                    <h3>2. Business & Owner Details</h3>
                  </div>
                  <dl className="details-list">
                    <div>
                      <dt>Business Name</dt>
                      <dd>
                        <strong>{data.businessDetails.name}</strong>
                      </dd>
                    </div>
                    <div>
                      <dt>GSTIN / License</dt>
                      <dd>
                        {data.businessDetails.gstin} · {data.businessDetails.licenseNo}
                      </dd>
                    </div>
                    <div>
                      <dt>Contact Person</dt>
                      <dd>{data.businessDetails.contactPerson}</dd>
                    </div>
                    <div>
                      <dt>Phone & Email</dt>
                      <dd>
                        {data.businessDetails.phone} · {data.businessDetails.email}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 3. Instrument Specifications */}
                <div className="workspace-card">
                  <div className="card-heading">
                    <FileCheck size={16} />
                    <h3>3. Instrument Specifications</h3>
                  </div>
                  <dl className="details-list">
                    <div>
                      <dt>Instrument Type</dt>
                      <dd>
                        <strong>{data.instrumentSpecs.type}</strong>
                      </dd>
                    </div>
                    <div>
                      <dt>Make & Model</dt>
                      <dd>
                        {data.instrumentSpecs.manufacturer} ({data.instrumentSpecs.model})
                      </dd>
                    </div>
                    <div>
                      <dt>Serial Number</dt>
                      <dd>
                        <code>{data.instrumentSpecs.serialNumber}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>Capacity & Class</dt>
                      <dd>
                        {data.instrumentSpecs.capacity} ({data.instrumentSpecs.accuracyClass})
                      </dd>
                    </div>
                    <div>
                      <dt>Verification Scale (e)</dt>
                      <dd>{data.instrumentSpecs.verificationInterval}</dd>
                    </div>
                  </dl>
                </div>

                {/* 4. Installation Address */}
                <div className="workspace-card">
                  <div className="card-heading">
                    <MapPin size={16} />
                    <h3>4. Installation Address & GPS</h3>
                  </div>
                  <dl className="details-list">
                    <div>
                      <dt>Premises Location</dt>
                      <dd>
                        <strong>{data.installationAddress.locationName}</strong>
                      </dd>
                    </div>
                    <div>
                      <dt>Address</dt>
                      <dd>{data.installationAddress.addressLine}</dd>
                    </div>
                    <div>
                      <dt>Landmark</dt>
                      <dd>{data.installationAddress.landmark}</dd>
                    </div>
                    <div>
                      <dt>Coordinates</dt>
                      <dd>
                        <code>{data.installationAddress.gpsCoordinates}</code>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 5. Previous Verification History */}
                <div className="workspace-card full-width">
                  <div className="card-heading">
                    <History size={16} />
                    <h3>5. Previous Verification History</h3>
                  </div>
                  <div className="history-strip">
                    <div>
                      <span>Last Inspection</span>
                      <strong>{data.previousHistory.lastInspectionDate}</strong>
                    </div>
                    <div>
                      <span>Certificate No</span>
                      <strong>{data.previousHistory.certificateNo}</strong>
                    </div>
                    <div>
                      <span>Inspecting Officer</span>
                      <strong>{data.previousHistory.lastOfficer}</strong>
                    </div>
                    <div>
                      <span>Seal Stamp No</span>
                      <strong>{data.previousHistory.sealNumber}</strong>
                    </div>
                    <div>
                      <span>Outcome</span>
                      <strong className="status-pass">{data.previousHistory.lastOutcome}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TESTING & READINGS (Sections 6-9) */}
          {activeTab === 'testing' && (
            <div className="workspace-tab-content">
              {/* 6. Test Checklist */}
              <div className="workspace-card full-width">
                <div className="card-heading">
                  <CheckCircle2 size={16} />
                  <h3>6. Pre-Inspection Physical Test Checklist</h3>
                </div>
                <div className="checklist-group">
                  {data.testChecklist.map((item) => (
                    <div key={item.id} className="checklist-row">
                      <div className="checklist-info">
                        <span className="checklist-cat">{item.category}</span>
                        <strong>{item.item}</strong>
                      </div>
                      <button
                        type="button"
                        className={`checklist-toggle ${item.passed ? 'passed' : 'failed'}`}
                        onClick={() => toggleChecklist(item.id)}
                      >
                        {item.passed ? (
                          <>
                            <CheckCircle2 size={14} /> Passed
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Failed / Flag
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7 & 8. Reading Entry & Tolerance Comparison */}
              <div className="workspace-card full-width">
                <div className="card-heading justify-between">
                  <div className="heading-left">
                    <FileText size={16} />
                    <h3>7 & 8. Standard Weight Readings & Tolerance Comparison (MPE)</h3>
                  </div>
                  <div className={`tolerance-badge ${allReadingsPassed ? 'pass' : 'fail'}`}>
                    {allReadingsPassed ? (
                      <>
                        <CheckCircle2 size={14} /> WITHIN MPE TOLERANCE
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} /> EXCEEDS TOLERANCE (OUT OF SPEC)
                      </>
                    )}
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="workspace-readings-table">
                    <thead>
                      <tr>
                        <th>LOAD APPLIED (M)</th>
                        <th>INSTRUMENT READING (R)</th>
                        <th>ERROR |R - M|</th>
                        <th>MAX PERMISSIBLE ERROR (MPE)</th>
                        <th>TOLERANCE STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.readings.map((reading) => (
                        <tr key={reading.id}>
                          <td>
                            <strong>{reading.loadAppliedKg} kg</strong>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.001"
                              className="reading-input"
                              value={reading.instrumentReadingKg}
                              onChange={(e) => updateReading(reading.id, 'instrumentReadingKg', parseFloat(e.target.value) || 0)}
                            />
                            <span>kg</span>
                          </td>
                          <td>
                            <code className={reading.errorKg > reading.maxPermissibleErrorKg ? 'error-high' : 'error-ok'}>
                              {reading.errorKg.toFixed(3)} kg
                            </code>
                          </td>
                          <td>±{reading.maxPermissibleErrorKg.toFixed(3)} kg</td>
                          <td>
                            <span className={`status-pill ${reading.passed ? 'pass' : 'fail'}`}>
                              {reading.passed ? 'Within Spec' : 'Exceeds MPE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 9. Real-Time GPS & Timestamp Capture */}
              <div className="workspace-card full-width">
                <div className="card-heading justify-between">
                  <div className="heading-left">
                    <MapPin size={16} />
                    <h3>9. GPS Geolocation & On-Site Timestamp Capture</h3>
                  </div>
                  <button
                    type="button"
                    className="gps-refresh-btn"
                    disabled={gpsRefreshing}
                    onClick={handleRefreshGps}
                  >
                    <RotateCcw size={13} className={gpsRefreshing ? 'spinning' : ''} />
                    {gpsRefreshing ? 'Locating...' : 'Refresh GPS Coordinates'}
                  </button>
                </div>
                <div className="gps-info-strip">
                  <div>
                    <span>Latitude & Longitude</span>
                    <strong>
                      {data.gpsCapture.lat}° N, {data.gpsCapture.lng}° E
                    </strong>
                  </div>
                  <div>
                    <span>GPS Accuracy</span>
                    <strong>±{data.gpsCapture.accuracyMeters} meters (High Precision)</strong>
                  </div>
                  <div>
                    <span>Capture Timestamp</span>
                    <strong>{data.gpsCapture.timestamp}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS & EVIDENCE (Sections 10-12) */}
          {activeTab === 'media' && (
            <div className="workspace-tab-content">
              {/* 10. Instrument & Seal Photographs */}
              <div className="workspace-card full-width">
                <div className="card-heading">
                  <Upload size={16} />
                  <h3>10. Instrument & Seal Photographs</h3>
                </div>
                <div className="photos-grid">
                  <div className="photo-upload-box">
                    <div className="photo-preview">
                      {data.photos.serialPlateUrl ? (
                        <img src={data.photos.serialPlateUrl} alt="Serial Plate" />
                      ) : (
                        <div className="photo-placeholder">No photo</div>
                      )}
                    </div>
                    <strong>Serial Number Plate</strong>
                    <span>Must show manufacturer & serial details</span>
                    <button type="button" className="upload-btn">
                      <Upload size={12} /> Capture / Upload
                    </button>
                  </div>

                  <div className="photo-upload-box">
                    <div className="photo-preview">
                      {data.photos.sealIntactUrl ? (
                        <img src={data.photos.sealIntactUrl} alt="Seal Intact" />
                      ) : (
                        <div className="photo-placeholder">No photo</div>
                      )}
                    </div>
                    <strong>Verification Seal</strong>
                    <span>Must show intact lead & wire stamp</span>
                    <button type="button" className="upload-btn">
                      <Upload size={12} /> Capture / Upload
                    </button>
                  </div>

                  <div className="photo-upload-box">
                    <div className="photo-preview">
                      {data.photos.fullSetupUrl ? (
                        <img src={data.photos.fullSetupUrl} alt="Full Setup" />
                      ) : (
                        <div className="photo-placeholder">No photo</div>
                      )}
                    </div>
                    <strong>Full Installation Setup</strong>
                    <span>Overall view of instrument & premises</span>
                    <button type="button" className="upload-btn">
                      <Upload size={12} /> Capture / Upload
                    </button>
                  </div>
                </div>
              </div>

              {/* 11. Supporting Documents */}
              <div className="workspace-card full-width">
                <div className="card-heading">
                  <FileText size={16} />
                  <h3>11. Supporting Documents</h3>
                </div>
                <div className="docs-list">
                  {data.supportingDocs.map((doc, idx) => (
                    <div key={idx} className="doc-item">
                      <FileText size={18} color="#0c8d83" />
                      <div className="doc-info">
                        <strong>{doc.name}</strong>
                        <span>{doc.type} Document</span>
                      </div>
                      <button type="button" className="doc-view-btn">
                        View document <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12. Officer Observations */}
              <div className="workspace-card full-width">
                <div className="card-heading">
                  <PenTool size={16} />
                  <h3>12. Officer Observations & Notes</h3>
                </div>
                <textarea
                  className="observations-textarea"
                  rows={4}
                  value={data.officerObservations}
                  onChange={(e) => setData((prev) => ({ ...prev, officerObservations: e.target.value }))}
                  placeholder="Enter detailed inspection findings, environment checks, or remarks..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: DECISION & SIGNATURE (Sections 13-15) */}
          {activeTab === 'decision' && (
            <div className="workspace-tab-content">
              {/* 13. Pass, Fail, Flag Decision */}
              <div className="workspace-card full-width">
                <div className="card-heading">
                  <ShieldCheck size={16} />
                  <h3>13. Verification Decision & Outcome</h3>
                </div>
                <div className="decision-selector">
                  <label className={`decision-option pass ${data.decision === 'PASSED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="PASSED"
                      checked={data.decision === 'PASSED'}
                      onChange={() => setData((prev) => ({ ...prev, decision: 'PASSED' }))}
                    />
                    <div className="option-copy">
                      <CheckCircle2 size={20} />
                      <strong>PASSED</strong>
                      <span>Issue Stamping & Verification Certificate</span>
                    </div>
                  </label>

                  <label className={`decision-option fail ${data.decision === 'FAILED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="FAILED"
                      checked={data.decision === 'FAILED'}
                      onChange={() => setData((prev) => ({ ...prev, decision: 'FAILED' }))}
                    />
                    <div className="option-copy">
                      <XCircle size={20} />
                      <strong>FAILED</strong>
                      <span>Rejection Notice & Stamping Withheld</span>
                    </div>
                  </label>

                  <label className={`decision-option flag ${data.decision === 'FLAGGED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="FLAGGED"
                      checked={data.decision === 'FLAGGED'}
                      onChange={() => setData((prev) => ({ ...prev, decision: 'FLAGGED' }))}
                    />
                    <div className="option-copy">
                      <AlertTriangle size={20} />
                      <strong>FLAGGED / SEIZED</strong>
                      <span>Escalate for Legal Metrology Investigation</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 14. Digital Signature */}
              <div className="workspace-card full-width">
                <div className="card-heading justify-between">
                  <div className="heading-left">
                    <PenTool size={16} />
                    <h3>14. Digital Signature Verification</h3>
                  </div>
                  <div className="sig-type-tabs">
                    <button
                      type="button"
                      className={officerSigType === 'drawn' ? 'active' : ''}
                      onClick={() => setOfficerSigType('drawn')}
                    >
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      className={officerSigType === 'typed' ? 'active' : ''}
                      onClick={() => setOfficerSigType('typed')}
                    >
                      Type Verification
                    </button>
                  </div>
                </div>

                <div className="signature-panel">
                  {officerSigType === 'drawn' ? (
                    <div className="canvas-container">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={120}
                        className="signature-canvas"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                      />
                      <button type="button" className="clear-sig-btn" onClick={clearSignature}>
                        Clear
                      </button>
                      <p className="sig-hint">Sign above using mouse or touch device</p>
                    </div>
                  ) : (
                    <div className="typed-signature-box">
                      <input
                        type="text"
                        placeholder="Type full legal name to verify digital signature"
                        className="typed-sig-input"
                        value={data.officerSignature || ''}
                        onChange={(e) => setData((prev) => ({ ...prev, officerSignature: e.target.value }))}
                      />
                      <span className="typed-sig-preview">{data.officerSignature || 'Signature Preview'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 15. Workspace Actions Footer (Save Offline & Submit) */}
        <div className="workspace-footer">
          <div className="footer-status-indicator">
            <span className="status-dot-active" />
            <span>Connected · Offline Backup Ready</span>
          </div>

          <div className="footer-actions">
            <button
              type="button"
              className="workspace-btn save-offline-btn"
              disabled={isSavingOffline || isSubmitting}
              onClick={handleSaveOffline}
            >
              <Save size={16} />
              {isSavingOffline ? 'Saving Local Backup...' : 'Save Offline'}
            </button>

            <button
              type="button"
              className="workspace-btn submit-inspection-btn"
              disabled={isSubmitting || isSavingOffline}
              onClick={handleSubmit}
            >
              <Send size={16} />
              {isSubmitting ? 'Submitting Report...' : 'Submit Verification Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
