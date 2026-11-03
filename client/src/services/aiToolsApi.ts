function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const aiToolsApi = {
  async getModelStatus() {
    const res = await fetch('/api/ai/status', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },

  async enhanceImage(formData: FormData) {
    const res = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async removeBackground(formData: FormData) {
    const res = await fetch('/api/ai/remove-background', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async removeObject(formData: FormData) {
    const res = await fetch('/api/ai/remove-object', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async restorePhoto(formData: FormData) {
    const res = await fetch('/api/ai/restore-photo', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async runOcr(formData: FormData) {
    const res = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async explainCode(payload: {
    code: string;
    language?: string;
    mode?: 'explain' | 'debug';
    context?: string;
  }) {
    const res = await fetch('/api/ai/code-assist', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async summarizeDocument(payload: { text: string; mode?: 'summary' | 'qa'; question?: string }) {
    const res = await fetch('/api/ai/document-assist', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async assistWriting(payload: {
    text: string;
    mode?: 'rewrite' | 'resume';
    tone?: string;
    targetRole?: string;
  }) {
    const res = await fetch('/api/ai/writing-assist', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async chat(payload: {
    messages: Array<{ role: 'user' | 'model' | 'assistant' | 'system'; content: string }>;
    systemPrompt?: string;
    temperature?: number;
    model?: string;
    provider?: 'auto' | 'gemini' | 'nvidia';
    attachments?: Array<{ name: string; mimeType: string; data: string; isText?: boolean }>;
  }) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async streamChat(
    payload: {
      messages: Array<{ role: 'user' | 'model' | 'assistant' | 'system'; content: string }>;
      systemPrompt?: string;
      temperature?: number;
      model?: string;
      provider?: 'auto' | 'gemini' | 'nvidia';
      attachments?: Array<{ name: string; mimeType: string; data: string; isText?: boolean }>;
    },
    onChunk: (text: string) => void,
    onDone: (meta: { provider?: string; model?: string }) => void,
    onError: (err: any) => void,
    abortSignal?: AbortSignal,
  ) {
    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Chat streaming failed (${res.status})`);
      }

      if (!res.body) {
        throw new Error('No streaming body returned');
      }

      const reader = res.body.getReader();
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
            try {
              const data = JSON.parse(jsonStr);
              if (data.error) {
                onError(new Error(data.error));
                return;
              }
              if (data.done) {
                onDone({ provider: data.provider, model: data.model });
                return;
              }
              if (data.text) {
                onChunk(data.text);
              }
            } catch {
              // ignore partial JSON parse
            }
          }
        }
      }
      onDone({});
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onError(err);
    }
  },

  async getJobStatus(jobId: string) {
    const res = await fetch(`/api/ai/jobs/${jobId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },

  async getHistory() {
    const res = await fetch('/api/ai/history', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },
};
