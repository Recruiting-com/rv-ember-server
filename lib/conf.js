'use strict';

var nconf = require('nconf');

nconf.argv().file({ file: 'local.json' }).env(['secret', 'apiKey']);

nconf.defaults({
    port: 3000,
    ApiVersion: '',
    ApiDomain: '',
    ApiStagingDomain: '',
    protocol: '',
    secret: '',
    apiKey: '',
    publicDir: './dist',
    cacheTimeout: 2592000000, // 30 days timeout for static assets
    cachePrivacy: 'private'
});

module.exports = nconf;
