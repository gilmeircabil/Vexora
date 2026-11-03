import { env } from '../../config/env.js';

export interface GenerateTextParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface GenerateTextResult {
  text: string;
  provider: 'gemini' | 'nvidia' | 'openrouter' | 'groq';
  model: string;
  tokensUsed?: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 string or plain text
  isText?: boolean;
}

export interface ChatParams {
  messages: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  provider?: 'auto' | 'gemini' | 'nvidia' | 'openrouter' | 'groq';
  attachments?: ChatAttachment[];
}

export const DEFAULT_SYSTEM_PROMPT =
  'You are Vexora AI, an advanced, helpful, and friendly AI companion built into VexoraMods. ' +
  'CRITICAL FORMATTING GUIDELINES:\n' +
  '1. Always structure your responses with clean, readable GitHub-flavored markdown.\n' +
  '2. When listing items, features, components, or steps, ALWAYS put each bullet item on its OWN SEPARATE NEW LINE starting with "* ". NEVER combine or squish multiple bullet points into a single paragraph or run-on line.\n' +
  '3. Use bold formatting (**Term:**) at the beginning of each bullet item.\n' +
  '4. Use descriptive markdown headings (##, ###) and blank lines between distinct topics so the text is spacious, scannable, and beautifully organized.';

export class GeminiTextService {
  /**
   * Generates text via Google Gemini REST API.
   */
  private static async callGemini(params: GenerateTextParams): Promise<GenerateTextResult> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    let model =
      params.model && params.model.startsWith('gemini')
        ? params.model
        : env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    if (model.startsWith('models/')) {
      model = model.slice('models/'.length);
    }
    // Automatically map deprecated or high-latency thinking models to instant Gemini 3.5 Flash Lite
    if (
      model === 'gemini-2.0-flash' ||
      model === 'gemini-1.5-flash' ||
      model === 'gemini-flash-latest' ||
      model === 'gemini-3.8-flash'
    ) {
      model = 'gemini-3.5-flash-lite';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: Record<string, any> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: params.prompt }],
        },
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 2048,
      },
    };

    if (params.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: params.systemPrompt }],
      };
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Google Gemini API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const candidates = data.candidates || [];
    let text = '';
    if (candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      text = parts.map((p: any) => p.text || '').join('\n');
    }

    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      text,
      provider: 'gemini',
      model,
      tokensUsed,
    };
  }

  /**
   * Generates text via NVIDIA NIM OpenAI-compatible REST API.
   */
  private static async callNvidia(params: GenerateTextParams): Promise<GenerateTextResult> {
    const apiKey = env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    const baseUrl = env.NVIDIA_BASE_URL.replace(/\/+$/, '');
    let model =
      params.model && (params.model.includes('/') || params.model.includes('llama'))
        ? params.model
        : env.NVIDIA_MODEL || 'meta/llama-3.2-90b-vision-instruct';

    // Map retired / deprecated models to active Meta flagship model
    if (model === 'meta/llama-3.3-70b-instruct' || model === 'llama-3.3-70b') {
      model = 'meta/llama-3.2-90b-vision-instruct';
    }
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    messages.push({ role: 'user', content: params.prompt });

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`NVIDIA NIM API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'nvidia',
      model,
      tokensUsed,
    };
  }

  /**
   * Generates text via OpenRouter REST API.
   */
  private static async callOpenRouter(
    params: GenerateTextParams & { model?: string },
  ): Promise<GenerateTextResult> {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in .env');
    }

    const baseUrl = env.OPENROUTER_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.OPENROUTER_MODEL || 'openrouter/free';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    messages.push({ role: 'user', content: params.prompt });

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vexoramods.com',
        'X-Title': 'VexoraMods AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'openrouter',
      model: data.model || model,
      tokensUsed,
    };
  }

  /**
   * Generates text via Groq LPU REST API.
   */
  private static async callGroq(
    params: GenerateTextParams & { model?: string },
  ): Promise<GenerateTextResult> {
    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in .env');
    }

    const baseUrl = env.GROQ_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    messages.push({ role: 'user', content: params.prompt });

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Groq API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'groq',
      model: data.model || model,
      tokensUsed,
    };
  }

  /**
   * Unified generator with auto-failover between Gemini, NVIDIA, OpenRouter, and Groq.
   */
  static async generate(
    params: GenerateTextParams & { model?: string },
  ): Promise<GenerateTextResult> {
    const preferredProvider = env.AI_PROVIDER;

    if (preferredProvider === 'groq' && env.GROQ_API_KEY) {
      try {
        return await this.callGroq(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) return await this.callGemini(params);
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouter(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidia(params);
        throw err;
      }
    }

    if (preferredProvider === 'openrouter' && env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouter(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroq(params);
        if (env.GEMINI_API_KEY) return await this.callGemini(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidia(params);
        throw err;
      }
    }

    if (preferredProvider === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidia(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroq(params);
        if (env.GEMINI_API_KEY) return await this.callGemini(params);
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouter(params);
        throw err;
      }
    }

    // Default or 'auto': Try Google Gemini first
    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGemini(params);
      } catch (err) {
        if (env.GROQ_API_KEY) {
          try {
            return await this.callGroq(params);
          } catch {}
        }
        if (env.OPENROUTER_API_KEY) {
          try {
            return await this.callOpenRouter(params);
          } catch {}
        }
        if (env.NVIDIA_API_KEY) {
          return await this.callNvidia(params);
        }
        throw err;
      }
    }

    if (env.GROQ_API_KEY) {
      try {
        return await this.callGroq(params);
      } catch (err) {
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouter(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidia(params);
        throw err;
      }
    }

    if (env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouter(params);
      } catch (err) {
        if (env.NVIDIA_API_KEY) return await this.callNvidia(params);
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.callNvidia(params);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or NVIDIA_API_KEY in your .env file.',
    );
  }

  /**
   * Performs multimodal OCR on document or image buffers using Google Gemini Vision.
   */
  static async extractDocumentText(params: {
    fileBuffer: Buffer;
    mimeType: string;
    originalName: string;
    model?: string;
  }): Promise<{ text: string; model: string; tokensUsed: number }> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    let model =
      params.model && params.model.startsWith('gemini')
        ? params.model
        : env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    if (model.startsWith('models/')) {
      model = model.slice('models/'.length);
    }
    // Automatically map deprecated or high-latency thinking models to instant Gemini 3.5 Flash Lite
    if (
      model === 'gemini-2.0-flash' ||
      model === 'gemini-1.5-flash' ||
      model === 'gemini-flash-latest' ||
      model === 'gemini-3.8-flash'
    ) {
      model = 'gemini-3.5-flash-lite';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: params.mimeType,
                data: params.fileBuffer.toString('base64'),
              },
            },
            {
              text: 'Perform high-accuracy optical character recognition (OCR) on this document or image. Transcribe all text, numbers, headings, tables, labels, and handwriting exactly as shown, preserving layout and paragraph structure where possible.',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Google Gemini Vision API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const candidates = data.candidates || [];
    let text = '';
    if (candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      text = parts.map((p: any) => p.text || '').join('\n');
    }

    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      text: text.trim(),
      model,
      tokensUsed,
    };
  }

  /**
   * Multi-turn chat via Google Gemini REST API.
   */
  private static async callGeminiChat(params: ChatParams): Promise<GenerateTextResult> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    let model =
      params.model && params.model.startsWith('gemini')
        ? params.model
        : env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    if (model.startsWith('models/')) {
      model = model.slice('models/'.length);
    }
    // Automatically map deprecated or high-latency thinking models to instant Gemini 3.5 Flash Lite
    if (
      model === 'gemini-2.0-flash' ||
      model === 'gemini-1.5-flash' ||
      model === 'gemini-flash-latest' ||
      model === 'gemini-3.8-flash'
    ) {
      model = 'gemini-3.5-flash-lite';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = params.messages
      .filter((m) => m.role !== 'system')
      .map((m, index, arr) => {
        const parts: Array<Record<string, any>> = [{ text: m.content || ' ' }];
        const isLastUser = m.role === 'user' && index === arr.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/') || att.mimeType === 'application/pdf') {
              parts.unshift({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data,
                },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              parts.push({
                text: `\n\n[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
        }

        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts,
        };
      });

    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    const body: Record<string, any> = {
      contents,
      systemInstruction: {
        parts: [{ text: systemText }],
      },
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 4096,
      },
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Google Gemini API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const candidates = data.candidates || [];
    let text = '';
    if (candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      text = parts.map((p: any) => p.text || '').join('\n');
    }

    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      text,
      provider: 'gemini',
      model,
      tokensUsed,
    };
  }

  /**
   * Streams multi-turn chat via Google Gemini REST API using SSE.
   */
  private static async streamGeminiChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'gemini'; model: string }> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    let model =
      params.model && params.model.startsWith('gemini')
        ? params.model
        : env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    if (model.startsWith('models/')) {
      model = model.slice('models/'.length);
    }
    // Automatically map deprecated or high-latency thinking models to instant Gemini 3.5 Flash Lite
    if (
      model === 'gemini-2.0-flash' ||
      model === 'gemini-1.5-flash' ||
      model === 'gemini-flash-latest' ||
      model === 'gemini-3.8-flash'
    ) {
      model = 'gemini-3.5-flash-lite';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = params.messages
      .filter((m) => m.role !== 'system')
      .map((m, index, arr) => {
        const parts: Array<Record<string, any>> = [{ text: m.content || ' ' }];
        const isLastUser = m.role === 'user' && index === arr.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/') || att.mimeType === 'application/pdf') {
              parts.unshift({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data,
                },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              parts.push({
                text: `\n\n[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
        }

        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts,
        };
      });

    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    const body: Record<string, any> = {
      contents,
      systemInstruction: {
        parts: [{ text: systemText }],
      },
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 4096,
      },
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Google Gemini stream error (${resp.status}): ${errText}`);
    }

    if (!resp.body) {
      throw new Error('No stream body returned by Google Gemini');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const chunkText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
              onChunk(chunkText);
            }
          } catch {
            // ignore partial JSON parse error
          }
        }
      }
    }

    return { provider: 'gemini', model };
  }

  /**
   * Multi-turn chat via NVIDIA NIM REST API.
   */
  private static async callNvidiaChat(params: ChatParams): Promise<GenerateTextResult> {
    const apiKey = env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    const baseUrl = env.NVIDIA_BASE_URL.replace(/\/+$/, '');
    let model =
      params.model && (params.model.includes('/') || params.model.includes('llama'))
        ? params.model
        : env.NVIDIA_MODEL || 'meta/llama-3.2-90b-vision-instruct';

    // Map retired / deprecated models to active Meta flagship model
    if (model === 'meta/llama-3.3-70b-instruct' || model === 'llama-3.3-70b') {
      model = 'meta/llama-3.2-90b-vision-instruct';
    }
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`NVIDIA NIM API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'nvidia',
      model,
      tokensUsed,
    };
  }

  /**
   * Streams multi-turn chat via NVIDIA NIM REST API using SSE.
   */
  private static async streamNvidiaChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'nvidia'; model: string }> {
    const apiKey = env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    const baseUrl = env.NVIDIA_BASE_URL.replace(/\/+$/, '');
    let model =
      params.model && (params.model.includes('/') || params.model.includes('llama'))
        ? params.model
        : env.NVIDIA_MODEL || 'meta/llama-3.2-90b-vision-instruct';

    // Map retired / deprecated models to active Meta flagship model
    if (model === 'meta/llama-3.3-70b-instruct' || model === 'llama-3.3-70b') {
      model = 'meta/llama-3.2-90b-vision-instruct';
    }
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`NVIDIA NIM stream error (${resp.status}): ${errText}`);
    }

    if (!resp.body) {
      throw new Error('No stream body returned by NVIDIA NIM');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const chunkText = data.choices?.[0]?.delta?.content;
            if (chunkText) {
              onChunk(chunkText);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    return { provider: 'nvidia', model };
  }

  /**
   * Multi-turn chat via OpenRouter REST API.
   */
  private static async callOpenRouterChat(params: ChatParams): Promise<GenerateTextResult> {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in .env');
    }

    const baseUrl = env.OPENROUTER_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.OPENROUTER_MODEL || 'openrouter/free';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vexoramods.com',
        'X-Title': 'VexoraMods AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'openrouter',
      model: data.model || model,
      tokensUsed,
    };
  }

  /**
   * Streams multi-turn chat via OpenRouter REST API using SSE.
   */
  private static async streamOpenRouterChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'openrouter'; model: string }> {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in .env');
    }

    const baseUrl = env.OPENROUTER_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.OPENROUTER_MODEL || 'openrouter/free';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vexoramods.com',
        'X-Title': 'VexoraMods AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter stream error (${resp.status}): ${errText}`);
    }

    if (!resp.body) {
      throw new Error('No stream body returned by OpenRouter');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const chunkText = data.choices?.[0]?.delta?.content;
            if (chunkText) {
              onChunk(chunkText);
            }
          } catch {
            // ignore partial JSON parse error
          }
        }
      }
    }

    return { provider: 'openrouter', model };
  }

  /**
   * Multi-turn chat via Groq LPU REST API.
   */
  private static async callGroqChat(params: ChatParams): Promise<GenerateTextResult> {
    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in .env');
    }

    const baseUrl = env.GROQ_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Groq API error (${resp.status}): ${errText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      provider: 'groq',
      model: data.model || model,
      tokensUsed,
    };
  }

  /**
   * Streams multi-turn chat via Groq LPU REST API using SSE.
   */
  private static async streamGroqChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'groq'; model: string }> {
    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in .env');
    }

    const baseUrl = env.GROQ_BASE_URL.replace(/\/+$/, '');
    const model = params.model || env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const url = `${baseUrl}/chat/completions`;

    const messages = [];
    const systemText =
      params.systemPrompt ||
      params.messages.find((m) => m.role === 'system')?.content ||
      DEFAULT_SYSTEM_PROMPT;

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m && m.role !== 'system') {
        let content: any = m.content;
        const isLastUser = m.role === 'user' && i === params.messages.length - 1;

        if (isLastUser && params.attachments && params.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of params.attachments) {
            if (att.mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: `data:${att.mimeType};base64,${att.data}` },
              });
            } else if (att.data) {
              const textContent = att.isText
                ? att.data
                : Buffer.from(att.data, 'base64').toString('utf-8');
              contentParts.push({
                type: 'text',
                text: `[Attached File: ${att.name}]\n\`\`\`\n${textContent}\n\`\`\`\n`,
              });
            }
          }
          contentParts.push({
            type: 'text',
            text: m.content || 'Please analyze the attached file.',
          });
          content = contentParts;
        }

        messages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Groq stream error (${resp.status}): ${errText}`);
    }

    if (!resp.body) {
      throw new Error('No stream body returned by Groq');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const chunkText = data.choices?.[0]?.delta?.content;
            if (chunkText) {
              onChunk(chunkText);
            }
          } catch {
            // ignore partial JSON parse error
          }
        }
      }
    }

    return { provider: 'groq', model };
  }

  /**
   * Unified multi-turn chat with automatic failover and model selection.
   */
  static async chat(params: ChatParams): Promise<GenerateTextResult> {
    const isGroq =
      params.provider === 'groq' ||
      params.model?.includes('groq') ||
      params.model?.startsWith('openai/gpt-oss') ||
      params.model?.startsWith('qwen/qwen3.8');
    const isOpenRouter =
      params.provider === 'openrouter' ||
      params.model?.startsWith('openrouter/') ||
      params.model?.endsWith(':free');
    const isNvidia =
      params.provider === 'nvidia' ||
      params.model?.includes('llama') ||
      params.model?.includes('meta/');
    const isGemini = params.provider === 'gemini' || params.model?.startsWith('gemini');

    if (isGroq && env.GROQ_API_KEY) {
      try {
        return await this.callGroqChat(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) return await this.callGeminiChat({ ...params, model: undefined });
        if (env.OPENROUTER_API_KEY)
          return await this.callOpenRouterChat({ ...params, model: undefined });
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat({ ...params, model: undefined });
        throw err;
      }
    }

    if (isOpenRouter && env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouterChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroqChat({ ...params, model: undefined });
        if (env.GEMINI_API_KEY) return await this.callGeminiChat({ ...params, model: undefined });
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat({ ...params, model: undefined });
        throw err;
      }
    }

    if (isNvidia && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidiaChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroqChat({ ...params, model: undefined });
        if (env.GEMINI_API_KEY) return await this.callGeminiChat({ ...params, model: undefined });
        if (env.OPENROUTER_API_KEY)
          return await this.callOpenRouterChat({ ...params, model: undefined });
        throw err;
      }
    }

    if (isGemini && env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroqChat({ ...params, model: undefined });
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat({ ...params, model: undefined });
        if (env.OPENROUTER_API_KEY)
          return await this.callOpenRouterChat({ ...params, model: undefined });
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'groq' && env.GROQ_API_KEY) {
      try {
        return await this.callGroqChat(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) return await this.callGeminiChat(params);
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouterChat(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat(params);
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'openrouter' && env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouterChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroqChat(params);
        if (env.GEMINI_API_KEY) return await this.callGeminiChat(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat(params);
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidiaChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.callGroqChat(params);
        if (env.GEMINI_API_KEY) return await this.callGeminiChat(params);
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouterChat(params);
        throw err;
      }
    }

    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiChat(params);
      } catch (err) {
        if (env.GROQ_API_KEY) {
          try {
            return await this.callGroqChat(params);
          } catch {}
        }
        if (env.OPENROUTER_API_KEY) {
          try {
            return await this.callOpenRouterChat(params);
          } catch {}
        }
        if (env.NVIDIA_API_KEY) {
          return await this.callNvidiaChat(params);
        }
        throw err;
      }
    }

    if (env.GROQ_API_KEY) {
      try {
        return await this.callGroqChat(params);
      } catch (err) {
        if (env.OPENROUTER_API_KEY) return await this.callOpenRouterChat(params);
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat(params);
        throw err;
      }
    }

    if (env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouterChat(params);
      } catch (err) {
        if (env.NVIDIA_API_KEY) return await this.callNvidiaChat(params);
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.callNvidiaChat(params);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY, GROQ_API_KEY, NVIDIA_API_KEY, or OPENROUTER_API_KEY in your .env file.',
    );
  }

  /**
   * Unified streaming chat with automatic failover and model selection.
   */
  static async streamChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'gemini' | 'nvidia' | 'openrouter' | 'groq'; model: string }> {
    const isGroq =
      params.provider === 'groq' ||
      params.model?.includes('groq') ||
      params.model?.startsWith('openai/gpt-oss') ||
      params.model?.startsWith('qwen/qwen3.8');
    const isOpenRouter =
      params.provider === 'openrouter' ||
      params.model?.startsWith('openrouter/') ||
      params.model?.endsWith(':free');
    const isNvidia =
      params.provider === 'nvidia' ||
      params.model?.includes('llama') ||
      params.model?.includes('meta/');
    const isGemini = params.provider === 'gemini' || params.model?.startsWith('gemini');

    if (isGroq && env.GROQ_API_KEY) {
      try {
        return await this.streamGroqChat(params, onChunk);
      } catch (err) {
        if (env.GEMINI_API_KEY)
          return await this.streamGeminiChat({ ...params, model: undefined }, onChunk);
        if (env.OPENROUTER_API_KEY)
          return await this.streamOpenRouterChat({ ...params, model: undefined }, onChunk);
        if (env.NVIDIA_API_KEY)
          return await this.streamNvidiaChat({ ...params, model: undefined }, onChunk);
        throw err;
      }
    }

    if (isOpenRouter && env.OPENROUTER_API_KEY) {
      try {
        return await this.streamOpenRouterChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY)
          return await this.streamGroqChat({ ...params, model: undefined }, onChunk);
        if (env.GEMINI_API_KEY)
          return await this.streamGeminiChat({ ...params, model: undefined }, onChunk);
        if (env.NVIDIA_API_KEY)
          return await this.streamNvidiaChat({ ...params, model: undefined }, onChunk);
        throw err;
      }
    }

    if (isNvidia && env.NVIDIA_API_KEY) {
      try {
        return await this.streamNvidiaChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY)
          return await this.streamGroqChat({ ...params, model: undefined }, onChunk);
        if (env.GEMINI_API_KEY) {
          return await this.streamGeminiChat({ ...params, model: undefined }, onChunk);
        }
        if (env.OPENROUTER_API_KEY) {
          return await this.streamOpenRouterChat({ ...params, model: undefined }, onChunk);
        }
        throw err;
      }
    }

    if (isGemini && env.GEMINI_API_KEY) {
      try {
        return await this.streamGeminiChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY)
          return await this.streamGroqChat({ ...params, model: undefined }, onChunk);
        if (env.NVIDIA_API_KEY) {
          return await this.streamNvidiaChat({ ...params, model: undefined }, onChunk);
        }
        if (env.OPENROUTER_API_KEY) {
          return await this.streamOpenRouterChat({ ...params, model: undefined }, onChunk);
        }
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'groq' && env.GROQ_API_KEY) {
      try {
        return await this.streamGroqChat(params, onChunk);
      } catch (err) {
        if (env.GEMINI_API_KEY) return await this.streamGeminiChat(params, onChunk);
        if (env.OPENROUTER_API_KEY) return await this.streamOpenRouterChat(params, onChunk);
        if (env.NVIDIA_API_KEY) return await this.streamNvidiaChat(params, onChunk);
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'openrouter' && env.OPENROUTER_API_KEY) {
      try {
        return await this.streamOpenRouterChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.streamGroqChat(params, onChunk);
        if (env.GEMINI_API_KEY) return await this.streamGeminiChat(params, onChunk);
        if (env.NVIDIA_API_KEY) return await this.streamNvidiaChat(params, onChunk);
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.streamNvidiaChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY) return await this.streamGroqChat(params, onChunk);
        if (env.GEMINI_API_KEY) return await this.streamGeminiChat(params, onChunk);
        if (env.OPENROUTER_API_KEY) return await this.streamOpenRouterChat(params, onChunk);
        throw err;
      }
    }

    if (env.GEMINI_API_KEY) {
      try {
        return await this.streamGeminiChat(params, onChunk);
      } catch (err) {
        if (env.GROQ_API_KEY) {
          try {
            return await this.streamGroqChat(params, onChunk);
          } catch {}
        }
        if (env.OPENROUTER_API_KEY) {
          try {
            return await this.streamOpenRouterChat(params, onChunk);
          } catch {}
        }
        if (env.NVIDIA_API_KEY) {
          return await this.streamNvidiaChat(params, onChunk);
        }
        throw err;
      }
    }

    if (env.GROQ_API_KEY) {
      try {
        return await this.streamGroqChat(params, onChunk);
      } catch (err) {
        if (env.OPENROUTER_API_KEY) return await this.streamOpenRouterChat(params, onChunk);
        if (env.NVIDIA_API_KEY) return await this.streamNvidiaChat(params, onChunk);
        throw err;
      }
    }

    if (env.OPENROUTER_API_KEY) {
      try {
        return await this.streamOpenRouterChat(params, onChunk);
      } catch (err) {
        if (env.NVIDIA_API_KEY) return await this.streamNvidiaChat(params, onChunk);
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.streamNvidiaChat(params, onChunk);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY, GROQ_API_KEY, NVIDIA_API_KEY, or OPENROUTER_API_KEY in your .env file.',
    );
  }
}
