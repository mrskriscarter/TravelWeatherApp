const express = require('express');
const credentials = require('./apiCredentials.json');

//import Vue from 'vue'
//import VueMaterial from 'vue-material'
//import 'vue-material/dist/vue-material.min.css'

//Vue.use(VueMaterial)

var app = express();
app.use(express.static('public'));

app.listen(5500, () => {
    console.log('Listening on port: 5500'); 
});

