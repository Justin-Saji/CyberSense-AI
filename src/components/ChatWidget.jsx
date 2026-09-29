import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, X, MessageSquare, Sparkles, Shield, Lock, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const fetchContext = () => {
    return "User is using CyberSense AI.";
  };

  const sanitizeResponse = (response) => {
    // Convert <br> tags to markdown line breaks
    let sanitized = response.replace(/<br\s*\/?>/gi, '\n');
    // Convert other common HTML tags to markdown
    sanitized = sanitized.replace(/<strong>/gi, '**').replace(/<\/strong>/gi, '**');
    sanitized = sanitized.replace(/<b>/gi, '**').replace(/<\/b>/gi, '**');
    sanitized = sanitized.replace(/<em>/gi, '*').replace(/<\/em>/gi, '*');
    sanitized = sanitized.replace(/<i>/gi, '*').replace(/<\/i>/gi, '*');
    sanitized = sanitized.replace(/<h([1-6])>/gi, (match, level) => '#'.repeat(parseInt(level)) + ' ').replace(/<\/h[1-6]>/gi, '\n');
    // Remove any remaining HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    // Clean up multiple consecutive line breaks
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    return sanitized;
  };

  const handleSend = async (textOverride = null) => {
    const text = textOverride || inputValue;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        conversation: newMessages,
        context: fetchContext()
      });

      if (response.data?.response) {
        const sanitizedResponse = sanitizeResponse(response.data.response);
        setMessages([...newMessages, { role: 'assistant', content: sanitizedResponse }]);
      } else {
        const fallback = "### 🛡️ CyberSense AI Security Advice\n\nAlways verify suspicious messages and links before interacting with them. You can use our **SMS**, **Email**, and **URL** scanners on the dashboard for real-time threat detection!";
        setMessages([...newMessages, { role: 'assistant', content: fallback }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = "### 🛡️ CyberSense AI Security Advice\n\nTo keep your account secure, ensure you use strong unique passwords, enable Multi-Factor Authentication (MFA), and scan any suspicious links or emails with CyberSense AI tools!";
      setMessages([...newMessages, { role: 'assistant', content: fallbackMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    { icon: <Shield className="w-3 h-3" />, text: "Account security" },
    { icon: <AlertTriangle className="w-3 h-3" />, text: "Phishing" },
    { icon: <Lock className="w-3 h-3" />, text: "Passwords" },
    { icon: <Sparkles className="w-3 h-3" />, text: "Security tips" }
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[320px] h-[450px] sm:w-[340px] sm:h-[480px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">CyberSense AI</h3>
                  <div className="flex items-center text-[10px] text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    <span className="text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 scroll-smooth bg-slate-900/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-3 overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
                      <Bot className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <div className="space-y-1 w-full">
                    <h4 className="text-sm font-semibold text-white">Cybersecurity Assistant</h4>
                    <p className="text-xs text-slate-400">Ask about security tips & threats</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 w-full max-w-[280px]">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(suggestion.text)}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg text-xs transition-all duration-200 border border-slate-700/50 hover:border-cyan-500/30 w-full text-left"
                      >
                        <div className="p-1 bg-slate-700/50 group-hover:bg-cyan-500/20 rounded transition-colors flex-shrink-0">
                          {React.cloneElement(suggestion.icon, { className: "w-3 h-3 text-cyan-400 group-hover:text-cyan-300" })}
                        </div>
                        <span className="flex-1 break-words">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 ml-2 shadow-lg shadow-cyan-500/20' : 'bg-slate-700/50 mr-2 border border-slate-600/50'}`}>
                        {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-cyan-400" />}
                      </div>
                      <div 
                        className={`px-3 py-2 rounded-xl text-xs break-words overflow-hidden ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-cyan-500/20' 
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm backdrop-blur-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50 prose-headings:text-cyan-400 prose-a:text-cyan-400 prose-table:text-slate-300 prose-th:border-b prose-th:border-slate-600 prose-td:border-b prose-td:border-slate-700 prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({node, ...props}) => (
                                  <div className="my-3">
                                    <table {...props} className="w-full border-collapse text-xs" style={{ tableLayout: 'auto' }} />
                                  </div>
                                ),
                                th: ({node, ...props}) => (
                                  <th {...props} className="px-2 py-1.5 text-left text-[10px] font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-600 bg-slate-800/50 break-words whitespace-normal" />
                                ),
                                td: ({node, ...props}) => (
                                  <td {...props} className="px-2 py-1.5 text-xs border-b border-slate-700/50 break-words whitespace-normal" />
                                ),
                                ul: ({node, ...props}) => (
                                  <ul {...props} className="space-y-0.5 my-1.5 ml-3 list-disc" />
                                ),
                                ol: ({node, ...props}) => (
                                  <ol {...props} className="space-y-0.5 my-1.5 ml-3 list-decimal" />
                                ),
                                li: ({node, ...props}) => (
                                  <li {...props} className="text-xs leading-relaxed" />
                                ),
                                code: ({node, inline, ...props}) => 
                                  inline ? (
                                    <code {...props} className="px-1 py-0.5 bg-slate-700/50 rounded text-cyan-400 text-[10px] font-mono break-all" />
                                  ) : (
                                    <code {...props} className="block p-2 bg-slate-900/50 rounded-lg text-[10px] font-mono border border-slate-700/50 break-all whitespace-pre-wrap" />
                                  ),
                                h1: ({node, ...props}) => (
                                  <h1 {...props} className="text-sm font-bold text-cyan-400 mt-3 mb-1.5" />
                                ),
                                h2: ({node, ...props}) => (
                                  <h2 {...props} className="text-xs font-bold text-cyan-400 mt-2 mb-1" />
                                ),
                                h3: ({node, ...props}) => (
                                  <h3 {...props} className="text-[10px] font-bold text-cyan-400 mt-1.5 mb-0.5" />
                                ),
                                p: ({node, ...props}) => (
                                  <p {...props} className="text-xs leading-relaxed my-1" />
                                ),
                                a: ({node, ...props}) => (
                                  <a {...props} className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer" />
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-700/50 mr-2 border border-slate-600/50">
                      <Bot className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/50 rounded-tl-sm backdrop-blur-sm flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gradient-to-t from-slate-950 to-slate-900/50 border-t border-slate-700/50">
              <div className="flex items-end gap-2 relative w-full">
                <div className="flex-1 relative min-w-0">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about cybersecurity..."
                    className="w-full max-h-24 min-h-[40px] bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 resize-none transition-all placeholder:text-slate-500 backdrop-blur-sm"
                    rows="1"
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:shadow-none hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-slate-700/80 text-white border border-slate-600/50 backdrop-blur-xl' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
          </>
        )}
      </motion.button>
    </div>
  );
};
