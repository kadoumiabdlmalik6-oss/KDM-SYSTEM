import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

let ai: GoogleGenAI | null = null;

// Lazily initialize the GoogleGenAI client to prevent app crash on load
// if the API key is not set in the environment.
const getAi = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      // This error will be caught by the calling function.
      throw new Error("Gemini API key is not configured.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const analyzeTradeWithGemini = async (trade: Trade): Promise<string> => {
  const outcome = trade.pnl >= 0 ? 'profit' : 'loss';

  const prompt = `
    بصفتك مدرب تداول محترف، قم بتحليل الصفقة التالية وقدم ملاحظات بناءة باللغة العربية.
    ركز على التحسينات المحتملة، وإدارة المخاطر، والجوانب النفسية.
    اجعل التحليل موجزًا وثاقبًا وسهل الفهم لمتداول متوسط الخبرة.
    نسق ردك باستخدام الماركداون.

    **تفاصيل الصفقة:**
    - **زوج التداول:** ${trade.pair}
    - **النوع:** ${trade.type === 'buy' ? 'شراء' : 'بيع'}
    - **الجلسة:** ${trade.session}
    ${trade.entryPrice ? `- **سعر الدخول:** ${trade.entryPrice}` : ''}
    ${trade.exitPrice ? `- **سعر الخروج:** ${trade.exitPrice}` : ''}
    - **نسبة المخاطرة/العائد:** 1:${trade.rr}
    - **النتيجة:** ${outcome === 'profit' ? 'ربح' : 'خسارة'} بقيمة ${Math.abs(trade.pnl).toFixed(2)}$
    - **التاريخ:** ${new Date(trade.date).toLocaleDateString('ar-EG')}
    - **تقييم المتداول:** ${trade.rating} من 5 نجوم
    - **ملاحظات المتداول:** "${trade.notes}"

    **تحليلك:**
  `;

  try {
    const gemini = getAi();
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing trade with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key")) {
        return "فشل تحليل الذكاء الاصطناعي. لم يتم تكوين مفتاح Gemini API بشكل صحيح. يرجى الطلب من المسؤول إعداده في متغيرات بيئة Vercel.";
    }
    return "حدث خطأ أثناء تحليل الصفقة. يرجى المحاولة مرة أخرى لاحقًا.";
  }
};

// Add and export the missing `getMotivationQuote` function.
export const getMotivationQuote = async (): Promise<string> => {
  const prompt = `
    قدم اقتباسًا تحفيزيًا قصيرًا وقويًا ومتبصرًا ومناسبًا لمتداول مالي باللغة العربية.
    يجب أن يكون الاقتباس عن الانضباط أو الصبر أو علم النفس أو إدارة المخاطر.
    لا تضمن أي إسناد (مثل "- اسم المؤلف"). أرجع نص الاقتباس فقط.
    اجعله في جملة واحدة.
  `;

  try {
    const gemini = getAi();
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // Clean up response, remove potential markdown quotes or asterisks
    return response.text.replace(/["*]/g, '').trim();
  } catch (error) {
    console.error("Error fetching motivation quote with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key")) {
        return "تعذر جلب الاقتباس. يرجى التأكد من تكوين مفتاح Gemini API بشكل صحيح.";
    }
    // Return a fallback quote on error
    return "السوق هو أداة لنقل الأموال من غير الصبورين إلى الصبورين.";
  }
};


export const analyzeMarketWithGemini = async (pair: string): Promise<string> => {
    const prompt = `
      بصفتك محلل أسواق مالية محترف، قدم تحليلًا فنيًا موجزًا ومفصلاً لزوج التداول التالي: ${pair}.
      يجب أن يكون التحليل مناسبًا لمتداول متوسط الخبرة.
      نسق ردك باستخدام الماركداون باللغة العربية.

      **التحليل يجب أن يتضمن:**
      - **نظرة عامة على الاتجاه الحالي:** (صاعد، هابط، عرضي) مع شرح بسيط.
      - **مستويات الدعم والمقاومة الرئيسية:** اذكر أهم المستويات السعرية التي يجب مراقبتها.
      - **سيناريوهات محتملة:** (سيناريو صاعد وسيناريو هابط) مع نقاط الدخول أو التأكيد المحتملة.
      - **ملخص:** خلاصة سريعة وتوصية عامة (مثلاً: "الحذر مطلوب" أو "الفرص قد تكون متاحة للشراء فوق مستوى X").
      - **إخلاء مسؤولية:** "هذا التحليل هو لأغراض تعليمية فقط ولا يعتبر نصيحة مالية."

      **تحليلك لـ ${pair}:**
    `;

    try {
        const gemini = getAi();
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing market with Gemini:", error);
        if (error instanceof Error && error.message.includes("API key")) {
            return "فشل تحليل الذكاء الاصطناعي. لم يتم تكوين مفتاح Gemini API بشكل صحيح.";
        }
        return "حدث خطأ أثناء تحليل السوق. يرجى المحاولة مرة أخرى لاحقًا.";
    }
};