import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import PageBackground from '../components/layouts/PageBackground';

const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const handleAction = async () => {
      if (!oobCode) {
        setError('Invalid action code');
        setLoading(false);
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, oobCode);
            setSuccess('Email verified successfully!');
            setTimeout(() => navigate('/'), 5173);
            break;
            
          case 'resetPassword':
            await verifyPasswordResetCode(auth, oobCode);
            setSuccess('You can now reset your password');
            setLoading(false);
            return;
            
          default:
            setError('Invalid action');
        }
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };

    handleAction();
  }, [mode, oobCode, navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || !newPassword) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 5173);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-xl"
        >
          {loading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-cyan-500 mx-auto" />
              </motion.div>
              <p className="text-gray-300 mt-6 text-lg">Processing your request...</p>
            </div>
          ) : error ? (
            <motion.div 
              className="text-center py-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-6">{error}</p>
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 bg-gray-700 text-gray-200 rounded-xl 
                  hover:bg-gray-600 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Return Home
              </button>
            </motion.div>
          ) : mode === 'resetPassword' && !success.includes('successfully') ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <KeyRound className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
              </div>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white
                      placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
                      transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 
                    text-white font-medium hover:from-cyan-600 hover:to-blue-600 
                    transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Reset Password
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-green-400 text-lg font-medium">{success}</p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-1 bg-gradient-to-r from-green-500 to-cyan-500 mt-8 rounded-full"
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageBackground>
  );
};

export default AuthAction;
