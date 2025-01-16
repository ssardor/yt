// src/bot/commands.js
const VideoProcessor = require("../services/videoProcessor");
const ThumbnailMaker = require("../services/thumbnailMaker");
const MetadataGenerator = require("../services/metadataGenerator");
const TrendAnalyzer = require("../services/trendAnalyzer");
const QuotaManager = require("../services/quotaManager");
const { logger } = require("../utils/logger");

const commands = {
  // Обработчик команды /start
  start: async (ctx) => {
    const keyboard = {
      keyboard: [
        ["🎥 Загрузить видео"],
        ["🌍 RU / EN", "📊 Статистика"]
      ],
      resize_keyboard: true
    };
    await ctx.reply("Привет! Отправь мне видео, и я подготовлю его для YouTube Shorts", keyboard);
  },

  // Обработчик команды /help
  help: async (ctx) => {
    await ctx.reply("Отправьте мне видео для обработки");
  },

  // Обработчик команды /settings
  settings: async (ctx) => {
    await ctx.reply("Настройки бота");
  },

  // Обработчик видео
  async handleVideo(ctx) {
    try {
      // Проверка квоты
      await QuotaManager.checkQuota(ctx.from.id);

      const statusMessage = await ctx.reply("⏳ Обрабатываю видео...");

      // Скачивание видео
      const file = await ctx.telegram.getFile(ctx.message.video.file_id);
      const videoPath = `uploads/videos/${file.file_id}.mp4`;
      await ctx.telegram.downloadFile(file.file_id, videoPath);

      // Получение языка из состояния пользователя (по умолчанию RU)
      const language = ctx.session?.language || "ru";

      // Обработка видео
      const processedClips = await VideoProcessor.processVideo(videoPath, language);

      // Отправка результатов
      await ctx.reply(`✅ Готово! Создано ${processedClips.length} клипов:`);

      // Отправка каждого клипа с метаданными
      for (const clip of processedClips) {
        const caption = `
🎥 Название: ${clip.metadata.title}

📝 Описание:
${clip.metadata.description}

🏷️ Теги:
${clip.metadata.tags.join(", ")}
`;

        await ctx.replyWithVideo(
          { source: clip.path },
          {
            caption,
            width: 1080,
            height: 1920
          }
        );
      }

      // Увеличение счетчика использования
      await QuotaManager.incrementQuota(ctx.from.id);

    } catch (error) {
      logger.error("Error in handleVideo:", error);
      if (error.message === "Daily limit reached") {
        await ctx.reply("❌ Достигнут дневной лимит видео");
      } else {
        await ctx.reply("❌ Произошла ошибка при обработке видео");
      }
    }
  },

  // Переключение языка
  async switchLanguage(ctx) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🇷🇺 Русский", callback_data: "lang_ru" },
          { text: "🇬�� English", callback_data: "lang_en" }
        ]
      ]
    };
    await ctx.reply("Выберите язык / Choose language:", keyboard);
  },

  // Статистика использования
  async showStats(ctx) {
    const quota = await QuotaManager.getQuota(ctx.from.id);
    const remaining = quota.limit - quota.used;
    await ctx.reply(`📊 Статистика:
    
🎥 Использовано сегодня: ${quota.used}
✨ Осталось: ${remaining}
🔄 Сброс лимита: ${new Date(quota.resetTime).toLocaleString()}`);
  }
};

module.exports = commands;
