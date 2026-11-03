import { env } from '../../config/env.js';

export interface GenerateTextParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResult {
  text: string;
  provider: 'gemini' | 'nvidia';
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
  provider?: 'auto' | 'gemini' | 'nvidia';
  attachments?: ChatAttachment[];
}

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
   * Unified generator with auto-failover between Gemini and NVIDIA.
   */
  static async generate(params: GenerateTextParams): Promise<GenerateTextResult> {
    const preferredProvider = env.AI_PROVIDER;

    if (preferredProvider === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidia(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) {
          return await this.callGemini(params);
        }
        throw err;
      }
    }

    // Default or 'auto': Try Google Gemini first
    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGemini(params);
      } catch (err) {
        if (env.NVIDIA_API_KEY) {
          return await this.callNvidia(params);
        }
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.callNvidia(params);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY in your .env file from https://aistudio.google.com.',
    );
  }

  /**
   * Performs multimodal OCR on document or image buffers using Google Gemini Vision.
   */
  static async extractDocumentText(params: {
    fileBuffer: Buffer;
    mimeType: string;
    originalName: string;
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
      'You are Vexora AI, a friendly, helpful, and highly intelligent AI assistant built into VexoraMods. Always provide clear, well-structured answers in GitHub-flavored markdown with code blocks, headings, and lists where appropriate.';

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
      'You are Vexora AI, a friendly, helpful, and highly intelligent AI assistant built into VexoraMods. Always provide clear, well-structured answers in GitHub-flavored markdown with code blocks, headings, and lists where appropriate.';

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
      'You are Vexora AI, a friendly, helpful, and highly intelligent AI assistant built into VexoraMods. Always provide clear, well-structured answers in GitHub-flavored markdown with code blocks, headings, and lists where appropriate.';

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m.role !== 'system') {
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
      'You are Vexora AI, a friendly, helpful, and highly intelligent AI assistant built into VexoraMods. Always provide clear, well-structured answers in GitHub-flavored markdown with code blocks, headings, and lists where appropriate.';

    messages.push({ role: 'system', content: systemText });
    for (let i = 0; i < params.messages.length; i++) {
      const m = params.messages[i];
      if (m.role !== 'system') {
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
   * Unified multi-turn chat with automatic failover and model selection.
   */
  static async chat(params: ChatParams): Promise<GenerateTextResult> {
    const isNvidia =
      params.provider === 'nvidia' ||
      params.model?.includes('llama') ||
      params.model?.includes('meta/');
    const isGemini = params.provider === 'gemini' || params.model?.startsWith('gemini');

    if (isNvidia && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidiaChat(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) {
          return await this.callGeminiChat({ ...params, model: undefined });
        }
        throw err;
      }
    }

    if (isGemini && env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiChat(params);
      } catch (err) {
        if (env.NVIDIA_API_KEY) {
          return await this.callNvidiaChat({ ...params, model: undefined });
        }
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.callNvidiaChat(params);
      } catch (err) {
        if (env.GEMINI_API_KEY) {
          return await this.callGeminiChat(params);
        }
        throw err;
      }
    }

    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiChat(params);
      } catch (err) {
        if (env.NVIDIA_API_KEY) {
          return await this.callNvidiaChat(params);
        }
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.callNvidiaChat(params);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY in your .env file from https://aistudio.google.com.',
    );
  }

  /**
   * Unified streaming chat with automatic failover and model selection.
   */
  static async streamChat(
    params: ChatParams,
    onChunk: (text: string) => void,
  ): Promise<{ provider: 'gemini' | 'nvidia'; model: string }> {
    const isNvidia =
      params.provider === 'nvidia' ||
      params.model?.includes('llama') ||
      params.model?.includes('meta/');
    const isGemini = params.provider === 'gemini' || params.model?.startsWith('gemini');

    if (isNvidia && env.NVIDIA_API_KEY) {
      try {
        return await this.streamNvidiaChat(params, onChunk);
      } catch (err) {
        if (env.GEMINI_API_KEY) {
          return await this.streamGeminiChat({ ...params, model: undefined }, onChunk);
        }
        throw err;
      }
    }

    if (isGemini && env.GEMINI_API_KEY) {
      try {
        return await this.streamGeminiChat(params, onChunk);
      } catch (err) {
        if (env.NVIDIA_API_KEY) {
          return await this.streamNvidiaChat({ ...params, model: undefined }, onChunk);
        }
        throw err;
      }
    }

    if (env.AI_PROVIDER === 'nvidia' && env.NVIDIA_API_KEY) {
      try {
        return await this.streamNvidiaChat(params, onChunk);
      } catch (err) {
        if (env.GEMINI_API_KEY) {
          return await this.streamGeminiChat(params, onChunk);
        }
        throw err;
      }
    }

    if (env.GEMINI_API_KEY) {
      try {
        return await this.streamGeminiChat(params, onChunk);
      } catch (err) {
        if (env.NVIDIA_API_KEY) {
          return await this.streamNvidiaChat(params, onChunk);
        }
        throw err;
      }
    }

    if (env.NVIDIA_API_KEY) {
      return await this.streamNvidiaChat(params, onChunk);
    }

    throw new Error(
      'No AI provider is configured. Please provide GEMINI_API_KEY in your .env file from https://aistudio.google.com.',
    );
  }
}
