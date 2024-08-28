import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authenticationRoute from './routes/authentication/authentication.route';
import filesRoute from './routes/files/files.routes';
import usersRoute from './routes/users/users.route';

const app = new Hono();

console.log('Starting server...');
console.log(`Connecting to ${process.env.DATABASE_NAME}`);

app.use('/*', cors());
app.route('/auth', authenticationRoute);
app.route('/files', filesRoute);
app.route('/users', usersRoute);

export default app;
