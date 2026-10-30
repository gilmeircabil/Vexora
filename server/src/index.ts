import mongoose from 'mongoose';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { AuthService } from './services/authService.js';
import { AIService } from './services/ai/aiService.js';

async function bootstrap() {
  console.log(`Starting ToolNest Backend API in [${env.NODE_ENV}] mode...`);

  // Initialize upload directories
  await AIService.initDirs();

  // Connect to MongoDB
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(` Connected to MongoDB at ${env.MONGODB_URI}`);

    // Ensure default admin user exists
    const adminExists = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (!adminExists) {
      console.log(` Creating default admin user: ${env.ADMIN_EMAIL}`);
      await AuthService.register({
        name: 'System Administrator',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      });
      console.log(` Admin user created successfully.`);
    }
  } catch (err) {
    console.warn(
      ` Could not connect to MongoDB (${(err as Error).message}). Operating with local in-memory fallback where applicable.`,
    );
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(` ToolNest API server running at http://localhost:${env.PORT}`);
    console.log(` Client URL: ${env.CLIENT_URL}`);
  });

  const shutdown = async () => {
    console.log('Shutting down ToolNest server...');
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
