import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext for Firebase
import { Search, ChevronDown, LogOut, Settings, User } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-500"
    >
      <LogOut className="h-4 w-4 mr-3" />
      Logout
    </button>
  );
};

const CommunityLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="h-screen">{children}</div>
    </div>
  );
};

export default CommunityLayout;