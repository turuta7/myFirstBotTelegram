const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
require('dotenv').config();
const { token } = process.env;
if (!token) {
    console.log('error token');
    return;
};

const bot = new TelegramBot(token, { polling: true });
try {
    // eslint-disable-next-line no-unused-vars
    bot.onText(/\/course/, msg => {
        const chatId = msg.chat.id;
        // const resp = match[1];
        const resp = 'Выберите валюту:';
        bot.sendMessage(chatId, resp, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'USD',
                            callback_data: 'USD',
                        },
                        {
                            text: 'EUR',
                            callback_data: 'EUR',
                        },
                        {
                            text: 'RUR',
                            callback_data: 'RUR',
                        },
                        {
                            text: 'BTC',
                            callback_data: 'BTC',
                        },
                    ],
                ],
            },
        });
    });

    bot.on('callback_query', query => {
        const { id } = query.message.chat;
        console.log(id);
        request(
            'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5',
            (error, responss, body) => {
                const data = JSON.parse(body);
                const result = data.filter(x => x.ccy === query.data)[0];

                const md = `
        *${result.ccy} => ${result.base_ccy}*
        Покупка: ${result.buy}
        Продажа: ${result.sale}
        `;

                bot.sendMessage(id, md, { parse_mode: 'Markdown' });
            },
        );
    });

} catch (error) {
    console.log(error);
}
require('https').createServer().listen(process.env.PORT || 5000).on('request', function (req, res) { res.end() });
// "prettier --write",
// "eslint --fix --max-warnings 0",
// "git add"