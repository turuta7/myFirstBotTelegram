const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const express = require('express');
const https = require("https");

const { argv } = require('yargs')

const app = express();

require('dotenv').config();
const { token } = process.env;

if (!token) {
    console.log('error token');
    return;
};

app.get('/', function (req, res) {
    res.send('Hello World')
})

let notes = [];
const bot = new TelegramBot(token, { polling: true });

try {
    bot.onText(/note(.+) (.+)/i, function (msg, match) {
        let userId1 = msg.from.id;
        let text1 = match[1];
        let time = match[2];
        notes.push({ 'uid': userId1, 'time': time, 'text': text1 });
        bot.sendMessage(userId1, 'Отлично! Я обязательно напомню, если не сдохну :)');
        console.log(notes);
    });



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
            }
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
            }
        });
    });


    bot.on('callback_query', query => {
        console.log(query.data);

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
                    Влажность: ${weather.main.humidity} %
                    Облачность: ${weather.clouds.all} %`
                    bot.sendMessage(id, response1, { parse_mode: 'Markdown' });
                }
            })
        };
        if (query.data === 'USD' || query.data === 'EUR' || query.data === 'RUR' || query.data === 'BTC') {
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

console.log(notes);
setInterval(function () {
    for (var i = 0; i < notes.length; i++) {
        var curDate = new Date().getHours() + ':' + new Date().getMinutes();



        if (notes[i]['time'] === curDate) {
            bot.sendMessage(notes[i]['uid'], 'Напоминаю, что вы должны: ' + notes[i]['text'] + ' сейчас.');
            notes.splice(i, 1);
        }
    }
}, 1000);


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




