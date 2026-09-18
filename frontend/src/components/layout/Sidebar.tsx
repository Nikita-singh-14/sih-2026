import { BarChart3, ClipboardCheck, FileCheck2, Gauge, LayoutDashboard, LogOut, Settings, Shield, Users, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { Role } from '../../types'

interface SidebarProps { isOpen: boolean; activeSection: string; onNavigate: (section: string) => void; onClose: () => void; role: Role }

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, roles: ['State Administrator', 'Legal Metrology Officer', 'GATC Operator', 'Applicant / Business'] },
  { label: 'Applications', icon: ClipboardCheck, count: '248', roles: ['State Administrator', 'Legal Metrology Officer', 'GATC Operator', 'Applicant / Business'] },
  { label: 'Instruments', icon: Gauge, roles: ['State Administrator', 'Legal Metrology Officer', 'GATC Operator', 'Applicant / Business'] },
  { label: 'Certificates', icon: FileCheck2, roles: ['State Administrator', 'Legal Metrology Officer', 'Applicant / Business'] },
  { label: 'Field operations', icon: BarChart3, roles: ['State Administrator', 'Legal Metrology Officer', 'GATC Operator'] },
]

export function Sidebar({ isOpen, activeSection, onNavigate, onClose, role }: SidebarProps) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault()
    onNavigate(label)
  }

  return <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
    <div className="brand"><div className="brand-mark"><Shield size={19} /></div><div><strong>Measure<span>Sure</span></strong><small>LEGAL METROLOGY</small></div><button className="icon-button close-button" type="button" aria-label="Close navigation" onClick={onClose}><X size={19} /></button></div>
    <div className="nav-section"><p className="nav-label">MAIN MENU</p><nav>{navigation.filter((item) => item.roles.includes(role)).map(({ label, icon: Icon, count }) => <a className={activeSection === label ? 'active' : ''} href={`#${label.toLowerCase().replaceAll(' ', '-')}`} key={label} onClick={(event) => navigate(event, label)}><Icon size={18} /><span>{label}</span>{count && <b>{count}</b>}</a>)}</nav></div>
    <div className="nav-section lower-nav"><p className="nav-label">MANAGE</p><nav>{['Stakeholders', 'Reports', 'Settings'].filter((label) => role === 'State Administrator' || label === 'Reports').map((label) => <a className={activeSection === label ? 'active' : ''} href={`#${label.toLowerCase()}`} key={label} onClick={(event) => navigate(event, label)}>{label === 'Stakeholders' ? <Users size={18} /> : label === 'Reports' ? <BarChart3 size={18} /> : <Settings size={18} />}<span>{label}</span></a>)}</nav></div>
    <div className="sidebar-footer"><div className="support-card"><strong>Need assistance?</strong><span>Visit the help centre</span><button type="button" onClick={() => onNavigate('Help centre')}>Open help centre <span>↗</span></button></div><button className="logout-button" type="button" onClick={() => onNavigate('Signed out')}><LogOut size={17} /> Sign out</button></div>
  </aside>
}