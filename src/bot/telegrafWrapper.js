import { Telegraf } from 'telegraf'

export default class TelegrafWrapper {
  constructor(token) {
    this.bot = new Telegraf(token)
  }

  // mimic node-telegram-bot-api methods
  onText(regex, handler) {
    this.bot.hears(regex, ctx => handler(ctx.message, ctx.match))
  }

  on(event, handler) {
    switch (event) {
      case 'message':
        this.bot.on('message', ctx => handler(ctx.message))
        break
      case 'callback_query':
        this.bot.on('callback_query', ctx => handler(ctx.callbackQuery))
        break
      case 'web_app_data':
        this.bot.on('message', ctx => {
          if (ctx.message && ctx.message.web_app_data) {
            handler(ctx.message)
          }
        })
        break
      case 'error':
        this.bot.catch(err => handler(err))
        break
      case 'polling_error':
        this.bot.catch(err => handler(err))
        break
      default:
        this.bot.on(event, ctx => handler(ctx.update))
    }
  }

  sendMessage(...args) {
    return this.bot.telegram.sendMessage(...args)
  }

  answerCallbackQuery(...args) {
    return this.bot.telegram.answerCbQuery(...args)
  }

  setMyCommands(...args) {
    return this.bot.telegram.setMyCommands(...args)
  }

  getMe() {
    return this.bot.telegram.getMe()
  }

  getWebhookInfo() {
    return this.bot.telegram.getWebhookInfo()
  }

  deleteWebhook(...args) {
    return this.bot.telegram.deleteWebhook(...args)
  }

  sendCommand(chatId, command) {
    return this.sendMessage(chatId, `/${command}`)
  }

  startPolling() {
    return this.bot.launch()
  }

  stopPolling() {
    return this.bot.stop()
  }
}
