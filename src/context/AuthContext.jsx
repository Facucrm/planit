import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EXAMS_DB, getExamsFor } from '../lib/exams_db';

const AuthContext = createContext(null);

const DEMO_PROFILE = {
  id: 'demo-user',
  name: 'Estudiante Demo',
  email: 'demo@uma.es',
  facultad: 'Escuela de Ingenierías Industriales',
  grado: 'Grado en Ingeniería en Tecnologías Industriales',
  curso: 1,
  plan: 'Plan 2024',
  isDemo: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('planit_profile');
    if (stored) {
      const p = JSON.parse(stored);
      setProfile(p);
      setUser({ id: p.id, email: p.email });
      loadExams(p.grado, p.curso, p.isDemo);
    }
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else if (!localStorage.getItem('planit_profile')) {
        setUser(null);
        setProfile(null);
        setExams([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
        localStorage.setItem('planit_profile', JSON.stringify(data));
        loadExams(data.grado, data.curso, false);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  }

  async function loadExams(grado, curso, isDemo) {
    try {
      // 1. Load official exams from local database or fallback generator
      const officialExams = getExamsFor(grado, curso);
      const roomKey = `${grado}-${curso}`;
      const formattedOfficial = officialExams.map((ex, idx) => ({
        id: `official-${roomKey}-${idx}`,
        ...ex,
        tipo: 'Examen oficial',
        isOfficial: true,
        grado,
        curso
      }));

      // 2. Load custom exams from Supabase
      let customExams = [];
      if (isDemo || profile?.isDemo || user?.id === 'demo-user') {
        const storedExams = localStorage.getItem('planit_demo_exams');
        if (storedExams) {
          customExams = JSON.parse(storedExams);
        }
      } else if (user?.id) {
        const { data } = await supabase
          .from('examenes_oficiales')
          .select('*')
          .eq('grado', grado)
          .eq('curso', curso);
        if (data) customExams = data;
      }

      setExams([...formattedOfficial, ...customExams]);
    } catch (e) {
      console.error('Error loading exams:', e);
    }
  }

  function loginDemo() {
    setProfile(DEMO_PROFILE);
    setUser({ id: 'demo-user', email: 'demo@uma.es' });
    localStorage.setItem('planit_profile', JSON.stringify(DEMO_PROFILE));
    loadExams(DEMO_PROFILE.grado, DEMO_PROFILE.curso, true);
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    
    // Si Supabase devuelve sesión (Confirmación de email desactivada)
    if (data?.session?.user || data?.user) {
      const u = data.session?.user || data.user;
      const defaultProfile = {
        id: u.id,
        name: name,
        email: email,
        facultad: 'Escuela de Ingenierías Industriales',
        grado: 'Grado en Ingeniería en Tecnologías Industriales',
        curso: 1,
        plan: 'Plan 2024'
      };
      
      // Intentamos crear el perfil inicial
      await supabase.from('profiles').upsert([defaultProfile]);
      
      // Si hay sesión activa (login automático), seteamos el estado para evitar redirección
      if (data?.session) {
        setProfile(defaultProfile);
        localStorage.setItem('planit_profile', JSON.stringify(defaultProfile));
        setUser(u);
      }
    }

    // Si Supabase requiere confirmación de email, data.session será null.
    if (!data.session) {
      throw new Error('Supabase requiere confirmación de email. Por favor, desactiva "Confirm Email" en la configuración de Authentication de tu panel de Supabase para poder usar emails inventados.');
    }

    return data;
  }

  async function updateProfile(updates) {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('planit_profile', JSON.stringify(newProfile));

    if (updates.grado || updates.curso) {
      const g = updates.grado || profile.grado;
      const c = updates.curso || profile.curso;
      await loadExams(g, c, newProfile.isDemo);
    }

    if (!newProfile.isDemo && profile.id) {
      await supabase.from('profiles').upsert({ id: profile.id, ...updates });
    }
  }

  async function addExam(examData) {
    const newExam = {
      id: Date.now(),
      ...examData,
      grado: profile?.grado,
      curso: profile?.curso,
    };

    setExams(prev => {
      const updated = [...prev, newExam];
      if (profile?.isDemo || user?.id === 'demo-user') {
        const custom = updated.filter(ex => !ex.isOfficial);
        localStorage.setItem('planit_demo_exams', JSON.stringify(custom));
      }
      return updated;
    });

    if (!profile?.isDemo && user && user.id !== 'demo-user') {
      const { error } = await supabase.from('examenes_oficiales').insert({
        ...examData,
        user_id: user.id,
        grado: profile?.grado,
        curso: profile?.curso
      });
      if (error) console.error('Error saving exam to Supabase:', error);
    }
  }

  async function removeExam(examId) {
    setExams(prev => {
      const updated = prev.filter(ex => ex.id !== examId);
      if (profile?.isDemo || user?.id === 'demo-user') {
        const custom = updated.filter(ex => !ex.isOfficial);
        localStorage.setItem('planit_demo_exams', JSON.stringify(custom));
      }
      return updated;
    });
    
    if (!profile?.isDemo && user && user.id !== 'demo-user') {
      // Intenta borrar de Supabase (solo si es un ID válido de Supabase, no los 'official-...' o Date.now())
      if (typeof examId === 'number' || typeof examId === 'string' && !String(examId).startsWith('official-')) {
         const { error } = await supabase.from('examenes_oficiales').delete().eq('id', examId);
         if (error) console.error('Error deleting exam from Supabase:', error);
      }
    }
  }

  function logout() {
    setUser(null);
    setProfile(null);
    setExams([]);
    localStorage.removeItem('planit_profile');
    supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, exams, loading, loginDemo, login, register, updateProfile, addExam, removeExam, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
