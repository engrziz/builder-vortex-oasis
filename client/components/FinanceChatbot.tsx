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

const predefinedResponses: Record<string, string> = {
  // Greetings
  'مرحبا': 'مرحباً بك! أنا مساعدك لتعلم الأسهم والمال بطريقة سهلة وممتعة! 🌟',
  'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! كيف يمكنني مساعدتك في تعلم الأموال اليوم؟ 😊',
  'هلا': 'أهلاً وسهلاً! هل تريد تعلم شيء جديد عن الأموال والأسهم؟ 🎈',
  
  // Stock market basics
  'ما هي الأسهم': 'الأسهم هي مثل قطع صغيرة من الشركات! 🧩 عندما تشتري سهماً، تصبح مالكاً لجزء صغير من تلك الشركة. مثل لو كان لديك قطعة من كعكة كبيرة! 🍰',
  'ما هو السهم': 'السهم هو مثل تذكرة دخول لتصبح شريكاً في شركة! 🎫 كلما نجحت الشركة أكثر، كلما أصبحت تذكرتك أغلى! 💰',
  'كيف أشتري أسهم': 'لشراء الأسهم، تحتاج أولاً أن تكبر وتفتح حساباً في البنك أو شركة الوساطة. لكن يمكنك الآن أن تتعلم وتخطط! 📚✨',
  
  // Money basics
  'ما هو المال': 'المال هو وسيلة نستخدمها لشراء الأشياء التي نحتاجها ونريدها! 💰 مثل الطعام والألعاب والكتب. يأتي من العمل والادخار! 🏦',
  'كيف أوفر المال': 'يمكنك توفير المال بوضع جزء من مصروفك في حصالة! 🐷 مثلاً، إذا أعطاك والداك 10 ريال، ضع ريالين في الحصالة واستخدم الباقي! 💡',
  'لماذا نوفر المال': 'نوفر المال للأشياء المهمة في المستقبل! 🌟 ��ثل شراء لعبة غالية، أو الدراسة في الجامعة، أو حتى مساعدة الآخرين! ❤️',
  
  // Investment basics
  'ما هو الاستثمار': 'الاستثمار مثل زراعة البذور! 🌱 تضع مالك في مكان آمن لينمو ويصبح أكثر مع الوقت، مثل الشجرة التي تكبر وتعطي ثماراً! 🌳🍎',
  'لماذا أستثمر': 'نستثمر لأن المال الذي نتركه نائماً لا ينمو! 😴 لكن المال المستثمر يعمل لنا حتى ونحن نائمون! مثل النحلة التي تصنع العسل! 🐝🍯',
  
  // Risk and safety
  'هل الأسهم آمنة': 'الأسهم مثل ركوب الأرجوحة! 🎢 أحياناً تصعد وأحياناً تنزل. لهذا نتعلم أولاً ونستثمر أموالاً قليلة فقط! الأمان يأتي من التعلم! 📖',
  'ما هي المخاطر': 'المخاطر مثل المطر! ☔ أحياناً تحدث، لكن إذا كنا مستعدين بالمظلة (التعلم والتخطيط)، لن نبتل كثيراً! 🌂',
  
  // Savings
  'كيف أبدأ الادخار': 'ابدأ بحصالة صغيرة! 🐷 ضع فيها ريالاً واحداً كل يوم، وستندهش كم ستجمع في الشهر! الادخار مثل لعبة ممتعة! 🎮',
  'ما أهمية الادخار': 'الادخار مثل المظلة في يوم ممطر! ☂️ يحمينا عندما نحتاج المال فجأة، ويساعدنا في تحقيق أحلامنا الكبيرة! ✨',
  
  // Default responses
  'default': 'هذا سؤال رائع! 🌟 أنا أتخصص في تعليم الأموال والأسهم للأطفال. هل يمكنك أن تسأل عن شيء متعلق بالمال أو الأسهم؟ مثل "ما هي الأسهم؟" أو "كيف أوفر المال؟" 💰📚'
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    
    // If no match, return default response
    return predefinedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
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
