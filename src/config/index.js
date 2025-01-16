require("dotenv").config();

module.exports = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  uploadPath: {
    videos: "uploads/videos",
    processed: "uploads/processed",
    thumbnails: "uploads/thumbnails",
    clips: "uploads/clips",
  },
  videoSettings: {
    maxDuration: 60,
    width: 1080,
    height: 1920,
    videoBitrate: "2500k",
    audioBitrate: "128k",
  },
  quotaSettings: {
    basic: {
      dailyLimit: 10,
      videoLength: 60,
    },
    pro: {
      dailyLimit: 30,
      videoLength: 60,
    },
  },
};
