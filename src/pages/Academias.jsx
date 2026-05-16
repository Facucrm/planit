import { MapPin, Navigation, MessageCircle, GraduationCap, Globe } from 'lucide-react';
import Logo from '../components/Logo';

const academias = [
  {
    id: 0,
    nombre: 'Academias Unitec',
    especialidad: 'Líder en Estudios Universitarios (ETSII, ETSI, Ciencias)',
    direccion: 'C/ Eolo, 3 (Teatinos), 29010 Málaga',
    descripcion: 'Desde 1994 preparando universitarios con éxito. Expertos en todas las asignaturas de Ingeniería y Ciencias. Modalidad presencial y online.',
    telefono: '34952345678',
    lat: 36.7181,
    lng: -4.4779,
    mapsQuery: 'Academias Unitec Málaga',
    websiteUrl: 'https://www.academiasunitec.com/estudios-universitarios/',
    featured: true,
  },
  {
    id: 1,
    nombre: 'Academia Ingeniería Málaga',
    especialidad: 'Ingenierías Industriales',
    direccion: 'C/ Jiménez Fraud 10, 29010 Málaga',
    descripcion: 'Cálculo, Física, Álgebra y Química. Profesores especializados en ETSII.',
    telefono: '34612345678',
    lat: 36.7155,
    lng: -4.4780,
  },
  {
    id: 2,
    nombre: 'TechStudy UMA',
    especialidad: 'Ingenierías y Tecnología',
    direccion: 'C/ Severo Ochoa 4, 29010 Málaga',
    descripcion: 'Estadística, Informática y Expresión Gráfica. Grupos reducidos.',
    telefono: '34698765432',
    lat: 36.7148,
    lng: -4.4760,
  },
  {
    id: 3,
    nombre: 'Academia Politécnica Sur',
    especialidad: 'ETSII y Telecomunicaciones',
    direccion: 'Av. de Cervantes 2, 29016 Málaga',
    descripcion: 'Todas las asignaturas de ingeniería industrial. Tutorías personalizadas.',
    telefono: '34655443322',
    lat: 36.7200,
    lng: -4.4200,
  },
];

export default function Academias() {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-4.50%2C36.70%2C-4.40%2C36.73&layer=mapnik&marker=36.715%2C-4.478`;

  return (
    <div>
      <div className="page-header">
        <div className="logo-row">
          <Logo size={28} light />
          <span>Planit</span>
        </div>
        <h1>Academias</h1>
        <p>Refuerzo académico de confianza, a un toque.</p>
      </div>

      <div className="page-content">
        {/* Map */}
        <div className="map-container animate-in">
          <iframe
            src={mapUrl}
            title="Mapa academias Málaga"
            loading="lazy"
          />
        </div>

        {/* Academy Cards */}
        {academias.map((aca, i) => (
          <div key={aca.id} className={`academia-card animate-in delay-${Math.min(i + 1, 4)}`}>
            <div className="aca-header">
              <div className="aca-icon">
                <GraduationCap size={20} color="#1B2A4A" />
              </div>
              <div>
                <h3>{aca.nombre}</h3>
                <div className="specialty">{aca.especialidad}</div>
              </div>
            </div>

            <div className="address">
              <MapPin size={14} /> {aca.direccion}
            </div>

            <p className="desc">{aca.descripcion}</p>

            <div className="aca-btns">
              {aca.websiteUrl ? (
                <a
                  className="btn btn-outline btn-sm"
                  href={aca.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={14} /> Visitar página web
                </a>
              ) : (
                <a
                  className="btn btn-outline btn-sm"
                  href={`https://www.google.com/maps/search/?api=1&query=${aca.lat},${aca.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={14} /> Ver ubicación
                </a>
              )}
              <a
                className="btn btn-outline btn-sm"
                href={`https://www.google.com/maps/dir/?api=1&destination=${aca.mapsQuery || `${aca.lat},${aca.lng}`}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation size={14} /> Cómo llegar
              </a>
            </div>

            <a
              className="btn-whatsapp"
              href={`https://wa.me/${aca.telefono}?text=Hola, soy estudiante de la UMA y me interesa información sobre clases de apoyo.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> Contactar por WhatsApp
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
