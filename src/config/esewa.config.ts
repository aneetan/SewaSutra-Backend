export const esewaConfig = {
  paymentUrl: process.env.ESEWA_PAYMENT_URL!,
  merchantCode: process.env.ESEWA_MERCHANT_CODE!,
  secretKey: process.env.ESEWA_SECRET_KEY!,
  successUrl: process.env.ESEWA_SUCCESS_URL!,
  failureUrl: process.env.ESEWA_FAILED_URL!,
  verifyUrl: process.env.ESEWA_VERIFY_URL!,
  statusCheckUrl: process.env.ESEWA_STATUS_CHECK_URL!
};
