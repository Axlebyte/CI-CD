const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ci-cd-starter' });
});

app.get('/', (req, res) => {
  res.send('This is my CI/CD project! UA92');
});

module.exports = app;
