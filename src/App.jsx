import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './App.css'

import { login, getProfile } from './api.js'

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleLogin = async () => {
      navigate('/login');
    };

    handleLogin();
  }, []);
  

  return (
    <>
      .
      <p className='fontExtraBold'>{user ? `Welcome, ${user.first_name}` : 'Please log in'}</p>
    </>
  )
}

export default App
