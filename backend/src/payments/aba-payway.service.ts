import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { BakongKHQR, khqrData } from 'bakong-khqr';

export interface AbaPaywayCheckoutData {
  req_time: string;
  merchant_id: string;
  tran_id: string;
  amount: string;
  currency: string;
  items: string;
  hash: string;
  payment_url: string;
  abapay_deeplink?: string;
  qrString?: string;
  qrImage?: string; // data:image/png;base64,...
}

@Injectable()
export class AbaPaywayService {
  private readonly logger = new Logger(AbaPaywayService.name);
  private readonly khqr = new BakongKHQR();

  constructor(private readonly configService: ConfigService) {}

  get merchantId(): string {
    return this.configService.get<string>('ABA_PAYWAY_MERCHANT_ID', 'ec478763');
  }

  get apiKey(): string {
    return this.configService.get<string>('ABA_PAYWAY_API_KEY', 'BED308D1E64D1BFEC894D99E542C3D91418541A8');
  }

  get apiUrl(): string {
    return this.configService.get<string>(
      'ABA_PAYWAY_API_URL',
      'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase',
    );
  }

  generateHash(rawString: string): string {
    return crypto
      .createHmac('sha512', this.apiKey)
      .update(rawString)
      .digest('base64');
  }

  async createCheckoutPayload(
    tranId: string,
    amount: number,
    currency: string,
    itemsList: Array<{ name: string; quantity: number; price: number }>,
    returnUrl?: string,
  ): Promise<AbaPaywayCheckoutData> {
    const now = new Date();
    const req_time = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

    const formattedAmount = Number(amount).toFixed(2);
    const itemsJson = JSON.stringify(itemsList);
    const itemsBase64 = Buffer.from(itemsJson).toString('base64');

    const rawToHash = `${req_time}${this.merchantId}${tranId}${formattedAmount}${itemsBase64}${returnUrl || ''}`;
    const hash = this.generateHash(rawToHash);

    const deeplink = `abamobilebank://payway?tran_id=${tranId}&amount=${formattedAmount}&currency=${currency.toUpperCase()}`;

    // បង្កើតទម្រង់ KHQR ស្តង់ដារជាតិ (NBC Bakong EMVCo) ដើម្បីឱ្យ App ABA Mobile ស្កេនស្គាល់
    const bakongAccountId = this.configService.get<string>('ABA_BAKONG_ACCOUNT_ID', 'sivfong@aba');
    const merchantName = this.configService.get<string>('ABA_MERCHANT_NAME', 'Car Seat Booking');
    const merchantCity = this.configService.get<string>('ABA_MERCHANT_CITY', 'Phnom Penh');

    let khqrString = '';
    try {
      const khqrRes = this.khqr.generateIndividual({
        bakongAccountID: bakongAccountId,
        merchantName: merchantName,
        merchantCity: merchantCity,
        currency: currency.toUpperCase() === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd,
        amount: Number(amount),
        billNumber: tranId,
        expirationTimestamp: Date.now() + 10 * 60 * 1000,
      });

      if (khqrRes.status.code === 0 && khqrRes.data?.qr) {
        khqrString = khqrRes.data.qr;
      }
    } catch (err) {
      this.logger.warn('Failed to generate Bakong KHQR, falling back to deeplink', err);
    }

    const qrDataToRender = khqrString || deeplink;

    // បង្កើតរូបភាព QR Code ជា Base64 Data URL ពណ៌ខៀវ ABA
    let qrImage = '';
    try {
      qrImage = await QRCode.toDataURL(qrDataToRender, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#002b49', // ABA Navy Blue Color
          light: '#ffffff',
        },
      });
    } catch (err) {
      this.logger.error('Failed to generate QR Code image', err);
    }

    return {
      req_time,
      merchant_id: this.merchantId,
      tran_id: tranId,
      amount: formattedAmount,
      currency: currency.toUpperCase(),
      items: itemsBase64,
      hash,
      payment_url: this.apiUrl,
      abapay_deeplink: deeplink,
      qrString: qrDataToRender,
      qrImage,
    };
  }

  verifyWebhookHash(reqTime: string, tranId: string, amount: string, receivedHash: string): boolean {
    const rawToHash = `${reqTime}${this.merchantId}${tranId}${amount}`;
    const calculatedHash = this.generateHash(rawToHash);
    return calculatedHash === receivedHash;
  }
}
