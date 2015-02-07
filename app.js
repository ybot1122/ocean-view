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

// query the multi-family property api
function api_query(src, params, callback) {
  var url = '';
  if (src === 1) {
    url = 'http://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/MultiFamilyProperties/FeatureServer/0/query?';
  }
  params['f'] = 'geojson';
  var param_string = JSON.stringify(params);
  var options = {
    host: url,
    path: param_string
  };
  http.request(options, function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      callback(str);
    });
  });
}

app.route('/events')
  .all(function(req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
  })
  .get(function(req, res, next) {
    // get request
  });

// Server start
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});