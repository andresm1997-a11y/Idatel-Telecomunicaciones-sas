import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <a href="/">
          <img src="/logo-idatel.png" alt="Idatel Logo" className="login-logo" />
        </a>
      </div>
      
      <div className="login-card-container">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Área administrativa de Idatel</p>
          
          {error && <div className="error-alert">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary block" disabled={loading}>
              {loading ? <Loader2 className="spin-icon" /> : 'Entrar'}
            </button>
          </form>
          
          <div className="login-help">
            <a href="/">Volver a la página principal</a>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          display: flex;
          flex-direction: column;
        }

        .login-header {
          padding: 2rem 4rem;
        }

        .login-logo {
          height: 60px;
        }

        .login-card-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-card {
           background: rgba(0, 0, 0, 0.75);
           padding: 60px 68px 40px;
           border-radius: 4px;
           width: 100%;
           max-width: 450px;
           box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .login-card h2 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 28px;
        }

        .login-subtitle {
          color: #b3b3b3;
          margin-bottom: 20px;
          margin-top: -20px;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 4px;
          background: #333;
          border: none;
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus {
          background: #454545;
          outline: none;
        }

        .error-alert {
          background: #e87c03;
          color: white;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 0.85rem;
        }

        .login-help {
          margin-top: 30px;
          text-align: center;
        }

        .login-help a {
          color: #b3b3b3;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        .login-help a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .login-header { padding: 1rem 2rem; }
          .login-card { padding: 40px 30px; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
