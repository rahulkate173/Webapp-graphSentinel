import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import Button from '../components/Button';
import FormError from '../components/FormError';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ organization_name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated, resetError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => resetError();
  }, [isAuthenticated, navigate, resetError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.organization_name) errors.organization_name = 'Organization name is required';
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmPassword, ...registerData } = formData;
      const res = await register(registerData);
      if (!res.error) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <AuthCard 
      title="Create account" 
      subtitle="Start your 30-day free trial."
    >
      <FormError message={typeof error === 'string' ? error : error?.message} />
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Organization Name"
          id="organization_name"
          name="organization_name"
          type="text"
          placeholder="Acme Financial"
          value={formData.organization_name}
          onChange={handleChange}
          error={validationErrors.organization_name}
        />
        
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
        />
        
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password}
        />
        
        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={validationErrors.confirmPassword}
        />
        
        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
      
      <div className="auth-footer">
        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
      </div>
    </AuthCard>
  );
};

export default Register;
