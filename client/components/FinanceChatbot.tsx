import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatApiResponse {
  response: string;
  error?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function FinanceChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً بك في مدرسة المال الصغيرة! 🏫💰 أنا هنا لأعلمك كل شيء عن الأموال والأسهم بطريقة سهلة وممتعة! اسألني أي سؤال عن المال! 🌟',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatApiResponse = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
      }

      return data.response || 'عذراً، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته؟ 😊';
    } catch (error) {
      console.error('Error calling AI API:', error);
      return 'عذراً، حدث خطأ تقني! 😅 هل يمكنك المحاولة مرة أخرى؟ أنا هنا لأعلمك عن الأموال والأسهم! 💰📚';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponseText = await getAIResponse(userMessageText);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessageText },
        { role: 'assistant', content: aiResponseText }
      ]);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'عذراً، حدث خطأ! 😅 هل يمكنك المحاولة مرة أخرى؟',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-orange-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-3 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">مدرسة المال الصغيرة</h1>
            <p className="text-sm text-gray-600">مساعدك لتعلم الأموال والأسهم</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 max-w-[80%]',
                message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-full flex-shrink-0',
                  message.sender === 'user'
                    ? 'bg-gray-200'
                    : 'bg-gradient-to-r from-orange-400 to-orange-500'
                )}
              >
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-gray-600" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={cn(
                  'p-3 rounded-lg leading-relaxed',
                  message.sender === 'user'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-white text-gray-800 shadow-sm border border-orange-100'
                )}
              >
                <p className="text-lg">{message.text}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {message.timestamp.toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-orange-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اسأل عن الأموال والأسهم..."
            className="flex-1 text-lg border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            disabled={isTyping}
          />
        </div>
      </div>
    </div>
  );
}
