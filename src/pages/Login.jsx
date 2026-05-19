import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Error: "Confirm Email" está activado en tu Supabase o la contraseña es incorrecta. Ve a Supabase > Authentication > Providers > Email y DESACTIVA "Confirm email" para usar cuentas de prueba.');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
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

      <h1 className="animate-in">Bienvenido de nuevo</h1>
      <p className="subtitle animate-in delay-1">Accede para ver tu calendario y comunidad.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group animate-in delay-2">
          <label htmlFor="login-email">Email UMA</label>
          <input
            id="login-email"
            type="email"
            placeholder="alumno@uma.es"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group animate-in delay-3">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary animate-in delay-4" type="submit" disabled={loading} id="btn-login">
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>

      <button className="forgot">¿Has olvidado tu contraseña?</button>

      <div className="divider">o</div>

      <button className="btn btn-outline" onClick={handleDemo} id="btn-demo-login">
        Probar Demo
      </button>

      <div className="auth-footer">
        ¿Todavía no tienes cuenta? <Link to="/register">Regístrate</Link>
      </div>
    </div>
  );
}
