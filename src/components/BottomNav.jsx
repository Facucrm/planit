import { NavLink } from 'react-router-dom';
import { CalendarDays, GraduationCap, MessageSquareText, UserRound } from 'lucide-react';

const tabs = [
  { to: '/app', icon: CalendarDays, label: 'Inicio' },
  { to: '/app/academias', icon: GraduationCap, label: 'Academias' },
  { to: '/app/comunidad', icon: MessageSquareText, label: 'Comunidad' },
  { to: '/app/perfil', icon: UserRound, label: 'Perfil' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/app'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
