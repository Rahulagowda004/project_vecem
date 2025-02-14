import React from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

function App() {
  const navigate = useNavigate();
  
  // Mock data - replace with real data from your backend
  const messages: Message[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Alice Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      content: 'Hey everyone! How are you doing today?',
      timestamp: '2 min ago'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Bob Smith',
      userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      content: 'Im doing great! Just finished working on the new feature.',
      timestamp: '5 min ago'
    }
  ];

  const onlineUsers: ChatUser[] = [
    {
      id: 'user1',
      name: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      status: 'online'
    },
    {
      id: 'user2',
      name: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      status: 'online'
    },
    {
      id: 'user3',
      name: 'Carol Williams',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      status: 'offline',
      lastSeen: '2h ago'
    }
  ];

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - Online Users */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <User className="w-5 h-5" />
            Online Users
          </h2>
        </div>
        <div className="px-2">
          {onlineUsers.map(user => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="w-full p-3 flex items-center space-x-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.status === 'online' ? 'Online' : `Last seen ${user.lastSeen}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Chat Room
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className="flex items-start space-x-3">
              <button
                onClick={() => handleUserClick(message.userId)}
                className="flex-shrink-0"
              >
                <img
                  src={message.userAvatar}
                  alt={message.userName}
                  className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUserClick(message.userId)}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {message.userName}
                  </button>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-gray-300 mt-1">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;