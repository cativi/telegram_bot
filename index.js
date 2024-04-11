const express = require('express');
const axios = require('axios').default;
const { Telegraf } = require('telegraf');

const User = require('./models/user.model');
const { linkedinPost } = require('./gpt');

// Config .env
require('dotenv').config();

// Config DB
require('./db');


// Creamos App de Express
const app = express();

// Creamos el Bot de Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

// Config conexión con Telegram
app.use(bot.webhookCallback('/telegram-bot'));
// URL pública del Bot
bot.telegram.setWebhook(`${process.env.BOT_URL}/telegram-bot`);

// Ruta POST necesaria para funcionar con Telegram
app.post('/telegram-bot', (req, res) => {
    res.send('Responder a Telegram');
});

// MIDDLEWARE del Bot
bot.use(async (ctx, next) => {


    const user = await User.findOne({ telegram_id: ctx.from.id });
    if (!user) {
        ctx.from.telegram_id = ctx.from.id;
        await User.create(ctx.from);
    }
    next();
});

// Comandos del Bot

bot.command('prueba', async ctx => {
    await ctx.reply('funsiona');
});

bot.command('start', ctx => {
    ctx.reply(`Escribe /hola para saludar,
    /tal para pregunta qué tal
    /tiempo seguido del nombre de una ciudad, ej: /tiempo madrid
    /dado para tirar el dado
     /adios para despedirte
     /start para volver al menú`);
});

// bot.command('hola', ctx => {
//     ctx.reply('Hola ¿qué tal?');
// });

bot.command('tal', ctx => {
    ctx.reply(`¡Qué tal! ¡Es un placer saludarte! ¿Cómo estás hoy? Espero que estés teniendo un día maravilloso lleno de alegría y buenos momentos. Si hay algo en lo que pueda ayudarte o si simplemente quieres charlar, ¡estoy aquí para ti! ¡Que tengas un excelente día!`);
});

bot.command('tiempo', async ctx => {
    // ctx.message.text
    const ciudad = ctx.message.text.split('/tiempo')[1];
    // otra opción: const ciudad = ctx.message.text.slice(8);

    try {
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OWM_API_KEY}&units=metric`)

        await ctx.replyWithHTML(`<b>Tiempo en ${ciudad.toUpperCase()}</b>

🌡️ Temperatura: ${data.main.temp}ºC
- Mínima: ${data.main.temp_min}ºC
- Máxima: ${data.main.temp_max}ºC
- Humedad: ${data.main.humidity}%`);
        await ctx.replyWithLocation(data.coord.lat, data.coord.lon);

    } catch (error) {
        ctx.reply(`No tenemos datos para la ciudad ${ciudad}`);
    }

});

bot.command('hola', async ctx => {
    // Mensaje que enviamos de forma aleatorio a cualquiera de los usuarios registrados en nuestro Bot

    const mensaje = ctx.message.text.split('/mensaje')[1];

    const users = await User.find();
    const user = users[Math.floor(Math.random() * users.length)];

    try {
        // await bot.telegram.sendMessage(user.telegram_id, mensaje);
        await ctx.reply(`Hola ${user.first_name}`);
    } catch (error) {
        ctx.reply(`Escribe /mensaje seguido de tu mensaje -> ejemplo: /mensaje Hola!!!`);
    }
});


bot.command('dado', ctx => {
    ctx.replyWithDice();
});


bot.command('adios', ctx => {
    ctx.reply('Bye');
});

// CHATGPT Bot Commands
// bot.command('ayuda', async ctx => {

//     const idea = ctx.message.text.split('/ayuda')[1];

//     const content = await linkedinPost(idea);

//     ctx.reply(content);
// });

// bot.command('linkedin', async ctx => {
//     // /linkedin como usar javascript en el servidor
//     const idea = ctx.message.text.split('/linkedin')[1];

//     const content = await linkedinPost(idea);

//     ctx.reply(content);
// });



// Poner a escuchar en un Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
})