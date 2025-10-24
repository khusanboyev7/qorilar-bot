import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotService } from './bot.service';
import { Qori } from './models/qori.model';
import { Ustoz } from './models/ustoz.model';
import { Rating } from './models/rating.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Qori, Ustoz, Rating]), // 👈 MUHIM!
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
