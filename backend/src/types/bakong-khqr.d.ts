declare module 'bakong-khqr' {
  export class BakongKHQR {
    generateIndividual(info: any): {
      status: { code: number; errorCode: any; message: any };
      data: { qr: string; md5: string } | null;
    };
    generateMerchant(info: any): {
      status: { code: number; errorCode: any; message: any };
      data: { qr: string; md5: string } | null;
    };
  }

  export const khqrData: {
    currency: {
      usd: string;
      khr: string;
    };
    merchantType: {
      individual: number;
      merchant: number;
    };
  };
}
