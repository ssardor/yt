const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

class ThumbnailMaker {
  async createThumbnail(videoPath) {
    const thumbnailPath = path.join(
      "uploads/thumbnails",
      `thumb_${Date.now()}.jpg`
    );

    // Извлечение кадра
    await this.extractFrame(videoPath, thumbnailPath);

    // Обработка изображения
    await this.processImage(thumbnailPath);

    return thumbnailPath;
  }

  async extractFrame(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ["50%"],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  async processImage(imagePath) {
    await sharp(imagePath)
      .resize(1080, 1920)
      .jpeg({ quality: 90 })
      .toFile(`${imagePath}_processed.jpg`);
  }
}

module.exports = new ThumbnailMaker();
