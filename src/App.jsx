import { useEffect, useState } from 'react'
import './App.css'

import { login, getProfile } from './api.js'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleLogin = async () => {
      const credentials = { username: 'charles-admin', password: '123456' };
      const response = await login(credentials);
      localStorage.setItem('token', response.data.token);

      const profileResponse = await getProfile();
      console.log(profileResponse.data);
      console.log(response.data);
      setUser(profileResponse.data);
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
