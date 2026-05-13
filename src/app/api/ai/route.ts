import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Sen Kiyim nomli onlayn do'konning sun'iy intellekt yordamchisisan.
    Foydalanuvchiga do'stona, qisqa va aniq javob ber. Agar kiyimlar haqida so'rasa, yaxshi maslahatlar ber.
    
    Foydalanuvchi xabari: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring." },
      { status: 500 }
    );
  }
}
