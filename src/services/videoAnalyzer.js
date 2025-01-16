const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");
const path = require("path");
const { logger } = require("../utils/logger");

class VideoAnalyzer {
  async analyzeVideo(videoPath) {
    try {
      const [scenes, audio] = await Promise.all([
        this.detectScenes(videoPath),
        this.analyzeAudio(videoPath),
      ]);

      const interestingMoments = this.findInterestingMoments(scenes, audio);
      return this.optimizeClips(interestingMoments);
    } catch (error) {
      logger.error("Error analyzing video:", error);
      throw error;
    }
  }

  async detectScenes(videoPath) {
    return new Promise((resolve, reject) => {
      const scenes = [];
      ffmpeg(videoPath)
        .outputOptions(["-filter:v", "select=gt(scene,0.4)", "-f", "null"])
        .on("stderr", (stderrLine) => {
          const match = stderrLine.match(/scene:(\d+\.\d+)/);
          if (match) {
            scenes.push(parseFloat(match[1]));
          }
        })
        .on("end", () => resolve(scenes))
        .on("error", reject)
        .run();
    });
  }

  async analyzeAudio(videoPath) {
    return new Promise((resolve, reject) => {
      const audioData = [];
      ffmpeg(videoPath)
        .outputOptions(["-af", "volumedetect", "-f", "null"])
        .on("stderr", (stderrLine) => {
          const match = stderrLine.match(/max_volume: (-?\d+\.\d+)/);
          if (match) {
            audioData.push(parseFloat(match[1]));
          }
        })
        .on("end", () => resolve(audioData))
        .on("error", reject)
        .run();
    });
  }

  findInterestingMoments(scenes, audio) {
    const moments = [];

    // Комбинируем данные о сценах и звуке
    scenes.forEach((scene, index) => {
      const audioLevel = audio[index] || 0;
      if (audioLevel > -20) {
        // Громкие моменты
        moments.push({
          timestamp: scene,
          score: audioLevel + 20,
        });
      }
    });

    return moments.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  optimizeClips(moments) {
    // Оптимизация длительности клипов
    return moments.map((moment) => ({
      start: Math.max(0, moment.timestamp - 2),
      duration: 15, // Оптимальная длина для Shorts
      score: moment.score,
    }));
  }
}

module.exports = VideoAnalyzer;
