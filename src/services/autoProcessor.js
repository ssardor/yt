const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const TrendAnalyzer = require("./trendAnalyzer");
const VideoProcessor = require("./videoProcessor");
const { logger } = require("../utils/logger");

class AutoProcessor {
  constructor(bot) {
    this.bot = bot;
    this.trendAnalyzer = new TrendAnalyzer();
    this.videoProcessor = new VideoProcessor();
    this.processedVideos = new Set();
    this.targetUserId = process.env.ADMIN_TELEGRAM_ID; // ID админа в Telegram
  }

  async start() {
    // Запуск автоматической обработки каждые 6 часов
    setInterval(() => this.processNewTrends(), 6 * 60 * 60 * 1000);
    await this.processNewTrends(); // Первый запуск
  }

  async processNewTrends() {
    try {
      const languages = ["ru", "en"];

      for (const lang of languages) {
        logger.info(`Starting trend analysis for ${lang}`);
        const trends = await this.trendAnalyzer.analyzeTrends(lang);
        logger.info(
          `Trends analyzed for ${lang}: ${trends.trendingVideos.length} videos found.`
        );

        if (!trends.trendingVideos || trends.trendingVideos.length === 0) {
          logger.warn(`No trending videos found for ${lang}`);
          continue;
        }

        for (const video of trends.trendingVideos.slice(0, 10)) {
          if (this.processedVideos.has(video.url)) {
            logger.info(`Video already processed: ${video.url}`);
            continue;
          }

          try {
            logger.info(`Processing video: ${video.url}`);
            await this.processVideo(video, lang);
            this.processedVideos.add(video.url);
            logger.info(`Successfully processed video: ${video.url}`);
          } catch (error) {
            logger.error(
              `Error processing video ${video.url}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      logger.error("Error in auto processing:", error);
    }
  }

  async processVideo(videoInfo, language) {
    try {
      const videoPath = path.join("uploads/videos", `${videoInfo.id}.mp4`);

      // Скачиваем видео
      await this.downloadVideo(videoInfo.url, videoPath);

      // Обрабатываем видео
      const processedClips = await this.videoProcessor.processVideo(
        videoPath,
        language
      );

      // Отправляем результаты в Telegram
      await this.sendResults(processedClips, language);

      // Очищаем временные файлы
      fs.unlinkSync(videoPath);
    } catch (error) {
      logger.error(`Error processing video ${videoInfo.url}:`, error);
    }
  }

  async downloadVideo(url, outputPath) {
    return new Promise((resolve, reject) => {
      ytdl(url, { quality: "highest" })
        .pipe(fs.createWriteStream(outputPath))
        .on("finish", resolve)
        .on("error", reject);
    });
  }

  async sendResults(clips, language) {
    const langEmoji = language === "ru" ? "🇷🇺" : "🇬🇧";

    await this.bot.telegram.sendMessage(
      this.targetUserId,
      `${langEmoji} Новые клипы готовы!`
    );

    for (const clip of clips) {
      const caption = `
${langEmoji} Готовый клип:

📝 Название:
${clip.metadata.title}

🔍 SEO описание:
${clip.metadata.description}

🏷️ Теги:
${clip.metadata.tags.join(", ")}

✅ Готово к публикации!
`;

      await this.bot.telegram.sendVideo(
        this.targetUserId,
        { source: clip.path },
        { caption }
      );
    }
  }
}

module.exports = AutoProcessor;
