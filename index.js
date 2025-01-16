if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Bot = require("./src/bot");
const { logger } = require("./src/utils/logger");

const bot = new Bot();

bot
  .launch()
  .then(() => {
    logger.info("Bot started successfully");
  })
  .catch((error) => {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  });
