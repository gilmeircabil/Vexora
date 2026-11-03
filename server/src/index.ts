import mongoose from 'mongoose';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { AuthService } from './services/authService.js';
import { AIService } from './services/ai/aiService.js';

async function bootstrap() {
  console.log(`Starting VexoraMods Backend API in [${env.NODE_ENV}] mode...`);

  // Initialize upload directories
  await AIService.initDirs();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(` VexoraMods API server running at http://localhost:${env.PORT}`);
    console.log(` Client URL: ${env.CLIENT_URL}`);
  });

  // Connect to MongoDB
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(` Connected to MongoDB at ${env.MONGODB_URI}`);

    // Run safe migration for existing accounts without a username
    const migratedCount = await AuthService.migrateExistingUsers();
    if (migratedCount > 0) {
      console.log(` Migrated ${migratedCount} existing user accounts to unique usernames.`);
    }

    // Ensure default admin user exists
    const adminUsername = env.ADMIN_USERNAME || 'admin';
    const adminExists = await User.findOne({
      $or: [
        { username: adminUsername },
        ...(env.ADMIN_EMAIL ? [{ email: env.ADMIN_EMAIL.toLowerCase() }] : []),
      ],
    });
    if (!adminExists) {
      console.log(` Creating default admin user (username: ${adminUsername})`);
      await AuthService.register({
        username: adminUsername,
        name: 'System Administrator',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      });
      console.log(` Admin user created successfully.`);
    }
  } catch (err) {
    console.warn(
      ` Could not connect to MongoDB (${(err as Error).message}). Database-dependent endpoints will return errors until MongoDB is reachable.`,
    );
  }

  const shutdown = async () => {
    console.log('Shutting down VexoraMods server...');
    server.close(async () => {
      await mongoose.disconnect();
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
