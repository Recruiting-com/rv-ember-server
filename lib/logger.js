const winston = require('winston');
const conf = require('./conf');

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  verbose: 'gray',
  debug: 'green',
  silly: 'magenta'
};
const levels = {
  error: 0,
  warn: 2,
  info: 1,
  verbose: 3,
  debug: 4,
  silly: 5
};

const getFilename = function() {
  var projectname = process.cwd().split('/').pop();
  var userDefinedLogFile = conf.get('logFile');  
  return userDefinedLogFile ? userDefinedLogFile : projectname + '_error.log';
};

const winstonLogger = new (winston.Logger)({
  levels: levels,
  transports: [
    new (winston.transports.Console)({
      timestamp: false,
      prettyPrint: true,
      level: 'info',
      colorize: true
    }),
    new (winston.transports.File)({
      timestamp: true,
      prettyPrint: true,
      filename: '../' + getFilename(),
      level: 'error',
      colorize: true
    })
  ]
});

winston.setLevels(levels);
winston.addColors(colors);
winston.remove(winston.transports.Console);

const Logger = {
  error: function() {
    winstonLogger.error.apply(winstonLogger, arguments);
  },
  warn: function() {
    winstonLogger.warn.apply(winstonLogger, arguments);
  },
  info: function() {
    winstonLogger.info.apply(winstonLogger, arguments);
  },
  verbose: function() {
    winstonLogger.verbose.apply(winstonLogger, arguments);
  },
  debug: function() {
    winstonLogger.debug.apply(winstonLogger, arguments);
  },
  silly: function() {
    winstonLogger.silly.apply(winstonLogger, arguments);
  }
};

module.exports = Logger;

