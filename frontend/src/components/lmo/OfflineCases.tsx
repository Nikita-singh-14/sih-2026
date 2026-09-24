import { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  CloudOff,
  RefreshCw,
  Download,
  Database,
  CheckCircle2,
  HardDrive,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import type { AuthUser } from '../../types'
import { offlineManager } from '../../features/lmo/offlineManager'

interface OfflineCasesProps {
  currentUser: AuthUser
  onActionFeedback?: (message: string) => void
}

export default function OfflineCases({ currentUser, onActionFeedback }: OfflineCasesProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState('')

  useEffect(() => {
    const unsub = offlineManager.subscribe((status, count, syncing) => {
      setIsOnline(status)
      setPendingSyncCount(count)
      setIsSyncing(syncing)
    })
    return () => {
      unsub()
    }
  }, [])

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  const handleTriggerSync = async () => {
    handleFeedback('Initiating sync with central Legal Metrology server...')
    const res = await offlineManager.syncPendingQueue()
    if (res.syncedCount > 0) {
      handleFeedback(`Successfully synced ${res.syncedCount} inspection records!`)
    } else {
      handleFeedback('All local cases are up to date.')
    }
  }

  const handleDownloadCases = () => {
    setDownloading(true)
    setDownloadMsg('Packaging offline inspection bundles...')
    setTimeout(() => {
      setDownloadMsg('Encrypting local database...')
      setTimeout(() => {
        setDownloading(false)
        setDownloadMsg('')
        handleFeedback('Offline package downloaded (12.4 MB stored locally)')
      }, 600)
    }, 600)
  }

  return (
    <div className="offline-cases-page" style={{ display: 'grid', gap: '24px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">OFFLINE & SYNC MANAGEMENT</p>
          <h1>Offline Inspection Storage</h1>
          <p className="heading-copy">Work seamlessly in remote areas with zero network connectivity.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ width: 'auto', margin: 0 }}
            disabled={downloading}
            onClick={handleDownloadCases}
          >
            <Download size={15} className={downloading ? 'spinning' : ''} />
            {downloading ? downloadMsg : 'Download Offline Package'}
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={!isOnline || isSyncing}
            onClick={handleTriggerSync}
          >
            <RefreshCw size={15} className={isSyncing ? 'spinning' : ''} />
            {isSyncing ? 'Syncing Queue...' : 'Sync Pending Queue'}
          </button>
        </div>
      </section>

      {/* Sync Status Banner */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderRadius: '8px',
          border: isOnline ? '1px solid #99f6e4' : '1px solid #fde68a',
          background: isOnline ? '#f0fdfa' : '#fffbeb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isOnline ? <Wifi size={24} color="#0d9488" /> : <WifiOff size={24} color="#d97706" />}
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: isOnline ? '#0f766e' : '#b45309' }}>
              {isOnline ? 'Online Connection Established' : 'Offline Mode Active'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              {isOnline
                ? 'Your device is connected. Local inspection reports can be synced instantly.'
                : 'Inspections recorded will be saved to encrypted IndexedDB storage.'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#173b52' }}>
            {pendingSyncCount} Record(s) Pending Sync
          </span>
        </div>
      </section>

      {/* KPI Storage Stats */}
      <section className="lmo-kpi-grid">
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon teal">
            <Database size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Local Encrypted Storage</span>
            <strong>14.2 MB / 50 MB</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon amber">
            <CloudOff size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Queue Pending Sync</span>
            <strong>{pendingSyncCount} Reports</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Last Sync Time</span>
            <strong>Today, 08:45 AM</strong>
          </div>
        </article>
        <article className="lmo-kpi-card">
          <div className="lmo-kpi-icon blue">
            <HardDrive size={19} />
          </div>
          <div className="lmo-kpi-copy">
            <span>Offline Cases Saved</span>
            <strong>8 Inspection Bundles</strong>
          </div>
        </article>
      </section>

      {/* Detailed Queue List */}
      <div className="panel workspace-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">LOCAL STORAGE QUEUE</p>
            <h2>Pending Sync Items</h2>
          </div>
          <span className="queue-count">{pendingSyncCount} items waiting</span>
        </div>

        {pendingSyncCount > 0 ? (
          <div className="table-wrap lmo-table-wrap">
            <table className="lmo-table">
              <thead>
                <tr>
                  <th>APPLICATION ID</th>
                  <th>INSPECTION DECISION</th>
                  <th>TIMESTAMP</th>
                  <th>ENCRYPTED FILE SIZE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="app-id-cell"><strong>LM-2024-09121</strong></td>
                  <td><span className="priority-badge low">PASSED</span></td>
                  <td>Today, 10:15 AM</td>
                  <td>1.8 MB</td>
                  <td><span className="status-pill scheduled">Queued</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FileCheck size={36} color="#0d9488" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: 0, color: '#173b52', fontSize: '15px' }}>All Offline Data Synchronized</h3>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '6px 0 0' }}>
              There are no pending inspection reports waiting to be synced to the central server.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
