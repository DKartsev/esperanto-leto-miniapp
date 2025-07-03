import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

// Rate limiting configuration
const rateLimit = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  requests: [],
  remaining: 10,
  resetTime: Date.now() + 60000
};

export function createOpenAIService() {
  // Validate environment variables
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') {
    logger.warn('OpenAI API key is not configured properly');
    return {
      isConfigured: () => false,
      sendMessage: async () => {
        throw new Error('OpenAI API не настроен. Проверьте конфигурацию.');
      },
      getRateLimitStatus: () => ({ remaining: 0, resetTime: Date.now() })
    };
  }

  // Get organization ID if provided
  const orgId = process.env.VITE_OPENAI_ORG_ID;
  const organizationId = orgId && orgId.trim() !== '' && orgId !== 'YOUR_ORG_ID' ? orgId : undefined;

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: apiKey,
    organization: organizationId
  });

  // Check rate limit
  const checkRateLimit = () => {
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    // Remove old requests outside the window
    rateLimit.requests = rateLimit.requests.filter(
      timestamp => timestamp > windowStart
    );

    // Check if we're within the limit
    if (rateLimit.requests.length >= rateLimit.maxRequests) {
      return false;
    }

    // Add current request
    rateLimit.requests.push(now);
    
    // Update remaining and reset time
    rateLimit.remaining = rateLimit.maxRequests - rateLimit.requests.length;
    const oldestRequest = rateLimit.requests[0];
    rateLimit.resetTime = oldestRequest ? oldestRequest + rateLimit.windowMs : now + rateLimit.windowMs;
    
    return true;
  };

  // Delay helper
  const delay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Validate response
  const validateResponse = (response) => {
    return (
      response &&
      response.choices &&
      response.choices.length > 0 &&
      response.choices[0].message &&
      response.choices[0].message.content
    );
  };

  // Sanitize input
  const sanitizeInput = (input) => {
    // Remove potentially harmful content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 4000); // Limit input length
  };

  // Create system prompt
  const createSystemPrompt = () => {
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
  };

  // Send message to OpenAI
  const sendMessage = async (message, conversationHistory = []) => {
    // Check rate limiting
    if (!checkRateLimit()) {
      throw new Error('Превышен лимит запросов. Попробуйте через минуту.');
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) {
      throw new Error('Сообщение не может быть пустым');
    }

    // Prepare messages
    const messages = [
      { role: 'system', content: createSystemPrompt() },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: sanitizedMessage }
    ];

    // Retry logic
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model: process.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
          messages,
          max_tokens: parseInt(process.env.VITE_OPENAI_MAX_TOKENS || '500'),
          temperature: parseFloat(process.env.VITE_OPENAI_TEMPERATURE || '0.7'),
          response_format: { type: 'json_object' },
          user: `esperanto-learner-${Date.now()}` // Unique user identifier
        });

        // Validate response
        if (!validateResponse(completion)) {
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
          // Fallback if JSON parsing fails
          return {
            response: responseContent || 'Извините, не удалось получить ответ.',
            examples: [],
            tips: [],
            difficulty: 'beginner'
          };
        }

      } catch (error) {
        logger.error(`OpenAI API attempt ${attempt} failed: ${error.message}`);

        // Handle specific error types
        if (error.status === 429) {
          if (attempt < maxRetries) {
            await delay(retryDelay * attempt);
            continue;
          }
          throw new Error('Сервис временно перегружен. Попробуйте позже.');
        }

        if (error.status === 401) {
          throw new Error('Ошибка авторизации API. Проверьте настройки API ключа и организации.');
        }

        if (error.status === 403) {
          throw new Error('Доступ запрещен. Проверьте права API ключа.');
        }

        if (error.status >= 500) {
          if (attempt < maxRetries) {
            await delay(retryDelay * attempt);
            continue;
          }
          throw new Error('Ошибка сервера OpenAI. Попробуйте позже.');
        }

        // Network errors
        if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
          if (attempt < maxRetries) {
            await delay(retryDelay * attempt);
            continue;
          }
          throw new Error('Ошибка сети. Проверьте подключение к интернету.');
        }

        // Final attempt failed
        if (attempt === maxRetries) {
          throw new Error(
            error.message || 'Произошла неизвестная ошибка при обращении к AI'
          );
        }
      }
    }

    throw new Error('Не удалось получить ответ после нескольких попыток');
  };

  // Get current rate limit status
  const getRateLimitStatus = () => {
    return {
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime
    };
  };

  // Check if service is properly configured
  const isConfigured = () => {
    return !!apiKey && apiKey !== 'your_openai_api_key';
  };

  return {
    isConfigured,
    sendMessage,
    getRateLimitStatus
  };
}