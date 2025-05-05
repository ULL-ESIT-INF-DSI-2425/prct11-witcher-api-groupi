import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './routers/default.js';
import { userRouter } from './routers/user.js';
import { merchantRouter } from './routers/merchant.js';
import { hunterRouter } from './routers/hunter.js';
import { goodRouter } from './routers/good.js';

const app = express();
app.use(express.json());

app.use(userRouter);
app.use(merchantRouter);
app.use(hunterRouter);
app.use(goodRouter);
// Todas antes de default para que no entre directamente
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});