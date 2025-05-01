import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './routers/default.js';
import { userRouter } from './routers/user.js';
import { merchantRouter } from './routers/merchant.js';

const app = express();
app.use(express.json());
app.use(defaultRouter);
app.use(userRouter);
app.use(merchantRouter);


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});