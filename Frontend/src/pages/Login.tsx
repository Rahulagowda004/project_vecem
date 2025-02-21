import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';

const Login = () => {
  const { login, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      let email = identifier;

      // If username is provided, find corresponding email from Firestore
      if (!isEmail) {
        const usersQuery = query(
          collection(firestore, 'users'),
          where('username', '==', identifier.toLowerCase())
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        if (querySnapshot.empty) {
          throw new Error('Username not found');
        }
        
        // Get the first matching user's email
        const userData = querySnapshot.docs[0].data();
        if (!userData.email) {
          throw new Error('User email not found');
        }
        
        email = userData.email;
      }

      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email"
              className="w-full p-2 rounded border bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 rounded border bg-gray-700 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-gray-400 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
