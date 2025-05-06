import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './routers/default.js';
import { merchantRouter } from './routers/merchant.js';
import { hunterRouter } from './routers/hunter.js';
import { goodRouter } from './routers/good.js';

export const app = express();
app.use(express.json());

app.use(merchantRouter);
app.use(hunterRouter);
app.use(goodRouter);
// Todas antes de default para que no entre directamente
app.use(defaultRouter);
