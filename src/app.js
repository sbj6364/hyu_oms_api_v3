import createError from 'http-errors';
import express from 'express';
import asyncify from 'express-asyncify';
import cors from 'cors';
import logger from 'morgan';
import helmet from 'helmet';

import http_api_v1 from './api_http/v1';

const app = asyncify(express());

/* Development 일 경우 console 에 log 표시 */
if(process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP API Version 1
app.use('/v1', http_api_v1);

// catch 404 and forward to error handler
app.use(async (req, res, next) => {
  next(createError(404));
});

// error handler
app.use(async (err, req, res, next) => {
  const status_code = err.status || 500;

  // 혹시 연결이 남아있을수도 있으므로 destroy 를 진행. (이렇게 하는게 맞나?)
  if(Boolean(req.db_connection) !== false) {
    req.db_connection.destroy();
  }

  /* Development 일 경우 console 에 error 표시 */
  if(process.env.NODE_ENV === 'development') {
    console.log(err.stack);
  }

  if(parseInt((status_code / 10).toString(), 10) === 50) {
    res.status(status_code);
    res.json({
      message: 'Internal server error',
      state: err.state || undefined
    });
  }
  else {
    res.status(status_code);
    res.json(err);
  }
});

export default app;