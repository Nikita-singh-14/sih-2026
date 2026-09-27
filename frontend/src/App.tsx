import './App.css'
import { Bell, ChevronDown, CircleHelp, LockKeyhole, Mail, Menu, Search, Shield, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { StatCard } from './components/dashboard/StatCard'
import { LmoDashboard } from './components/dashboard/LmoDashboard'
import { GatcDashboard } from './components/dashboard/GatcDashboard'
import { BusinessDashboard } from './components/business/BusinessDashboard'
import { StateAdminWorkspaces } from './components/admin/StateAdminWorkspaces'
import { StateAdminOverview } from './components/admin/StateAdminOverview'
import { StateAdminApplications } from './components/admin/StateAdminApplications'
import { StateAdminInstruments } from './components/admin/StateAdminInstruments'
import { StateAdminCertificates } from './components/admin/StateAdminCertificates'
import { StateAdminFieldOperations } from './components/admin/StateAdminFieldOperations'
import { StateAdminStakeholders } from './components/admin/StateAdminStakeholders'
import { StateAdminReports } from './components/admin/StateAdminReports'
import { StateAdminSettings } from './components/admin/StateAdminSettings'
import './components/business/BusinessDashboard.css'
import './components/admin/StateAdmin.css'
import { StatusBadge } from './components/ui/StatusBadge'
import { applications, dashboardStats, instruments, notifications, upcomingVisits } from './features/dashboard/data'
import {
  initialAdminApplications,
  initialAdminCertificates,
  initialAdminInspections,
  initialAdminInstruments,
  initialAdminOfficers,
  initialApplicants,
  initialGatcOfficersList,
  initialLmoOfficersList,
} from './features/admin/adminData'
import type {
  AdminApplicantStakeholder,
  AdminApplication,
  AdminApplicationStatus,
  AdminCertificate,
  AdminFieldInspection,
  AdminGatcOfficerStakeholder,
  AdminInstrument,
  AdminLmoOfficerStakeholder,
  AdminOfficer,
} from './features/admin/adminTypes'
import type { ApplicationStatus, AuthUser, Instrument, InstrumentStatus, Role } from './types';
import MyAssignments from './components/lmo/MyAssignments';
import TodaysRoute from './components/lmo/TodaysRoute';
import FieldInspections from './components/lmo/FieldInspections';
import OfflineCases from './components/lmo/OfflineCases';
import SubmittedReports from './components/lmo/SubmittedReports';
import FlaggedInstruments from './components/lmo/FlaggedInstruments';
import LmoNotifications from './components/lmo/Notifications';

const roleOptions: { value: Role; description: string }[] = [
  { value: 'State Administrator', description: 'Manage statewide operations, users, and reports' },
  { value: 'Legal Metrology Officer', description: 'Review applications and conduct field verification' },
  { value: 'GATC Officer', description: 'Conduct GATC centre testing & verification operations' },
  { value: 'GATC Operator', description: 'Manage centre appointments and test reports' },
  { value: 'Applicant / Business', description: 'Submit applications and manage instruments' },
]

const backendRoles: Record<string, Role> = {
  STATE_ADMINISTRATOR: 'State Administrator',
  LEGAL_METROLOGY_OFFICER: 'Legal Metrology Officer',
  GATC_OFFICER: 'GATC Officer',
  GATC_OPERATOR: 'GATC Operator',
  APPLICANT_BUSINESS: 'Applicant / Business',
}

function AuthPage({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('Applicant / Business')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim()
    const password = String(formData.get('password'))
    if (password.length < 6) {
      setError('Use a password with at least 6 characters.')
      return
    }
    const role = String(formData.get('role') || 'State Administrator') as Role
    const name = mode === 'signup' ? String(formData.get('name')).trim() : email.split('@')[0] || 'Arjun Sharma'
    if (mode === 'signup' && !name) {
      setError('Enter your full name to continue.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password, role: Object.entries(backendRoles).find(([, label]) => label === role)?.[0] }),
      })
      const result = await response.json() as {
        message?: string
        accessToken?: string
        user?: { id: string; name: string; email: string; role: string; jurisdiction?: { district?: string; state?: string } }
      }
      if (!response.ok || !result.accessToken || !result.user) throw new Error(result.message || 'Unable to authenticate right now')
      
      const authenticatedUser: AuthUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: backendRoles[result.user.role] || role,
        rawRole: result.user.role,
        jurisdiction: result.user.jurisdiction,
      }
      
      localStorage.setItem('measuresure-session', JSON.stringify(authenticatedUser))
      localStorage.setItem('measuresure-token', result.accessToken)
      onAuthenticated(authenticatedUser)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the authentication service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <Shield size={21} />
          </div>
          <div>
            <strong>
              Measure<span>Sure</span>
            </strong>
            <small>LEGAL METROLOGY</small>
          </div>
        </div>
        <div className="auth-intro">
          <p className="eyebrow">SECURE OPERATIONS PORTAL</p>
          <h1>Verification work, with a clear chain of trust.</h1>
          <p>Access the right tools for your role across applications, instruments, field visits, and certificates.</p>
        </div>
        <div className="auth-note">
          <LockKeyhole size={17} />
          <span>Role-based access keeps jurisdictional data in the right hands.</span>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <p className="eyebrow">
              WELCOME TO MEASURE<span>SURE</span>
            </p>
            <h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}</h2>
            <p>{mode === 'login' ? 'Use your registered account to continue.' : 'Choose the role that matches your work.'}</p>
          </div>
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError('') }}>
              Sign in
            </button>
            <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setError('') }}>
              Create account
            </button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Full name
                <input name="name" required placeholder="Enter your full name" />
              </label>
            )}
            <label>
              Email address
              <div className="auth-input">
                <Mail size={16} />
                <input name="email" type="email" required placeholder="name@organisation.gov.in" />
              </div>
            </label>
            <label>
              Password
              <div className="auth-input">
                <LockKeyhole size={16} />
                <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" />
              </div>
            </label>
            {mode === 'signup' && (
              <label>
                Access role
                <select name="role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role)}>
                  {roleOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
                <small className="role-hint">{roleOptions.find((option) => option.value === selectedRole)?.description}</small>
              </label>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span>
            </button>
          </form>
          <p className="auth-footer">By continuing, you agree to the platform access and data-use policies.</p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  useEffect(() => {
    const savedSession = window.localStorage.getItem('measuresure-session')
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession) as AuthUser)
      } catch {
        localStorage.removeItem('measuresure-session')
      }
    }
  }, [])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('Overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [feedback, setFeedback] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [applicationFormType, setApplicationFormType] = useState<'Initial verification' | 'Re-verification' | null>(null)
  const [applicationRecords, setApplicationRecords] = useState(applications)
  const [registry, setRegistry] = useState(instruments)

  // State Administrator Management Workspace State
  const [adminApplications, setAdminApplications] = useState<AdminApplication[]>(initialAdminApplications)
  const [adminInstruments, setAdminInstruments] = useState<AdminInstrument[]>(initialAdminInstruments)
  const [adminCertificates, setAdminCertificates] = useState<AdminCertificate[]>(initialAdminCertificates)
  const [adminInspections, setAdminInspections] = useState<AdminFieldInspection[]>(initialAdminInspections)
  const [adminApplicants] = useState<AdminApplicantStakeholder[]>(initialApplicants)
  const [adminLmos] = useState<AdminLmoOfficerStakeholder[]>(initialLmoOfficersList)
  const [adminGatcs] = useState<AdminGatcOfficerStakeholder[]>(initialGatcOfficersList)
  const [adminOfficers] = useState<AdminOfficer[]>(initialAdminOfficers)
  const [appFilterStatus, setAppFilterStatus] = useState<string>('All')
  const [instFilterStatus, setInstFilterStatus] = useState<string>('All')

  const isLmo = currentUser?.role === 'Legal Metrology Officer' || currentUser?.rawRole === 'LEGAL_METROLOGY_OFFICER'
  const isGatc =
    currentUser?.role === 'GATC Officer' ||
    currentUser?.rawRole === 'GATC_OFFICER' ||
    currentUser?.role === 'GATC Operator' ||
    currentUser?.rawRole === 'GATC_OPERATOR'
  const isBusiness =
    currentUser?.role === 'Applicant / Business' ||
    currentUser?.rawRole === 'APPLICANT_BUSINESS'

  const userJurisdiction =
    currentUser?.jurisdiction?.state ||
    currentUser?.jurisdiction?.district ||
    'DELHI'

  const handleOverviewNavigateToApplications = (filterStatus: string = 'All') => {
    setAppFilterStatus(filterStatus)
    setActiveSection('Applications')
    setSidebarOpen(false)
    showFeedback(`Applications workspace filtered by ${filterStatus}`)
  }

  const handleOverviewNavigateToInstruments = (filterStatus: string = 'All') => {
    setInstFilterStatus(filterStatus)
    setActiveSection('Instruments')
    setSidebarOpen(false)
    showFeedback(`Instruments workspace filtered by ${filterStatus}`)
  }

  const handleUpdateApplicationStatus = (id: string, newStatus: AdminApplicationStatus, remarksText?: string) => {
    setAdminApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        const updatedRemarks = remarksText
          ? [
              ...app.remarks,
              {
                id: `rem-${Date.now()}`,
                author: 'State Administrator',
                role: 'State Admin',
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                text: remarksText,
              },
            ]
          : app.remarks
        const updatedHistory = [
          {
            id: `hist-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: `Marked as ${newStatus}`,
            by: 'State Administrator',
            notes: remarksText || undefined,
          },
          ...app.history,
        ]
        return {
          ...app,
          status: newStatus,
          remarks: updatedRemarks,
          history: updatedHistory,
        }
      })
    )
    showFeedback(`Application ${id} status updated to ${newStatus}`)
  }

  const handleAssignOfficer = (id: string, officerName: string) => {
    setAdminApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        const officerObj = adminOfficers.find((o) => o.name === officerName)
        const updatedHistory = [
          {
            id: `hist-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: officerName ? `Assigned to ${officerName}` : 'Unassigned Officer',
            by: 'State Administrator',
          },
          ...app.history,
        ]
        return {
          ...app,
          assignedOfficer: officerName,
          assignedOfficerEmail: officerObj?.email,
          status: app.status === 'Pending Review' ? ('Assigned' as AdminApplicationStatus) : app.status,
          history: updatedHistory,
        }
      })
    )
    showFeedback(`Officer ${officerName || 'Unassigned'} allocated to ${id}`)
  }

  const handleAddRemark = (id: string, remarkText: string) => {
    setAdminApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        return {
          ...app,
          remarks: [
            ...app.remarks,
            {
              id: `rem-${Date.now()}`,
              author: 'State Administrator',
              role: 'State Admin',
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              text: remarkText,
            },
          ],
        }
      })
    )
    showFeedback(`Remark added to case ${id}`)
  }

  const handleAssignLmo = (id: string, lmoName: string) => {
    setAdminInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, assignedLmo: lmoName } : inst))
    )
    showFeedback(`LMO ${lmoName || 'Unassigned'} allocated to ${id}`)
  }

  const handleMarkInspection = (id: string, notes?: string) => {
    setAdminInstruments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              markedForInspection: true,
              inspectionNotes: notes || 'Marked for priority field inspection',
              status: inst.status === 'Active' ? 'Pending Verification' : inst.status,
            }
          : inst
      )
    )
    showFeedback(`Instrument ${id} marked for field inspection`)
  }

  const handleFlagInstrument = (id: string, reason: string) => {
    setAdminInstruments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              isFlagged: !inst.isFlagged,
              flagReason: !inst.isFlagged ? reason || 'Flagged by State Administrator' : '',
            }
          : inst
      )
    )
    showFeedback(`Instrument ${id} flag status updated`)
  }

  /* --- CERTIFICATE MANAGEMENT HANDLERS --- */
  const handleVerifyCertificate = (id: string) => {
    setAdminCertificates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const updatedHistory = [
          {
            id: `ch-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: 'Certificate Verified by State Administrator',
            by: 'State Administrator',
          },
          ...c.history,
        ]
        return { ...c, isVerified: true, history: updatedHistory }
      })
    )
    showFeedback(`Certificate ${id} verified by State Administrator`)
  }

  const handleFlagCertificate = (id: string, reason: string) => {
    setAdminCertificates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isFlagged: !c.isFlagged,
              status: !c.isFlagged ? 'Flagged' : 'Active',
              flagReason: !c.isFlagged ? reason || 'Flagged discrepancy' : '',
            }
          : c
      )
    )
    showFeedback(`Certificate ${id} flag status updated`)
  }

  /* --- FIELD OPERATIONS HANDLERS --- */
  const handleAssignFieldOpsLmo = (id: string, lmoName: string) => {
    setAdminInspections((prev) =>
      prev.map((insp) => {
        if (insp.id !== id) return insp
        const updatedHistory = [
          {
            id: `ih-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: `Reassigned to Officer ${lmoName}`,
            by: 'State Administrator',
          },
          ...insp.history,
        ]
        return { ...insp, lmoOfficer: lmoName, history: updatedHistory }
      })
    )
    showFeedback(`Inspection ${id} reassigned to ${lmoName}`)
  }

  const handleRescheduleInspection = (id: string, newDate: string, newTime: string) => {
    setAdminInspections((prev) =>
      prev.map((insp) => {
        if (insp.id !== id) return insp
        const updatedHistory = [
          {
            id: `ih-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: `Rescheduled visit to ${newDate} (${newTime})`,
            by: 'State Administrator',
          },
          ...insp.history,
        ]
        return { ...insp, scheduledDate: newDate, scheduledTime: newTime, history: updatedHistory }
      })
    )
    showFeedback(`Inspection ${id} rescheduled to ${newDate}`)
  }

  const handleReviewInspectionReport = (id: string, decision: 'PASSED' | 'FAILED' | 'FLAGGED', notes: string) => {
    setAdminInspections((prev) =>
      prev.map((insp) => {
        if (insp.id !== id) return insp
        const updatedHistory = [
          {
            id: `ih-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action: `Admin Report Endorsement: ${decision}`,
            by: 'State Administrator',
          },
          ...insp.history,
        ]
        return {
          ...insp,
          status: 'Completed',
          reportSummary: {
            decision,
            notes: notes || 'Endorsed by State Administrator',
            readings: insp.reportSummary?.readings || [],
            photosCaptured: insp.reportSummary?.photosCaptured || 2,
            sealVerified: decision === 'PASSED',
          },
          history: updatedHistory,
        }
      })
    )
    showFeedback(`Inspection ${id} report endorsed as ${decision}`)
  }

  const handleFlagInspection = (id: string, reason: string) => {
    setAdminInspections((prev) =>
      prev.map((insp) =>
        insp.id === id
          ? {
              ...insp,
              isFlagged: !insp.isFlagged,
              flagReason: !insp.isFlagged ? reason || 'Flagged for audit' : '',
            }
          : insp
      )
    )
    showFeedback(`Inspection ${id} flag status updated`)
  }

  const filteredApplications = useMemo(
    () =>
      applicationRecords.filter((application) => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !query ||
          [application.id, application.instrumentId, application.instrument, application.applicant].some((value) =>
            value.toLowerCase().includes(query)
          )
        return matchesSearch && (statusFilter === 'All statuses' || application.status === statusFilter)
      }),
    [applicationRecords, searchTerm, statusFilter]
  )

  const applicationSummary = useMemo(
    () => ({
      total: applicationRecords.length,
      underReview: applicationRecords.filter((application) => application.status === 'Under review').length,
      scheduled: applicationRecords.filter((application) => application.status === 'Scheduled').length,
      verified: applicationRecords.filter((application) => application.status === 'Verified').length,
    }),
    [applicationRecords]
  )

  const filteredInstruments = useMemo(
    () =>
      registry.filter((instrument) => {
        const query = searchTerm.trim().toLowerCase()
        return (
          !query ||
          [instrument.id, instrument.type, instrument.serialNumber, instrument.owner, instrument.location].some((value) =>
            value.toLowerCase().includes(query)
          )
        )
      }),
    [registry, searchTerm]
  )

  const showFeedback = (message: string) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2600)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setSidebarOpen(false)
    setSearchTerm('')
    setStatusFilter('All statuses')
    setNotificationsOpen(false)
    if (section !== 'Overview') showFeedback(`${section} workspace selected`)
  }

  const renderStatus = (status: ApplicationStatus | InstrumentStatus) => (
    <span className={`status-badge ${status.toLowerCase().replaceAll(' ', '-')} ${status === 'Active' ? 'verified' : ''}`}>
      <i />
      {status}
    </span>
  )

  if (!currentUser) return <AuthPage onAuthenticated={setCurrentUser} />

  const signOut = () => {
    localStorage.removeItem('measuresure-session')
    localStorage.removeItem('measuresure-token')
    setCurrentUser(null)
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        activeSection={activeSection}
        onNavigate={(section) => (section === 'Signed out' ? signOut() : handleSectionChange(section))}
        onClose={() => setSidebarOpen(false)}
        role={currentUser.role}
        rawRole={currentUser.rawRole}
      />
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activeSection}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Help" onClick={() => showFeedback('Help centre opened')}>
              <CircleHelp size={19} />
            </button>
            <button
              className="icon-button notification-button"
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={19} />
              <span />
            </button>
            {notificationsOpen && (
              <div className="notifications-popover">
                {notifications.map((notification) => (
                  <button type="button" className={notification.unread ? 'unread' : ''} key={notification.id} onClick={() => showFeedback(notification.title)}>
                    <strong>{notification.title}</strong>
                    <small>{notification.detail}</small>
                  </button>
                ))}
              </div>
            )}
            <button className="profile-menu" type="button" onClick={() => showFeedback('Profile menu opened')}>
              <div className="avatar">
                {isLmo ? 'LM' : isGatc ? 'GO' : currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="profile-copy">
                <strong>{currentUser.name}</strong>
                <span>{isGatc ? (currentUser.gatc?.name || 'GATC Officer') : currentUser.role}</span>
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {/* LMO Specific Overview Dashboard */}
          {isLmo && activeSection === 'Overview' && (
            <LmoDashboard currentUser={currentUser} onActionFeedback={showFeedback} />
          )}

          {/* LMO Specific Pages */}
          {isLmo && activeSection !== 'Overview' && activeSection !== 'Signed out' && (
            <>
              {activeSection === 'My Assignments' && <MyAssignments currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Today’s Route' && <TodaysRoute currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Field Inspections' && <FieldInspections currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Offline Cases' && <OfflineCases currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Submitted Reports' && <SubmittedReports currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Flagged Instruments' && <FlaggedInstruments currentUser={currentUser} onActionFeedback={showFeedback} />}
              {activeSection === 'Notifications' && <LmoNotifications currentUser={currentUser} onActionFeedback={showFeedback} />}
            </>
          )}

          {/* GATC Officer / Operator Specific Dashboard */}
          {isGatc && (
            <GatcDashboard
              currentUser={currentUser}
              activeSection={activeSection}
              onActionFeedback={showFeedback}
              onNavigate={handleSectionChange}
            />
          )}

          {/* Business / Applicant Account Dashboard */}
          {isBusiness && (
            <BusinessDashboard
              currentUser={currentUser}
              activeSection={activeSection}
              onActionFeedback={showFeedback}
              onNavigate={handleSectionChange}
            />
          )}

          {/* State Administrator Dashboard */}
          {!isLmo && !isGatc && !isBusiness && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">{currentUser.role.toUpperCase()} / {userJurisdiction.toUpperCase()}</p>
                  <h1>Good morning, {currentUser.name.split(' ')[0]}</h1>
                  <p className="heading-copy">Here is what needs your attention across the Legal Metrology network.</p>
                </div>
              </section>

              {activeSection === 'Overview' && (
                <StateAdminOverview
                  applications={adminApplications}
                  instruments={adminInstruments}
                  officers={adminOfficers}
                  upcomingVisitsList={upcomingVisits}
                  onNavigateToApplications={handleOverviewNavigateToApplications}
                  onNavigateToInstruments={handleOverviewNavigateToInstruments}
                  onNavigateToSection={handleSectionChange}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  onAssignOfficer={handleAssignOfficer}
                  onAddRemark={handleAddRemark}
                />
              )}

              {activeSection === 'Applications' && (
                <StateAdminApplications
                  applications={adminApplications}
                  officers={adminOfficers}
                  initialStatusFilter={appFilterStatus}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  onAssignOfficer={handleAssignOfficer}
                  onAddRemark={handleAddRemark}
                />
              )}

              {activeSection === 'Instruments' && (
                <StateAdminInstruments
                  instruments={adminInstruments}
                  officers={adminOfficers}
                  initialStatusFilter={instFilterStatus}
                  onAssignLmo={handleAssignLmo}
                  onMarkInspection={handleMarkInspection}
                  onFlagInstrument={handleFlagInstrument}
                />
              )}

              {activeSection === 'Certificates' && (
                <StateAdminCertificates
                  certificates={adminCertificates}
                  onVerifyCertificate={handleVerifyCertificate}
                  onFlagCertificate={handleFlagCertificate}
                  onNavigateToInstruments={handleOverviewNavigateToInstruments}
                />
              )}

              {activeSection === 'Field operations' && (
                <StateAdminFieldOperations
                  inspections={adminInspections}
                  officers={adminOfficers}
                  onAssignLmo={handleAssignFieldOpsLmo}
                  onReschedule={handleRescheduleInspection}
                  onReviewReport={handleReviewInspectionReport}
                  onFlagInspection={handleFlagInspection}
                />
              )}

              {activeSection === 'Stakeholders' && (
                <StateAdminStakeholders
                  applicants={adminApplicants}
                  lmoOfficers={adminLmos}
                  gatcOfficers={adminGatcs}
                  onNavigateToApplications={handleOverviewNavigateToApplications}
                  onNavigateToInstruments={handleOverviewNavigateToInstruments}
                />
              )}

              {activeSection === 'Reports' && (
                <StateAdminReports
                  applications={adminApplications}
                  instruments={adminInstruments}
                  certificates={adminCertificates}
                  inspections={adminInspections}
                  officers={adminOfficers}
                  jurisdictionState={userJurisdiction}
                />
              )}

              {activeSection === 'Settings' && (
                <StateAdminSettings
                  currentUser={currentUser}
                  onActionFeedback={showFeedback}
                />
              )}

              {['Help centre', 'Signed out'].includes(activeSection) && (
                <section className="workspace-panel panel empty-workspace">
                  <p className="eyebrow">{activeSection.toUpperCase()}</p>
                  <h2>
                    {activeSection === 'Signed out'
                      ? 'Sign-out is ready for backend authentication'
                      : `${activeSection} workspace`}
                  </h2>
                  <p>This module is now connected to navigation and ready for user actions.</p>
                  <button className="secondary-button" type="button" onClick={() => handleSectionChange('Overview')}>
                    Return to overview <span>→</span>
                  </button>
                </section>
              )}
            </>
          )}

          {showRegistrationForm && (
            <div className="modal-backdrop" role="presentation">
              <div className="modal" role="dialog" aria-modal="true" aria-labelledby="registration-title">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">INSTRUMENT REGISTRY</p>
                    <h2 id="registration-title">Register instrument</h2>
                  </div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Close registration form"
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    const formData = new FormData(event.currentTarget)
                    const instrument: Instrument = {
                      id: `WM-DEL-${String(registry.length + 1983).padStart(5, '0')}`,
                      type: String(formData.get('type')),
                      manufacturer: 'Pending entry',
                      model: 'Pending entry',
                      serialNumber: String(formData.get('serialNumber')),
                      location: String(formData.get('location')),
                      owner: 'Draft registration',
                      status: 'Pending Verification' as InstrumentStatus,
                      nextDue: 'To be scheduled',
                    }
                    setRegistry((current) => [instrument, ...current])
                    setShowRegistrationForm(false)
                    showFeedback(`${instrument.id} draft saved`)
                  }}
                >
                  <label>
                    Instrument type
                    <input name="type" required placeholder="e.g. Electronic weighing scale" />
                  </label>
                  <label>
                    Serial number
                    <input name="serialNumber" required placeholder="Enter serial number" />
                  </label>
                  <label>
                    Premises location
                    <input name="location" required placeholder="Enter location" />
                  </label>
                  <div className="modal-actions">
                    <button className="secondary-button" type="button" onClick={() => setShowRegistrationForm(false)}>
                      Cancel
                    </button>
                    <button className="primary-button" type="submit">
                      Save draft
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {applicationFormType && (
            <div className="modal-backdrop" role="presentation">
              <div className="modal" role="dialog" aria-modal="true" aria-labelledby="application-title">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">APPLICATION REGISTER</p>
                    <h2 id="application-title">{applicationFormType}</h2>
                  </div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Close application form"
                    onClick={() => setApplicationFormType(null)}
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    const formData = new FormData(event.currentTarget)
                    const id = `LM-2026-${String(8422 + applicationRecords.length).padStart(5, '0')}`
                    setApplicationRecords((current) => [
                      {
                        id,
                        type: applicationFormType,
                        instrumentId: String(formData.get('instrumentId')),
                        instrument: String(formData.get('instrument')),
                        applicant: String(formData.get('applicant')),
                        location: String(formData.get('location')),
                        submitted: 'Just now',
                        status: 'Under review',
                      },
                      ...current,
                    ])
                    setApplicationFormType(null)
                    showFeedback(`${id} submitted for review`)
                  }}
                >
                  <label>
                    Instrument ID
                    <input name="instrumentId" required placeholder="e.g. WM-DEL-01982" />
                  </label>
                  <label>
                    Instrument type
                    <input name="instrument" required placeholder="e.g. Electronic weighing scale" />
                  </label>
                  <label>
                    Applicant / business
                    <input name="applicant" required placeholder="Enter business name" />
                  </label>
                  <label>
                    Verification location
                    <input name="location" required placeholder="Enter premises or test centre" />
                  </label>
                  <div className="modal-actions">
                    <button className="secondary-button" type="button" onClick={() => setApplicationFormType(null)}>
                      Cancel
                    </button>
                    <button className="primary-button" type="submit">
                      Submit application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {feedback && (
            <div className="toast" role="status">
              {feedback}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
