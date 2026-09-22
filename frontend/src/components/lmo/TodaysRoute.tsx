import React, { useState, useMemo } from 'react'
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Play,
  Calendar,
  Building2,
  Compass,
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react'
import type { AuthUser, LmoAssignment } from '../../types'
import { getAssignmentsForOfficer } from '../../features/lmo/data'
import { InspectionWorkspaceModal } from '../dashboard/InspectionWorkspaceModal'
import { offlineManager } from '../../features/lmo/offlineManager'

interface TodaysRouteProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

interface RouteStop extends LmoAssignment {
  stopNumber: number
  distanceKm: number
  eta: string
  arrivalStatus: 'Upcoming' | 'En Route' | 'Arrived' | 'Completed'
}

export default function TodaysRoute({ currentUser, onActionFeedback }: TodaysRouteProps) {
  const baseAssignments = useMemo(() => getAssignmentsForOfficer(currentUser), [currentUser])

  const [stops, setStops] = useState<RouteStop[]>(() =>
    baseAssignments.map((a, idx) => ({
      ...a,
      stopNumber: idx + 1,
      distanceKm: Number((1.5 + idx * 2.3).toFixed(1)),
      eta: a.time,
      arrivalStatus: idx === 0 ? 'En Route' : 'Upcoming'
    }))
  )

  const [activeWorkspaceAssignment, setActiveWorkspaceAssignment] = useState<LmoAssignment | null>(null)
  const [navigatingStop, setNavigatingStop] = useState<number | null>(null)

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  const routeSummary = useMemo(() => {
    const totalStops = stops.length
    const completedStops = stops.filter((s) => s.arrivalStatus === 'Completed').length
    const totalDist = stops.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1)
    return { totalStops, completedStops, totalDist }
  }, [stops])

  const handleStartGPS = (stop: RouteStop) => {
    setNavigatingStop(stop.stopNumber)
    onActionFeedback(`GPS Navigation started for Stop #${stop.stopNumber}: ${stop.business}`)
    setStops((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, arrivalStatus: 'En Route' } : s))
    )
  }

  const handleMarkArrived = (stop: RouteStop) => {
    setStops((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, arrivalStatus: 'Arrived' } : s))
    )
    onActionFeedback(`Arrived at Stop #${stop.stopNumber}: ${stop.business}. Geo-tag locked.`)
  }

  return (
    <div className="lmo-subpage">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">ROUTE & GPS NAVIGATION / {jurisdictionDisplay}</p>
          <h1>Today’s Field Inspection Route</h1>
          <p className="heading-copy">
            Optimized travel route and turn-by-turn verification schedule for {currentUser.name}.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            const firstUpcoming = stops.find((s) => s.arrivalStatus !== 'Completed') || stops[0]
            if (firstUpcoming) handleStartGPS(firstUpcoming)
          }}
        >
          <Navigation size={14} /> Start Full Route Navigation
        </button>
      </section>

      {/* KPI Cards */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <MapPin size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Total Route Stops</span>
            <strong>{routeSummary.totalStops} Visits</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Compass size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Est. Route Distance</span>
            <strong>{routeSummary.totalDist} km</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <Clock size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Est. Travel & Inspection</span>
            <strong>~ 4 hrs 15 mins</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Stops Completed</span>
            <strong>{routeSummary.completedStops} / {routeSummary.totalStops}</strong>
          </div>
        </article>
      </section>

      {/* Content Grid: Route Map Representation + Sequential Stops */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Map Panel Representation */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">LIVE JURISDICTION MAP</p>
              <h2>Route Visualizer</h2>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: '320px',
              background: '#0f172a',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffffff',
              padding: '1.5rem'
            }}
          >
            {/* Grid pattern overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.4
              }}
            />

            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.2)',
                  border: '2px solid #0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 0 20px rgba(13, 148, 136, 0.5)'
                }}
              >
                <Compass size={28} color="#2dd4bf" className="spinning" />
              </div>

              <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem' }}>
                GPS Locked: {jurisdictionDisplay}
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '240px', margin: '0 auto 1rem' }}>
                {navigatingStop
                  ? `Active navigation to Stop #${navigatingStop}`
                  : 'Turn-by-turn guidance active for officer route.'}
              </p>

              <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#e2e8f0'
                  }}
                >
                  Accuracy: ±3m
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#6ee7b7'
                  }}
                >
                  Traffic: Clear
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sequential Stops List */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FIELD SCHEDULE</p>
              <h2>Sequential Inspection Stops</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {stops.map((stop) => (
              <div
                key={stop.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border:
                    stop.arrivalStatus === 'En Route'
                      ? '2px solid #0d9488'
                      : stop.arrivalStatus === 'Completed'
                      ? '1px solid #cbd5e1'
                      : '1px solid #e2e8f0',
                  background:
                    stop.arrivalStatus === 'En Route'
                      ? '#f0fdfa'
                      : stop.arrivalStatus === 'Completed'
                      ? '#f8fafc'
                      : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: stop.arrivalStatus === 'Completed' ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        stop.arrivalStatus === 'Completed'
                          ? '#10b981'
                          : stop.arrivalStatus === 'En Route'
                          ? '#0d9488'
                          : '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    {stop.arrivalStatus === 'Completed' ? <CheckCircle2 size={20} /> : stop.stopNumber}
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem' }}>{stop.business}</strong>
                      <span className="verification-type-badge">{stop.verificationType}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', margin: '2px 0' }}>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} /> {stop.location}
                    </span>
                    <small style={{ color: '#0f766e', fontWeight: 600 }}>
                      ETA {stop.eta} · {stop.distanceKm} km from previous stop
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {stop.arrivalStatus !== 'Completed' && (
                    <>
                      {stop.arrivalStatus === 'En Route' ? (
                        <button
                          className="secondary-button"
                          type="button"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => handleMarkArrived(stop)}
                        >
                          Mark Arrived
                        </button>
                      ) : (
                        <button
                          className="secondary-button"
                          type="button"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => handleStartGPS(stop)}
                        >
                          <Navigation size={13} /> GPS
                        </button>
                      )}

                      <button
                        className="primary-button"
                        type="button"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                        onClick={() => setActiveWorkspaceAssignment(stop)}
                      >
                        <Play size={12} fill="currentColor" /> Start Inspection
                      </button>
                    </>
                  )}

                  {stop.arrivalStatus === 'Completed' && (
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      Visit Verified ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal */}
      {activeWorkspaceAssignment && (
        <InspectionWorkspaceModal
          assignment={activeWorkspaceAssignment}
          onClose={() => setActiveWorkspaceAssignment(null)}
          onSaveOffline={(data) => {
            offlineManager.saveInspectionOffline(data)
            onActionFeedback(`Saved offline for ${data.applicationDetails.applicationNo}`)
            setActiveWorkspaceAssignment(null)
          }}
          onSubmitInspection={(data) => {
            setStops((prev) =>
              prev.map((s) =>
                s.applicationId === data.applicationDetails.applicationNo
                  ? { ...s, arrivalStatus: 'Completed', status: data.decision === 'PASSED' ? 'Passed' : 'Failed' }
                  : s
              )
            )
            onActionFeedback(`Inspection completed for ${data.applicationDetails.applicationNo}`)
            setActiveWorkspaceAssignment(null)
          }}
        />
      )}
    </div>
  )
}
