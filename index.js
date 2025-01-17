require("dotenv").config();
const { Telegraf } = require("telegraf");
const AutoProcessor = require("./src/services/autoProcessor");
const { logger } = require("./src/utils/logger");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const autoProcessor = new AutoProcessor(bot);

bot.start((ctx) => {
  ctx.reply(
    "Привет! Я бот для автоматической обработки видео. Я буду отправлять вам короткие видео для YouTube Shorts."
  );
});

bot.command("stats", (ctx) => {
  ctx.reply(
    "📊 Статистика:\n\n🎥 Использовано сегодня: 0\n✨ Осталось: 10\n🔄 Сброс лимита: 1/18/2025, 12:00:00 AM"
  );
});

bot
  .launch()
  .then(() => {
    logger.info("Bot started successfully");
    autoProcessor.start();
  })
  .catch((error) => {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  });
