import morgan from 'morgan';

export const requestLogger = morgan('combined');

export const errorLogger = (err, req, _res, next) => {
  console.error(`[${req.method}] ${req.originalUrl}`, err);
  next(err);
};
