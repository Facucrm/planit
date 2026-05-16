import { useNavigate } from 'react-router-dom';
import { CalendarDays, GraduationCap, MessageSquareText } from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { icon: CalendarDays, title: 'Calendario inteligente', desc: 'Dictado por voz para no perder ninguna entrega.' },
  { icon: GraduationCap, title: 'Academias verificadas', desc: 'Contacto directo por WhatsApp.' },
  { icon: MessageSquareText, title: 'Chat de tu curso', desc: 'Habla solo con compañeros de tu grado y año.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <p className="uni-tag animate-in">Universidad de Málaga</p>
      <h1 className="animate-in delay-1">Tu vida académica,<br />en un solo lugar.</h1>
      <p className="lead animate-in delay-2">
        Calendario inteligente, academias de confianza y la comunidad de tu carrera. Hecho por y para alumnos UMA.
      </p>

      {features.map(({ icon: Icon, title, desc }, i) => (
        <div key={title} className={`feature-card animate-in delay-${i + 2}`}>
          <div className="icon-box">
            <Icon size={24} />
          </div>
          <div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        </div>
      ))}

      <div className="landing-buttons">
        <button className="btn btn-primary" onClick={() => navigate('/register')} id="btn-crear-cuenta">
          Crear cuenta
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/login')} id="btn-iniciar-sesion">
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
