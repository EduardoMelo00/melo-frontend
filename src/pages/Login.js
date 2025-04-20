import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // se estiver usando react-router
import api from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Faz a requisição ao seu backend (ajuste URL/baseURL em api.js)
      const response = await api.post('/auth/login', { email, password });
      console.log(response.data)
      const { accessToken, user } = response.data;

      console.log(accessToken)
      // Salva token e nome do usuário no localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userName', user.name || '');
      localStorage.setItem('role', user.role); // 'admin' ou 'user'
      // Redireciona para página de boas-vindas
      navigate('/welcome');
    } catch (error) {
      console.error(error);
      setErrorMsg('Credenciais inválidas ou erro de servidor.');
    }
  };

  return (
    <div className="login-background">
      {/* Overlay semitransparente */}
      <div className="login-overlay"></div>

      {/* Card de login */}
      <div className="login-card">
        <h2>Melo Engenharia</h2>
        <h3>Faça seu Login</h3>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
