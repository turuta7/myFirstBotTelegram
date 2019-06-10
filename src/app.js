const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const express = require('express');

const app = express();



require('dotenv').config();
const { token } = process.env;
// if (!token) {
//     console.log('error token');
//     return;
// };

app.get('/', function (req, res) {
    res.send('Hello World')
})


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

const http = require("http");
setInterval(function () {
    http.get("https://myfirst-telegrambot.herokuapp.com/");
}, 300000); // every 5 minutes (300000)


app.listen(process.env.PORT || 3000)

// require('https').createServer().listen(process.env.PORT || 5000)
//     .on('request', function (req, res) {
//         res.end()
//     });

// "prettier --write",
// "eslint --fix --max-warnings 0",
// "git add"