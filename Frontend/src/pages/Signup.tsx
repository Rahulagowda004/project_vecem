import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';

interface SignupProps {
  onClose?: () => void;
  auth: ReturnType<typeof useAuth>; // Add auth prop
}

interface SignupState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
}

class SignupComponent extends React.Component<SignupProps, SignupState> {
  constructor(props: SignupProps) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false
    };
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      ...prevState,
      [name]: value,
      error: ''
    }));

    // Password match validation
    if (name === 'confirmPassword' || name === 'password') {
      const password = name === 'password' ? value : this.state.password;
      const confirmPassword = name === 'confirmPassword' ? value : this.state.confirmPassword;
      
      if (password && confirmPassword && password !== confirmPassword) {
        this.setState({ error: 'Passwords do not match' });
      }
    }
  };

  validateForm = (): boolean => {
    const { username, email, password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return false;
    }

    if (username.length < 3) {
      this.setState({ error: 'Username must be at least 3 characters' });
      return false;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      this.setState({ error: emailError });
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      this.setState({ error: passwordError });
      return false;
    }

    return true;
  };

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!this.validateForm()) return;

    this.setState({ loading: true, error: '' });

    try {
      await this.props.auth.signup( // Use auth from props
        this.state.username,
        this.state.email,
        this.state.password
      );
      if (this.props.onClose) {
        this.props.onClose();
      }
      // Redirect to login page after successful signup
      window.location.href = '/';
    } catch (error: any) {
      this.setState({
        error: error.message || 'Failed to create account',
        loading: false
      });
    }
  };

  render() {
    const { error, loading } = this.state;
    const { auth } = this.props; // Get auth from props

    if (auth.user) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={this.handleInputChange}
                className="w-full p-2 rounded border bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={this.handleInputChange}
                className="w-full p-2 rounded border bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={this.handleInputChange}
                className="w-full p-2 rounded border bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={this.handleInputChange}
                className="w-full p-2 rounded border bg-gray-700 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <p className="text-gray-400 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

// Proper HOC wrapper
const WithAuthSignup = (props: Omit<SignupProps, 'auth'>) => {
  const auth = useAuth();
  return <SignupComponent {...props} auth={auth} />;
};

export default WithAuthSignup;
