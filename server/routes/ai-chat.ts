import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client only when needed to avoid build-time errors
let genAI: GoogleGenerativeAI | null = null;

const getGeminiClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAI;
};

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في تعليم الأطفال عن الأموال والأسهم والاستثمار باللغة العربية. 

قواعد مهمة:
1. تحدث باللغة العربية الفصحى البسيطة والواضحة للأطفال
2. استخدم أمثلة مناسبة للأطفال وتشبيهات من حياتهم اليومية
3. استخدم الرموز التعبيرية لجعل الإجابات ممتعة 😊🌟💰
4. ركز فقط على موضوع المال والأسهم والاستثمار والادخار
5. إذا سُئلت عن موضوع خارج نطاق الأموال، أعد السؤال بلطف إلى الموضوع المالي
6. اجعل الإجابات قصيرة ومفهومة (3-4 جمل كحد أقصى)
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "مفتاح Gemini API غير مُعرّف في متغيرات البيئة",
        response: "عذراً، لا يمكنني الإجابة الآن. يرجى المحاولة لاحقاً! 😊"
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "الرسالة مطلوبة",
        response: "يرجى كتابة سؤالك! 😊"
      });
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build conversation context
    let conversationContext = SYSTEM_PROMPT + "\n\n";
    
    // Add recent conversation history (limit to last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        conversationContext += `المستخدم: ${msg.content}\n`;
      } else {
        conversationContext += `المساعد: ${msg.content}\n`;
      }
    }
    
    // Add current user message
    conversationContext += `المستخدم: ${message}\nالمساعد: `;

    const result = await model.generateContent(conversationContext);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from Gemini");
    }

    const chatResponse: ChatResponse = { response: text };
    res.json(chatResponse);

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    const fallbackResponse = "عذراً، حدث خطأ تقني! 😅 هل يمكنك المحاولة مرة أخرى؟ أنا هنا لأعلمك عن الأموال والأسهم! 💰📚";
    
    res.status(500).json({ 
      error: 'خطأ في الخادم',
      response: fallbackResponse
    });
  }
};
