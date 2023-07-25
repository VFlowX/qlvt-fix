import { transports, createLogger, format, config } from 'winston';
import 'winston-daily-rotate-file';
const { timestamp, label, printf, errors } = format;
import path from 'path'
var logDir = 'logs'; // directory path you want to set

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const timezoned = () => {
  return new Date().toLocaleString('vi', {
    timeZone: 'Asia/Ho_Chi_Minh'
  });
}
var transportErr = new (transports.DailyRotateFile)({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  level: 'error',
  maxFiles: '30d'
});

var transportCombine = new (transports.DailyRotateFile)({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d'
});

var transportConsole = new (transports.Console)({
  format: format.combine(
    format.colorize(),
    myFormat
  )
});

const logger = createLogger({
  levels: config.syslog.levels,
  format: format.combine(
    timestamp({ format: timezoned }),
    myFormat,
    label({ label: ' ' }),
    errors({ stack: true }),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    transportErr,
    transportCombine,
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(transportConsole);
}

export { logger }
