import { RequestHandler } from "express";
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client only when needed
let anthropic: Anthropic | null = null;

const getClaudeClient = (): Anthropic => {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'fallback_mode',
    });
  }
  return anthropic;
};

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

// Enhanced fallback responses as backup
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase().trim();
  
  const responses: Record<string, string> = {
    'سيولة': 'السيولة هي سهولة تحويل الأشياء إلى نقود! �� مثل بيع لعبتك بسرعة للحصول على نقود. البيت صعب تحويله لنقود (سيولة قليلة) لكن النقود في البنك سهل سحبها (سيولة عالية)! 🏦💰',
    'مرحبا': 'مرحباً بك! أنا مساعدك الذكي لتعلم الأسهم والمال بطريقة سهلة وممتعة! 🌟 اسألني أي سؤال عن المال!',
    'ما هي الأسهم': 'الأسهم هي مثل قطع صغيرة من الشركات! 🧩 عندما تشتري سهماً، تصبح مالكاً لجزء صغير من تلك الشركة. مثل لو كان لديك قطعة من كعكة كبيرة! 🍰',
    'ما هو المال': 'المال هو وسيلة نستخدمها لشراء الأشياء التي نحتاجها ونريدها! 💰 مثل الطعام والألعاب والكتب. يأتي من العمل والادخار! 🏦',
    'كيف أوفر المال': 'يمكنك توفير المال بوضع جزء من مصروفك في حصالة! مثلاً، إذا أعطاك والداك 10 ريال، ضع ريالين في الحصالة واستخدم الباقي! 💡',
    'ما هو الاستثمار': 'الاستثمار مثل زراعة البذور! 🌱 تضع مالك في مكان آمن لينمو ويصبح أك��ر مع الوقت، مثل الشجرة التي تكبر وتعطي ثماراً! 🌳🍎',
    'تضارب': 'التضارب هو شراء وبيع الأسهم بسرعة لربح سريع! 🎢 مثل شراء لعبة اليوم بـ10 ريال وبيعها غداً بـ15 ريال. لكن احذر! قد تنخفض لـ5 ريال! إنها مثل لعبة محفوفة بالمخاطر! 🎯⚠️',
    'ما هو التداول': 'التداول هو بيع وشراء الأسهم! 📈📉 مثل تبادل البطاقات مع أصدقائك، لكن بالأسهم! يحتاج صبر وتعلم كثير قبل أن تبدأ!',
    'ما هي البورصة': 'البورصة مثل سوق كبير للأسهم! 🏪 الناس يأتون ليشتروا ويبيعوا أجزاء من الشركات. مثل سوق الخضار لكن للأسهم! 📊'
  };
  
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return 'هذا سؤال رائع! 🌟 أنا أتخصص في تعليم الأموال والأسهم للأطفال. هل يمكنك أن تسأل عن شيء متعلق بالمال أو الأسهم؟ مثل "ما هي الأسهم؟" أو "كيف أوفر المال؟" 💰📚';
};

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, conversationHistory = [] }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "الرسالة مطلوبة",
        response: "يرجى كتابة سؤالك! 😊"
      });
    }

    // Try Claude AI first if API key is available
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'fallback_mode') {
      try {
        const claude = getClaudeClient();
        
        // Build conversation context
        const systemPrompt = `أنت مساعد ذكي متخصص في تعليم الأطفال عن الأموال والأسهم والاستثمار باللغة العربية.

قواعد مهمة:
1. تحدث باللغة العربية الفصحى البسيطة والواضحة للأطفال
2. استخدم أمثلة مناسبة للأطفال وتشبيهات من حياتهم اليومية
3. استخدم الرموز التعبيرية لجعل الإجابات ممتعة 😊🌟💰
4. ركز فقط على موضوع المال والأسهم والاستثمار والادخار
5. إذا سُئلت عن موضوع خارج نطاق الأموال، أعد السؤال بلطف إلى الموضوع ال��الي
6. اجعل الإجابات قصيرة ومفهومة (3-4 جمل كحد أقصى)
7. شجع الأطفال على الادخار والتفكير الإيجابي نحو المال
8. لا تعطي نصائح استثمارية محددة أو أسعار أسهم، ركز على التعليم فقط

مثال على إجاباتك:
- الأسهم مثل قطع الأحجية من الشركات الكبيرة! 🧩
- الادخار مثل زراعة البذور التي تنمو مع الوقت! 🌱
- المال أداة مفيدة لتحقيق أحلامنا! ✨

كن ودوداً ومشجعاً ومتحمساً لتعليم الأطفال!`;

        // Prepare messages for Claude
        const messages: any[] = [];
        
        // Add conversation history
        const recentHistory = conversationHistory.slice(-6);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
        
        // Add current message
        messages.push({
          role: 'user',
          content: message
        });

        const response = await claude.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 200,
          system: systemPrompt,
          messages: messages
        });

        if (response.content && response.content[0]?.type === 'text') {
          const aiResponse = response.content[0].text;
          console.log('✅ Claude AI response generated successfully!');
          
          const chatResponse: ChatResponse = { response: aiResponse };
          return res.json(chatResponse);
        }
      } catch (claudeError) {
        console.log('🔄 Claude API failed, using fallback responses:', claudeError);
      }
    }

    // Fallback to predefined responses
    console.log('📚 Using smart fallback responses');
    const response = getFallbackResponse(message);
    
    const chatResponse: ChatResponse = { response };
    res.json(chatResponse);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    const fallbackResponse = "عذراً، حدث خطأ تقني! 😅 هل يمكنك المحاولة مرة أخرى؟ أنا هنا لأعلمك عن الأموال والأسهم! 💰📚";
    
    res.status(500).json({ 
      error: 'خطأ في الخادم',
      response: fallbackResponse
    });
  }
};
