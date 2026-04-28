import { MercadoPagoConfig, PreApproval } from 'mercadopago';

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    console.warn('MERCADO_PAGO_ACCESS_TOKEN is not defined');
}

export const mpConfig = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

export const preApproval = new PreApproval(mpConfig);
