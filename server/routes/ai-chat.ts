import { RequestHandler } from "express";
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client only when needed
let hf: HfInference | null = null;

const getHfClient = (): HfInference => {
  if (!hf) {
    hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }
  return hf;
};

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في تعليم الأطفال عن الأموال والأسهم والاستثمار باللغة العربية. 

قواعد مهمة:
1. تحدث باللغة العربية الفصحى البسيطة والواضحة للأطفال
2. استخدم أمثلة مناسبة للأطفال وتشبيهات من حياتهم اليومية
3. استخدم الرموز التعبيرية لجعل الإجابات ممتعة 😊🌟💰
4. ركز فقط على موضوع المال والأسهم والاست��مار والادخار
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

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "الرسالة مطلوبة",
        response: "يرجى كتابة سؤالك! 😊"
      });
    }

    // Build conversation context
    let prompt = SYSTEM_PROMPT + "\n\n";
    
    // Add recent conversation history (limit to last 4 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-4);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        prompt += `المستخدم: ${msg.content}\n`;
      } else {
        prompt += `المساعد: ${msg.content}\n`;
      }
    }
    
    // Add current user message
    prompt += `المستخدم: ${message}\nالمساعد: `;

    try {
      // Use Hugging Face API (free model: microsoft/DialoGPT-medium)
      const hfClient = getHfClient();
      
      // Use a free Arabic-capable model
      const result = await hfClient.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1,
        }
      });

      let response = result.generated_text;
      
      // Clean up the response (remove the prompt part)
      if (response.includes('المساعد: ')) {
        const parts = response.split('المساعد: ');
        response = parts[parts.length - 1].trim();
      }

      // If response is empty or too short, use fallback
      if (!response || response.length < 10) {
        throw new Error("Response too short or empty");
      }

      const chatResponse: ChatResponse = { response };
      res.json(chatResponse);

    } catch (hfError) {
      console.log('Hugging Face API failed, trying simpler approach:', hfError);
      
      // Fallback: Use simple text generation with a smaller model
      try {
        const hfClient = getHfClient();
        const result = await hfClient.textGeneration({
          model: 'gpt2',
          inputs: `سؤال: ${message}\nإجابة بالعربية للأطفال عن المال والأسهم:`,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.8,
          }
        });

        let response = result.generated_text;
        response = response.replace(`سؤال: ${message}\nإجابة بالعربية للأطفال عن المال والأسهم:`, '').trim();
        
        if (response && response.length > 10) {
          const chatResponse: ChatResponse = { response };
          res.json(chatResponse);
          return;
        }
      } catch (fallbackError) {
        console.log('Fallback model also failed:', fallbackError);
      }
      
      // If both fail, throw error to use predefined responses
      throw new Error("All HF models failed");
    }

  } catch (error) {
    console.error('Hugging Face API Error:', error);
    
    const fallbackResponse = "عذراً، حدث خطأ تقني! 😅 هل يمكنك المحاولة مرة أخرى؟ أنا هنا لأعلمك عن الأموال والأسهم! 💰📚";
    
    res.status(500).json({ 
      error: 'خطأ في الخادم',
      response: fallbackResponse
    });
  }
};
