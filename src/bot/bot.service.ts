import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Qori } from './models/bot.model';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Qori)
    private qoriModel: typeof Qori,
  ) {}

  async addQori(full_name: string, username: string, phone: string) {
    const existing = await this.qoriModel.findOne({ where: { username } });
    if (existing)
      return `@${username} siz allaqachon ro‘yxatdan o‘tgan ekansiz ✅`;

    await this.qoriModel.create({
      full_name,
      username,
      phone_number: phone,
      status: "a'zo",
    } as any);

    return `Tabriklaymiz, ${full_name}! Siz botga a'zo bo‘ldingiz 🎉`;
  }

  async getAllQorilar() {
    const qorilar = await this.qoriModel.findAll();
    if (!qorilar.length) return "Hozircha hech kim a'zo emas.";
    return qorilar.map((q) => `👳‍♂️ ${q.full_name} (@${q.username})`).join('\n');
  }
}
