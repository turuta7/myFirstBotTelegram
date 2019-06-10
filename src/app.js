const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const express = require('express');
const https = require("https");

const { argv } = require('yargs')

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

    bot.onText(/\/weather/, msg => {
        const chatId = msg.chat.id;
        const resp = 'Погода:';
        bot.sendMessage(chatId, resp, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Погода в Черкассах',
                            callback_data: 'cherkasy',
                        },
                        {
                            text: 'Погода в Киеве',
                            callback_data: 'kiev',
                        },
                    ],
                ],
            },
        });
    });


    bot.on('callback_query', query => {
        const { id } = query.message.chat;
        if (query.data === 'cherkasy' || query.data === 'kiev') {
            const { apiKey } = process.env;
            const city = argv.c || query.data
            const units = 'metric'
            const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`

            request(url, (err, response, body) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('error:', err)
                } else {
                    const weather = JSON.parse(body)
                    const response1 = `*Сейчас: ${weather.main.temp} градусов в ${weather.name}*
                      \n Максимальная темперетура: ${weather.main.temp_max} 
                      \n Минимальная темперетура: ${weather.main.temp_min}
                      Влажность: ${weather.main.humidity} %
                      Облачность: ${weather.clouds} %`
                    bot.sendMessage(id, response1, { parse_mode: 'Markdown' });
                }
            })
        } else {
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
        }


    });

} catch (error) {
    console.log(error);
}



setInterval(function () {
    https.get("https://myfirst-telegrambot.herokuapp.com/");
}, 300000); // every 5 minutes (300000)


app.listen(process.env.PORT || 3000)

// require('https').createServer().listen(process.env.PORT || 5000)
//     .on('request', function (req, res) {
//         res.end()
//     });

// "prettier --write",
// "eslint --fix --max-warnings 0",
// "git add"




