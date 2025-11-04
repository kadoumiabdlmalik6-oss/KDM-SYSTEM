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
    As a professional trading coach, analyze the following trade and provide constructive feedback. 
    Focus on potential improvements, risk management, and psychological aspects.
    Keep the analysis concise, insightful, and easy to understand for an intermediate trader.
    Format your response in markdown.

    **Trade Details:**
    - **Trading Pair:** ${trade.pair}
    - **Type:** ${trade.type.charAt(0).toUpperCase() + trade.type.slice(1)}
    - **Session:** ${trade.session}
    ${trade.entryPrice ? `- **Entry Price:** ${trade.entryPrice}` : ''}
    ${trade.exitPrice ? `- **Exit Price:** ${trade.exitPrice}` : ''}
    - **Risk/Reward Ratio:** 1:${trade.rr}
    - **Outcome:** A ${outcome} of $${Math.abs(trade.pnl).toFixed(2)}
    - **Date:** ${new Date(trade.date).toLocaleDateString()}
    - **Trader's Rating:** ${trade.rating} out of 5 stars
    - **Trader's Notes:** "${trade.notes}"

    **Your Analysis:**
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
        return "AI analysis failed. The Gemini API key is not configured correctly. Please ask the administrator to set it up in the Vercel environment variables.";
    }
    return "An error occurred while analyzing the trade. Please try again later.";
  }
};

// FIX: Add and export the missing `getMotivationQuote` function.
export const getMotivationQuote = async (): Promise<string> => {
  const prompt = `
    Provide a short, powerful, and insightful motivational quote suitable for a financial trader.
    The quote should be about discipline, patience, psychology, or risk management.
    Do not include any attributions (e.g., "- Author Name"). Just return the quote text.
    Keep it to a single sentence.
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
        return "Could not fetch a quote. Please ensure the Gemini API key is configured correctly.";
    }
    // Return a fallback quote on error
    return "The market is a device for transferring money from the impatient to the patient.";
  }
};
