import { Ctx, Hears, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { BOT_NAME } from '../app.constants';

interface SessionData {
  step?: 'ism' | 'phone';
  full_name?: string;
  phone?: string;
}

interface MyContext extends Context {
  session?: SessionData;
}

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<MyContext>,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    await ctx.reply(
      `👋 Assalomu alaykum, ${ctx.from?.first_name || 'do‘st'}!\n\n` +
        `Bu bot orqali siz "Qorilar" jamoasiga a'zo bo‘lishingiz mumkin.\n\n` +
        `➡️ A'zo bo‘lish uchun: /azobolish`,
    );
  }

  @Hears('/azobolish')
  async azobolish(@Ctx() ctx: MyContext) {
    ctx.session = { step: 'ism' };
    await ctx.reply('Ismingizni to‘liq kiriting:');
  }

  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    const text = (ctx.message as any)?.text;
    if (!text) return;

    if (!ctx.session) ctx.session = {};

    if (ctx.session.step === 'ism') {
      ctx.session.full_name = text;
      ctx.session.step = 'phone';
      await ctx.reply(
        '📞 Telefon raqamingizni yuboring (masalan: +998901234567)',
      );
      return;
    }

    if (ctx.session.step === 'phone') {
      ctx.session.phone = text;
      const user = ctx.from;

      const msg = await this.botService.addQori(
        ctx.session.full_name ?? '',
        user?.username || 'no_username',
        ctx.session.phone ?? '',
      );

      await ctx.reply(msg);
      ctx.session = {};
    }
  }

  @Hears('/qorilar')
  async getQorilar(@Ctx() ctx: MyContext) {
    const qorilar = await this.botService.getAllQorilar();
    await ctx.reply(qorilar);
  }
}
