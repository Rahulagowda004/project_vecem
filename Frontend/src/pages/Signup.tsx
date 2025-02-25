import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail, validatePassword } from "../utils/validation";
import PageBackground from "../components/layouts/PageBackground";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createUserDocument } from "../services/apiService";

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
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      error: "",
      loading: false,
    };
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
      error: "",
    }));

    // Password match validation
    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : this.state.password;
      const confirmPassword =
        name === "confirmPassword" ? value : this.state.confirmPassword;

      if (password && confirmPassword && password !== confirmPassword) {
        this.setState({ error: "Passwords do not match" });
      }
    }
  };

  validateForm = (): boolean => {
    const { username, email, password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      this.setState({ error: "Passwords do not match" });
      return false;
    }

    if (username.length < 3) {
      this.setState({ error: "Username must be at least 3 characters" });
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

  registerUser = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      await fetch("http://localhost:5000/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          username: this.state.username, // Include username
        }),
      });
    }
  };

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!this.validateForm()) return;

    this.setState({ loading: true, error: "" });

    try {
      await this.props.auth.signup(
        // Use auth from props
        this.state.username,
        this.state.email,
        this.state.password
      );
      await this.registerUser(); // Register user with backend
      const user = auth.currentUser;
      if (user) {
        await createUserDocument(user.uid, {
          username: this.state.username,
          email: this.state.email,
          createdAt: new Date().toISOString(),
        });
      }
      if (this.props.onClose) {
        this.props.onClose();
      }
      // Redirect to login page after successful signup
      window.location.href = "/";
    } catch (error: any) {
      this.setState({
        error: error.message || "Failed to create account",
        loading: false,
      });
    }
  };

  handleGoogleSignIn = async () => {
    this.setState({ loading: true, error: "" });

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await this.registerUser(); // Register user with backend
      if (this.props.onClose) {
        this.props.onClose();
      }
      window.location.href = "/";
    } catch (err: any) {
      this.setState({
        error: err.message || "Failed to sign in with Google",
        loading: false,
      });
      console.error("Google sign-in error:", err);
    }
  };

  render() {
    const { error, loading } = this.state;
    const { auth } = this.props;

    if (auth.user) {
      return <Navigate to="/login" replace />;
    }

    return (
      <PageBackground>
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0.95, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                repeat: 0,
              },
            }}
            className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50"
          >
            <motion.h2
              initial={{ opacity: 0.9 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.3,
                  repeat: 0,
                },
              }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2 text-center"
            >
              Welcome to Vecem!
            </motion.h2>
            <p className="text-gray-300 text-sm mb-8 text-center">
              Create an account and unlock endless possibilities!
            </p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={this.handleSubmit}
              className="space-y-6"
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0.9 },
                animate: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    when: "beforeChildren",
                    repeat: 0,
                  },
                },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="space-y-2"
              >
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  onChange={this.handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={this.handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="space-y-2"
              >
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={this.handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="space-y-2"
              >
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={this.handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold
                  hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </motion.button>
            </motion.form>

            {/* Add Google Sign-in Button */}
            <motion.button
              onClick={this.handleGoogleSignIn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 p-3 rounded-lg bg-white text-gray-700 font-semibold
                hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNC0xMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4="
                    alt="Google logo"
                    className="h-5 w-5 mr-2"
                  />
                  Sign in with Google
                </>
              )}
            </motion.button>

            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              className="text-gray-400 text-center text-sm mt-6"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-cyan-300 transition-colors duration-200 font-medium"
              >
                Login
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </PageBackground>
    );
  }
}

// Proper HOC wrapper
const WithAuthSignup = (props: Omit<SignupProps, "auth">) => {
  const auth = useAuth();
  return <SignupComponent {...props} auth={auth} />;
};

export default WithAuthSignup;
