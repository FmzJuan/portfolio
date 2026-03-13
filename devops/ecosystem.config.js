module.exports = {
  apps : [
    {
      name: 'api-wordpress-sheets',
      script: './apiwordpressform/server.js', // ajuste para o nome real do seu arquivo .js
      watch: false
    },
    {
      name: 'bot-investur-baileys',
      script: './Bot-investur/index.js', // ajuste para o nome real do seu arquivo .js
      watch: false
    },
    {
      name: 'fallback-email-titan',
      script: './loop-email-titan/Main-V1.py',
      interpreter: 'python', // fundamental para o PM2 saber que é Python
      watch: false
    }
  ]
};