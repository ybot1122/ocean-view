/*
  Backend server for OCEAN-VIEW
*/

// NPM Packages
var express = require('express');
var session = require('express-session');
var http = require('http');

// Global server variables
var host = "127.0.0.1";
var app = express();
var port = 8081;

app.use(express.static('public'));
app.use(express.static('public/style'));
app.use(express.static('public/img'));

// Server start
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});