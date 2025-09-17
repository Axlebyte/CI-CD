const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ci-cd-starter' });
});

app.get('/', (req, res) => {
  res.send('Welcome to Taylors page!');
});

module.exports = app;
