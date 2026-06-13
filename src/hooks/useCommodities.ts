import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { CommodityRow } from '../types/database';

export type CategoryFilter =
  | 'food_staples'
  | 'electronics'
  | 'building_materials'
  | 'personal_care';

export interface CommodityItem {
  id: string;
  name: string;
  category: CategoryFilter;
  description: string | null;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
}

export interface OrderPayload {
  commodityId: string;
  commodityName: string;
  quantity: number;
  unitPrice: number;
}

type CommoditySelectRow = Pick<
  CommodityRow,
  'id' | 'name' | 'category' | 'description' | 'price' | 'stock_quantity' | 'image_url'
>;

async function fetchCommodities(category?: CategoryFilter): Promise<CommodityItem[]> {
  let q = supabase
    .from('commodities')
    .select('id, name, category, description, price, stock_quantity, image_url')
    .eq('is_available', true)
    .gt('stock_quantity', 0)
    .order('name');

  if (category) {
    q = q.eq('category', category) as typeof q;
  }

  const { data, error } = await q.returns<CommoditySelectRow[]>();
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category as CategoryFilter,
    description: r.description ?? null,
    price: Number(r.price),
    stockQuantity: Number(r.stock_quantity),
    imageUrl: r.image_url ?? null,
  }));
}

export function useCommodities(category?: CategoryFilter) {
  return useQuery<CommodityItem[]>({
    queryKey: ['commodities', category ?? 'all'],
    queryFn: () => fetchCommodities(category),
  });
}

export function useCommodityOrder() {
  const { member } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<string, Error, OrderPayload>({
    mutationFn: async ({ commodityId, commodityName, quantity, unitPrice }) => {
      if (!member?.id) throw new Error('Not authenticated');

      // Atomic: inserts order + decrements stock in one PG transaction
      const { data: orderId, error: rpcErr } = await supabase.rpc(
        'place_commodity_order',
        {
          p_member_id:    member.id,
          p_commodity_id: commodityId,
          p_quantity:     quantity,
          p_unit_price:   unitPrice,
        }
      );

      if (rpcErr) throw new Error(rpcErr.message);

      // Confirmation notification — non-fatal if it fails
      await supabase.from('notifications').insert({
        member_id: member.id,
        type:      'order_placed',
        title:     'Order Confirmed',
        message:   `Your order for ${commodityName} × ${quantity} has been placed and is being processed.`,
      });

      return orderId as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commodities'] });
      queryClient.invalidateQueries({ queryKey: ['member', 'orders'] });
    },
  });
}
