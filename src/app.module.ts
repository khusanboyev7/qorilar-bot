import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import LocalSession from 'telegraf-session-local';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    // .env fayldan global konfiguratsiyalar
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL ulanmasi
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      autoLoadModels: true,
      synchronize: process.env.SYNC_MODE === 'true',
      logging: process.env.LOGGING === 'true',
    }),

    // Telegraf konfiguratsiyasi
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isWebhook = config.get<string>('USE_WEBHOOK') === 'true';
        const domain = config.get<string>('WEBHOOK_URL');

        const launchOptions =
          isWebhook && domain
            ? {
                webhook: {
                  domain,
                  hookPath: '/api/bot',
                },
                dropPendingUpdates: true,
              }
            : { dropPendingUpdates: true };

        return {
          token: config.get<string>('BOT_TOKEN') ?? '',
          middlewares: [
            // Session ma'lumotlarini faylda saqlaydi
            new LocalSession({
              database: './src/session.json',
              property: 'session',
            }).middleware(),
          ],
          include: [BotModule],
          launchOptions,
        };
      },
    }),

    // Bot uchun modul
    BotModule,
  ],
})
export class AppModule {}
