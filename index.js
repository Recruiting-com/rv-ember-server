'use strict';

var Hapi = require('hapi');
var Path = require('path');
var Auth = require('./lib/auth');
var Conf = require('./lib/conf');

var cacheConfig = {
  cache: {
      expiresIn: Conf.get('cacheTimeout'),
      privacy: Conf.get('cachePrivacy')
  }
};

var server = new Hapi.Server();

server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(Conf.get('publicDir'), 'templates')
});

server.connection({ port: Conf.get('port')});

server.state('authToken', {
    ttl: null,
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

server.state('apiKey', {
    ttl: null,
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

server.route({
    path: '/public/{p*}',
    method: 'GET',
    handler: {
        directory: {
            path: Conf.get('publicDir'),
            listing: false,
            index: false,
            redirectToSlash: false
        }
    },
    config: cacheConfig
});

//API Proxy
var mapper = function (request, callback) {
    var search = '';
    var domain = Conf.get('ApiDomain');
    var protocol = Conf.get('protocol');
    if (request.url.search){
        search = request.url.search;
    }
    callback(null, protocol + '://' + domain + '/' + request.params.p + search);
};

//API-staging Proxy
var stagingMapper = function (request, callback) {
    var search = '';
    var stagingDomain = Conf.get('ApiStagingDomain');
    var protocol = Conf.get('protocol');
    if (request.url.search){
        search = request.url.search;
    }
    callback(null, protocol + '://' + stagingDomain + '/' + request.params.p + search);
};

//API-staging Proxy
var proxyMapper = function (request, callback) {
    var search = '';
    if (request.url.search){
        search = request.url.search;
    }
    callback(null, request.params.p + search);
};

server.route({
    method: ['GET', 'PUT', 'POST', 'DELETE'],
    path: '/api/{p*}',
    handler: { proxy: { mapUri: mapper, passThrough: true }}
});

server.route({
    method: ['GET', 'PUT', 'POST', 'DELETE'],
    path: '/api-staging/{p*}',
    handler: { proxy: { mapUri: stagingMapper, passThrough: true }
    }
});

server.route({
    method: ['GET', 'PUT', 'POST', 'DELETE'],
    path: '/proxy/{p*}',
    handler: { proxy: { mapUri: proxyMapper, passThrough: true }}
});

server.route({
    path: '/{p*}',
    method: 'GET',
    handler: function(request, reply){
        var authObj = Auth.getAuthToken();
        var token = authObj.shaSecret;
        var apiTimeStamp = authObj.apiTimeStamp;
        reply.view('index').state('authToken', token).state('apiKey', Auth.getApiKey()).state('apiTimeStamp', apiTimeStamp);
    }
});

module.exports = server;
