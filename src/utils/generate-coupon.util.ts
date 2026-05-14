const COUPON_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCouponCode(length = 8): string {
  return Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * COUPON_ALPHABET.length);
    return COUPON_ALPHABET[randomIndex];
  }).join('');
}
