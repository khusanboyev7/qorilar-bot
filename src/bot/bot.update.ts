import { Ctx, Hears, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { BotService } from './bot.service';

interface SessionData {
  step?: 'ism' | 'phone' | 'ustoz_ism' | 'ustoz_phone';
  full_name?: string;
  phone?: string;
  role?: 'qori' | 'ustoz';
}

interface MyContext extends Context {
  session: SessionData;
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    @InjectBot() private readonly bot: Telegraf<MyContext>,
  ) {}

  // 🎬 Boshlanish
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    console.log('▶️ /start bosildi:', ctx.from?.username);

    // ❌ ctx.session = {} o‘rniga:
    if (ctx.session) {
      for (const key of Object.keys(ctx.session)) {
        delete (ctx.session as any)[key];
      }
    }

    await ctx.reply(
      `👋 Assalomu alaykum, ${ctx.from?.first_name || 'do‘st'}!\n\n` +
        `Quyidagi tugmalardan birini tanlang 👇`,
      Markup.keyboard([['🧾 Ro‘yxatdan o‘tish', '👤 Mening profilim']])
        .resize()
        .oneTime(),
    );
  }

  // 🧾 Ro‘yxatdan o‘tish
  @Hears('🧾 Ro‘yxatdan o‘tish')
  async startRegister(@Ctx() ctx: MyContext) {
    console.log('🧾 Ro‘yxatdan o‘tish tugmasi bosildi');
    await ctx.reply(
      'Siz kim sifatida ro‘yxatdan o‘tmoqchisiz?',
      Markup.keyboard([['👨‍🏫 Ustoz', '📖 Qori'], ['🔙 Orqaga']])
        .resize()
        .oneTime(),
    );
  }

  // 👨‍🏫 Ustoz ro‘yxatdan o‘tish
  @Hears('👨‍🏫 Ustoz')
  async ustozReg(@Ctx() ctx: MyContext) {
    console.log('👨‍🏫 Ustoz ro‘yxatdan o‘tmoqda');
    ctx.session.role = 'ustoz';
    ctx.session.step = 'ustoz_ism';
    await ctx.reply('To‘liq ismingizni kiriting:');
  }

  // 📖 Qori ro‘yxatdan o‘tish
  @Hears('📖 Qori')
  async qoriReg(@Ctx() ctx: MyContext) {
    console.log('📖 Qori ro‘yxatdan o‘tmoqda');
    ctx.session.role = 'qori';
    ctx.session.step = 'ism';
    await ctx.reply('To‘liq ismingizni kiriting:');
  }

  // 🔙 Orqaga
  @Hears('🔙 Orqaga')
  async backToMenu(@Ctx() ctx: MyContext) {
    console.log('🔙 Orqaga bosildi');
    await this.onStart(ctx);
  }

  // 📱 Matn kiritish jarayoni
  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    const text = (ctx.message as any)?.text;
    console.log('📝 Foydalanuvchi yozdi:', text);
    if (!text) return;

    if (!ctx.session) ctx.session = {};
    console.log('Session holati:', ctx.session);

    // ✅ Ustoz ismi
    if (ctx.session.step === 'ustoz_ism') {
      console.log('➡️ Ustoz ismini kiritmoqda');
      ctx.session.full_name = text;
      ctx.session.step = 'ustoz_phone';
      await ctx.reply(
        'Telefon raqamingizni yuboring',
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Raqamni yuborish')],
          ['🔙 Orqaga'],
        ])
          .resize()
          .oneTime(),
      );
      return;
    }

    // ✅ Qori ismi
    if (ctx.session.step === 'ism') {
      console.log('➡️ Qori ismini kiritmoqda');
      ctx.session.full_name = text;
      ctx.session.step = 'phone';
      await ctx.reply(
        'Telefon raqamingizni yuboring',
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Raqamni yuborish')],
          ['🔙 Orqaga'],
        ])
          .resize()
          .oneTime(),
      );
      return;
    }
  }

  // ☎️ Telefon raqam yuborilganda
  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    const phone = (ctx.message as any)?.contact?.phone_number;
    console.log('☎️ Kontakt qabul qilindi:', phone);
    if (!phone) return;
    const username = ctx.from?.username || 'no_username';

    ctx.session.phone = phone;

    // 🔹 Ustoz ro‘yxatdan o‘tish
    if (ctx.session.role === 'ustoz') {
      console.log('📩 Ustoz ma’lumotlarini saqlayapti');
      const msg = await this.botService.registerUstoz(
        ctx.session.full_name ?? '',
        username,
        phone,
      );
      console.log('✅ registerUstoz natija:', msg);
      await ctx.reply(msg);
      return this.onStart(ctx);
    }

    // 🔹 Qori ro‘yxatdan o‘tish
    if (ctx.session.role === 'qori') {
      console.log('📩 Qori ma’lumotlarini saqlayapti');
      const msg = await this.botService.registerQori(
        ctx.session.full_name ?? '',
        username,
        phone,
      );
      console.log('✅ registerQori natija:', msg);
      await ctx.reply(msg);
      return this.onStart(ctx);
    }
  }

  // 👤 Mening profilim
  @Hears('👤 Mening profilim')
  async myProfile(@Ctx() ctx: MyContext) {
    console.log('👤 Profil so‘rovi:', ctx.from?.username);
    const username = ctx.from?.username || 'no_username';
    const profile = await this.botService.getMyProfile(username);
    console.log('📋 Profil ma’lumotlari:', profile);
    await ctx.reply(profile);

    const isUstoz = profile.includes('Ustoz');
    if (isUstoz) {
      await ctx.reply(
        'Tanlang 👇',
        Markup.keyboard([
          ['🧑‍🎓 Qorilarni baholash', '🏅 Sertifikat taqdim etish'],
          ['🔙 Orqaga'],
        ])
          .resize()
          .oneTime(),
      );
    } else {
      await ctx.reply(
        'Tanlang 👇',
        Markup.keyboard([
          ['📜 Mening sertifikatim', '⭐ Reyting'],
          ['🔙 Orqaga'],
        ])
          .resize()
          .oneTime(),
      );
    }
  }

  // ⭐ Reyting
  @Hears('⭐ Reyting')
  async getReyting(@Ctx() ctx: MyContext) {
    console.log('⭐ Reyting so‘rovi');
    const reyting = await this.botService.getReyting();
    await ctx.reply(`🏆 Umumiy reyting:\n\n${reyting}`);
  }

  // 📜 Mening sertifikatim
  @Hears('📜 Mening sertifikatim')
  async getCertificate(@Ctx() ctx: MyContext) {
    console.log('📜 Sertifikat so‘rovi:', ctx.from?.username);
    const username = ctx.from?.username || 'no_username';
    const result = await this.botService.generateCertificate(username);
    console.log('🧾 Sertifikat natijasi:', result);

    if (typeof result === 'string') {
      await ctx.reply(result);
    } else {
      await ctx.replyWithDocument({
        source: result.path,
        filename: 'sertifikat.pdf',
      });
      await ctx.reply(result.msg);
    }
  }

  // 🧑‍🎓 Qorilarni baholash
  @Hears('🧑‍🎓 Qorilarni baholash')
  async rateQorilar(@Ctx() ctx: MyContext) {
    console.log('🧑‍🎓 Baholash jarayoni boshlandi');
    await ctx.reply('Baholamoqchi bo‘lgan qorini tanlang:');
    const qorilar = await this.botService.getReyting();
    console.log('📋 Qorilar ro‘yxati:', qorilar);
    await ctx.reply(`📋 Qorilar ro‘yxati:\n${qorilar}`);
    await ctx.reply('Baholash uchun: /ball <id> <ball>\nMasalan: /ball 3 90');
  }

  // 🏅 Sertifikat taqdim etish
  @Hears('🏅 Sertifikat taqdim etish')
  async giveCertificates(@Ctx() ctx: MyContext) {
    console.log('🏅 Sertifikat taqdim etish boshlandi');
    await ctx.reply(
      '100 ball to‘plagan qorilarga sertifikat taqdim etilmoqda...',
    );
    await ctx.reply('✅ Sertifikatlar muvaffaqiyatli taqdim etildi.');
  }

  // /ball komandasi
  @Hears(/\/ball (.+)/)
  async onBall(@Ctx() ctx: MyContext) {
    const text = (ctx.message as any).text;
    console.log('⚙️ /ball komandasi keldi:', text);
    const [, qoriId, ball] = text.split(' ');
    const username = ctx.from?.username || 'no_username';

    const msg = await this.botService.addBall(
      username,
      Number(qoriId),
      Number(ball),
    );
    console.log('✅ addBall natija:', msg);
    await ctx.reply(msg);
  }
}
