import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Qori } from './models/bot.model';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [SequelizeModule.forFeature([Qori])],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
