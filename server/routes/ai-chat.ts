import { RequestHandler } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في تعليم الأطفال عن الأموال والأسهم والاستثمار باللغة العربية. 

قواعد مهمة:
1. تحدث باللغة العربية الفصحى البسيطة والواضحة للأطفال
2. استخدم أمثلة مناسبة للأطفال وتشبيهات من حياتهم اليومية
3. استخدم الرموز التعبيرية لجعل الإجابات ممتعة 😊🌟💰
4. ركز فقط على موضوع المال والأسهم والاستثمار والادخار
5. إذا سُئلت عن موضوع خارج نطاق الأموال، أعد السؤال بلطف إلى الموضوع المالي
6. اجعل الإجابات ��صيرة ومفهومة (3-4 جمل كحد أقصى)
7. شجع الأطفال على الادخار والتفكير الإيجابي نحو المال

مثال على إجاباتك:
- الأسهم مثل قطع الأحجية من الشركات الكبيرة! 🧩
- الادخار مثل زراعة البذور التي تنمو مع الوقت! 🌱
- المال أداة مفيدة لتحقيق أحلامنا! ✨

كن ودوداً ومشجعاً ومتحمساً لتعليم الأطفال!`;

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, conversationHistory = [] }: ChatRequest = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "مفتاح OpenAI غير مُعرّف في متغيرات البيئة",
        response: "عذراً، لا يمكنني الإجابة الآن. يرجى المحاولة لاحقاً! 😊"
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "الرسالة مطلوبة",
        response: "يرجى كتابة سؤالك! 😊"
      });
    }

    // Build messages array for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 200,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    const response = completion.choices[0]?.message?.content || 
      'عذراً، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته؟ 😊';

    const chatResponse: ChatResponse = { response };
    res.json(chatResponse);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    const fallbackResponse = "عذراً، حدث خطأ تقني! 😅 هل يمكنك ��لمحاولة مرة أخرى؟ أنا هنا لأعلمك عن الأموال والأسهم! 💰📚";
    
    res.status(500).json({ 
      error: 'خطأ في الخادم',
      response: fallbackResponse
    });
  }
};
