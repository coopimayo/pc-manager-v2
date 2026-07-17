export interface RechargeRule {
  on: 'short-rest' | 'long-rest' | 'turn';
  amount: number | 'all';
}
