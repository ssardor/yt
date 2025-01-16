class KeyboardManager {
    static getMainKeyboard() {
        return {
            keyboard: [
                ['🎥 Загрузить видео'],
                ['⚙️ Настройки', '📊 Статистика']
            ],
            resize_keyboard: true
        };
    }

    static getEditKeyboard() {
        return {
            inline_keyboard: [
                [
                    { text: '✏️ Заголовок', callback_data: 'edit_title' },
                    { text: '🏷️ Теги', callback_data: 'edit_tags' }
                ],
                [
                    { text: '👁️ Предпросмотр', callback_data: 'preview' },
                    { text: '✅ Готово', callback_data: 'done' }
                ]
            ]
        };
    }

    static getLanguageKeyboard() {
        return {
            inline_keyboard: [
                [
                    { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
                    { text: '🇬🇧 English', callback_data: 'lang_en' }
                ]
            ]
        };
    }
}

module.exports = KeyboardManager;