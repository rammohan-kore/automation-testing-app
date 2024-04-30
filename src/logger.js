const winston = require('winston');
require('winston-daily-rotate-file');
require('dotenv').config()
const { combine, timestamp, json } = winston.format;

const savgFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: process.env.LOG_DIR + '/' + `savg-server-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
});

const savgLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(timestamp(), json()),
  transports: [savgFileRotateTransport, new winston.transports.Console()],
});

const wsFileRotateTransport = new winston.transports.DailyRotateFile({
    filename: process.env.LOG_DIR + '/' + `ws-server-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
  });
  
  const wsLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: combine(timestamp(), json()),
    transports: [wsFileRotateTransport, new winston.transports.Console()],
  });

module.exports = {savgLogger, wsLogger};