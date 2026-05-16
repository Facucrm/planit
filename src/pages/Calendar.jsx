import { useState, useMemo } from 'react';
import { CalendarDays, List, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, X, ExternalLink, MessageCircle, Trash2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatShortDate(d) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].substring(0, 3)}`;
}

const ACADEMIAS_DB = [
  { name: 'Academias Unitec', phone: '34952345678', keywords: ['Física', 'Cálculo', 'Matemáticas', 'Química', 'Álgebra', 'Materiales', 'Termodinámica', 'Contabilidad', 'Economía', 'Empresa', 'Marketing'] },
  { name: 'Academia Ingeniería Málaga', phone: '34612345678', keywords: ['Mecánica', 'Resistencia', 'Máquinas', 'Fluidos', 'Estructuras', 'Fabricación', 'Industrial', 'Procesos', 'Motores'] },
  { name: 'TechStudy UMA', phone: '34698765432', keywords: ['Informática', 'Programación', 'Estadística', 'Expresión Gráfica', 'Dibujo', 'Software', 'Computadores', 'Datos', 'Sistemas', 'Diseño'] },
  { name: 'Academia Politécnica Sur', phone: '34655443322', keywords: ['Electrónica', 'Eléctrica', 'Telecomunicación', 'Señales', 'Circuitos', 'Redes', 'Automática', 'Robots', 'Instalaciones'] }
];

function getRecommendation(asignatura, grado) {
  const asig = (asignatura || '').toLowerCase();
  const grad = (grado || '').toLowerCase();
  
  for (const aca of ACADEMIAS_DB) {
    if (aca.keywords.some(kw => asig.includes(kw.toLowerCase()))) {
      return { name: aca.name, phone: aca.phone };
    }
  }

  if (grad.includes('informática') || grad.includes('software')) return { name: 'TechStudy UMA', phone: '34698765432' };
  if (grad.includes('mecánica') || grad.includes('industrial') || grad.includes('energía')) return { name: 'Academia Ingeniería Málaga', phone: '34612345678' };
  if (grad.includes('telecomunicación') || grad.includes('eléctrica') || grad.includes('electrónica')) return { name: 'Academia Politécnica Sur', phone: '34655443322' };

  return { name: 'Academias Unitec', phone: '34952345678' };
}

export default function Calendar() {
  const { exams, profile, addExam, removeExam } = useAuth();
  const [view, setView] = useState('weekly');
  // Default to June 2026 for engineering students
  const defaultDate = profile?.grado ? new Date(2026, 5, 1) : new Date();
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newAsignatura, setNewAsignatura] = useState('');
  const [newFecha, setNewFecha] = useState(formatDateKey(new Date()));
  const [newHora, setNewHora] = useState('09:00');
  const [newTipo, setNewTipo] = useState('Examen oficial');


  const examMap = useMemo(() => {
    const map = {};
    exams.forEach(ex => {
      const key = ex.fecha;
      if (!map[key]) map[key] = [];
      map[key].push(ex);
    });
    return map;
  }, [exams]);

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }
  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }
  function prevMonth() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }
  function nextMonth() {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }

  // Monthly grid
  function getMonthDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7;
    startDay -= 1;

    const days = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, otherMonth: true });
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), otherMonth: false });
    }
    // Next month padding
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), otherMonth: true });
      }
    }
    return days;
  }

  const weekLabel = `${formatShortDate(weekDays[0])} – ${formatShortDate(weekDays[6])}`;

  async function handleAddSubmit(e) {
    e.preventDefault();
    await addExam({
      asignatura: newAsignatura,
      fecha: newFecha,
      hora: newHora,
      convocatoria: newTipo
    });
    setNewAsignatura('');
    setShowAddModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="logo-row">
          <Logo size={28} light />
          <span>Planit</span>
        </div>
        <h1>Mi calendario</h1>
        <p>Organiza entregas, exámenes y clases.</p>

        <div className="cal-toggle">
          <button
            className={view === 'monthly' ? 'active' : ''}
            onClick={() => setView('monthly')}
          >
            <CalendarDays size={14} /> Mensual
          </button>
          <button
            className={view === 'weekly' ? 'active' : ''}
            onClick={() => setView('weekly')}
          >
            <List size={14} /> Semanal
          </button>
        </div>
      </div>

      <div className="page-content">
        {view === 'weekly' ? (
          <>
            {/* Week Navigation */}
            <div className="week-nav animate-in">
              <button onClick={prevWeek} aria-label="Semana anterior"><ChevronLeft size={22} /></button>
              <span>{weekLabel}</span>
              <button onClick={nextWeek} aria-label="Semana siguiente"><ChevronRight size={22} /></button>
            </div>

            {/* Day rows */}
            {weekDays.map((day, i) => {
              const key = formatDateKey(day);
              const dayExams = examMap[key] || [];
              const hasEvent = dayExams.length > 0;

              return (
                <div 
                  key={key} 
                  className={`day-row${hasEvent ? ' has-event' : ''} animate-in delay-${Math.min(i + 1, 4)}`}
                  onClick={() => hasEvent && setSelectedDay(day)}
                  style={{ cursor: hasEvent ? 'pointer' : 'default' }}
                >
                  <div className="day-badge">
                    <div className="weekday">{WEEKDAYS[i]}</div>
                    <div className="daynum">{day.getDate()}</div>
                  </div>
                  <div className="day-info">
                    {hasEvent ? dayExams.map(ex => (
                      <div key={ex.id}>
                        <h4>
                          <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#3B82F6' }} />
                          {ex.asignatura}
                        </h4>
                        <p className="meta">
                          {dayExams.length} evento{dayExams.length > 1 ? 's' : ''} · <span className="official">Examen oficial</span>
                        </p>
                      </div>
                    )) : (
                      <span className="no-events">Sin eventos</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="week-nav animate-in">
              <button onClick={prevMonth} aria-label="Mes anterior"><ChevronLeft size={22} /></button>
              <span>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              <button onClick={nextMonth} aria-label="Mes siguiente"><ChevronRight size={22} /></button>
            </div>

            {/* Monthly Grid */}
            <div className="card animate-in delay-1">
              <div className="month-grid">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} className="day-header">{d}</div>
                ))}
                {getMonthDays().map(({ date, otherMonth }, i) => {
                  const key = formatDateKey(date);
                  const hasExam = !!examMap[key];
                  const today = formatDateKey(new Date()) === key;
                  return (
                    <div
                      key={i}
                      className={`month-day${otherMonth ? ' other-month' : ''}${hasExam ? ' has-exam' : ''}${today ? ' today' : ''}${selectedDay && formatDateKey(selectedDay) === key ? ' selected' : ''}`}
                      onClick={() => {
                        if (hasExam) {
                          setSelectedDay(date);
                        } else {
                          setCurrentDate(date);
                          setView('weekly');
                        }
                      }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exams for this month */}
            <div style={{ marginTop: 16 }}>
              {exams
                .filter(ex => {
                  const d = new Date(ex.fecha);
                  return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                })
                .sort((a, b) => a.fecha.localeCompare(b.fecha))
                .map(ex => (
                  <div key={ex.id} className="day-row has-event animate-in" style={{ marginBottom: 8 }}>
                    <div className="day-badge">
                      <div className="weekday">{WEEKDAYS[new Date(ex.fecha).getDay() === 0 ? 6 : new Date(ex.fecha).getDay() - 1]}</div>
                      <div className="daynum">{new Date(ex.fecha).getDate()}</div>
                    </div>
                    <div className="day-info">
                      <h4>{ex.asignatura}</h4>
                      <p className="meta">
                        <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {ex.hora} · <span className="official">{ex.convocatoria}</span>
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exámenes del {selectedDay.getDate()} de {MONTH_NAMES[selectedDay.getMonth()]}</h3>
              <button className="close-btn" onClick={() => setSelectedDay(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {(examMap[formatDateKey(selectedDay)] || []).map(ex => {
                const recommendation = getRecommendation(ex.asignatura, ex.grado || profile?.grado);
                return (
                  <div key={ex.id} className="exam-detail-card">
                    <div className="exam-main">
                      <div className="exam-icon"><CheckCircle size={20} color="#3B82F6" /></div>
                      <div className="exam-text" style={{ flex: 1 }}>
                        <h4>{ex.asignatura}</h4>
                        <p>{ex.hora} · {ex.convocatoria}</p>
                      </div>
                      <button 
                        onClick={() => removeExam(ex.id)}
                        title="Eliminar tarea"
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {recommendation && (
                      <div className="academy-recommendation">
                        <div className="rec-info">
                          <span>Intensivo recomendado en:</span>
                          <strong>{recommendation.name}</strong>
                        </div>
                        <a 
                          href={`https://wa.me/${recommendation.phone}?text=Hola! He visto en Planit que impartís intensivos de ${ex.asignatura}. Me gustaría recibir más información.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva tarea / examen</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="page-form">
              <div className="form-group">
                <label>Asignatura</label>
                <input 
                  type="text" 
                  placeholder="Ej: Cálculo I" 
                  value={newAsignatura} 
                  onChange={e => setNewAsignatura(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input 
                  type="date" 
                  value={newFecha} 
                  onChange={e => setNewFecha(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input 
                  type="time" 
                  value={newHora} 
                  onChange={e => setNewHora(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={newTipo} onChange={e => setNewTipo(e.target.value)}>
                  <option value="Examen oficial">Examen oficial</option>
                  <option value="Entrega">Entrega</option>
                  <option value="Parcial">Parcial</option>
                  <option value="Clase extra">Clase extra</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>
                Guardar tarea
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab" aria-label="Añadir evento" id="fab-add" onClick={() => setShowAddModal(true)}>
        <Plus size={24} />
      </button>
    </div>
  );
}
