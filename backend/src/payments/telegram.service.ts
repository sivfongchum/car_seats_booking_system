import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BookingNotificationPayload {
  bookingNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  origin?: string;
  destination?: string;
  departureDate?: string | Date;
  vehiclePlate?: string;
  seatNumbers?: string[];
  amount: number | string;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  paidAt?: Date;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) { }

  get botToken(): string {
    return this.configService.get<string>(
      'TELEGRAM_BOT_TOKEN',
      '8678316329:AAGLmlJyS4ihUXaPp5y-3RfpmwROGryfSnE',
    );
  }

  get chatId(): string {
    return this.configService.get<string>('TELEGRAM_CHAT_ID', '8649285498');
  }

  async sendMessage(htmlMessage: string, customChatId?: string): Promise<boolean> {
    const targetChatId = customChatId || this.chatId;
    if (!targetChatId || !this.botToken) {
      this.logger.warn('Telegram botToken or chatId is not configured');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: htmlMessage,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        this.logger.error(`Telegram API error: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log(`Telegram notification sent successfully to chat_id: ${targetChatId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
      return false;
    }
  }

  async sendPaymentSuccessNotification(payload: BookingNotificationPayload): Promise<boolean> {
    const formattedAmount = `${Number(payload.amount).toFixed(2)} ${payload.currency || 'USD'}`;
    const seatsList = payload.seatNumbers?.length ? payload.seatNumbers.join(', ') : 'N/A';
    const departureStr = payload.departureDate
      ? new Date(payload.departureDate).toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' })
      : 'N/A';
    const paidAtStr = new Date(payload.paidAt || Date.now()).toLocaleString('km-KH', {
      timeZone: 'Asia/Phnom_Penh',
    });

    const message = `
🎉 <b>ការទូទាត់ប្រាក់ជោគជ័យ / Payment Successful!</b>
━━━━━━━━━━━━━━━━━━━━━━
🎫 <b>លេខកូដកក់ (Booking Ref):</b> <code>${payload.bookingNumber}</code>
👤 <b>អតិថិជន (Customer):</b> ${payload.customerName || 'N/A'}
📞 <b>ទូរស័ព្ទ / Email:</b> ${payload.customerPhone || payload.customerEmail || 'N/A'}

🚌 <b>ខ្សែរត់ (Route):</b> <b>${payload.origin || 'N/A'} ➡️ ${payload.destination || 'N/A'}</b>
⏰ <b>ម៉ោងចេញដំណើរ:</b> ${departureStr}
💺 <b>កៅអី (Seats):</b> <b>${seatsList}</b>
🚐 <b>ស្លាកលេខរថយន្ត:</b> ${payload.vehiclePlate || 'N/A'}

💵 <b>ទឹកប្រាក់សរុប:</b> <b>${formattedAmount}</b>
💳 <b>វិធីទូទាត់:</b> ${payload.paymentMethod}
🧾 <b>លេខប្រតិបត្តិការ:</b> <code>${payload.transactionReference}</code>
🕒 <b>កាលបរិច្ឆេទបង់:</b> ${paidAtStr}
✅ <b>ស្ថានភាព:</b> <b>CONFIRMED (បានបញ្ជាក់)</b>
━━━━━━━━━━━━━━━━━━━━━━
<i>ប្រព័ន្ធកក់សំបុត្ររថយន្ត Online Car Seat Booking System</i>
`.trim();

    return this.sendMessage(message);
  }
}
