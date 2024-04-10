const express = require('express');
const axios = require('axios').default;
const { Telegraf } = require('telegraf');



// Config .env
require('dotenv').config();


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

bot.command('hola', ctx => {
    ctx.reply('Hola ¿qué tal?');
});

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

- Temperatura: ${data.main.temp}ºC
- Mínima: ${data.main.temp_min}ºC
- Máxima: ${data.main.temp_max}ºC
- Humedad: ${data.main.humidity}%`);
        await ctx.replyWithLocation(data.coord.lat, data.coord.lon);

    } catch (error) {
        ctx.reply(`No tenemos datos para la ciudad ${ciudad}`);
    }

});



bot.command('dado', ctx => {
    ctx.replyWithDice();
});


bot.command('adios', ctx => {
    ctx.reply('Bye');
});


// Poner a escuchar en un Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
})