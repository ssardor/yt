require("dotenv").config();
const Bot = require("./src/bot");
const { logger } = require("./src/utils/logger");

let botInstance = null;

// Обработка необработанных исключений
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  if (botInstance) botInstance.stop();
});

// Обработка необработанных отклонений промисов
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
});

// Создание экземпляра бота
const startBot = async () => {
  try {
    botInstance = new Bot();
    await botInstance.launch();
  } catch (error) {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  }
};

startBot();
