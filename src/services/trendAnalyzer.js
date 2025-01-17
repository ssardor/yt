const axios = require("axios");
const { logger } = require("../utils/logger");

class TrendAnalyzer {
  constructor() {
    this.regions = {
      ru: "RU",
      en: "US,GB,CA,AU",
    };
    this.daysToAnalyze = 10;
  }

  async analyzeTrends(language = "ru") {
    logger.info(`Analyzing trends for language: ${language}`);
    try {
      const regions = this.regions[language].split(",");
      let allTrends = [];

      // Анализ по всем регионам
      for (const region of regions) {
        const trends = await this.getRegionTrends(region);
        allTrends = [...allTrends, ...trends];
      }

      // Анализ за последние 10 дней
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - this.daysToAnalyze);

      const filteredTrends = allTrends.filter((video) => {
        const publishDate = new Date(video.snippet.publishedAt);
        return publishDate > tenDaysAgo;
      });

      // Сортировка по популярности
      const sortedTrends = filteredTrends.sort((a, b) => {
        const scoreA = this.calculateVideoScore(a);
        const scoreB = this.calculateVideoScore(b);
        return scoreB - scoreA;
      });

      return this.extractTrendData(sortedTrends.slice(0, 50));
    } catch (error) {
      logger.error("Error in trend analysis:", error);
      return this.getDefaultTrends(language);
    } finally {
      logger.info(`Trends analysis completed for language: ${language}`);
    }
  }

  async getRegionTrends(region) {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          chart: "mostPopular",
          regionCode: region,
          maxResults: 50,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );
    return response.data.items;
  }

  calculateVideoScore(video) {
    const views = parseInt(video.statistics.viewCount) || 0;
    const likes = parseInt(video.statistics.likeCount) || 0;
    const comments = parseInt(video.statistics.commentCount) || 0;

    return views * 1 + likes * 2 + comments * 3;
  }

  extractTrendData(videos) {
    const tags = new Map();
    const topics = new Map();
    const titles = [];

    videos.forEach((video) => {
      // Анализ тегов
      if (video.snippet.tags) {
        video.snippet.tags.forEach((tag) => {
          tags.set(tag, (tags.get(tag) || 0) + 1);
        });
      }

      // Анализ заголовков
      titles.push({
        title: video.snippet.title,
        views: parseInt(video.statistics.viewCount),
        url: `https://youtube.com/watch?v=${video.id}`,
      });

      // Анализ тем
      const description = video.snippet.description;
      const words = description.split(/\s+/);
      words.forEach((word) => {
        if (word.length > 4) {
          topics.set(word, (topics.get(word) || 0) + 1);
        }
      });
    });

    return {
      popularTags: Array.from(tags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag]) => tag),
      trendingVideos: titles.slice(0, 10),
      popularTopics: Array.from(topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic]) => topic),
    };
  }

  getDefaultTrends(language) {
    return {
      popularTags: ["shorts", "trending", "viral"],
      popularTopics: ["challenge", "tutorial", "reaction"],
      trendingVideos: [],
    };
  }
}

module.exports = TrendAnalyzer;
