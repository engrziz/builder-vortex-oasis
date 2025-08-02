# سَعة - Chatbot تعليم الأموال والأسهم

مساعد ذكي لتعليم المفاهيم المالية باللغة العربية.

## المميزات

- 🤖 شات بوت ذكي مدعوم بـ Claude AI
- 💰 متخصص في تعليم المال والأسهم
- 🇸🇦 باللغة العربية
- 🎯 مقيد على المواضيع المالية فقط
- 🔄 نظام احتياطي للإجابات المحددة مسبقاً

## التقنيات المستخدمة

- React 18 + TypeScript
- Vite
- TailwindCSS
- Express.js
- Claude AI (Anthropic)
- Radix UI Components

## التشغيل المحلي

```bash
npm install
npm run dev
```

التطبيق سيفتح على `http://localhost:8080`

## متطلبات البيئة

أضف مفتاح Claude API في ملف `.env`:

```
ANTHROPIC_API_KEY=your_claude_api_key_here
```

احصل على مفتاح مجاني من [console.anthropic.com](https://console.anthropic.com)

## الأوامر المتاحة

- `npm run dev` - تشغيل الخادم التطويري
- `npm run build` - بناء المشروع للإنتاج
- `npm run start` - تشغيل النسخة النهائية
- `npm test` - تشغيل الاختبارات

## النشر

يمكن نشر المشروع على:
- Netlify
- Vercel
- أي خدمة استضافة تدعم Node.js

---

مشروع تعليمي لتعزيز الثقافة المالية 💰
