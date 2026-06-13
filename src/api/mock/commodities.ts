import { COMMODITIES, COMMODITY_FILTERS } from '../../data/member';
import type { ApiListResponse, ApiResponse, Commodity, CommoditySummary } from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getCommodities(): Promise<ApiListResponse<Commodity>> {
  await delay();
  return { data: COMMODITIES, meta: { total: COMMODITIES.length, page: 1, perPage: 20 } };
}

export async function getCommodityFilters(): Promise<ApiListResponse<string>> {
  await delay();
  return { data: COMMODITY_FILTERS, meta: { total: COMMODITY_FILTERS.length, page: 1, perPage: 20 } };
}

export async function placeOrder(itemName: string, quantity: number): Promise<ApiResponse<{ orderId: string }>> {
  await delay();
  const id = `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { data: { orderId: id } };
}

export async function getCommoditySummary(): Promise<ApiResponse<CommoditySummary>> {
  await delay();
  return {
    data: {
      creditLimit: '₦100,000',
      creditUsed: '₦42,000',
      availableCredit: '₦58,000',
      pendingOrders: 0,
    },
  };
}
