import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { OrderWithCommodity } from '../types/database';

export interface CommodityOrder {
  id: string;
  commodityId: string;
  commodityName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'ready' | 'collected' | 'cancelled';
  orderedAt: string;
}

async function fetchOrderHistory(memberId: string): Promise<CommodityOrder[]> {
  const { data, error } = await supabase
    .from('commodity_orders')
    .select(`
      id, commodity_id, quantity, unit_price, total_amount, status, ordered_at,
      commodities ( name )
    `)
    .eq('member_id', memberId)
    .order('ordered_at', { ascending: false })
    .limit(30)
    .returns<OrderWithCommodity[]>();

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    commodityId: r.commodity_id,
    commodityName: r.commodities?.name ?? 'Unknown Item',
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    totalAmount: Number(r.total_amount),
    status: r.status,
    orderedAt: r.ordered_at,
  }));
}

export function useOrderHistory() {
  const { member } = useAuth();
  return useQuery<CommodityOrder[]>({
    queryKey: ['member', 'orders', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchOrderHistory(member.id);
    },
    enabled: !!member?.id,
  });
}
