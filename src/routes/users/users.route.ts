import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { mailServiceFactory, MailServiceProviders } from '../../services/mail';

const usersRoute = new Hono();
const prisma = new PrismaClient();
const mailService = mailServiceFactory({
  provider: MailServiceProviders.brevo,
});

// Route are secured by jwt
usersRoute.use(
  '/*',
  jwt({
    secret: process.env.JWT_SECRET as string,
  })
);

// Get me
usersRoute.get('/me', async (c) => {
  const userId = c.get('jwtPayload').id;
  const user = await prisma.users.findUnique({
    select: {
      id: true,
      email: true,
      password: false,
      createdAt: true,
      updatedAt: true,
    },
    where: { id: userId },
  });
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(user);
});

export default usersRoute;
