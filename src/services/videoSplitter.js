const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { logger } = require("../utils/logger");
const { ensureDirectoryExists } = require("../utils/helpers");

class VideoSplitter {
  constructor() {
    // Создаем директорию при инициализации
    ensureDirectoryExists("uploads/clips");
  }

  async splitVideo(videoPath, timestamps) {
    const clips = [];
    const outputDir = "uploads/clips";

    for (let i = 0; i < timestamps.length - 1; i++) {
      const start = timestamps[i];
      const duration = timestamps[i + 1] - start;

      const outputPath = path.join(outputDir, `clip_${i}_${Date.now()}.mp4`);

      try {
        await this.extractClip(videoPath, outputPath, start, duration);
        clips.push(outputPath);
      } catch (error) {
        logger.error(`Error splitting video at ${start}:`, error);
      }
    }

    return clips;
  }

  async detectInterestingMoments(videoPath) {
    // Здесь можно добавить алгоритм определения интересных моментов
    // Например, анализ движения, звука и т.д.
    return [0, 15, 30, 45]; // Пример временных меток
  }

  extractClip(inputPath, outputPath, start, duration) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(duration)
        .output(outputPath)
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .run();
    });
  }
}

module.exports = new VideoSplitter();
