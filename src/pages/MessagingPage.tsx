import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageSquare, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MessagingPage() {
  const { user, messages, sendMessage } = useApp();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) { navigate('/login'); return null; }

  const chatMessages = messages.filter(
    m => (m.senderId === user.id || m.receiverId === user.id)
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage({
      id: 'm_' + Date.now(),
      senderId: user.id,
      receiverId: user.role === 'admin' ? 'student1' : 'admin',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleString(),
      read: false,
    });
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Chat Header */}
          <div className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">UniHive Support</h2>
              <p className="text-xs text-gray-400">Hostel management & booking assistance</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">Start a conversation</h3>
                <p className="text-sm text-gray-500">Send a message to UniHive support about hostels, bookings, or any questions.</p>
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-amber-500 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className={`text-xs mt-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-end gap-3">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none"
              />
              <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white p-3 rounded-xl transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
