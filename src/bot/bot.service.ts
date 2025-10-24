import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Qori } from './models/qori.model';
import { Ustoz } from './models/ustoz.model';
import { Rating } from './models/rating.model';
import { generateCertificate } from './utils/certificate';
import * as fs from 'fs';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectModel(Qori) private readonly qoriRepo: typeof Qori,
    @InjectModel(Ustoz) private readonly ustozRepo: typeof Ustoz,
    @InjectModel(Rating) private readonly ratingRepo: typeof Rating,
  ) {}

  /** 🧍‍♂️ Qorini ro‘yxatdan o‘tkazish */
  async registerQori(full_name: string, username: string, phone: string) {
    try {
      const exist = await this.qoriRepo.findOne({ where: { username } });
      if (exist) return 'Siz avval ro‘yxatdan o‘tgan ekansiz ✅';

      await this.qoriRepo.create({ full_name, username, phone, ball: 0 });
      return 'Siz muvaffaqiyatli ro‘yxatdan o‘tdingiz ✅';
    } catch (error) {
      this.logger.error(`registerQori xatosi: ${error.message}`);
      return '❌ Ro‘yxatdan o‘tishda xatolik yuz berdi.';
    }
  }

  /** 👨‍🏫 Ustozni ro‘yxatdan o‘tkazish */
  async registerUstoz(full_name: string, username: string, phone: string) {
    try {
      const exist = await this.ustozRepo.findOne({ where: { username } });
      if (exist) return 'Siz allaqachon ustoz sifatida ro‘yxatdan o‘tgansiz ✅';

      await this.ustozRepo.create({ full_name, username, phone });
      return 'Ustoz sifatida muvaffaqiyatli ro‘yxatdan o‘tdingiz ✅';
    } catch (error) {
      this.logger.error(`registerUstoz xatosi: ${error.message}`);
      return '❌ Ro‘yxatdan o‘tishda xatolik yuz berdi.';
    }
  }

  /** 👁 Foydalanuvchi profilini ko‘rish */
  async getMyProfile(username: string) {
    try {
      const qori = await this.qoriRepo.findOne({ where: { username } });
      if (qori)
        return `👤 Ism: ${qori.full_name}\n📞 Tel: ${qori.phone}\n⭐ Ball: ${qori.ball}`;

      const ustoz = await this.ustozRepo.findOne({ where: { username } });
      if (ustoz) return `👨‍🏫 Ustoz: ${ustoz.full_name}\n📞 Tel: ${ustoz.phone}`;

      return 'Profil topilmadi ❌';
    } catch (error) {
      this.logger.error(`getMyProfile xatosi: ${error.message}`);
      return '❌ Profilni olishda xatolik yuz berdi.';
    }
  }

  /** ⭐ Ball qo‘yish (ustoz tomonidan) */
  async addBall(ustozUsername: string, qoriId: number, ball: number) {
    try {
      const ustoz = await this.ustozRepo.findOne({
        where: { username: ustozUsername },
      });
      if (!ustoz) return 'Ustoz topilmadi ❌';

      const qori = await this.qoriRepo.findByPk(qoriId);
      if (!qori) return 'Qori topilmadi ❌';

      qori.ball += ball;
      await qori.save();

      await this.ratingRepo.create({
        ustozId: ustoz.id,
        qoriId: qori.id,
        ball,
      });

      return `✅ ${qori.full_name} ga ${ball} ball qo‘yildi.`;
    } catch (error) {
      this.logger.error(`addBall xatosi: ${error.message}`);
      return '❌ Ball qo‘yishda xatolik yuz berdi.';
    }
  }

  /** 🏆 Reytingni olish */
  async getReyting() {
    try {
      const qorilar = await this.qoriRepo.findAll({
        order: [['ball', 'DESC']],
      });

      if (!qorilar.length) return 'Hozircha reyting yo‘q.';

      return qorilar
        .map((q, i) => `${i + 1}. ${q.full_name} — ${q.ball} ball`)
        .join('\n');
    } catch (error) {
      this.logger.error(`getReyting xatosi: ${error.message}`);
      return '❌ Reytingni olishda xatolik yuz berdi.';
    }
  }

  /** 📜 Sertifikat yaratish */
  async generateCertificate(username: string) {
    try {
      const qori = await this.qoriRepo.findOne({ where: { username } });
      if (!qori) return 'Siz ro‘yxatdan o‘tmagansiz.';

      if (qori.ball < 100)
        return `😔 Sizda hali sertifikat yo‘q.\nBallingiz: ${qori.ball}`;

      const pdfPath = await generateCertificate(qori.full_name);
      const file = fs.readFileSync(pdfPath);

      return {
        msg: '🎉 Sizning sertifikatingiz tayyor!',
        file,
        path: pdfPath,
      };
    } catch (error) {
      this.logger.error(`generateCertificate xatosi: ${error.message}`);
      return '❌ Sertifikat yaratishda xatolik yuz berdi.';
    }
  }
}
