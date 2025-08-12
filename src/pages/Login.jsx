import { useState, useEffect } from 'react';
import { login, getProfile } from '../api.js'
import { useNavigate } from 'react-router-dom';
import { Icon } from "@iconify/react";
import './Login.css';

import LoginArt from '../assets/login-art.svg';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const credentials = { username: formData.username, password: formData.password };
            const response = await login(credentials);
            localStorage.setItem('token', response.data.token);

            const profileResponse = await getProfile();
            console.log(profileResponse.data);
            console.log(response.data);
            
            if (response.data.token) {
                navigate('/dashboard');
            }
        } catch (error) {
            setLoading(false);
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
        

    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

  return (
    <div className="page login">
      <div className="visualizer">
        <img src={LoginArt} alt="" />
      </div>
      
      <div className="divider"><div className="bar"></div></div>
      
      <div className="form">
        <h1 className='fontExtraBold'>CSP Connect</h1>
        <form onSubmit={handleLogin}>
            <p className="fontExtraBold"><span className='textAccent'>Login.</span><br/><span className='fontBold'>Provide your registered credentials</span></p>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                autoComplete='off'
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <button className='submit' type="submit">{loading ? <Icon icon="eos-icons:three-dots-loading" width={48} /> : 'Login'}</button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;
