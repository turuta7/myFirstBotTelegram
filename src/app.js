const TelegramBot = require('node-telegram-bot-api');

const request = require('request');

// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const { token } = process.env;

const bot = new TelegramBot(token, { polling: true });

// eslint-disable-next-line no-unused-vars
bot.onText(/\/course/, msg => {
    const chatId = msg.chat.id;
    // const resp = match[1];
    const resp = 'Выбирете валюту:';
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
            console.log(body);
            console.log(error);
            console.log(responss);

            const result = data.filter(x => x.ccy === query.data)[0];

            const md = `
        *${result.ccy} => ${result.base_ccy}*
        Покупка: ${result.buy}
        Продажа: ${result.sale}
        `;
            console.log(md);
            bot.sendMessage(id, md, { parse_mode: 'Markdown' });
        },
    );
});



// "prettier --write",
// "eslint --fix --max-warnings 0",
// "git add"