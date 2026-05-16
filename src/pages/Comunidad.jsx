import { useState, useEffect, useRef } from 'react';
import { Send, Users, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

const MOCK_MESSAGES = [
  { id: 1, user_name: 'Ana García', content: '¿Alguien tiene los apuntes de Cálculo?', created_at: new Date(Date.now() - 3600000).toISOString(), user_id: '1' },
  { id: 2, user_name: 'Juan Pérez', content: '¡Yo los tengo! Te los paso por el grupo de Drive.', created_at: new Date(Date.now() - 3000000).toISOString(), user_id: '2' },
  { id: 3, user_name: 'Carlos Ruiz', content: '¿Sabéis si han subido ya las notas de Física?', created_at: new Date(Date.now() - 1800000).toISOString(), user_id: '3' },
];

export default function Comunidad() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const roomId = `${profile?.grado || 'GITI'}-${profile?.curso || 1}`;
  const roomName = `${profile?.grado || 'GITI'} · ${profile?.curso || 1}º Curso`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (profile?.isDemo) {
      setMessages(MOCK_MESSAGES);
    } else {
      loadMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId, profile?.isDemo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) setMessages(data);
    if (error && error.code !== 'PGRST116') console.error('Error loading messages:', error);
  }

  function subscribeToMessages() {
    return supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      content: inputText,
      user_id: user?.id || 'demo-user',
      user_name: profile?.nombre || 'Usuario Demo',
      room_id: roomId,
      created_at: new Date().toISOString()
    };

    if (profile?.isDemo) {
      setMessages(prev => [...prev, { ...newMessage, id: Date.now() }]);
    } else {
      const { error } = await supabase.from('messages').insert(newMessage);
      if (error) {
        console.error('Error sending message:', error);
        // Fallback for demo/missing table
        setMessages(prev => [...prev, { ...newMessage, id: Date.now() }]);
      }
    }

    setInputText('');
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ paddingBottom: 40 }}>
        <div className="logo-row">
          <Logo size={28} light />
          <span>Planit</span>
        </div>
        <h1>Comunidad</h1>
        <div className="room-badge">
          <Hash size={12} style={{ marginRight: 4 }} />
          {roomName}
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => {
            const isMe = msg.user_id === (user?.id || 'demo-user');
            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={msg.id} className={`message ${isMe ? 'me' : 'other'}`}>
                {!isMe && <div className="message-user">{msg.user_name}</div>}
                <div className="message-content">{msg.content}</div>
                <div className="message-time">{time}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
