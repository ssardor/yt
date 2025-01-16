const path = require("path");
const fs = require("fs");

const helpers = {
  ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  },

  generateFileName(prefix, extension) {
    return `${prefix}_${Date.now()}${extension}`;
  },

  cleanupOldFiles(directory, maxAge = 24 * 60 * 60 * 1000) {
    // 24 часа
    if (!fs.existsSync(directory)) return;

    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (Date.now() - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  },
};

module.exports = helpers;
