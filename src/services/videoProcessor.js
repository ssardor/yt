const ffmpeg = require("fluent-ffmpeg");
const VideoAnalyzer = require("./videoAnalyzer");
const MetadataGenerator = require("./metadataGenerator");
const { logger } = require("../utils/logger");

class VideoProcessor {
  constructor() {
    this.analyzer = new VideoAnalyzer();
    this.metadataGenerator = new MetadataGenerator();
  }

  async processVideo(inputPath, language = "ru") {
    logger.info(`Starting video processing for: ${inputPath}`);
    try {
      // Анализ трендов
      const trends = await this.trendAnalyzer.analyzeTrends(language);

      // Анализ видео
      const moments = await this.analyzer.analyzeVideo(inputPath);

      // Создание клипов
      const clips = await Promise.all(
        moments.map((moment) => this.createClip(inputPath, moment))
      );

      // Генерация метаданных
      const metadata = await Promise.all(
        clips.map((clip) =>
          this.metadataGenerator.generateMetadata(
            {
              title: clip.title,
              trends,
            },
            language
          )
        )
      );

      return clips.map((clip, index) => ({
        path: clip.path,
        metadata: metadata[index],
      }));
    } catch (error) {
      logger.error("Error processing video:", error);
      throw error;
    } finally {
      logger.info(`Video processing completed for: ${inputPath}`);
    }
  }

  async createClip(inputPath, moment) {
    // Создание оптимизированного клипа для Shorts
    const outputPath = `uploads/processed/clip_${Date.now()}.mp4`;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(moment.start)
        .setDuration(moment.duration)
        .size("1080x1920")
        .videoBitrate("2500k")
        .audioCodec("aac")
        .audioBitrate("128k")
        .output(outputPath)
        .on("end", () =>
          resolve({
            path: outputPath,
            title: `Moment at ${moment.start}s`,
          })
        )
        .on("error", reject)
        .run();
    });
  }
}

module.exports = VideoProcessor;
