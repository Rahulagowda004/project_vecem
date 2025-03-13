import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileByUsername } from '../services/userService';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!username || !user) return;

      try {
        const profileData = await getUserProfileByUsername(username);
        
        // If the profile UID doesn't match the current user's UID,
        // redirect to the /view version
        if (profileData && profileData.uid !== user.uid) {
          navigate(`/${username}/view`, { replace: true });
        }
      } catch (error) {
        console.error('Error checking profile access:', error);
        navigate('/home', { replace: true });
      }
    };

    checkAccess();
  }, [username, user, navigate]);

  return <>{children}</>;
};

export default ProfileGuard;
