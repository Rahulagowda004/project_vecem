import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Database, BookOpen, BarChart2, Trash2, ExternalLink, Globe, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  users_count: number;
  datasets_count: number;
  prompts_count: number;
  last_updated: string;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  upload_type: string;
  owner: string;  // This will now contain the user's full name
  createdAt: string;
}

interface Prompt {
  id: string;
  name: string;
  domain: string;
  username: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string; // Changed from optional to required
  profilePicture?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'datasets' | 'prompts'>('overview');
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch('http://127.0.0.1:5000/admin/dashboard', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setError('');
        // Store credentials in session storage
        sessionStorage.setItem('adminCredentials', credentials);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Failed to authenticate');
    }
  };

  useEffect(() => {
    const credentials = sessionStorage.getItem('adminCredentials');
    if (credentials) {
      setIsAuthenticated(true);
      fetchDashboardStats(credentials);
    }
  }, []);

  const fetchDashboardStats = async (credentials: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/admin/dashboard', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      const credentials = sessionStorage.getItem('adminCredentials');
      if (!credentials) return;

      try {
        // Fetch datasets
        const datasetsResponse = await fetch('http://127.0.0.1:5000/admin/datasets', {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });
        
        // Fetch prompts
        const promptsResponse = await fetch('http://127.0.0.1:5000/admin/prompts', {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });

        // Fetch users
        const usersResponse = await fetch('http://127.0.0.1:5000/admin/users', {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });

        if (datasetsResponse.ok && promptsResponse.ok && usersResponse.ok) {
          const datasetsData = await datasetsResponse.json();
          const promptsData = await promptsResponse.json();
          const usersData = await usersResponse.json();
          setDatasets(datasetsData);
          setPrompts(promptsData);
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleDeleteDataset = async (datasetId: string) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    
    const credentials = sessionStorage.getItem('adminCredentials');
    if (!credentials) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/datasets/${datasetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        setDatasets(prevDatasets => prevDatasets.filter(dataset => dataset.id !== datasetId));
        toast.success('Dataset deleted successfully');
      } else {
        throw new Error('Failed to delete dataset');
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Failed to delete dataset');
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    
    const credentials = sessionStorage.getItem('adminCredentials');
    if (!credentials) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        setPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== promptId));
        toast.success('Prompt deleted successfully');
      } else {
        throw new Error('Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not Available';
    
    try {
      // Try parsing as ISO string first
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // If ISO parsing fails, try alternative format
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        return new Date(timestamp).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-300">Total Users</h3>
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {stats?.users_count || 0}
              </p>
            </motion.div>
            {/* Add more stat cards */}
          </div>
        );

      case 'datasets':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataset.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{dataset.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataset.upload_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataset.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(dataset.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleDeleteDataset(dataset.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'prompts':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{prompt.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{prompt.domain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{prompt.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(prompt.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'users':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture || "/default-avatar.png"}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-300">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        @{user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700"
        >
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full bg-cyan-500 text-white rounded-lg px-4 py-2 hover:bg-cyan-600 transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-cyan-400">Vecem Admin</h1>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('datasets')}
              className={`w-full flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'datasets' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Database className="w-5 h-5 mr-3" />
              Datasets
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`w-full flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'prompts' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              Prompts
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Users
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
