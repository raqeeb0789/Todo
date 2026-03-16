import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login({ onSuccess, onSwitch, onForgot }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOn, setIsOn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        // Validation for registration
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const url = `${API}/auth/register`;
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        };
        const res = await axios.post(url, payload);
        onSuccess(res.data.token, res.data.user);
      } else {
        const url = `${API}/auth/login`;
        const payload = {
          email: formData.email,
          password: formData.password
        };
        const res = await axios.post(url, payload);
        onSuccess(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  useEffect(() => {
    let proxy, draggable;
    
    const initializeLamp = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap;
        const HIT = document.querySelector('.lamp__hit');
        const DUMMY_CORD = document.querySelector('.cord--dummy');
        
        if (!HIT || !DUMMY_CORD) return;
        
        const ENDX = DUMMY_CORD.getAttribute('x2');
        const ENDY = DUMMY_CORD.getAttribute('y2');
        
        // Initial setup
        gsap.set('.lamp__eye', {
          rotate: isOn ? 0 : 180,
          transformOrigin: '50% 50%',
          yPercent: 50,
        });
        
        gsap.set(['.cords', '.lamp__hit'], {
          x: -10,
        });
        
        proxy = document.createElement('div');
        gsap.set(proxy, {
          x: ENDX,
          y: ENDY,
        });
        
        // Create the draggable instance
        if (window.Draggable) {
          let startX, startY;
          
          draggable = window.Draggable.create(proxy, {
            trigger: HIT,
            type: 'x,y',
            onPress: (e) => {
              startX = e.x;
              startY = e.y;
            },
            onDrag: function () {
              gsap.set(DUMMY_CORD, {
                attr: {
                  x2: this.x,
                  y2: Math.max(200, this.y),
                },
              });
            },
            onRelease: function (e) {
              const DISTX = Math.abs(e.x - startX);
              const DISTY = Math.abs(e.y - startY);
              const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
              
              gsap.to(DUMMY_CORD, {
                attr: { x2: ENDX, y2: ENDY },
                duration: 0.1,
                onComplete: () => {
                  if (TRAVELLED > 30) { // Reduced threshold for easier activation
                    setIsOn(prev => !prev);
                    const newState = !isOn;
                    document.documentElement.style.setProperty('--on', newState ? '1' : '0');
                    
                    const hue = Math.floor(Math.random() * 359);
                    document.documentElement.style.setProperty('--shade-hue', hue.toString());
                    document.documentElement.style.setProperty('--glow-color', `hsl(${hue}, 40%, 45%)`);
                    document.documentElement.style.setProperty('--glow-color-dark', `hsl(${hue}, 40%, 35%)`);
                    
                    gsap.to('.lamp__eye', {
                      rotate: newState ? 0 : 180,
                      duration: 0.1,
                    });

                    gsap.to('.lamp__mouth', {
                      opacity: newState ? 1 : 0,
                      duration: 0.2,
                    });

                    gsap.to('.lamp__tongue', {
                      y: newState ? 0 : 20,
                      duration: 0.2,
                    });

                    // Animate the form
                    if (newState) {
                      gsap.to('.login-form', {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'back.out(1.2)',
                        pointerEvents: 'all'
                      });
                    } else {
                      gsap.to('.login-form', {
                        opacity: 0,
                        scale: 0.8,
                        y: 20,
                        duration: 0.3,
                        ease: 'power2.in',
                        pointerEvents: 'none'
                      });
                    }
                    
                    // Play a click sound
                    try {
                      const audio = new Audio('https://assets.codepen.io/605876/click.mp3');
                      audio.play();
                    } catch (err) {
                      console.log('Audio not supported');
                    }
                  }
                },
              });
            },
          })[0];
        }
      }
    };

    // Set initial form state
    if (typeof window !== 'undefined' && window.gsap) {
      const gsap = window.gsap;
      gsap.set('.login-form', {
        opacity: isOn ? 1 : 0,
        scale: isOn ? 1 : 0.8,
        y: isOn ? 0 : 20,
        pointerEvents: isOn ? 'all' : 'none'
      });
    }

    // Initialize
    initializeLamp();

    // Cleanup
    return () => {
      if (draggable) {
        draggable.kill();
      }
      // Reset styles
      document.documentElement.style.removeProperty('--on');
      document.documentElement.style.removeProperty('--shade-hue');
      document.documentElement.style.removeProperty('--glow-color');
      document.documentElement.style.removeProperty('--glow-color-dark');
    };
  }, [isOn]);

  return (
    <div className="container">
      {/* Lamp UI and radio controls */}
      <form className="radio-controls">
        <input type="radio" id="on" name="status" value="on" />
        <label htmlFor="on">On</label>
        <input type="radio" id="off" name="status" value="off" />
        <label htmlFor="off">Off</label>
      </form>

      <svg className="lamp" viewBox="0 0 333 484" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="lamp__shade shade">
          <ellipse className="shade__opening" cx="165" cy="220" rx="130" ry="20" />
          <ellipse className="shade__opening-shade" cx="165" cy="220" rx="130" ry="20" fill="url(#opening-shade)" />
        </g>
        <g className="lamp__base base">
          <path className="base__side" d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" />
          <path d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" fill="url(#side-shading)" />
          <ellipse className="base__top" cx="165" cy="430" rx="80" ry="20" />
          <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
        </g>
        <g className="lamp__post post">
          <path className="post__body" d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" />
          <path d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" fill="url(#post-shading)" />
        </g>
        <g className="lamp__cords cords">
          <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
          <path className="cord cord--rig" d="M124 187.023s17.007 21.921 17.007 34.846c0 12.925-11.338 23.231-17.007 34.846-5.669 11.615-17.007 21.921-17.007 34.846 0 12.925 17.007 34.846 17.007 34.846" strokeWidth="6" strokeLinecap="round" />
          <line className="cord cord--dummy" x1="124" y2="348" x2="124" y1="190" strokeWidth="6" strokeLinecap="round" />
        </g>
        <path className="lamp__light" d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z" fill="url(#light)" />
        <g className="lamp__top top">
          <path className="top__body" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" />
          <path className="top__shading" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" fill="url(#top-shading)" />
        </g>
        <g className="lamp__face face">
          <g className="lamp__mouth">
            <path className="mouth-shape" d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" />
            <circle className="lamp__tongue" cx="165" cy="160" r="12" />
          </g>
          <g className="lamp__eyes">
            <path className="lamp__eye lamp__stroke" d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path className="lamp__eye lamp__stroke" d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        <defs>
          <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stopColor="var(--shade)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--b-1)" />
            <stop offset="0.8" stopColor="var(--b-2)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--b-3)" />
            <stop offset="1" stopColor="var(--b-4)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--b-1)" />
            <stop offset="1" stopColor="var(--b-2)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--l-1)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--l-2)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--t-1)" stopOpacity=".8" />
            <stop offset="1" stopColor="var(--t-2)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle className="lamp__hit" cx="124" cy="347" r="66" fill="#C4C4C4" fillOpacity=".1" />
      </svg>

      {/* Only one login form, inside lamp overlay */}
      <form className={`login-form ${isOn ? 'active' : ''}`} onSubmit={handleSubmit}>
        <h2>{isRegisterMode ? 'Create Account' : 'Welcome Back'}</h2>
        
        {isRegisterMode && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
              className="form-input"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            className="form-input"
          />
        </div>

        {isRegisterMode && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              className="form-input"
            />
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
        
        <button type="submit" className="login-btn" disabled={loading}>
          {isRegisterMode ? 'Sign Up' : 'Login'}
        </button>
        
        <div className="form-footer">
          <button type="button" className="forgot-link" onClick={toggleMode}>
            {isRegisterMode ? 'Already have an account? Login' : 'Create account'}
          </button>
          {!isRegisterMode && (
            <button type="button" className="forgot-link" onClick={onForgot}>
              Forgot Password?
            </button>
          )}
        </div>
      </form>
    </div>
  );
}