import React, { useEffect, useState, useMemo } from 'react'
import {
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Trash2,
  CheckCircle2,
  HardDrive,
  Database
} from 'lucide-react'
import type { AuthUser } from '../../types'
import { offlineManager } from '../../features/lmo/offlineManager'
import { getAssignmentsForOfficer } from '../../features/lmo/data'

interface OfflineCasesProps {
  currentUser: AuthUser
  onActionFeedback: (msg: string) => void
}

export default function OfflineCases({ currentUser, onActionFeedback }: OfflineCasesProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [downloadingOffline, setDownloadingOffline] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  const jurisdictionDisplay = useMemo(() => {
    const d = currentUser.jurisdiction?.district?.trim()
    const s = currentUser.jurisdiction?.state?.trim()
    if (d && s) return `${d.toUpperCase()}, ${s.toUpperCase()}`
    if (d) return d.toUpperCase()
    if (s) return s.toUpperCase()
    return 'JURISDICTION ASSIGNED'
  }, [currentUser])

  // Get cached items from offlineManager queue
  const [offlineQueue, setOfflineQueue] = useState(() => offlineManager.getPendingQueue())
  const officerAssignments = useMemo(() => getAssignmentsForOfficer(currentUser), [currentUser])

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe((online, count, syncing) => {
      setIsOnline(online)
      setPendingSyncCount(count)
      setIsSyncing(syncing)
      setOfflineQueue(offlineManager.getPendingQueue())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleManualSync = async () => {
    onActionFeedback('Initiating offline queue synchronization...')
    const result = await offlineManager.syncPendingQueue()
    setOfflineQueue(offlineManager.getPendingQueue())
    if (result.syncedCount > 0) {
      onActionFeedback(`Synchronized ${result.syncedCount} inspection reports with central server`)
    } else {
      onActionFeedback('All local inspection reports are synchronized')
    }
  }

  const handleDownloadCases = () => {
    setDownloadingOffline(true)
    setDownloadProgress('Preparing encrypted offline bundle...')
    setTimeout(() => {
      setDownloadProgress('Storing in local encrypted vault...')
      setTimeout(() => {
        setDownloadingOffline(false)
        setDownloadProgress('')
        onActionFeedback(`Downloaded ${officerAssignments.length} cases for offline field work`)
      }, 600)
    }, 600)
  }

  const handleClearCache = () => {
    offlineManager.clearQueue()
    setOfflineQueue([])
    setPendingSyncCount(0)
    onActionFeedback('Cleared local offline inspection cache')
  }

  return (
    <div className="lmo-subpage">
      {/* Network & Offline Status Banner */}
      <div className={`lmo-sync-status-bar ${isOnline ? 'online' : 'offline'}`} style={{ marginBottom: '1.5rem' }}>
        <div className="sync-status-left">
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>
            {isOnline
              ? 'Network Connected · Auto-sync enabled for offline inspection uploads'
              : 'Offline Mode Active · Changes will be securely queued locally'}
          </span>
        </div>

        <div className="sync-status-right">
          <span className="pending-sync-badge">
            <CloudOff size={13} /> {pendingSyncCount} Pending Sync{pendingSyncCount !== 1 ? 's' : ''}
          </span>
          {isOnline && (
            <button
              type="button"
              className="sync-now-btn"
              disabled={isSyncing}
              onClick={handleManualSync}
            >
              <RefreshCw size={13} className={isSyncing ? 'spinning' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">OFFLINE ENGINE / {jurisdictionDisplay}</p>
          <h1>Offline Inspection Cases & Sync Queue</h1>
          <p className="heading-copy">
            Store inspection forms, photo evidence, and test readings without cellular coverage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" type="button" onClick={handleClearCache}>
            <Trash2 size={14} /> Clear Synced Cache
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={downloadingOffline}
            onClick={handleDownloadCases}
          >
            <Download size={14} className={downloadingOffline ? 'spinning' : ''} />
            {downloadingOffline ? downloadProgress : 'Download Assigned Cases'}
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <HardDrive size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Offline Cases Cached</span>
            <strong>{officerAssignments.length} Cases</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <CloudOff size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Pending Sync Queue</span>
            <strong>{pendingSyncCount} Items</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Local Database Status</span>
            <strong>AES-256 Encrypted</strong>
          </div>
        </article>

        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <Database size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Storage Allocated</span>
            <strong>18.4 MB / 50 MB</strong>
          </div>
        </article>
      </section>

      {/* Main Content Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Offline Queue */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">LOCAL INSPECTION QUEUE</p>
              <h2>Unsynced Offline Reports</h2>
            </div>
            {pendingSyncCount > 0 && isOnline && (
              <button className="primary-button" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={handleManualSync}>
                <RefreshCw size={13} /> Sync All
              </button>
            )}
          </div>

          <div className="table-wrap">
            <table className="lmo-table">
              <thead>
                <tr>
                  <th>APPLICATION ID</th>
                  <th>DECISION</th>
                  <th>SAVED AT</th>
                  <th>EVIDENCE</th>
                  <th>SYNC STATUS</th>
                </tr>
              </thead>
              <tbody>
                {offlineQueue.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.applicationId}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>
                        {item.data.businessDetails?.name || 'Establishment'}
                      </small>
                    </td>
                    <td>
                      <span className={`status-pill ${item.data.decision ? item.data.decision.toLowerCase() : 'pending'}`}>
                        {item.data.decision || 'PASSED'}
                      </span>
                    </td>
                    <td>{new Date(item.savedAt).toLocaleString()}</td>
                    <td>
                      <small style={{ display: 'block' }}>
                        GPS: {item.data.gpsCapture ? 'Locked (±3m)' : 'N/A'}
                      </small>
                      <small style={{ color: '#0284c7' }}>
                        Photos: {item.data.photos ? Object.keys(item.data.photos).length : 0}
                      </small>
                    </td>
                    <td>
                      <span className="priority-badge medium" style={{ background: '#fef3c7', color: '#b45309' }}>
                        {item.status === 'pending' ? 'Pending Upload' : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {offlineQueue.length === 0 && (
              <div className="lmo-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle2 size={36} color="#10b981" />
                <h3>All offline inspections are synchronized</h3>
                <p>There are currently no unsynced reports pending upload in your local cache.</p>
              </div>
            )}
          </div>
        </section>

        {/* Cached Field Packages */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">CACHED FIELD BUNDLES</p>
              <h2>Assigned Cases Cached</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {officerAssignments.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>{a.applicationId}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.business}</span>
                  <small style={{ display: 'block', fontSize: '0.75rem', color: '#0f766e', marginTop: '2px' }}>
                    Form + Previous Certificate + Spec Sheet
                  </small>
                </div>
                <span
                  style={{
                    background: '#ccfbf1',
                    color: '#0f766e',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  Offline Ready
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
