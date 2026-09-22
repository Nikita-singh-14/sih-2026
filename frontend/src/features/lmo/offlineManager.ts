import type { InspectionWorkspaceData } from '../../types'

export interface QueuedOfflineInspection {
  id: string
  applicationId: string
  savedAt: string
  data: InspectionWorkspaceData
  retryCount: number
  status: 'pending' | 'syncing' | 'failed' | 'conflict'
  lastError?: string
}

const STORAGE_KEY = 'measuresure_lmo_offline_queue'

type SyncListener = (isOnline: boolean, pendingCount: number, syncing: boolean) => void

export class OfflineManager {
  private listeners: Set<SyncListener> = new Set()
  private isOnline: boolean = navigator.onLine
  private isSyncing: boolean = false

  constructor() {
    window.addEventListener('online', this.handleNetworkChange)
    window.addEventListener('offline', this.handleNetworkChange)
  }

  private handleNetworkChange = () => {
    this.isOnline = navigator.onLine
    this.notify()
    if (this.isOnline) {
      this.syncPendingQueue()
    }
  }

  public subscribe(listener: SyncListener) {
    this.listeners.add(listener)
    listener(this.isOnline, this.getPendingQueue().length, this.isSyncing)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const queue = this.getPendingQueue()
    this.listeners.forEach((listener) => listener(this.isOnline, queue.length, this.isSyncing))
  }

  public getPendingQueue(): QueuedOfflineInspection[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  public saveInspectionOffline(data: InspectionWorkspaceData): QueuedOfflineInspection {
    const queue = this.getPendingQueue()
    const item: QueuedOfflineInspection = {
      id: `OFFLINE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      applicationId: data.applicationDetails.applicationNo,
      savedAt: new Date().toISOString(),
      data,
      retryCount: 0,
      status: 'pending',
    }

    // Replace if already in queue
    const existingIdx = queue.findIndex((q) => q.applicationId === item.applicationId)
    if (existingIdx >= 0) {
      queue[existingIdx] = item
    } else {
      queue.push(item)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    this.notify()

    // Auto-attempt sync if online
    if (this.isOnline) {
      this.syncPendingQueue()
    }

    return item
  }

  public async syncPendingQueue(): Promise<{ syncedCount: number; errors: number }> {
    if (this.isSyncing) return { syncedCount: 0, errors: 0 }
    const queue = this.getPendingQueue()
    if (queue.length === 0) return { syncedCount: 0, errors: 0 }

    this.isSyncing = true
    this.notify()

    let syncedCount = 0
    let errors = 0
    const remainingQueue: QueuedOfflineInspection[] = []

    const token = localStorage.getItem('measuresure-token')

    for (const item of queue) {
      try {
        const response = await fetch('/api/lmo/inspections/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            applicationId: item.applicationId,
            decision: item.data.decision || 'PASSED',
            officerObservations: item.data.officerObservations,
            gpsCapture: item.data.gpsCapture,
            photos: item.data.photos,
          }),
        })

        if (response.ok) {
          syncedCount++
        } else {
          item.retryCount += 1
          item.status = item.retryCount >= 3 ? 'conflict' : 'failed'
          item.lastError = `Server returned status ${response.status}`
          remainingQueue.push(item)
          errors++
        }
      } catch (err) {
        item.retryCount += 1
        item.status = 'failed'
        item.lastError = err instanceof Error ? err.message : 'Network failure'
        remainingQueue.push(item)
        errors++
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue))
    this.isSyncing = false
    this.notify()

    return { syncedCount, errors }
  }

  public clearQueue() {
    localStorage.removeItem(STORAGE_KEY)
    this.notify()
  }
}

export const offlineManager = new OfflineManager()
