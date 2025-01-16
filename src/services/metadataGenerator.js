const axios = require("axios");
const { logger } = require("../utils/logger");

class MetadataGenerator {
  constructor() {
    this.languages = {
      ru: {
        templates: [
          "🔥 {keyword} | Shorts",
          "😱 Невероятно! {keyword}",
          "⚡ {keyword} #shorts",
        ],
        emojis: ["🔥", "😱", "⚡", "🚀", "💥"],
      },
      en: {
        templates: [
          "🔥 {keyword} | Shorts",
          "😱 Amazing! {keyword}",
          "⚡ {keyword} #shorts",
        ],
        emojis: ["🔥", "😱", "⚡", "🚀", "💥"],
      },
    };
  }

  async generateMetadata(videoInfo, language = "ru") {
    try {
      const trends = await this.getTrends(language);
      const title = this.generateTitle(videoInfo, trends, language);
      const description = this.generateDescription(trends, language);
      const tags = this.generateTags(trends, language);

      return {
        title,
        description,
        tags,
        language,
      };
    } catch (error) {
      logger.error("Error generating metadata:", error);
      return this.getDefaultMetadata(language);
    }
  }

  generateTitle(videoInfo, trends, language) {
    const templates = this.languages[language].templates;
    const emojis = this.languages[language].emojis;

    const template = templates[Math.floor(Math.random() * templates.length)];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const keyword = videoInfo.title || trends.popularTopics[0];

    return template.replace("{keyword}", keyword).replace("{emoji}", emoji);
  }

  generateDescription(trends, language) {
    const templates = {
      ru: `🎥 {topic}

👉 Смотри до конца!
❤️ Ставь лайк
🔔 Подпишись на канал

#shorts ${trends.popularTags
        .slice(0, 5)
        .map((tag) => "#" + tag)
        .join(" ")}`,
      en: `🎥 {topic}

👉 Watch till the end!
❤️ Like if you enjoyed
🔔 Subscribe for more

#shorts ${trends.popularTags
        .slice(0, 5)
        .map((tag) => "#" + tag)
        .join(" ")}`,
    };

    return templates[language].replace("{topic}", trends.popularTopics[0]);
  }

  generateTags(trends, language) {
    const baseTags = trends.popularTags.slice(0, 15);
    const commonTags = {
      ru: ["shorts", "шортс", "тренды"],
      en: ["shorts", "trending", "viral"],
    };

    return [...new Set([...baseTags, ...commonTags[language]])];
  }

  getDefaultMetadata(language) {
    return {
      title: language === "ru" ? "🔥 Новое видео" : "🔥 New video",
      description: this.generateDescription(
        { popularTags: [], popularTopics: ["content"] },
        language
      ),
      tags: this.languages[language].defaultTags,
      language,
    };
  }
}

module.exports = MetadataGenerator;
