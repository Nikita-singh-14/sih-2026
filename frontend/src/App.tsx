import './App.css'
import { Bell, ChevronDown, CircleHelp, LockKeyhole, Mail, Menu, Search, Shield, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { StatCard } from './components/dashboard/StatCard'
import { StatusBadge } from './components/ui/StatusBadge'
import { applications, dashboardStats, instruments, notifications, upcomingVisits } from './features/dashboard/data'
import type { ApplicationStatus, Instrument, InstrumentStatus, Role } from './types'

interface AuthUser { name: string; email: string; role: Role }

const roleOptions: { value: Role; description: string }[] = [
  { value: 'State Administrator', description: 'Manage statewide operations, users, and reports' },
  { value: 'Legal Metrology Officer', description: 'Review applications and conduct field verification' },
  { value: 'GATC Operator', description: 'Manage centre appointments and test reports' },
  { value: 'Applicant / Business', description: 'Submit applications and manage instruments' },
]

const backendRoles: Record<string, Role> = {
  STATE_ADMINISTRATOR: 'State Administrator',
  LEGAL_METROLOGY_OFFICER: 'Legal Metrology Officer',
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
      const response = await fetch(`http://localhost:3000/api/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password, role: Object.entries(backendRoles).find(([, label]) => label === role)?.[0] }),
      })
      const result = await response.json() as { message?: string; accessToken?: string; user?: { id: string; name: string; email: string; role: string } }
      if (!response.ok || !result.accessToken || !result.user) throw new Error(result.message || 'Unable to authenticate right now')
      const authenticatedUser = { name: result.user.name, email: result.user.email, role: backendRoles[result.user.role] || role }
      localStorage.setItem('measuresure-session', JSON.stringify(authenticatedUser))
      localStorage.setItem('measuresure-token', result.accessToken)
      onAuthenticated(authenticatedUser)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the authentication service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return <main className="auth-shell"><section className="auth-brand-panel"><div className="auth-brand"><div className="brand-mark"><Shield size={21} /></div><div><strong>Measure<span>Sure</span></strong><small>LEGAL METROLOGY</small></div></div><div className="auth-intro"><p className="eyebrow">SECURE OPERATIONS PORTAL</p><h1>Verification work, with a clear chain of trust.</h1><p>Access the right tools for your role across applications, instruments, field visits, and certificates.</p></div><div className="auth-note"><LockKeyhole size={17} /><span>Role-based access keeps jurisdictional data in the right hands.</span></div></section><section className="auth-form-panel"><div className="auth-form-wrap"><div className="auth-form-heading"><p className="eyebrow">WELCOME TO MEASURE<span>SURE</span></p><h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}</h2><p>{mode === 'login' ? 'Use your registered account to continue.' : 'Choose the role that matches your work.'}</p></div><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError('') }}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setError('') }}>Create account</button></div><form className="auth-form" onSubmit={submit}>{mode === 'signup' && <label>Full name<input name="name" required placeholder="Enter your full name" /></label>}<label>Email address<div className="auth-input"><Mail size={16} /><input name="email" type="email" required placeholder="name@organisation.gov.in" /></div></label><label>Password<div className="auth-input"><LockKeyhole size={16} /><input name="password" type="password" required minLength={6} placeholder="At least 6 characters" /></div></label>{mode === 'signup' && <label>Access role<select name="role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role)}>{roleOptions.map((option) => <option value={option.value} key={option.value}>{option.value}</option>)}</select><small className="role-hint">{roleOptions.find((option) => option.value === selectedRole)?.description}</small></label>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Connecting...' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button></form><p className="auth-footer">By continuing, you agree to the platform access and data-use policies.</p></div></section></main>
}

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedSession = localStorage.getItem('measuresure-session')
    return savedSession ? JSON.parse(savedSession) as AuthUser : null
  })
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

  const filteredApplications = useMemo(() => applicationRecords.filter((application) => {
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch = !query || [application.id, application.instrumentId, application.instrument, application.applicant]
      .some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (statusFilter === 'All statuses' || application.status === statusFilter)
  }), [applicationRecords, searchTerm, statusFilter])

  const applicationSummary = useMemo(() => ({
    total: applicationRecords.length,
    underReview: applicationRecords.filter((application) => application.status === 'Under review').length,
    scheduled: applicationRecords.filter((application) => application.status === 'Scheduled').length,
    verified: applicationRecords.filter((application) => application.status === 'Verified').length,
  }), [applicationRecords])

  const filteredInstruments = useMemo(() => registry.filter((instrument) => {
    const query = searchTerm.trim().toLowerCase()
    return !query || [instrument.id, instrument.type, instrument.serialNumber, instrument.owner, instrument.location]
      .some((value) => value.toLowerCase().includes(query))
  }), [registry, searchTerm])

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

  const renderStatus = (status: ApplicationStatus | InstrumentStatus) => <span className={`status-badge ${status.toLowerCase().replaceAll(' ', '-')} ${status === 'Active' ? 'verified' : ''}`}><i />{status}</span>

  if (!currentUser) return <AuthPage onAuthenticated={setCurrentUser} />

  const signOut = () => {
    localStorage.removeItem('measuresure-session')
    localStorage.removeItem('measuresure-token')
    setCurrentUser(null)
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} activeSection={activeSection} onNavigate={(section) => section === 'Signed out' ? signOut() : handleSectionChange(section)} onClose={() => setSidebarOpen(false)} role={currentUser.role} />
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{activeSection}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Help" onClick={() => showFeedback('Help centre opened')}><CircleHelp size={19} /></button>
            <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={19} /><span /></button>
            {notificationsOpen && <div className="notifications-popover">{notifications.map((notification) => <button type="button" className={notification.unread ? 'unread' : ''} key={notification.id} onClick={() => showFeedback(notification.title)}><strong>{notification.title}</strong><small>{notification.detail}</small></button>)}</div>}
            <button className="profile-menu" type="button" onClick={() => showFeedback('Profile menu opened')}><div className="avatar">{currentUser.name.slice(0, 2).toUpperCase()}</div><div className="profile-copy"><strong>{currentUser.name}</strong><span>{currentUser.role}</span></div><ChevronDown size={16} /></button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div><p className="eyebrow">{currentUser.role.toUpperCase()} / DELHI</p><h1>Good morning, {currentUser.name.split(' ')[0]}</h1><p className="heading-copy">Here is what needs your attention across the Legal Metrology network.</p></div>
            <button className="primary-button" type="button" onClick={() => setShowRegistrationForm(true)}><ShieldCheck size={17} /> Register instrument</button>
          </section>

          {activeSection === 'Overview' && <section className="stats-grid" aria-label="Verification summary">
            {dashboardStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </section>}

          {activeSection === 'Overview' && <section className="content-grid">
            <div className="panel applications-panel">
              <div className="panel-header"><div><p className="eyebrow">WORK QUEUE</p><h2>Recent applications</h2></div><button className="text-button" type="button" onClick={() => { setSearchTerm(''); setStatusFilter('All statuses'); showFeedback('Showing all applications') }}>View all <span>→</span></button></div>
              <div className="table-toolbar"><div className="search-field"><Search size={16} /><input aria-label="Search applications" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by application or instrument ID" /></div><select className="filter-button" aria-label="Filter applications by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Under review</option><option>Scheduled</option><option>Verified</option><option>Awaiting documents</option></select></div>
              <div className="table-wrap"><table><thead><tr><th>Application</th><th>Instrument</th><th>Applicant</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{filteredApplications.map((application) => <tr key={application.id}><td><strong>{application.id}</strong><span>{application.type}</span></td><td><strong>{application.instrumentId}</strong><span>{application.instrument}</span></td><td>{application.applicant}</td><td>{application.submitted}</td><td><StatusBadge status={application.status} /></td></tr>)}</tbody></table>{filteredApplications.length === 0 && <p className="empty-state">No applications match your search.</p>}</div>
            </div>
            <aside className="panel visits-panel"><div className="panel-header"><div><p className="eyebrow">FIELD OPERATIONS</p><h2>Upcoming visits</h2></div><button className="icon-button" type="button" aria-label="View calendar" onClick={() => showFeedback('Calendar options opened')}>•••</button></div><div className="visits-list">{upcomingVisits.map((visit) => <div className="visit-item" key={visit.time}><div className="date-tile"><strong>{visit.day}</strong><span>{visit.month}</span></div><div className="visit-details"><strong>{visit.title}</strong><span>{visit.time} · {visit.location}</span><small>{visit.officer}</small></div></div>)}</div><button className="secondary-button" type="button" onClick={() => showFeedback('Calendar opened')}>Open calendar <span>→</span></button></aside>
          </section>}

          {activeSection === 'Applications' && <section className="applications-dashboard">
            <div className="application-hero panel"><div><p className="eyebrow">LEGAL METROLOGY WORK QUEUE</p><h2>Verification applications</h2><p>Review, schedule, and track initial verification and re-verification requests across Delhi.</p></div><div className="application-actions"><button className="secondary-button" type="button" onClick={() => setApplicationFormType('Re-verification')}>Re-verification</button><button className="primary-button" type="button" onClick={() => setApplicationFormType('Initial verification')}>Initial verification</button></div></div>
            <div className="application-metrics">
              <article className="metric-card"><span>Total applications</span><strong>{applicationSummary.total}</strong><small>All active requests</small></article>
              <article className="metric-card metric-review"><span>Under review</span><strong>{applicationSummary.underReview}</strong><small>Needs officer action</small></article>
              <article className="metric-card metric-scheduled"><span>Scheduled</span><strong>{applicationSummary.scheduled}</strong><small>Ready for verification</small></article>
              <article className="metric-card metric-verified"><span>Verified</span><strong>{applicationSummary.verified}</strong><small>Completed this cycle</small></article>
            </div>
            <div className="workspace-panel panel"><div className="panel-header"><div><p className="eyebrow">APPLICATION REGISTER</p><h2>All applications</h2></div><span className="queue-count">{filteredApplications.length} shown</span></div><div className="table-toolbar"><div className="search-field"><Search size={16} /><input aria-label="Search applications" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search application, instrument, or applicant" /></div><select className="filter-button" aria-label="Filter applications" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Under review</option><option>Scheduled</option><option>Verified</option><option>Awaiting documents</option></select></div><div className="table-wrap"><table><thead><tr><th>Application</th><th>Instrument</th><th>Applicant</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{filteredApplications.map((application) => <tr key={application.id}><td><strong>{application.id}</strong><span>{application.type}</span></td><td><strong>{application.instrumentId}</strong><span>{application.instrument}</span></td><td>{application.applicant}</td><td>{application.submitted}</td><td>{renderStatus(application.status)}</td></tr>)}</tbody></table>{filteredApplications.length === 0 && <p className="empty-state">No applications match your filters.</p>}</div></div>
          </section>}

          {activeSection === 'Instruments' && <section className="workspace-panel panel"><div className="panel-header"><div><p className="eyebrow">REGISTRY</p><h2>Instrument registry</h2></div><button className="primary-button" type="button" onClick={() => setShowRegistrationForm(true)}><ShieldCheck size={17} /> Register instrument</button></div><div className="table-toolbar"><div className="search-field"><Search size={16} /><input aria-label="Search instruments" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search ID, serial number, owner or location" /></div></div><div className="table-wrap"><table><thead><tr><th>Instrument</th><th>Owner</th><th>Location</th><th>Next due</th><th>Status</th></tr></thead><tbody>{filteredInstruments.map((instrument) => <tr key={instrument.id}><td><strong>{instrument.id}</strong><span>{instrument.type} · {instrument.manufacturer} {instrument.model}</span><small>Serial {instrument.serialNumber}</small></td><td>{instrument.owner}</td><td>{instrument.location}</td><td>{instrument.nextDue}</td><td>{renderStatus(instrument.status)}</td></tr>)}</tbody></table>{filteredInstruments.length === 0 && <p className="empty-state">No instruments match your search.</p>}</div></section>}

          {['Certificates', 'Field operations', 'Stakeholders', 'Reports', 'Settings', 'Help centre', 'Signed out'].includes(activeSection) && <section className="workspace-panel panel empty-workspace"><p className="eyebrow">{activeSection.toUpperCase()}</p><h2>{activeSection === 'Signed out' ? 'Sign-out is ready for backend authentication' : `${activeSection} workspace`}</h2><p>This module is now connected to navigation and ready for its next implementation slice from the platform plan.</p><button className="secondary-button" type="button" onClick={() => handleSectionChange('Overview')}>Return to overview <span>→</span></button></section>}

          {activeSection === 'Overview' && <section className="notice-bar"><div className="notice-icon"><Bell size={17} /></div><div><strong>12 certificates expire in the next 30 days</strong><span>Send renewal reminders to instrument owners before Friday.</span></div><button className="text-button" type="button" onClick={() => handleSectionChange('Certificates')}>Review certificates <span>→</span></button></section>}
          {showRegistrationForm && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="registration-title"><div className="panel-header"><div><p className="eyebrow">INSTRUMENT REGISTRY</p><h2 id="registration-title">Register instrument</h2></div><button className="icon-button" type="button" aria-label="Close registration form" onClick={() => setShowRegistrationForm(false)}>×</button></div><form onSubmit={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const instrument: Instrument = { id: `WM-DEL-${String(registry.length + 1983).padStart(5, '0')}`, type: String(formData.get('type')), manufacturer: 'Pending entry', model: 'Pending entry', serialNumber: String(formData.get('serialNumber')), location: String(formData.get('location')), owner: 'Draft registration', status: 'Pending Verification' as InstrumentStatus, nextDue: 'To be scheduled' }; setRegistry((current) => [instrument, ...current]); setShowRegistrationForm(false); showFeedback(`${instrument.id} draft saved`) }}><label>Instrument type<input name="type" required placeholder="e.g. Electronic weighing scale" /></label><label>Serial number<input name="serialNumber" required placeholder="Enter serial number" /></label><label>Premises location<input name="location" required placeholder="Enter location" /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowRegistrationForm(false)}>Cancel</button><button className="primary-button" type="submit">Save draft</button></div></form></div></div>}
          {applicationFormType && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="application-title"><div className="panel-header"><div><p className="eyebrow">APPLICATION REGISTER</p><h2 id="application-title">{applicationFormType}</h2></div><button className="icon-button" type="button" aria-label="Close application form" onClick={() => setApplicationFormType(null)}>×</button></div><form onSubmit={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const id = `LM-2026-${String(8422 + applicationRecords.length).padStart(5, '0')}`; setApplicationRecords((current) => [{ id, type: applicationFormType, instrumentId: String(formData.get('instrumentId')), instrument: String(formData.get('instrument')), applicant: String(formData.get('applicant')), location: String(formData.get('location')), submitted: 'Just now', status: 'Under review' }, ...current]); setApplicationFormType(null); showFeedback(`${id} submitted for review`) }}><label>Instrument ID<input name="instrumentId" required placeholder="e.g. WM-DEL-01982" /></label><label>Instrument type<input name="instrument" required placeholder="e.g. Electronic weighing scale" /></label><label>Applicant / business<input name="applicant" required placeholder="Enter business name" /></label><label>Verification location<input name="location" required placeholder="Enter premises or test centre" /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setApplicationFormType(null)}>Cancel</button><button className="primary-button" type="submit">Submit application</button></div></form></div></div>}
          {feedback && <div className="toast" role="status">{feedback}</div>}
        </div>
      </main>
    </div>
  )
}

export default App
