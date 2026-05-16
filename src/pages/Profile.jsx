import { useState, useEffect, useMemo } from 'react';
import { UserRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { UMA_STRUCTURE } from '../lib/constants';

const CURSOS = [1, 2, 3, 4];
const PLANES = ['Plan 2010', 'Plan 2024', 'Plan 2025'];

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [facultad, setFacultad] = useState('');
  const [grado, setGrado] = useState('');
  const [curso, setCurso] = useState(1);
  const [plan, setPlan] = useState('Plan 2024');
  const [saved, setSaved] = useState(false);

  const availableFaculties = useMemo(() => Object.keys(UMA_STRUCTURE), []);
  const availableDegrees = useMemo(() => {
    return facultad ? UMA_STRUCTURE[facultad] || [] : [];
  }, [facultad]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setFacultad(profile.facultad || '');
      setGrado(profile.grado || '');
      setCurso(profile.curso || 1);
      setPlan(profile.plan || 'Plan 2024');
    }
  }, [profile]);

  function handleFacultadChange(newFac) {
    setFacultad(newFac);
    // Reset grado if the new faculty doesn't contain the current degree
    const degrees = UMA_STRUCTURE[newFac] || [];
    if (!degrees.includes(grado)) {
      setGrado('');
    }
  }

  async function handleSave() {
    await updateProfile({ name, facultad, grado, curso, plan });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div>
      <div className="page-header">
        <div className="logo-row">
          <Logo size={28} light />
          <span>Planit</span>
        </div>
        <h1>Mi perfil</h1>
      </div>

      <div className="page-content">
        {/* User Card */}
        <div className="profile-user-card animate-in">
          <div className="profile-avatar">
            <UserRound size={24} />
          </div>
          <div>
            <div className="profile-name">{profile?.name || 'Sin nombre'}</div>
            <div className="profile-email">{profile?.email || ''}</div>
          </div>
        </div>

        {/* Form */}
        <div className="profile-form animate-in delay-1">
          <div className="form-group">
            <label htmlFor="profile-name">Nombre</label>
            <input id="profile-name" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="profile-facultad">Facultad / Escuela</label>
            <select id="profile-facultad" value={facultad} onChange={e => handleFacultadChange(e.target.value)}>
              <option value="">Selecciona una facultad...</option>
              {availableFaculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="profile-grado">Grado / Carrera</label>
            <select 
              id="profile-grado" 
              value={grado} 
              onChange={e => setGrado(e.target.value)}
              disabled={!facultad}
            >
              <option value="">{facultad ? 'Selecciona un grado...' : 'Primero selecciona una facultad'}</option>
              {availableDegrees.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Curso</label>
            <div className="pill-group">
              {CURSOS.map(c => (
                <button key={c} className={`pill${curso === c ? ' active' : ''}`} onClick={() => setCurso(c)}>
                  {c}º
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Plan académico</label>
            <div className="pill-group">
              {PLANES.map(p => (
                <button key={p} className={`pill${plan === p ? ' active' : ''}`} onClick={() => setPlan(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSave} id="btn-guardar-perfil" style={{ marginTop: 8 }}>
            Guardar cambios
          </button>
        </div>

        <button className="btn-logout animate-in delay-2" onClick={handleLogout} id="btn-logout">
          <LogOut size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Cerrar sesión
        </button>
      </div>

      {saved && <div className="toast">✓ Perfil actualizado</div>}
    </div>
  );
}
