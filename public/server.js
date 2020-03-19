const express = require('express');
const credentials = require('./apiCredentials.json');


var app = express();
app.use(express.static('public'));

app.listen(5500, () => {
    console.log('Listening on port: 5500'); 
});

