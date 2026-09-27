import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  CloudOff,
  FileCheck2,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import type { MouseEvent } from 'react'
import type { Role } from '../../types'

interface SidebarProps {
  isOpen: boolean
  activeSection: string
  onNavigate: (section: string) => void
  onClose: () => void
  role: Role
  rawRole?: string
}

const defaultNavigation = [
  { label: 'Overview', icon: LayoutDashboard, roles: ['State Administrator', 'Applicant / Business'] },
  { label: 'Applications', icon: ClipboardCheck, count: '248', roles: ['State Administrator', 'Applicant / Business'] },
  { label: 'Instruments', icon: Gauge, roles: ['State Administrator', 'Applicant / Business'] },
  { label: 'Certificates', icon: FileCheck2, roles: ['State Administrator', 'Applicant / Business'] },
  { label: 'Field operations', icon: BarChart3, roles: ['State Administrator', 'Applicant / Business'] },
]

const lmoNavigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Assignments', icon: ClipboardCheck },
  { label: 'Today’s Route', icon: MapPin },
  { label: 'Field Inspections', icon: ShieldCheck },
  { label: 'Offline Cases', icon: CloudOff },
  { label: 'Submitted Reports', icon: BarChart3 },
  { label: 'Flagged Instruments', icon: AlertTriangle },
  { label: 'Notifications', icon: Bell, count: '3' },
]

const gatcNavigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Allocated Cases', icon: FileText },
  { label: 'Test Schedule', icon: Calendar },
  { label: 'Verification Workspace', icon: CheckCircle2 },
  { label: 'Test Equipment', icon: Wrench },
  { label: 'Submitted Results', icon: FileCheck2 },
  { label: 'Certificates', icon: ShieldCheck },
  { label: 'Centre Reports', icon: BarChart3 },
  { label: 'Notifications', icon: Bell, count: '2' },
]

export function Sidebar({ isOpen, activeSection, onNavigate, onClose, role, rawRole }: SidebarProps) {
  const isLmo = role === 'Legal Metrology Officer' || rawRole === 'LEGAL_METROLOGY_OFFICER'
  const isGatc =
    role === 'GATC Officer' ||
    rawRole === 'GATC_OFFICER' ||
    role === 'GATC Operator' ||
    rawRole === 'GATC_OPERATOR'

  const navigate = (event: MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault()
    onNavigate(label)
  }

  const activeNav = isLmo ? lmoNavigation : isGatc ? gatcNavigation : null

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <Shield size={19} />
        </div>
        <div>
          <strong>
            Measure<span>Sure</span>
          </strong>
          <small>LEGAL METROLOGY</small>
        </div>
        <button className="icon-button close-button" type="button" aria-label="Close navigation" onClick={onClose}>
          <X size={19} />
        </button>
      </div>

      {activeNav ? (
        <div className="nav-section">
          <p className="nav-label">MAIN MENU</p>
          <nav>
            {activeNav.map(({ label, icon: Icon, count }) => (
              <a
                key={label}
                className={activeSection === label || (label === 'Dashboard' && activeSection === 'Overview') ? 'active' : ''}
                href={`#${label.toLowerCase().replaceAll(' ', '-')}`}
                onClick={(event) => navigate(event, label)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {count && <b className="notification-badge-count">{count}</b>}
              </a>
            ))}
          </nav>
        </div>
      ) : (
        <>
          <div className="nav-section">
            <p className="nav-label">MAIN MENU</p>
            <nav>
              {defaultNavigation
                .filter((item) => item.roles.includes(role))
                .map(({ label, icon: Icon, count }) => (
                  <a
                    key={label}
                    className={activeSection === label ? 'active' : ''}
                    href={`#${label.toLowerCase().replaceAll(' ', '-')}`}
                    onClick={(event) => navigate(event, label)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {count && <b>{count}</b>}
                  </a>
                ))}
            </nav>
          </div>
          <div className="nav-section lower-nav">
            <p className="nav-label">MANAGE</p>
            <nav>
              {['Stakeholders', 'Reports', 'Settings']
                .filter((label) => role === 'State Administrator' || role === 'Applicant / Business' || label === 'Reports')
                .map((label) => (
                  <a
                    key={label}
                    className={activeSection === label ? 'active' : ''}
                    href={`#${label.toLowerCase()}`}
                    onClick={(event) => navigate(event, label)}
                  >
                    {label === 'Stakeholders' ? (
                      <Users size={18} />
                    ) : label === 'Reports' ? (
                      <BarChart3 size={18} />
                    ) : (
                      <Settings size={18} />
                    )}
                    <span>{label}</span>
                  </a>
                ))}
            </nav>
          </div>
        </>
      )}

      <div className="sidebar-footer">
        <div className="support-card">
          <strong>Need assistance?</strong>
          <span>Visit the help centre</span>
          <button type="button" onClick={() => onNavigate('Help centre')}>
            Open help centre <span>↗</span>
          </button>
        </div>
        <button className="logout-button" type="button" onClick={() => onNavigate('Signed out')}>
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  )
}