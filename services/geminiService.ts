import { GoogleGenAI } from "@google/genai";
import { DeliveryRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDataWithGemini = async (data: DeliveryRecord[], userQuery: string): Promise<{ answer: string, sql: string }> => {
  try {
    const dataContext = JSON.stringify(data.slice(0, 15)); 

    const systemPrompt = `
      You are a Senior Support Automation Analyst and SQL Expert.
      
      Dataset Schema (table name: 'deliveries'):
      - id (string)
      - total_delivery_time (float, minutes)
      - region (string)
      - order_total (float)
      - refunded_amount (float)
      - restaurant_id (string)
      - driver_id (string)

      Sample Data:
      ${dataContext}

      Your Task:
      1. Answer the user's query analytically based on the data.
      2. Generate a standard SQL query that would retrieve this answer from a database.
      
      Format your response as a JSON object ONLY:
      {
        "answer": "Your analytical text here...",
        "sql": "SELECT ... FROM deliveries ..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) return { answer: "No response generated.", sql: "" };

    try {
        return JSON.parse(text);
    } catch (e) {
        return { answer: text, sql: "-- SQL generation failed to parse" };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { answer: "Unable to analyze data at this time. Please check your API configuration.", sql: "" };
  }
};