const { Telegraf, session } = require("telegraf");
const commands = require("./commands");
const AutoProcessor = require("../services/autoProcessor");
const { logger } = require("../utils/logger");
const config = require("../config");

class Bot {
  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN must be provided!");
    }
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // Добавляем middleware для сессий
    this.bot.use(session());

    // Инициализация автопроцессора
    this.autoProcessor = new AutoProcessor(this.bot);

    this.setupCommands();
    this.setupHandlers();
  }

  setupMiddleware() {
    // Логирование
    this.bot.use(async (ctx, next) => {
      const start = new Date();
      await next();
      const ms = new Date() - start;
      logger.info(`${ctx.from?.id} - ${ms}ms`);
    });
  }

  setupCommands() {
    // Базовые команды
    this.bot.command("start", commands.start);
    this.bot.command("stats", commands.showStats);
  }

  setupHandlers() {
    // Обработка видео
    this.bot.on("video", commands.handleVideo);

    // Обработка кнопок
    this.bot.hears("🎥 Загрузить видео", commands.start);
    this.bot.hears("🇷🇺 RU / EN", commands.switchLanguage);
    this.bot.hears("📊 Статистика", commands.showStats);

    // Обработка callback-ов от inline кнопок
    this.bot.action(/lang_(.+)/, async (ctx) => {
      const language = ctx.match[1];
      ctx.session.language = language;
      await ctx.answerCbQuery();
      await ctx.reply(
        language === "ru"
          ? "🇷🇺 Язык изменен на Русский"
          : "🇬🇧 Language set to English"
      );
    });
  }

  async launch() {
    try {
      // Остановка бота при завершении процесса
      process.once("SIGINT", () => this.stop("SIGINT"));
      process.once("SIGTERM", () => this.stop("SIGTERM"));

      // Настройка и запуск
      this.setupMiddleware();
      this.setupCommands();
      this.setupHandlers();

      // Запуск с очисткой предыдущих обновлений
      await this.bot.launch({
        dropPendingUpdates: true,
        polling: {
          timeout: 30,
          limit: 100,
        },
      });

      logger.info("Bot started successfully");

      // Запуск автоматической обработки
      await this.autoProcessor.start();
      logger.info("Auto processor started");
    } catch (error) {
      logger.error("Failed to start bot:", error);
      throw error;
    }
  }

  async stop(signal) {
    logger.info(`Stopping bot on ${signal}`);
    await this.bot.stop();
    process.exit(0);
  }
}

module.exports = Bot;
