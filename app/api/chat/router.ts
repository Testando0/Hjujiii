import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configuração do cliente Groq usando o driver OpenAI
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30; // Limite para serverless

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'), // Ou 'llama3-8b-8192' para mais velocidade
    messages,
    system: "Você é um assistente AI prestativo, inteligente e direto. Responda em Markdown. Se o usuário pedir para gerar uma imagem, instrua-o a começar a frase com '/img'.",
  });

  return result.toDataStreamResponse();
}
