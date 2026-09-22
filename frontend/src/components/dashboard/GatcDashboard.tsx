import { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Download,
  Eraser,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  History,
  Info,
  Inbox,
  LifeBuoy,
  Lock,
  MapPin,
  MoreHorizontal,
  PenSquare,
  Plus,
  PlusCircle,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  UserCheck,
  Weight,
  Wrench,
  X,
} from 'lucide-react'
import type { AuthUser, GatcSubmittedResult, GatcTestEquipment, GatcTestRequest } from '../../types'
import {
  centreReadinessItems,
  evaluateGatcAllocation,
  foreignCentreCases,
  gatcEquipmentList,
  gatcKpiStats,
  gatcReportsData,
  gatcSubmittedResultsList,
  gatcTodayScheduleRows,
  getGatcTestRequests,
  type GatcChecklistItem,
  type GatcReading,
  type GatcScheduleRow,
  type GatcUploadedDoc,
} from '../../features/gatc/data'

interface GatcDashboardProps {
  currentUser: AuthUser
  activeSection?: string
  onActionFeedback?: (message: string) => void
  onNavigate?: (section: string) => void
}

export function GatcDashboard({
  currentUser,
  activeSection = 'Overview',
  onActionFeedback,
  onNavigate,
}: GatcDashboardProps) {
  const [testRequests, setTestRequests] = useState<GatcTestRequest[]>(() =>
    getGatcTestRequests(currentUser)
  )
  const [scheduleRows, setScheduleRows] = useState<GatcScheduleRow[]>(gatcTodayScheduleRows)
  const [equipmentList, setEquipmentList] = useState<GatcTestEquipment[]>(gatcEquipmentList)
  const [submittedResults, setSubmittedResults] = useState<GatcSubmittedResult[]>(gatcSubmittedResultsList)

  // Search & Filter States for Schedule
  const [searchTerm, setSearchTerm] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState('All instruments')
  const [dateFilter, setDateFilter] = useState('All dates')
  const [verificationTypeFilter, setVerificationTypeFilter] = useState('All verification types')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')

  // Equipment Filter State
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState('All Statuses')
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('')

  // Submitted Results Filter State
  const [resultsReviewFilter, setResultsReviewFilter] = useState('All Review Statuses')

  // Verification Workspace Modal State
  const [activeCase, setActiveCase] = useState<GatcScheduleRow | null>(null)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'Overview' | 'Instrument Details' | 'Testing and Readings' | 'Photos and Evidence' | 'Decision and Signature'
  >('Overview')

  // Allocation Engine Modal State
  const [allocationModalCase, setAllocationModalCase] = useState<GatcScheduleRow | null>(null)

  // Security Guard State: Cross-Centre 403 Forbidden Access
  const [crossCentreAccessDenied, setCrossCentreAccessDenied] = useState<{
    caseId: string
    centreName: string
    gatcCode: string
    district: string
    state: string
    instrument: string
  } | null>(null)
  const [simulatedUrlInput, setSimulatedUrlInput] = useState('')

  // Returned Report Correction & Resubmission Modal State
  const [correctionModalItem, setCorrectionModalItem] = useState<GatcSubmittedResult | null>(null)
  const [resubmitObservations, setResubmitObservations] = useState('')
  const [resubmitDocUploaded, setResubmitDocUploaded] = useState(false)

  // Editable Form State inside Modal
  const [selectedEquipment, setSelectedEquipment] = useState<string>('')
  const [environmental, setEnvironmental] = useState({
    temperatureC: 23.5,
    humidityPercent: 52,
    pressureHpa: 1013.2,
  })
  const [checklist, setChecklist] = useState<GatcChecklistItem[]>([])
  const [readings, setReadings] = useState<GatcReading[]>([])
  const [photos, setPhotos] = useState<{
    serialPlateUrl?: string
    sealIntactUrl?: string
    displayUrl?: string
    fullSetupUrl?: string
  }>({})
  const [documents, setDocuments] = useState<GatcUploadedDoc[]>([])
  const [observations, setObservations] = useState('')
  const [decision, setDecision] = useState<'PASSED' | 'FAILED' | 'HOLD'>('PASSED')

  // Signature state
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calibrationErrorAlert, setCalibrationErrorAlert] = useState<string | null>(null)

  const handleFeedback = (msg: string) => {
    if (onActionFeedback) onActionFeedback(msg)
  }

  // Cross-Centre URL Security Check Handler
  const handleCheckCaseUrlAccess = (inputCaseId: string) => {
    const trimmedId = inputCaseId.trim()
    if (!trimmedId) return

    // Check if it belongs to a foreign centre
    if (foreignCentreCases[trimmedId]) {
      setCrossCentreAccessDenied(foreignCentreCases[trimmedId])
      handleFeedback(`SECURITY ALERT 403 FORBIDDEN: Case ${trimmedId} belongs to another GATC centre.`)
      return
    }

    // Check if case belongs to user's centre
    const localCase = scheduleRows.find(
      (r) => r.caseId.toLowerCase() === trimmedId.toLowerCase() || r.applicationDetails.applicationNo.toLowerCase() === trimmedId.toLowerCase()
    )
    if (localCase) {
      setCrossCentreAccessDenied(null)
      openWorkspace(localCase)
      handleFeedback(`Authorized URL Access: Loading ${localCase.caseId}`)
    } else {
      handleFeedback(`Case ID ${trimmedId} not found in repository.`)
    }
  }

  // Handle Correction & Resubmission
  const handleOpenCorrection = (item: GatcSubmittedResult) => {
    setCorrectionModalItem(item)
    setResubmitObservations(item.remarks)
    setResubmitDocUploaded(false)
  }

  const handleExecuteResubmit = () => {
    if (!correctionModalItem) return
    setSubmittedResults((prev) =>
      prev.map((r) =>
        r.id === correctionModalItem.id
          ? {
              ...r,
              reviewStatus: 'Submitted',
              submittedDate: 'Just now (Resubmitted)',
              remarks: `Corrected & Resubmitted by GATC Officer: ${resubmitObservations}`,
            }
          : r
      )
    )
    handleFeedback(`Report for ${correctionModalItem.caseId} corrected & resubmitted to LMO`)
    setCorrectionModalItem(null)
  }

  // Derive dynamic centre name
  const centreName = useMemo(() => {
    if (currentUser.gatc?.name && currentUser.gatc.name.trim() !== '') {
      return currentUser.gatc.name.trim()
    }
    if (currentUser.gatcProfile?.centreName && currentUser.gatcProfile.centreName.trim() !== '') {
      return currentUser.gatcProfile.centreName.trim()
    }
    return 'Test centre not assigned'
  }, [currentUser])

  // Derive officer name
  const officerName = currentUser.name || 'Officer'

  // Filter schedule rows with 6 filter parameters
  const filteredScheduleRows = useMemo(() => {
    return scheduleRows.filter((row) => {
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        [row.caseId, row.applicant, row.instrument, row.applicantDetails.name].some((field) =>
          field.toLowerCase().includes(query)
        )

      const matchesInstrument =
        instrumentFilter === 'All instruments' ||
        row.instrument.toLowerCase().includes(instrumentFilter.toLowerCase())

      const matchesDate =
        dateFilter === 'All dates' ||
        (dateFilter === 'Today' && (row.date === 'Today' || row.date === '2026-09-20')) ||
        row.date.toLowerCase().includes(dateFilter.toLowerCase())

      const matchesVerificationType =
        verificationTypeFilter === 'All verification types' ||
        row.verificationType.toLowerCase() === verificationTypeFilter.toLowerCase()

      const matchesStatus =
        statusFilter === 'All statuses' ||
        row.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesPriority =
        priorityFilter === 'All priorities' ||
        row.priority.toLowerCase() === priorityFilter.toLowerCase()

      return (
        matchesSearch &&
        matchesInstrument &&
        matchesDate &&
        matchesVerificationType &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    scheduleRows,
    searchTerm,
    instrumentFilter,
    dateFilter,
    verificationTypeFilter,
    statusFilter,
    priorityFilter,
  ])

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const query = equipmentSearchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        [item.equipmentId, item.name, item.category, item.capacityRange].some((f) =>
          f.toLowerCase().includes(query)
        )
      const matchesStatus =
        equipmentStatusFilter === 'All Statuses' ||
        item.status.toLowerCase() === equipmentStatusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [equipmentList, equipmentSearchTerm, equipmentStatusFilter])

  // Filtered Submitted Results List
  const filteredSubmittedResults = useMemo(() => {
    return submittedResults.filter((item) => {
      return (
        resultsReviewFilter === 'All Review Statuses' ||
        item.reviewStatus.toLowerCase() === resultsReviewFilter.toLowerCase()
      )
    })
  }, [submittedResults, resultsReviewFilter])

  // Open Workspace Modal with Expired Calibration Safety Guard
  const openWorkspace = (row: GatcScheduleRow) => {
    // Safety check: verify selected reference equipment is not expired
    const selectedEq = equipmentList.find(
      (e) => e.id === (row.selectedEquipmentId || 'eq-1')
    )
    if (selectedEq && selectedEq.isExpired) {
      setCalibrationErrorAlert(
        `Cannot start verification: Selected reference equipment [${selectedEq.equipmentId} - ${selectedEq.name}] calibration expired on ${selectedEq.calibrationExpiry}. Please select valid reference equipment.`
      )
      handleFeedback(`Blocked: Equipment ${selectedEq.equipmentId} calibration is expired.`)
      return
    }

    setCalibrationErrorAlert(null)
    setActiveCase(row)
    setActiveWorkspaceTab('Overview')
    setSelectedEquipment(row.selectedEquipmentId || 'eq-1')
    setEnvironmental(row.environmentalConditions)
    setChecklist(row.checklist)
    setReadings(row.readings)
    setPhotos(row.photos)
    setDocuments(row.documents)
    setObservations(row.observations || '')
    setDecision(row.decision || 'PASSED')
    setTypedSignature(officerName)
    setHasSignature(false)
    handleFeedback(`Opened verification workspace for ${row.caseId}`)
  }

  // Handle Equipment Selection change inside modal with safety check
  const handleEquipmentSelectionChange = (eqId: string) => {
    const selectedEq = equipmentList.find((e) => e.id === eqId)
    if (selectedEq && selectedEq.isExpired) {
      setCalibrationErrorAlert(
        `Warning: Selected reference equipment [${selectedEq.equipmentId}] calibration expired on ${selectedEq.calibrationExpiry}. It cannot be used for official calibration.`
      )
    } else {
      setCalibrationErrorAlert(null)
    }
    setSelectedEquipment(eqId)
  }

  // Handle Action Button click per status
  const handleRowAction = (row: GatcScheduleRow) => {
    openWorkspace(row)
  }

  // Primary action button in top header
  const handlePrimaryRecordAction = () => {
    const activeRow =
      scheduleRows.find((r) => r.status === 'In Progress') ||
      scheduleRows.find((r) => r.status === 'Scheduled') ||
      scheduleRows[0]
    if (activeRow) openWorkspace(activeRow)
  }

  // Checklist Item Toggle
  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    )
  }

  // Reading Entry Change with Automatic Pass/Fail calculation
  const handleReadingChange = (
    id: string,
    field: 'loadAppliedKg' | 'instrumentReadingKg' | 'maxPermissibleErrorKg',
    value: number
  ) => {
    setReadings((prev) =>
      prev.map((rd) => {
        if (rd.id !== id) return rd
        const updated = { ...rd, [field]: value }
        const calculatedError = Math.round((updated.instrumentReadingKg - updated.loadAppliedKg) * 1000) / 1000
        const isPassed = Math.abs(calculatedError) <= updated.maxPermissibleErrorKg
        return {
          ...updated,
          errorKg: calculatedError,
          passed: isPassed,
        }
      })
    )
  }

  // Add new Reading Entry
  const handleAddReading = () => {
    const newReading: GatcReading = {
      id: `rd-${Date.now()}`,
      loadAppliedKg: 20.0,
      instrumentReadingKg: 20.0,
      errorKg: 0.0,
      maxPermissibleErrorKg: 0.01,
      passed: true,
    }
    setReadings((prev) => [...prev, newReading])
  }

  // Remove Reading Entry
  const handleRemoveReading = (id: string) => {
    if (readings.length <= 1) return
    setReadings((prev) => prev.filter((rd) => rd.id !== id))
  }

  // Photo Upload Simulation
  const handlePhotoUpload = (key: keyof typeof photos) => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
    ]
    const randomUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)]
    setPhotos((prev) => ({ ...prev, [key]: randomUrl }))
    handleFeedback(`Photograph uploaded for ${key}`)
  }

  // Document Upload Simulation
  const handleAddDocument = () => {
    const newDoc: GatcUploadedDoc = {
      id: `doc-${Date.now()}`,
      name: `Verification_Proof_${Date.now().toString().slice(-4)}.pdf`,
      type: 'PDF Document',
      size: '1.4 MB',
      uploadDate: 'Today',
    }
    setDocuments((prev) => [...prev, newDoc])
    handleFeedback('Supporting document attached.')
  }

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#0c8d83'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  // Save Draft Handler
  const handleSaveDraft = () => {
    if (!activeCase) return
    setIsSubmitting(true)
    setTimeout(() => {
      setScheduleRows((prev) =>
        prev.map((r) =>
          r.caseId === activeCase.caseId
            ? {
                ...r,
                status: 'In Progress',
                environmentalConditions: environmental,
                checklist,
                readings,
                photos,
                documents,
                observations,
                decision,
              }
            : r
        )
      )
      setIsSubmitting(false)
      handleFeedback(`Draft saved for case ${activeCase.caseId}. Status set to In Progress.`)
    }, 500)
  }

  // Submit Final Results Handler to LMO Workflow
  const handleSubmitResults = () => {
    if (!activeCase) return

    // Verify selected equipment is not expired
    const selectedEq = equipmentList.find((e) => e.id === selectedEquipment)
    if (selectedEq && selectedEq.isExpired) {
      alert(`Cannot submit results: Reference equipment [${selectedEq.equipmentId}] calibration expired on ${selectedEq.calibrationExpiry}.`)
      return
    }

    setIsSubmitting(true)

    // Determine target status from decision
    let finalStatus: GatcScheduleRow['status'] = 'Completed'
    if (decision === 'FAILED') finalStatus = 'Failed'
    else if (decision === 'HOLD') finalStatus = 'Awaiting Evidence'

    setTimeout(() => {
      setScheduleRows((prev) =>
        prev.map((r) =>
          r.caseId === activeCase.caseId
            ? {
                ...r,
                status: finalStatus,
                environmentalConditions: environmental,
                checklist,
                readings,
                photos,
                documents,
                observations,
                decision,
              }
            : r
        )
      )

      // Add entry to submitted results list for LMO review
      const newSubmittedEntry = {
        id: `sub-${Date.now()}`,
        caseId: activeCase.caseId,
        instrument: activeCase.instrument,
        result: decision,
        submittedDate: 'Today, Just now',
        reviewingAuthority: 'R. K. Sharma (Senior LMO)',
        reviewStatus: 'Submitted' as const,
        remarks: `Technical test report submitted by ${officerName} to LMO for final certificate issuance decision.`,
        lmoEndorsed: false,
      }

      setSubmittedResults((prev) => [newSubmittedEntry, ...prev])
      setIsSubmitting(false)
      setActiveCase(null)
      handleFeedback(
        `Technical test report for ${activeCase.caseId} submitted to LMO. Final certificate decision rests with LMO.`
      )
    }, 700)
  }

  return (
    <div className="gatc-officer-dashboard">
      {/* Dynamic Header Section */}
      <section className="page-heading gatc-officer-heading">
        <div className="heading-text">
          <p className="eyebrow">GATC OFFICER / {centreName.toUpperCase()}</p>
          <h1>Good morning, {officerName}</h1>
          <p className="heading-copy">Here is your centre’s verification activity for today.</p>
        </div>
        <button
          className="primary-button gatc-record-action-btn"
          type="button"
          onClick={handlePrimaryRecordAction}
        >
          <PenSquare size={17} /> Record test results
        </button>
      </section>

      {/* Expired Calibration Alert Banner if triggered */}
      {calibrationErrorAlert && (
        <div className="gatc-calibration-error-banner" role="alert">
          <ShieldAlert size={20} color="#dc2626" />
          <div className="alert-content">
            <strong>CALIBRATION EXPIRED SAFETY GUARD TRIGGERED</strong>
            <p>{calibrationErrorAlert}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setCalibrationErrorAlert(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'Overview' && (
        <>
          {/* 4 KPI Cards */}
          <section className="gatc-kpi-cards-grid" aria-label="Key Performance Indicators">
            {gatcKpiStats.map((kpi) => {
              let IconComp = FileText
              let iconClass = 'blue'

              if (kpi.iconType === 'today') {
                IconComp = Calendar
                iconClass = 'teal'
              } else if (kpi.iconType === 'awaiting') {
                IconComp = Clock
                iconClass = 'amber'
              } else if (kpi.iconType === 'passed') {
                IconComp = CheckCircle2
                iconClass = 'green'
              }

              const isUp = kpi.trendDirection === 'up'

              return (
                <article key={kpi.label} className="gatc-kpi-card">
                  <div className={`gatc-kpi-icon-wrap ${iconClass}`}>
                    <IconComp size={20} />
                  </div>
                  <div className="gatc-kpi-details">
                    <span className="gatc-kpi-label">{kpi.label}</span>
                    <strong className="gatc-kpi-value">{kpi.value}</strong>
                    <div className={`gatc-kpi-trend ${isUp ? 'up' : 'down'}`}>
                      {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      <span>{kpi.trend}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          {/* Main 2-Column Content Grid */}
          <section className="gatc-main-grid">
            {/* Left Column: Today's Test Schedule */}
            <div className="panel gatc-schedule-panel">
              <div className="panel-header">
                <div>
                  <h2>Today’s Test Schedule</h2>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onNavigate && onNavigate('Test Schedule')}
                >
                  View full schedule <span>→</span>
                </button>
              </div>

              {/* 6 Search and Filters Bar */}
              <div className="gatc-multi-filter-bar">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    aria-label="Search schedule by Case ID, Applicant or Instrument"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Case ID, Applicant or Instrument..."
                  />
                </div>

                <div className="filter-selects-row">
                  {/* Instrument Filter */}
                  <div className="filter-select-item">
                    <select
                      aria-label="Filter by Instrument"
                      value={instrumentFilter}
                      onChange={(e) => setInstrumentFilter(e.target.value)}
                    >
                      <option value="All instruments">All Instruments</option>
                      <option value="Electronic weighing scale">Electronic scale</option>
                      <option value="Platform scale">Platform scale</option>
                      <option value="Retail counter scale">Retail scale</option>
                      <option value="Fuel dispenser">Fuel dispenser</option>
                      <option value="Weighbridge">Weighbridge</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="filter-select-item">
                    <select
                      aria-label="Filter by Date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="All dates">All Dates</option>
                      <option value="Today">Today</option>
                      <option value="20 Sep 2026">20 Sep 2026</option>
                      <option value="21 Sep 2026">21 Sep 2026</option>
                    </select>
                  </div>

                  {/* Verification Type Filter */}
                  <div className="filter-select-item">
                    <select
                      aria-label="Filter by Verification Type"
                      value={verificationTypeFilter}
                      onChange={(e) => setVerificationTypeFilter(e.target.value)}
                    >
                      <option value="All verification types">All Verification Types</option>
                      <option value="Initial verification">Initial verification</option>
                      <option value="Periodic verification">Periodic verification</option>
                      <option value="Re-verification">Re-verification</option>
                      <option value="Special inspection">Special inspection</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="filter-select-item">
                    <select
                      aria-label="Filter by Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All statuses">All Statuses</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Awaiting Evidence">Awaiting Evidence</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="filter-select-item">
                    <select
                      aria-label="Filter by Priority"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="All priorities">All Priorities</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Today's Test Schedule Table with exact 7 columns */}
              <div className="table-wrap gatc-schedule-table-wrap">
                <table className="gatc-schedule-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Case ID</th>
                      <th>Applicant/Business</th>
                      <th>Instrument</th>
                      <th>Verification Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScheduleRows.map((row) => {
                      let actionButtonLabel = 'Open Case'
                      let buttonClass = 'secondary-outline'

                      if (row.status === 'Scheduled') {
                        actionButtonLabel = 'Start Verification'
                        buttonClass = 'primary-solid'
                      } else if (row.status === 'In Progress') {
                        actionButtonLabel = 'Record Results'
                        buttonClass = 'primary-solid'
                      } else if (row.status === 'Awaiting Evidence') {
                        actionButtonLabel = 'Resume Test'
                        buttonClass = 'amber-solid'
                      }

                      return (
                        <tr key={row.caseId}>
                          <td className="slot-cell">{row.slot}</td>
                          <td className="case-id-cell">
                            <strong>{row.caseId}</strong>
                          </td>
                          <td className="applicant-cell">{row.applicant}</td>
                          <td className="instrument-cell">{row.instrument}</td>
                          <td className="test-type-cell">{row.verificationType}</td>
                          <td className="status-cell">
                            <span
                              className={`gatc-badge ${row.status.toLowerCase().replaceAll(' ', '-')}`}
                            >
                              <i /> {row.status}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button
                              type="button"
                              className={`gatc-row-btn ${buttonClass}`}
                              onClick={() => handleRowAction(row)}
                            >
                              {actionButtonLabel}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredScheduleRows.length === 0 && (
                  <div className="gatc-empty-state">
                    <AlertCircle size={30} color="#94a3b8" />
                    <p>No test cases match your current search and filter options.</p>
                  </div>
                )}
              </div>

              {/* Bottom Alert Banner with EXACT required text */}
              <div className="gatc-alert-banner">
                <div className="alert-icon-circle">!</div>
                <div className="alert-text">
                  <strong>Test reports require submission before the end of the day.</strong>
                  <span>Complete and submit pending technical test reports to avoid operational delays.</span>
                </div>
                <button
                  type="button"
                  className="alert-link-btn"
                  onClick={() => onNavigate && onNavigate('Submitted Results')}
                >
                  View pending results <span>→</span>
                </button>
              </div>
            </div>

            {/* Right Column: 6 Dynamic Status Items Centre Readiness Panel */}
            <div className="panel gatc-readiness-panel">
              <div className="panel-header">
                <h2>Centre Readiness</h2>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Options"
                  onClick={() => handleFeedback('Centre readiness options clicked')}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Displaying 6 dynamic status items */}
              <div className="gatc-readiness-list">
                {centreReadinessItems.map((item) => {
                  let IconComp = Weight
                  if (item.iconType === 'bench') IconComp = Sliders
                  else if (item.iconType === 'camera') IconComp = Camera
                  else if (item.iconType === 'certificate') IconComp = Award
                  else if (item.iconType === 'expiry') IconComp = Clock
                  else if (item.iconType === 'maintenance') IconComp = Wrench

                  return (
                    <div key={item.id} className="gatc-readiness-item">
                      <div className="readiness-icon-box">
                        <IconComp size={18} />
                      </div>
                      <div className="readiness-info">
                        <strong>{item.title}</strong>
                        <span>{item.subtext}</span>
                      </div>
                      <span className={`readiness-status-badge ${item.statusType}`}>
                        {item.statusType === 'valid' || item.statusType === 'available' || item.statusType === 'online' ? (
                          <Check size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {item.status}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="readiness-footer-action">
                <button
                  type="button"
                  className="secondary-button equipment-register-btn"
                  onClick={() => onNavigate && onNavigate('Test Equipment')}
                >
                  <Wrench size={14} /> View Equipment Register <span>→</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* TEST EQUIPMENT MODULE */}
      {activeSection === 'Test Equipment' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">EQUIPMENT REGISTER & CALIBRATION GUARDIAN</p>
              <h2>GATC Test Equipment Register</h2>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => handleFeedback('Opening equipment registration form')}
            >
              <Plus size={16} /> Add Equipment
            </button>
          </div>

          <div className="gatc-multi-filter-bar">
            <div className="search-field">
              <Search size={15} />
              <input
                aria-label="Search test equipment"
                value={equipmentSearchTerm}
                onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                placeholder="Search by Equipment ID, Name, Category or Capacity..."
              />
            </div>
            <div className="filter-selects-row">
              <div className="filter-select-item">
                <select
                  aria-label="Filter equipment status"
                  value={equipmentStatusFilter}
                  onChange={(e) => setEquipmentStatusFilter(e.target.value)}
                >
                  <option value="All Statuses">All Equipment Statuses</option>
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Calibration Due">Calibration Due</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="gatc-equipment-table">
              <thead>
                <tr>
                  <th>EQUIPMENT ID</th>
                  <th>EQUIPMENT NAME</th>
                  <th>CATEGORY</th>
                  <th>CAPACITY / RANGE</th>
                  <th>CALIBRATION DATE</th>
                  <th>CALIBRATION EXPIRY</th>
                  <th>STATUS</th>
                  <th>MAINTENANCE HISTORY</th>
                  <th>CERTIFICATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className={eq.isExpired ? 'row-expired' : ''}>
                    <td className="eq-id-cell">
                      <strong>{eq.equipmentId}</strong>
                    </td>
                    <td className="eq-name-cell">
                      <strong>{eq.name}</strong>
                    </td>
                    <td>{eq.category}</td>
                    <td>{eq.capacityRange}</td>
                    <td>{eq.calibrationDate}</td>
                    <td className={eq.isExpired ? 'text-expired' : ''}>
                      {eq.calibrationExpiry}
                      {eq.isExpired && <span className="expired-badge">EXPIRED</span>}
                    </td>
                    <td>
                      <span className={`eq-status-badge ${eq.status.toLowerCase().replaceAll(' ', '-')}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td className="maintenance-cell">{eq.maintenanceHistory}</td>
                    <td>
                      <button
                        type="button"
                        className="doc-view-btn"
                        onClick={() => handleFeedback(`Downloading certificate ${eq.calibrationCertificate}`)}
                      >
                        <Download size={13} /> {eq.calibrationCertificate}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBMITTED RESULTS MODULE */}
      {activeSection === 'Submitted Results' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">REPORTS REGISTER & GOVERNANCE AUDIT</p>
              <h2>Submitted Technical Test Results</h2>
            </div>
          </div>

          {/* LMO Workflow Governance Banner */}
          <div className="lmo-governance-notice-banner">
            <Lock size={18} color="#0c8d83" />
            <div>
              <strong>TECHNICAL TEST REPORT SUBMITTED TO LMO</strong>
              <p>
                GATC Officers submit technical calibration reports. Final legal metrology certificate issuance authority rests exclusively with the assigned Legal Metrology Officer (LMO).
              </p>
            </div>
          </div>

          <div className="table-toolbar">
            <select
              className="filter-button"
              aria-label="Filter Review Status"
              value={resultsReviewFilter}
              onChange={(e) => setResultsReviewFilter(e.target.value)}
            >
              <option value="All Review Statuses">All Review Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Returned for Correction">Returned for Correction</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="table-wrap">
            <table className="gatc-results-table">
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>INSTRUMENT</th>
                  <th>RESULT</th>
                  <th>SUBMITTED DATE</th>
                  <th>REVIEWING AUTHORITY</th>
                  <th>REVIEW STATUS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmittedResults.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.caseId}</strong>
                    </td>
                    <td>{item.instrument}</td>
                    <td>
                      <span className={`status-pill ${item.result.toLowerCase()}`}>
                        {item.result}
                      </span>
                    </td>
                    <td>{item.submittedDate}</td>
                    <td>{item.reviewingAuthority}</td>
                    <td>
                      <span className={`review-status-badge ${item.reviewStatus.toLowerCase().replaceAll(' ', '-')}`}>
                        {item.reviewStatus}
                      </span>
                    </td>
                    <td className="remarks-cell">{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CENTRE REPORTS MODULE */}
      {activeSection === 'Centre Reports' && (
        <section className="workspace-panel panel gatc-reports-module">
          <div className="panel-header">
            <div>
              <p className="eyebrow">OPERATIONAL ANALYTICS & COMPLIANCE</p>
              <h2>Centre Performance Reports</h2>
            </div>
          </div>

          {/* 5 Operational Metrics Cards */}
          <div className="reports-kpi-grid">
            <div className="reports-metric-card">
              <span>Total Cases Allocated</span>
              <strong>{gatcReportsData.totalAllocated}</strong>
              <small>All scheduled & verified cases</small>
            </div>
            <div className="reports-metric-card">
              <span>Pass / Fail Rate</span>
              <strong>{gatcReportsData.passPercentage}%</strong>
              <small>94.2% Pass · 5.8% Fail</small>
            </div>
            <div className="reports-metric-card">
              <span>Avg Completion Time</span>
              <strong>{gatcReportsData.avgCompletionMins} mins</strong>
              <small>Per technical verification</small>
            </div>
            <div className="reports-metric-card">
              <span>Pending Tests</span>
              <strong>{gatcReportsData.pendingTests}</strong>
              <small>In queue for verification</small>
            </div>
            <div className="reports-metric-card">
              <span>Equipment Utilisation</span>
              <strong>{gatcReportsData.equipmentUtilisation}%</strong>
              <small>Active reference standard rate</small>
            </div>
          </div>

          {/* Officer Performance & Monthly Trend Grid */}
          <div className="reports-grid-2col">
            {/* Officer Performance Table */}
            <div className="workspace-card">
              <div className="card-heading">
                <UserCheck size={16} />
                <h3>Officer Verification Performance</h3>
              </div>
              <table className="gatc-schedule-table">
                <thead>
                  <tr>
                    <th>OFFICER NAME</th>
                    <th>TESTS COMPLETED</th>
                    <th>PASS RATE</th>
                    <th>AVG TURNAROUND</th>
                  </tr>
                </thead>
                <tbody>
                  {gatcReportsData.officerPerformance.map((off) => (
                    <tr key={off.name}>
                      <td>
                        <strong>{off.name}</strong>
                      </td>
                      <td>{off.testsCompleted}</td>
                      <td>
                        <span className="status-pill pass">{off.passRate}</span>
                      </td>
                      <td>{off.avgTurnaround}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Verification Trend Visual Chart */}
            <div className="workspace-card">
              <div className="card-heading">
                <BarChart3 size={16} />
                <h3>Monthly Verification Trend (2026)</h3>
              </div>
              <div className="monthly-chart-wrap">
                {gatcReportsData.monthlyTrend.map((m) => (
                  <div key={m.month} className="chart-bar-group">
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${(m.count / 40) * 120}px` }}
                      title={`${m.count} verifications`}
                    />
                    <span className="chart-label">{m.month}</span>
                    <small className="chart-val">{m.count}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Allocated Cases Workspace Section */}
      {activeSection === 'Allocated Cases' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">WORK QUEUE</p>
              <h2>Allocated Cases Register</h2>
            </div>
            <span className="queue-count">{scheduleRows.length} total cases allocated</span>
          </div>

          <div className="table-wrap">
            <table className="gatc-schedule-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Case ID</th>
                  <th>Applicant/Business</th>
                  <th>Instrument</th>
                  <th>Verification Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr key={row.caseId}>
                    <td className="slot-cell">{row.slot}</td>
                    <td>
                      <strong>{row.caseId}</strong>
                    </td>
                    <td>{row.applicant}</td>
                    <td>{row.instrument}</td>
                    <td>{row.verificationType}</td>
                    <td>
                      <span className={`gatc-badge ${row.status.toLowerCase().replaceAll(' ', '-')}`}>
                        <i /> {row.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gatc-row-btn secondary-outline"
                        onClick={() => openWorkspace(row)}
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Test Schedule Section */}
      {activeSection === 'Test Schedule' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">CENTRE TIMETABLE</p>
              <h2>Test Schedule & Appointments</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="gatc-schedule-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Case ID</th>
                  <th>Applicant/Business</th>
                  <th>Instrument</th>
                  <th>Verification Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr key={row.caseId}>
                    <td className="slot-cell">{row.slot}</td>
                    <td>
                      <strong>{row.caseId}</strong>
                    </td>
                    <td>{row.applicant}</td>
                    <td>{row.instrument}</td>
                    <td>{row.verificationType}</td>
                    <td>
                      <span className={`gatc-badge ${row.status.toLowerCase().replaceAll(' ', '-')}`}>
                        <i /> {row.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gatc-row-btn primary-solid"
                        onClick={() => openWorkspace(row)}
                      >
                        Record Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Certificates Section */}
      {activeSection === 'Certificates' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">LEGAL CERTIFICATES & GOVERNANCE</p>
              <h2>Issued Test Certificates</h2>
            </div>
          </div>
          <div className="lmo-governance-notice-banner">
            <Lock size={18} color="#0c8d83" />
            <div>
              <strong>LEGAL METROLOGY CERTIFICATE ISSUANCE AUTHORITY</strong>
              <p>
                GATC Officers record technical verification results and submit reports to Legal Metrology Officers. Final legal verification certificates are generated and endorsed by the LMO.
              </p>
            </div>
          </div>
          <div className="empty-state">
            <Award size={32} color="#94a3b8" />
            <p>Verification test certificates endorsed by Legal Metrology Officers appear here upon final sign-off.</p>
          </div>
        </section>
      )}

      {/* Notifications Section */}
      {activeSection === 'Notifications' && (
        <section className="workspace-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ALERTS</p>
              <h2>Notifications & Reminders</h2>
            </div>
          </div>
          <div className="notifications-list-view">
            <div className="notification-row">
              <Bell size={18} color="#0c8d83" />
              <div>
                <strong>Test reports require submission before the end of the day.</strong>
                <span>Ensure test certificates are signed off by the GATC technical officer and sent to LMO.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Help Centre Section */}
      {activeSection === 'Help Centre' && (
        <section className="workspace-panel panel empty-workspace">
          <div className="panel-header">
            <div>
              <p className="eyebrow">SUPPORT</p>
              <h2>GATC Officer Help Centre</h2>
            </div>
          </div>
          <div className="workspace-intro-box">
            <LifeBuoy size={36} color="#0c8d83" />
            <h3>Need technical support or calibration SOP guidance?</h3>
            <p>
              Access standard operating procedures for legal metrology verification, load cell tolerances, and NABL compliance guidelines.
            </p>
          </div>
        </section>
      )}

      {/* VERIFICATION WORKSPACE MODAL WITH 5 EQUAL-SIZED TABS */}
      {activeCase && (
        <div className="modal-backdrop gatc-fixed-modal-backdrop" role="presentation">
          <div className="modal gatc-fixed-workspace-modal" role="dialog" aria-modal="true">
            {/* Modal Fixed Header */}
            <div className="workspace-header">
              <div className="workspace-title-group">
                <div className="workspace-badge">
                  <FlaskConical size={16} />
                  <span>GATC TECHNICAL VERIFICATION WORKSPACE</span>
                </div>
                <h2>
                  Case: {activeCase.caseId} – {activeCase.applicantDetails.name}
                </h2>
                <p>
                  {activeCase.instrumentSpecs.type} · Priority: {activeCase.priority} · {activeCase.date}
                </p>
              </div>
              <button
                className="icon-button close-workspace-btn"
                type="button"
                aria-label="Close modal"
                onClick={() => setActiveCase(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Fixed 5 Equal-Sized Navigation Tabs */}
            <div className="gatc-equal-workspace-tabs">
              {(
                [
                  'Overview',
                  'Instrument Details',
                  'Testing and Readings',
                  'Photos and Evidence',
                  'Decision and Signature',
                ] as const
              ).map((tabName) => (
                <button
                  key={tabName}
                  type="button"
                  className={`gatc-equal-tab-btn ${activeWorkspaceTab === tabName ? 'active' : ''}`}
                  onClick={() => setActiveWorkspaceTab(tabName)}
                >
                  <span>{tabName}</span>
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="workspace-body gatc-fixed-modal-body">
              {/* TAB 1: OVERVIEW */}
              {activeWorkspaceTab === 'Overview' && (
                <div className="workspace-tab-content">
                  <div className="workspace-grid-2col">
                    {/* Application Details Card */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <FileText size={16} />
                        <h3>Application & Fee Details</h3>
                      </div>
                      <dl className="details-list">
                        <div>
                          <dt>Application No</dt>
                          <dd>
                            <strong>{activeCase.applicationDetails.applicationNo}</strong>
                          </dd>
                        </div>
                        <div>
                          <dt>Submitted Date</dt>
                          <dd>{activeCase.applicationDetails.submittedDate}</dd>
                        </div>
                        <div>
                          <dt>Fee Payment Status</dt>
                          <dd>
                            <span className="paid-tag">{activeCase.applicationDetails.feeStatus}</span>
                          </dd>
                        </div>
                        <div>
                          <dt>Category</dt>
                          <dd>{activeCase.applicationDetails.category}</dd>
                        </div>
                        <div>
                          <dt>Jurisdiction</dt>
                          <dd>{activeCase.applicationDetails.jurisdiction}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Applicant & Business Details Card */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <Building2 size={16} />
                        <h3>Applicant / Business Details</h3>
                      </div>
                      <dl className="details-list">
                        <div>
                          <dt>Business Name</dt>
                          <dd>
                            <strong>{activeCase.applicantDetails.name}</strong>
                          </dd>
                        </div>
                        <div>
                          <dt>GSTIN</dt>
                          <dd>
                            <code>{activeCase.applicantDetails.gstin}</code>
                          </dd>
                        </div>
                        <div>
                          <dt>License No</dt>
                          <dd>{activeCase.applicantDetails.licenseNo}</dd>
                        </div>
                        <div>
                          <dt>Contact Person</dt>
                          <dd>{activeCase.applicantDetails.contactPerson}</dd>
                        </div>
                        <div>
                          <dt>Phone & Email</dt>
                          <dd>
                            {activeCase.applicantDetails.phone} · {activeCase.applicantDetails.email}
                          </dd>
                        </div>
                        <div>
                          <dt>Premises Address</dt>
                          <dd>{activeCase.applicantDetails.address}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Verification Testing Summary Card */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <UserCheck size={16} />
                        <h3>Testing Summary & Officer</h3>
                      </div>
                      <dl className="details-list">
                        <div>
                          <dt>Verifying Officer</dt>
                          <dd>
                            <strong>{officerName}</strong>
                          </dd>
                        </div>
                        <div>
                          <dt>Assigned Test Centre</dt>
                          <dd>{centreName}</dd>
                        </div>
                        <div>
                          <dt>Verification Type</dt>
                          <dd>
                            <span className="type-tag">{activeCase.verificationType}</span>
                          </dd>
                        </div>
                        <div>
                          <dt>Scheduled Slot</dt>
                          <dd>
                            {activeCase.date}, {activeCase.slot}
                          </dd>
                        </div>
                        <div>
                          <dt>Current Status</dt>
                          <dd>
                            <span className={`gatc-badge ${activeCase.status.toLowerCase().replaceAll(' ', '-')}`}>
                              <i /> {activeCase.status}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Previous History Summary Card */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <History size={16} />
                        <h3>Previous Verification Summary</h3>
                      </div>
                      <dl className="details-list">
                        <div>
                          <dt>Last Verification Date</dt>
                          <dd>{activeCase.previousHistory.lastInspectionDate}</dd>
                        </div>
                        <div>
                          <dt>Certificate Number</dt>
                          <dd>{activeCase.previousHistory.certificateNo}</dd>
                        </div>
                        <div>
                          <dt>Last Outcome</dt>
                          <dd>
                            <span className="status-pill pass">
                              {activeCase.previousHistory.lastOutcome}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt>Previous Seal No</dt>
                          <dd>
                            <code>{activeCase.previousHistory.sealNumber}</code>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTRUMENT DETAILS */}
              {activeWorkspaceTab === 'Instrument Details' && (
                <div className="workspace-tab-content">
                  <div className="workspace-grid-2col">
                    {/* Instrument Specs */}
                    <div className="workspace-card full-width">
                      <div className="card-heading">
                        <Wrench size={16} />
                        <h3>Instrument Technical Specifications</h3>
                      </div>
                      <div className="history-strip">
                        <div>
                          <span>Instrument Type</span>
                          <strong>{activeCase.instrumentSpecs.type}</strong>
                        </div>
                        <div>
                          <span>Manufacturer</span>
                          <strong>{activeCase.instrumentSpecs.manufacturer}</strong>
                        </div>
                        <div>
                          <span>Model Number</span>
                          <strong>{activeCase.instrumentSpecs.model}</strong>
                        </div>
                        <div>
                          <span>Serial Number</span>
                          <strong>{activeCase.instrumentSpecs.serialNumber}</strong>
                        </div>
                        <div>
                          <span>Measuring Capacity</span>
                          <strong>{activeCase.instrumentSpecs.capacity}</strong>
                        </div>
                      </div>
                      <div className="history-strip" style={{ marginTop: '10px' }}>
                        <div>
                          <span>Accuracy Class</span>
                          <strong>{activeCase.instrumentSpecs.accuracyClass}</strong>
                        </div>
                        <div>
                          <span>Minimum Load</span>
                          <strong>{activeCase.instrumentSpecs.minLoad}</strong>
                        </div>
                        <div>
                          <span>Verification Interval</span>
                          <strong>{activeCase.instrumentSpecs.verificationInterval}</strong>
                        </div>
                        <div>
                          <span>Installation Premises</span>
                          <strong>{activeCase.instrumentSpecs.premisesLocation}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Complete Historical Log Table */}
                    <div className="workspace-card full-width">
                      <div className="card-heading">
                        <History size={16} />
                        <h3>Historical Verification Logs & Seals</h3>
                      </div>
                      <table className="gatc-schedule-table">
                        <thead>
                          <tr>
                            <th>DATE</th>
                            <th>CERTIFICATE NO</th>
                            <th>OFFICER</th>
                            <th>OUTCOME</th>
                            <th>SEAL NO</th>
                            <th>REMARKS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeCase.historyLogs && activeCase.historyLogs.length > 0 ? (
                            activeCase.historyLogs.map((log, idx) => (
                              <tr key={idx}>
                                <td>{log.date}</td>
                                <td>
                                  <strong>{log.certificateNo}</strong>
                                </td>
                                <td>{log.officer}</td>
                                <td>
                                  <span className="status-pill pass">{log.outcome}</span>
                                </td>
                                <td>
                                  <code>{log.sealNo}</code>
                                </td>
                                <td>{log.remarks}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td>{activeCase.previousHistory.lastInspectionDate}</td>
                              <td>
                                <strong>{activeCase.previousHistory.certificateNo}</strong>
                              </td>
                              <td>{activeCase.previousHistory.lastOfficer}</td>
                              <td>
                                <span className="status-pill pass">
                                  {activeCase.previousHistory.lastOutcome}
                                </span>
                              </td>
                              <td>
                                <code>{activeCase.previousHistory.sealNumber}</code>
                              </td>
                              <td>Periodic legal metrology verification complete.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TESTING AND READINGS */}
              {activeWorkspaceTab === 'Testing and Readings' && (
                <div className="workspace-tab-content">
                  {/* Applicable Test Standard Box */}
                  <div className="standard-banner-box">
                    <Info size={18} color="#0c8d83" />
                    <div>
                      <strong>APPLICABLE LEGAL METROLOGY TEST STANDARD</strong>
                      <p>{activeCase.applicableStandard}</p>
                    </div>
                  </div>

                  <div className="workspace-grid-2col">
                    {/* Reference Equipment Selection with Expired Calibration Safety Check */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <Weight size={16} />
                        <h3>Reference Equipment Selection</h3>
                      </div>
                      <label className="field-label">
                        Select NABL Traceable Standard Weights / Equipment:
                        <select
                          className="gatc-select-full"
                          value={selectedEquipment}
                          onChange={(e) => handleEquipmentSelectionChange(e.target.value)}
                        >
                          {equipmentList.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              [{eq.equipmentId}] {eq.name} ({eq.isExpired ? 'EXPIRED' : `Exp: ${eq.calibrationExpiry}`})
                            </option>
                          ))}
                        </select>
                      </label>
                      <small className="field-hint">
                        Selected mass standard must have valid NABL calibration traceability.
                      </small>
                    </div>

                    {/* Environmental Conditions */}
                    <div className="workspace-card">
                      <div className="card-heading">
                        <Thermometer size={16} />
                        <h3>Environmental Conditions</h3>
                      </div>
                      <div className="environmental-inputs-grid">
                        <label>
                          Temperature (°C)
                          <input
                            type="number"
                            step="0.1"
                            value={environmental.temperatureC}
                            onChange={(e) =>
                              setEnvironmental((prev) => ({
                                ...prev,
                                temperatureC: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </label>
                        <label>
                          Humidity (% RH)
                          <input
                            type="number"
                            step="1"
                            value={environmental.humidityPercent}
                            onChange={(e) =>
                              setEnvironmental((prev) => ({
                                ...prev,
                                humidityPercent: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </label>
                        <label>
                          Pressure (hPa)
                          <input
                            type="number"
                            step="0.1"
                            value={environmental.pressureHpa}
                            onChange={(e) =>
                              setEnvironmental((prev) => ({
                                ...prev,
                                pressureHpa: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Standard Test Checklist */}
                  <div className="workspace-card full-width">
                    <div className="card-heading">
                      <CheckCircle2 size={16} />
                      <h3>Standard Verification Checklist</h3>
                    </div>
                    <div className="checklist-group">
                      {checklist.map((chk) => (
                        <div key={chk.id} className="checklist-row">
                          <div className="checklist-info">
                            <span className="checklist-cat">{chk.category}</span>
                            <strong>{chk.item}</strong>
                            {chk.remarks && <small className="chk-remarks">{chk.remarks}</small>}
                          </div>
                          <button
                            type="button"
                            className={`checklist-toggle ${chk.passed ? 'passed' : 'failed'}`}
                            onClick={() => toggleChecklistItem(chk.id)}
                          >
                            {chk.passed ? <Check size={14} /> : <X size={14} />}
                            <span>{chk.passed ? 'PASS' : 'FAIL'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multiple Reading Entries Table */}
                  <div className="workspace-card full-width">
                    <div className="card-heading justify-between">
                      <div className="heading-left">
                        <Sliders size={16} />
                        <h3>Load Test Readings & Automatic Tolerance Comparison</h3>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        onClick={handleAddReading}
                      >
                        <PlusCircle size={15} /> Add test point
                      </button>
                    </div>

                    <table className="workspace-readings-table">
                      <thead>
                        <tr>
                          <th>TEST LOAD APPLIED (kg)</th>
                          <th>INSTRUMENT READING (kg)</th>
                          <th>CALCULATED ERROR (kg)</th>
                          <th>MAX PERMISSIBLE ERROR (MPE ±kg)</th>
                          <th>AUTOMATIC VERDICT</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readings.map((rd) => (
                          <tr key={rd.id}>
                            <td>
                              <input
                                className="reading-input"
                                type="number"
                                step="0.001"
                                value={rd.loadAppliedKg}
                                onChange={(e) =>
                                  handleReadingChange(
                                    rd.id,
                                    'loadAppliedKg',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="reading-input"
                                type="number"
                                step="0.001"
                                value={rd.instrumentReadingKg}
                                onChange={(e) =>
                                  handleReadingChange(
                                    rd.id,
                                    'instrumentReadingKg',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td>
                              <strong className={rd.passed ? 'error-ok' : 'error-high'}>
                                {rd.errorKg > 0 ? `+${rd.errorKg}` : rd.errorKg} kg
                              </strong>
                            </td>
                            <td>
                              <input
                                className="reading-input"
                                type="number"
                                step="0.001"
                                value={rd.maxPermissibleErrorKg}
                                onChange={(e) =>
                                  handleReadingChange(
                                    rd.id,
                                    'maxPermissibleErrorKg',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                            <td>
                              <span className={`tolerance-badge ${rd.passed ? 'pass' : 'fail'}`}>
                                {rd.passed ? 'PASS (Within MPE)' : 'FAIL (Exceeds MPE)'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="icon-button"
                                title="Remove test point"
                                onClick={() => handleRemoveReading(rd.id)}
                              >
                                <Trash2 size={15} color="#ef4444" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PHOTOS AND EVIDENCE */}
              {activeWorkspaceTab === 'Photos and Evidence' && (
                <div className="workspace-tab-content">
                  {/* Photo Upload Grid */}
                  <div className="workspace-card full-width">
                    <div className="card-heading">
                      <Camera size={16} />
                      <h3>Mandatory Instrument Photographs</h3>
                    </div>

                    <div className="photos-grid">
                      {/* Photo 1: Serial Plate */}
                      <div className="photo-upload-box">
                        <div className="photo-preview">
                          {photos.serialPlateUrl ? (
                            <img src={photos.serialPlateUrl} alt="Serial Plate" />
                          ) : (
                            <span className="photo-placeholder">No photograph</span>
                          )}
                        </div>
                        <strong>1. Serial Plate Photo</strong>
                        <span>Manufacturer serial plate & approval mark</span>
                        <button
                          type="button"
                          className="upload-btn"
                          onClick={() => handlePhotoUpload('serialPlateUrl')}
                        >
                          <Upload size={13} /> {photos.serialPlateUrl ? 'Re-upload' : 'Upload photo'}
                        </button>
                      </div>

                      {/* Photo 2: Seal Intact */}
                      <div className="photo-upload-box">
                        <div className="photo-preview">
                          {photos.sealIntactUrl ? (
                            <img src={photos.sealIntactUrl} alt="Verification Seal" />
                          ) : (
                            <span className="photo-placeholder">No photograph</span>
                          )}
                        </div>
                        <strong>2. Security Seal Photo</strong>
                        <span>Verification seal wire & lead seal</span>
                        <button
                          type="button"
                          className="upload-btn"
                          onClick={() => handlePhotoUpload('sealIntactUrl')}
                        >
                          <Upload size={13} /> {photos.sealIntactUrl ? 'Re-upload' : 'Upload photo'}
                        </button>
                      </div>

                      {/* Photo 3: Display Reading */}
                      <div className="photo-upload-box">
                        <div className="photo-preview">
                          {photos.displayUrl ? (
                            <img src={photos.displayUrl} alt="Display Reading" />
                          ) : (
                            <span className="photo-placeholder">No photograph</span>
                          )}
                        </div>
                        <strong>3. Display Reading Photo</strong>
                        <span>Instrument digital/analog weight display</span>
                        <button
                          type="button"
                          className="upload-btn"
                          onClick={() => handlePhotoUpload('displayUrl')}
                        >
                          <Upload size={13} /> {photos.displayUrl ? 'Re-upload' : 'Upload photo'}
                        </button>
                      </div>

                      {/* Photo 4: Full Setup */}
                      <div className="photo-upload-box">
                        <div className="photo-preview">
                          {photos.fullSetupUrl ? (
                            <img src={photos.fullSetupUrl} alt="Full Setup" />
                          ) : (
                            <span className="photo-placeholder">No photograph</span>
                          )}
                        </div>
                        <strong>4. Full Setup Photo</strong>
                        <span>Overall instrument installation in lab/site</span>
                        <button
                          type="button"
                          className="upload-btn"
                          onClick={() => handlePhotoUpload('fullSetupUrl')}
                        >
                          <Upload size={13} /> {photos.fullSetupUrl ? 'Re-upload' : 'Upload photo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Documents Upload */}
                  <div className="workspace-card full-width">
                    <div className="card-heading justify-between">
                      <div className="heading-left">
                        <FileText size={16} />
                        <h3>Supporting Document Uploads</h3>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        onClick={handleAddDocument}
                      >
                        <PlusCircle size={15} /> Attach document
                      </button>
                    </div>

                    <div className="docs-list">
                      {documents.map((doc) => (
                        <div key={doc.id} className="doc-item">
                          <FileText size={18} color="#0c8d83" />
                          <div className="doc-info">
                            <strong>{doc.name}</strong>
                            <span>
                              {doc.type} · {doc.size} · Uploaded {doc.uploadDate}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="doc-view-btn"
                            onClick={() => handleFeedback(`Viewing document ${doc.name}`)}
                          >
                            <Download size={13} /> View
                          </button>
                        </div>
                      ))}

                      {documents.length === 0 && (
                        <p className="empty-state">No supporting documents attached yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DECISION AND SIGNATURE */}
              {activeWorkspaceTab === 'Decision and Signature' && (
                <div className="workspace-tab-content">
                  {/* Officer Observations */}
                  <div className="workspace-card full-width">
                    <div className="card-heading">
                      <PenSquare size={16} />
                      <h3>Officer Technical Observations</h3>
                    </div>
                    <textarea
                      className="observations-textarea"
                      rows={4}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Enter officer notes, load cell performance, linearity findings, seal wire replacement details..."
                    />
                  </div>

                  {/* Verification Decision Radio Options */}
                  <div className="workspace-card full-width">
                    <div className="card-heading">
                      <ShieldCheck size={16} />
                      <h3>Verification Decision Verdict</h3>
                    </div>
                    <div className="decision-selector">
                      {/* Pass Option */}
                      <label
                        className={`decision-option pass ${decision === 'PASSED' ? 'selected' : ''}`}
                        onClick={() => setDecision('PASSED')}
                      >
                        <div className="option-copy">
                          <strong>PASSED</strong>
                          <span>Instrument complies with all MPE tolerances & standards.</span>
                        </div>
                      </label>

                      {/* Fail Option */}
                      <label
                        className={`decision-option fail ${decision === 'FAILED' ? 'selected' : ''}`}
                        onClick={() => setDecision('FAILED')}
                      >
                        <div className="option-copy">
                          <strong>FAILED</strong>
                          <span>Instrument error exceeds MPE limits or seal broken.</span>
                        </div>
                      </label>

                      {/* Hold Option */}
                      <label
                        className={`decision-option flag ${decision === 'HOLD' ? 'selected' : ''}`}
                        onClick={() => setDecision('HOLD')}
                      >
                        <div className="option-copy">
                          <strong>HOLD</strong>
                          <span>Hold verification pending repair certificate / evidence.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* LMO Governance Authority Notice */}
                  <div className="lmo-governance-notice-banner" style={{ margin: 0 }}>
                    <Lock size={16} color="#0c8d83" />
                    <div>
                      <strong>GOVERNANCE RESTRICTION: TECHNICAL TEST REPORT SUBMISSION</strong>
                      <p>
                        Submitting this report sends technical calibration findings to the Legal Metrology Officer. Final legal certificate issuance rests exclusively with LMO approval.
                      </p>
                    </div>
                  </div>

                  {/* Digital Signature Panel */}
                  <div className="workspace-card full-width">
                    <div className="card-heading justify-between">
                      <div className="heading-left">
                        <PenSquare size={16} />
                        <h3>GATC Verifying Officer Digital Signature</h3>
                      </div>
                      <div className="sig-type-tabs">
                        <button
                          type="button"
                          className={signatureType === 'draw' ? 'active' : ''}
                          onClick={() => setSignatureType('draw')}
                        >
                          Draw Signature
                        </button>
                        <button
                          type="button"
                          className={signatureType === 'type' ? 'active' : ''}
                          onClick={() => setSignatureType('type')}
                        >
                          Typed Signature
                        </button>
                      </div>
                    </div>

                    {signatureType === 'draw' ? (
                      <div className="canvas-container">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          className="signature-canvas"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />
                        <button type="button" className="clear-sig-btn" onClick={clearCanvas}>
                          <Eraser size={12} /> Clear
                        </button>
                        <small className="sig-hint">
                          Draw officer signature inside the box using mouse or touch screen.
                        </small>
                      </div>
                    ) : (
                      <div className="typed-signature-box">
                        <input
                          className="typed-sig-input"
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          placeholder="Type full legal name for digital sign-off"
                        />
                        <div className="typed-sig-preview">
                          {typedSignature || officerName} (Digitally Signed)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Fixed Footer with Save Draft and Submit Results Buttons */}
            <div className="workspace-footer">
              <div className="footer-status-indicator">
                <span className="status-dot-active" />
                <span>GATC Lab Connected · Standard Valid</span>
              </div>

              <div className="footer-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={isSubmitting}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  className="primary-button"
                  disabled={isSubmitting}
                  onClick={handleSubmitResults}
                >
                  <Send size={15} />
                  {isSubmitting ? 'Submitting to LMO...' : 'Submit Technical Report to LMO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
