import OpenAI from 'openai';

// Rate limiting configuration
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  requests: number[];
}

class OpenAIService {
  private client: OpenAI | null = null;
  private rateLimit: RateLimitConfig;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    // Initialize rate limiting (10 requests per minute)
    this.rateLimit = {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      requests: []
    };

    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Validate environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_openai_api_key') {
        console.warn('OpenAI API key is not configured properly');
        return;
      }

      // Get organization ID if provided and not empty
      const orgId = import.meta.env.VITE_OPENAI_ORG_ID;
      const organizationId = orgId && orgId.trim() !== '' && orgId !== 'YOUR_ORG_ID' ? orgId : undefined;

      // Initialize OpenAI client
      this.client = new OpenAI({
        apiKey: apiKey,
        organization: organizationId,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
      });

      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
      this.client = null;
    }
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - this.rateLimit.windowMs;
    
    // Remove old requests outside the window
    this.rateLimit.requests = this.rateLimit.requests.filter(
      timestamp => timestamp > windowStart
    );

    // Check if we're within the limit
    if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
      return false;
    }

    // Add current request
    this.rateLimit.requests.push(now);
    return true;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateResponse(response: unknown): boolean {
    const res = response as { choices?: { message?: { content?: string } }[] };
    return Boolean(res?.choices?.[0]?.message?.content);
  }

  private sanitizeInput(input: string): string {
    // Remove potentially harmful content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 4000); // Limit input length
  }

  private createSystemPrompt(): string {
    return `Вы - AI-помощник для изучения языка эсперанто. Ваша задача:

1. Помогать пользователям изучать эсперанто
2. Отвечать на вопросы о грамматике, словаре и культуре эсперанто
3. Предоставлять примеры и упражнения
4. Быть терпеливым и поддерживающим учителем
5. Отвечать на русском языке, но включать примеры на эсперанто

Правила:
- Всегда отвечайте дружелюбно и профессионально
- Предоставляйте точную информацию об эсперанто
- Включайте практические примеры
- Поощряйте изучение языка
- Если не знаете ответ, честно скажите об этом

Отвечайте в формате JSON:
{
  "response": "ваш ответ здесь",
  "examples": ["пример 1", "пример 2"],
  "tips": ["совет 1", "совет 2"],
  "difficulty": "beginner|intermediate|advanced"
}`;
  }

  async sendMessage(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{
    response: string;
    examples?: string[];
    tips?: string[];
    difficulty?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    // Check if client is initialized
    if (!this.client) {
      throw new Error('OpenAI API не настроен. Проверьте конфигурацию API ключа.');
    }

    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Превышен лимит запросов. Попробуйте через минуту.');
    }

    // Sanitize input
    const sanitizedMessage = this.sanitizeInput(message);
    if (!sanitizedMessage) {
      throw new Error('Сообщение не может быть пустым');
    }

    // Prepare messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.createSystemPrompt() },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: sanitizedMessage }
    ];

    // Retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🤖 Sending request to OpenAI (attempt ${attempt}/${this.maxRetries})`);
        
        const completion = await this.client.chat.completions.create({
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
          messages,
          max_tokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '500'),
          temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.7'),
          response_format: { type: 'json_object' },
          user: `esperanto-learner-${Date.now()}` // Unique user identifier
        });

        console.log('✅ Received response from OpenAI');

        // Validate response
        if (!this.validateResponse(completion)) {
          throw new Error('Получен некорректный ответ от OpenAI');
        }

        const responseContent = completion.choices[0].message.content;
        
        try {
          // Parse JSON response
          const parsedResponse = JSON.parse(responseContent || '{}');
          
          return {
            response: parsedResponse.response || 'Извините, не удалось получить ответ.',
            examples: parsedResponse.examples || [],
            tips: parsedResponse.tips || [],
            difficulty: parsedResponse.difficulty || 'beginner',
            usage: completion.usage ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens
            } : undefined
          };
        } catch (parseError) {
          console.warn('⚠️ Failed to parse JSON response, using fallback');
          // Fallback if JSON parsing fails
          return {
            response: responseContent || 'Извините, не удалось получить ответ.',
            examples: [],
            tips: [],
            difficulty: 'beginner'
          };
        }

      } catch (error: unknown) {
        console.error(`❌ OpenAI API attempt ${attempt} failed:`, error);

        // Handle specific error types
        if ((error as { status?: number }).status === 429) {
          // Check if it's a quota exceeded error vs rate limit
          const errorMessage = (error as { message?: string }).message || '';
          if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
            throw new Error('Превышена квота OpenAI API. Проверьте план подписки и биллинг на platform.openai.com');
          } else {
            if (attempt < this.maxRetries) {
              console.log(`⏳ Rate limited, waiting ${this.retryDelay * attempt}ms before retry`);
              await this.delay(this.retryDelay * attempt);
              continue;
            }
            throw new Error('Превышен лимит запросов к API. Попробуйте через несколько минут.');
          }
        }

        if (error.status === 401) {
          throw new Error('Ошибка авторизации API. Проверьте правильность API ключа в настройках.');
        }

        if (error.status === 403) {
          throw new Error('Доступ запрещен. Проверьте права API ключа или активируйте биллинг.');
        }

        if (error.status >= 500) {
          if (attempt < this.maxRetries) {
            console.log(`🔄 Server error, retrying in ${this.retryDelay * attempt}ms`);
            await this.delay(this.retryDelay * attempt);
            continue;
          }
          throw new Error('Ошибка сервера OpenAI. Попробуйте позже.');
        }

        // Network errors
        if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
          if (attempt < this.maxRetries) {
            console.log(`🌐 Network error, retrying in ${this.retryDelay * attempt}ms`);
            await this.delay(this.retryDelay * attempt);
            continue;
          }
          throw new Error('Ошибка сети. Проверьте подключение к интернету.');
        }

        // Final attempt failed
        if (attempt === this.maxRetries) {
          throw new Error(
            error.message || 'Произошла неизвестная ошибка при обращении к AI'
          );
        }
      }
    }

    throw new Error('Не удалось получить ответ после нескольких попыток');
  }

  // Get current rate limit status
  getRateLimitStatus(): {
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - this.rateLimit.windowMs;
    
    // Clean old requests
    this.rateLimit.requests = this.rateLimit.requests.filter(
      timestamp => timestamp > windowStart
    );

    const remaining = Math.max(0, this.rateLimit.maxRequests - this.rateLimit.requests.length);
    const oldestRequest = this.rateLimit.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.rateLimit.windowMs : now;

    return {
      remaining,
      resetTime
    };
  }

  // Check if service is properly configured
  isConfigured(): boolean {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    return !!(this.client && apiKey && apiKey !== 'your_openai_api_key_here' && apiKey !== 'your_openai_api_key');
  }

  // Test connection with lightweight request
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Use a minimal test request to avoid quota issues
      const response = await this.client!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        temperature: 0
      });

      return this.validateResponse(response);
    } catch (error: unknown) {
      console.error('OpenAI connection test failed:', error);
      
      // Don't throw quota errors during connection test
      if (
        (error as { status?: number; message?: string }).status === 429 &&
        ((error as { message?: string }).message?.includes('quota') ||
          (error as { message?: string }).message?.includes('billing'))
      ) {
        console.warn('Connection test skipped due to quota limits');
        return false;
      }
      
      return false;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
