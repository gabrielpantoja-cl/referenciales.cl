// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, CoreMessage, StreamTextResult } from 'ai';
import { db } from '@/lib/prisma';
import { MessageRole } from '@prisma/client';
import { auth } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Interfaz para las FAQs
interface FAQs {
  [key: string]: string;
}

// Preguntas frecuentes (FAQs) y sus respuestas
const faqs: FAQs = {
  "¿De qué se trata referenciales.cl?": "Referenciales.cl es una base de datos colaborativa para peritos tasadores.",
  "¿Cómo puedo registrarme?": "Al iniciar sesión con Google te registras automáticamente en nuestra aplicación.",
  "¿Cuáles son los servicios que ofrecen?": "Ofrecemos acceso a una base de datos colaborativa, incluyendo consultas personalizadas, vista por mapa y más.",
  "¿Cuál es el correo o teléfono de contacto?": "El canal oficial de comunicación es el WhatsApp: +56 9 3176 9472."
};

// Prompt inicial para orientar al asistente
const promptInitial = `
Eres un asistente virtual para referenciales.cl. Responde a las preguntas de los usuarios de manera clara y concisa, y limita tus respuestas a temas relacionados con las tasaciones inmobiliarias. Aquí hay algunas preguntas frecuentes y sus respuestas:
${Object.entries(faqs).map(([question, answer]) => `- "${question}": "${answer}"`).join('\n')}
`;

export async function POST(req: NextRequest) {
  try {
    // --- Authentication ---
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    // --- End Authentication ---

    // --- VERIFICACIÓN DE API KEY ---
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return new Response('Server configuration error: Missing API Key', { status: 500 });
    }
    // --- FIN VERIFICACIÓN ---

    // Inicializar OpenAI Client
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { messages }: { messages: CoreMessage[] } = await req.json();

    // --- Save User Message ---
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      try {
        await db.chatMessage.create({
          data: {
            id: randomUUID(), // Generar ID único
            userId: userId,
            role: MessageRole.user,
            content: typeof lastUserMessage.content === 'string' 
              ? lastUserMessage.content 
              : JSON.stringify(lastUserMessage.content),
          },
        });
      } catch (dbError) {
        console.error("Error saving user message:", dbError);
        // No fallar la request si no se puede guardar el mensaje
      }
    }
    // --- End Save User Message ---

    // --- Check FAQs ---
    const lastMessageContent = typeof lastUserMessage?.content === 'string' 
      ? lastUserMessage.content 
      : '';
      
    if (lastMessageContent && faqs.hasOwnProperty(lastMessageContent)) {
      try {
        await db.chatMessage.create({
          data: {
            id: randomUUID(), // Generar ID único
            userId: userId,
            role: MessageRole.bot,
            content: faqs[lastMessageContent]
          }
        });
      } catch (dbError) {
        console.error("Error saving FAQ bot message:", dbError);
        // No fallar la request si no se puede guardar el mensaje
      }
      return NextResponse.json({ message: faqs[lastMessageContent] });
    }
    // --- End Check FAQs ---

    // --- Add System Prompt ---
    const messagesWithSystemPrompt: CoreMessage[] = [
      { role: 'system', content: promptInitial },
      ...messages
    ];
    // --- End Add System Prompt ---

    // --- Use AI SDK streamText ---
    const result: StreamTextResult<never, never> = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messagesWithSystemPrompt,
      onFinish: async ({ text }: { text: string }) => {
        try {
          await db.chatMessage.create({
            data: {
              id: randomUUID(), // Generar ID único
              userId: userId,
              role: MessageRole.bot,
              content: text,
            },
          });
        } catch (dbError) {
          console.error("Error saving bot message:", dbError);
          // No fallar la request si no se puede guardar el mensaje
        }
      },
    });
    // --- End Use AI SDK streamText ---

    return result.toDataStreamResponse();

  } catch (error) {
    // --- Error Handling ---
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Opcional: Habilitar Edge Runtime para mejor performance (comentado por ahora)
// export const runtime = 'edge';
