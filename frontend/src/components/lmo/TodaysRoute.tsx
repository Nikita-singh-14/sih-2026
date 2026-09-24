import { useState, useMemo } from 'react'
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Sliders,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import type { AuthUser, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer } from '../../features/lmo/data'

interface TodaysRouteProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function TodaysRoute({ currentUser, onActionFeedback }: TodaysRouteProps) {
  const [assignments] = useState<LmoAssignment[]>(() =>
    getAssignmentsForOfficer(currentUser).filter((a) => a.date === 'Today')
  )
  const [activeStopId, setActiveStopId] = useState<string | null>(assignments[0]?.id || null)

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const routeSummary = useMemo(() => {
    return {
      totalStops: assignments.length,
      estimatedDistance: `${assignments.length * 4.2} km`,
      estimatedDriveTime: `${assignments.length * 15 + 20} mins`,
      completedStops: assignments.filter((a) => a.status === 'Passed' || a.status === 'Failed').length,
    }
  }, [assignments])

  const selectedStop = assignments.find((a) => a.id === activeStopId) || assignments[0]

  return (
    <div className="todays-route-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">FIELD OFFICERS / ROUTE OPTIMIZER</p>
          <h1>Today’s Field Inspection Route</h1>
          <p className="heading-copy">
            Optimized travel sequence and GPS navigation for {currentUser.jurisdiction?.district || 'Delhi Central'} Zone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ width: 'auto', margin: 0 }}
            onClick={() => handleFeedback('Re-optimizing route sequence based on live traffic...')}
          >
            <RotateCw size={14} /> Re-Optimize Sequence
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => handleFeedback('Launching turn-by-turn navigation in Maps...')}
          >
            <Navigation size={14} /> Start Turn-by-Turn GPS
          </button>
        </div>
      </section>

      {/* Route Overview Metrics */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <MapPin size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Stops</span>
            <strong>{routeSummary.totalStops} Stops</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Compass size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Est. Total Distance</span>
            <strong>{routeSummary.estimatedDistance}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <Clock size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Est. Travel Time</span>
            <strong>{routeSummary.estimatedDriveTime}</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Completed Stops</span>
            <strong>{routeSummary.completedStops} / {routeSummary.totalStops}</strong>
          </div>
        </article>
      </section>

      {/* Main Content: Map Visualizer & Stop List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: '20px' }}>
        {/* Left: Stops Timeline */}
        <div className="panel" style={{ padding: '24px' }}>
          <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid #e2e9eb' }}>
            <div>
              <p className="eyebrow">SEQUENCE OF VISITS</p>
              <h2>Stop Schedule ({assignments.length} locations)</h2>
            </div>
            <span style={{ fontSize: '12px', color: '#0c8d83', fontWeight: 600 }}>Traffic: Normal</span>
          </div>

          <div className="stops-timeline" style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
            {assignments.map((item, index) => {
              const isSelected = item.id === activeStopId
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveStopId(item.id)}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0c8d83' : '1px solid #e2e9eb',
                    background: isSelected ? '#f0fdfa' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isSelected ? '#0c8d83' : '#173b52',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#173b52', fontSize: '13px' }}>{item.business}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{item.time}</span>
                    </div>
                    <p style={{ margin: '4px 0 6px', color: '#64748b', fontSize: '12px' }}>{item.location}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="verification-type-badge">{item.instrument}</span>
                      <span className={`priority-badge ${item.priority.toLowerCase()}`}>{item.priority} Priority</span>
                      {item.riskFactors && item.riskFactors.length > 0 && (
                        <span style={{ color: '#dc2626', fontSize: '10px', fontWeight: 700 }}>
                          ⚠️ High Risk Case
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Selected Stop Detail Card & Map Mockup */}
        <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <p className="eyebrow" style={{ color: '#0c8d83', marginBottom: '8px' }}>ACTIVE STOP DETAILS</p>
            {selectedStop ? (
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#173b52', fontSize: '16px' }}>{selectedStop.business}</h3>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 16px' }}>{selectedStop.location}</p>

                <div style={{ display: 'grid', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Application No:</span>
                    <strong style={{ color: '#173b52' }}>{selectedStop.applicationId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Target Time:</span>
                    <strong style={{ color: '#173b52' }}>{selectedStop.time}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Inspection Type:</span>
                    <strong style={{ color: '#173b52' }}>{selectedStop.verificationType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Instrument:</span>
                    <strong style={{ color: '#173b52' }}>{selectedStop.instrument}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
                  <button
                    className="primary-button"
                    type="button"
                    style={{ width: '100%' }}
                    onClick={() => handleFeedback(`Opening navigation for ${selectedStop.business}`)}
                  >
                    <Navigation size={14} /> Navigate with Google Maps
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    style={{ width: '100%', margin: 0 }}
                    onClick={() => handleFeedback(`Notifying establishment ${selectedStop.business} of arrival...`)}
                  >
                    Send Arrival SMS Alert
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '12px' }}>Select a stop from the list to view route details.</p>
            )}
          </div>

          {/* Interactive Route Preview Card */}
          <div className="panel" style={{ padding: '20px', background: '#173b52', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Compass size={20} color="#70d8c9" />
              <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Smart Route Assist</h4>
            </div>
            <p style={{ fontSize: '12px', color: '#9fb8c2', lineHeight: '1.5', margin: '0 0 16px' }}>
              Route generated with live traffic pattern analysis, minimizing total commute time across all {assignments.length} inspection sites.
            </p>
            <button
              type="button"
              onClick={() => handleFeedback('Exported daily route manifest (PDF)')}
              style={{
                width: '100%',
                padding: '9px',
                border: '1px solid #2b5b70',
                borderRadius: '6px',
                background: '#1b465c',
                color: '#70d8c9',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Export Route Manifest (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
