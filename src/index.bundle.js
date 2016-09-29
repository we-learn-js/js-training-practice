var quiz = require('./index')

quiz(document.getElementById('quiz'), { url: 'data/quiz.json?' + Date.now() })
