import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, loginDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  function handleDemo() {
    loginDemo();
    navigate('/app');
  }

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="auth-logo">
        <Logo size={40} />
        <span>Planit</span>
      </div>

      <h1 className="animate-in">Crea tu cuenta</h1>
      <p className="subtitle animate-in delay-1">Empieza a organizar tu curso.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group animate-in delay-1">
          <label htmlFor="reg-name">Nombre completo</label>
          <input
            id="reg-name"
            type="text"
            placeholder="Lucía García"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group animate-in delay-2">
          <label htmlFor="reg-email">Email UMA</label>
          <input
            id="reg-email"
            type="email"
            placeholder="alumno@uma.es"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group animate-in delay-3">
          <label htmlFor="reg-password">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary animate-in delay-4" type="submit" disabled={loading} id="btn-register">
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>

      <div className="divider">o</div>

      <button className="btn btn-outline" onClick={handleDemo} id="btn-demo-register">
        Probar Demo
      </button>

      <div className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </div>
    </div>
  );
}
