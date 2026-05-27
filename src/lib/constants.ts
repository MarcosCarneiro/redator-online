/**
 * Array of plan IDs that are considered public and visible on the Pricing page.
 * The order of items in this array dictates their display order on the frontend (left to right).
 */
export const PUBLIC_PLANS = ['pro_2', 'pro_4', 'pro_8'] as const;

export type PublicPlanId = typeof PUBLIC_PLANS[number];
