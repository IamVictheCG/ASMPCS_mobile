import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterChips } from '../../src/components/FilterChips';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { Badge } from '../../src/components/ui/Badge';
import type { BadgeVariant } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardBody } from '../../src/components/ui/Card';
import { Modal } from '../../src/components/ui/Modal';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  CategoryFilter,
  CommodityItem,
  useCommodities,
  useCommodityOrder,
} from '../../src/hooks/useCommodities';
import { CommodityOrder, useOrderHistory } from '../../src/hooks/useOrderHistory';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import { Colors, Fonts, FontSize, Radii, Shadows } from '../../src/theme/tokens';

// ─── Category metadata ────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  food_staples:       '🌾',
  electronics:        '📱',
  building_materials: '🏗️',
  personal_care:      '🧴',
};

const CATEGORY_BG: Record<string, string> = {
  food_staples:       'rgba(26,122,74,0.18)',
  electronics:        'rgba(21,101,168,0.18)',
  building_materials: 'rgba(232,160,32,0.18)',
  personal_care:      'rgba(124,58,237,0.18)',
};

// ─── Filter chip config ───────────────────────────────────────

interface FilterOption {
  label: string;
  value: CategoryFilter | undefined;
}
const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All',                value: undefined               },
  { label: 'Food Staples',       value: 'food_staples'          },
  { label: 'Electronics',        value: 'electronics'           },
  { label: 'Building Materials', value: 'building_materials'    },
  { label: 'Personal Care',      value: 'personal_care'         },
];

function labelToCategory(label: string): CategoryFilter | undefined {
  return FILTER_OPTIONS.find((o) => o.label === label)?.value;
}

// ─── Utility helpers ──────────────────────────────────────────

function fmtMoney(n: number): string {
  return '₦' + n.toLocaleString('en-NG');
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function orderStatusVariant(status: CommodityOrder['status']): BadgeVariant {
  const map: Record<CommodityOrder['status'], BadgeVariant> = {
    pending:    'pending',
    processing: 'repaying',
    ready:      'active',
    collected:  'approved',
    cancelled:  'rejected',
  };
  return map[status];
}

// ─── Skeleton ─────────────────────────────────────────────────

function CommoditiesSkeleton() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Skeleton height={40} borderRadius={Radii.full} style={{ marginBottom: 20 }} />
      <Skeleton height={32} borderRadius={Radii.sm} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={{
              width: '47%',
              backgroundColor: 'rgba(255,255,255,0.07)',
              borderRadius: Radii.md,
              overflow: 'hidden',
            }}
          >
            <Skeleton height={80} borderRadius={0} />
            <View style={{ padding: 12, gap: 8 }}>
              <Skeleton width="80%" height={13} />
              <Skeleton width="55%" height={16} />
              <Skeleton height={32} borderRadius={Radii.sm} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Product card ─────────────────────────────────────────────

interface ProductCardProps {
  item: CommodityItem;
  onOrder: () => void;
}

function ProductCard({ item, onOrder }: ProductCardProps) {
  const isLowStock = item.stockQuantity < 5;

  return (
    <View
      style={[
        {
          width: '47%',
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          borderRadius: Radii.md,
          overflow: 'hidden',
        },
        Shadows.card,
      ]}
    >
      {/* Image or emoji placeholder */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: '100%', height: 80 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            backgroundColor: CATEGORY_BG[item.category] ?? 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            paddingVertical: 18,
          }}
        >
          <Text style={{ fontSize: 34 }}>{CATEGORY_EMOJI[item.category] ?? '📦'}</Text>
        </View>
      )}

      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontFamily: Fonts.sansSemibold,
            fontSize: 13,
            color: Colors.white,
            marginBottom: 3,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.monoMedium,
            fontSize: 16,
            color: Colors.mint,
            marginBottom: 8,
          }}
        >
          {fmtMoney(item.price)}
        </Text>

        {/* Stock indicator */}
        <Text
          style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.xs,
            color: isLowStock ? Colors.gold : Colors.green2,
            marginBottom: 10,
          }}
        >
          {isLowStock ? `⚠ Only ${item.stockQuantity} left` : '✓ In Stock'}
        </Text>

        <TouchableOpacity
          onPress={onOrder}
          activeOpacity={0.75}
          style={{
            backgroundColor: 'rgba(0,198,216,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(0,198,216,0.30)',
            borderRadius: Radii.sm,
            paddingVertical: 10,
            alignItems: 'center',
            minHeight: 40,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ fontFamily: Fonts.sansSemibold, fontSize: 12, color: Colors.mint }}
          >
            Order Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Order modal ──────────────────────────────────────────────

interface OrderModalProps {
  item: CommodityItem | null;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  isOrdering: boolean;
  orderError: string | null;
}

function OrderModal({
  item,
  quantity,
  onQuantityChange,
  onClose,
  onConfirm,
  isOrdering,
  orderError,
}: OrderModalProps) {
  if (!item) return null;
  const maxQty = Math.min(10, item.stockQuantity);
  const total = item.price * quantity;

  return (
    <Modal visible title="Place Order" onClose={onClose}>
      <View style={{ gap: 16 }}>
        {/* Product summary row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: Radii.sm,
            padding: 14,
          }}
        >
          <View
            style={{
              backgroundColor: CATEGORY_BG[item.category] ?? 'rgba(255,255,255,0.08)',
              borderRadius: Radii.sm,
              width: 56,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 56, height: 56, borderRadius: Radii.sm }}
                contentFit="cover"
              />
            ) : (
              <Text style={{ fontSize: 26 }}>
                {CATEGORY_EMOJI[item.category] ?? '📦'}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.sansSemibold,
                fontSize: FontSize.md,
                color: Colors.white,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.mono,
                fontSize: 15,
                color: Colors.mint,
                marginTop: 2,
              }}
            >
              {fmtMoney(item.price)} / unit
            </Text>
            {item.description ? (
              <Text
                style={{
                  fontFamily: Fonts.sans,
                  fontSize: FontSize.xs,
                  color: Colors.muted,
                  marginTop: 4,
                  lineHeight: 16,
                }}
                numberOfLines={3}
              >
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Quantity selector */}
        <View>
          <Text
            style={{
              fontFamily: Fonts.sansSemibold,
              fontSize: FontSize.xs,
              color: Colors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              marginBottom: 12,
            }}
          >
            Quantity (max {maxQty})
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
              style={{
                width: 44,
                height: 44,
                borderRadius: Radii.sm,
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: Colors.white, fontSize: 22 }}>−</Text>
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: Fonts.monoMedium,
                fontSize: 26,
                color: Colors.white,
                minWidth: 40,
                textAlign: 'center',
              }}
            >
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
              style={{
                width: 44,
                height: 44,
                borderRadius: Radii.sm,
                backgroundColor: quantity >= maxQty
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,198,216,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: quantity >= maxQty ? Colors.muted : Colors.mint,
                  fontSize: 22,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error message */}
        {orderError ? (
          <View
            style={{
              backgroundColor: 'rgba(192,57,43,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(192,57,43,0.25)',
              borderRadius: Radii.sm,
              padding: 12,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.sm,
                color: Colors.red2,
              }}
            >
              ✕ {orderError}
            </Text>
          </View>
        ) : null}

        {/* Total + confirm */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
            paddingTop: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.xs,
                color: Colors.muted,
              }}
            >
              Order Total
            </Text>
            <Text
              style={{
                fontFamily: Fonts.monoMedium,
                fontSize: 22,
                color: Colors.mint,
              }}
            >
              {fmtMoney(total)}
            </Text>
          </View>
          <Button
            variant="primary"
            label={isOrdering ? 'Placing Order…' : 'Place Order →'}
            disabled={isOrdering}
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Order history tab ────────────────────────────────────────

function OrderHistoryTab() {
  const query = useOrderHistory();

  if (query.isLoading) {
    return (
      <View style={{ gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={72} borderRadius={Radii.md} />
        ))}
      </View>
    );
  }

  if (query.isError) {
    return (
      <ScreenError
        message="Could not load order history."
        onRetry={() => query.refetch()}
      />
    );
  }

  const orders = query.data ?? [];

  if (orders.length === 0) {
    return (
      <Card>
        <CardBody>
          <View style={{ alignItems: 'center', paddingVertical: 32, gap: 10 }}>
            <Text style={{ fontSize: 36 }}>📦</Text>
            <Text
              style={{
                fontFamily: Fonts.playfairSemibold,
                fontSize: FontSize.xl,
                color: Colors.white,
                textAlign: 'center',
              }}
            >
              No Orders Yet
            </Text>
            <Text
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.base,
                color: Colors.muted,
                textAlign: 'center',
              }}
            >
              Items you order from the shop will appear here for tracking.
            </Text>
          </View>
        </CardBody>
      </Card>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardBody>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    fontFamily: Fonts.sansSemibold,
                    fontSize: FontSize.md,
                    color: Colors.white,
                  }}
                  numberOfLines={1}
                >
                  {order.commodityName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.mono,
                      fontSize: FontSize.base,
                      color: Colors.mint,
                    }}
                  >
                    {fmtMoney(order.totalAmount)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.sans,
                      fontSize: FontSize.xs,
                      color: Colors.muted,
                    }}
                  >
                    × {order.quantity} unit{order.quantity > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.mono,
                    fontSize: FontSize.xs,
                    color: Colors.muted,
                  }}
                >
                  {fmtDate(order.orderedAt)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Badge
                  variant={orderStatusVariant(order.status)}
                  label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                />
                <Text
                  style={{
                    fontFamily: Fonts.mono,
                    fontSize: FontSize.xs,
                    color: 'rgba(255,255,255,0.25)',
                  }}
                >
                  {order.id.slice(-8).toUpperCase()}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>
      ))}
    </View>
  );
}

// ─── Screen tab toggle ────────────────────────────────────────

type ScreenTab = 'shop' | 'orders';

function ScreenTabBar({
  active,
  onChange,
}: {
  active: ScreenTab;
  onChange: (t: ScreenTab) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: Radii.sm,
        padding: 3,
        marginBottom: 20,
      }}
    >
      {(['shop', 'orders'] as const).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          style={{
            flex: 1,
            paddingVertical: 9,
            alignItems: 'center',
            borderRadius: Radii.sm - 2,
            backgroundColor:
              active === t ? 'rgba(0,198,216,0.18)' : 'transparent',
          }}
          activeOpacity={0.75}
        >
          <Text
            style={{
              fontFamily: Fonts.sansSemibold,
              fontSize: FontSize.sm,
              color: active === t ? Colors.white : Colors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            {t === 'shop' ? 'Shop' : 'My Orders'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────

export default function MemberCommodities() {
  const [screenTab, setScreenTab] = useState<ScreenTab>('shop');
  const [filterLabel, setFilterLabel] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<CommodityItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const category = labelToCategory(filterLabel);
  const commoditiesQuery = useCommodities(category);
  const orderMutation = useCommodityOrder();

  const isLoading = commoditiesQuery.isLoading;
  const isError = commoditiesQuery.isError;

  async function onRefresh() {
    setRefreshing(true);
    await commoditiesQuery.refetch();
    setRefreshing(false);
  }

  function openModal(item: CommodityItem) {
    setSelectedItem(item);
    setQuantity(1);
    orderMutation.reset();
  }

  function closeModal() {
    setSelectedItem(null);
    setQuantity(1);
    orderMutation.reset();
  }

  function handleOrder() {
    if (!selectedItem || orderMutation.isPending) return;
    orderMutation.mutate(
      {
        commodityId:   selectedItem.id,
        commodityName: selectedItem.name,
        quantity,
        unitPrice:     selectedItem.price,
      },
      {
        onSuccess: () => {
          const name = selectedItem.name;
          const qty = quantity;
          closeModal();
          toast.show(`${name} × ${qty} ordered successfully!`);
        },
      }
    );
  }

  const items = commoditiesQuery.data ?? [];
  const chipOptions = FILTER_OPTIONS.map((o) => o.label);

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar
        title="Commodities"
        onNotifPress={() => router.push('/(member)/notifications' as any)}
      />

      {isLoading ? (
        <CommoditiesSkeleton />
      ) : isError ? (
        <ScreenError onRetry={() => commoditiesQuery.refetch()} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.mint}
            />
          }
        >
          {/* Screen tab toggle */}
          <ScreenTabBar active={screenTab} onChange={setScreenTab} />

          {screenTab === 'shop' ? (
            <>
              {/* Category filter chips */}
              <FilterChips
                options={chipOptions}
                value={filterLabel}
                onChange={(v) => setFilterLabel(v)}
              />

              <SectionTitle style={{ marginBottom: 14 }}>
                {filterLabel === 'All'
                  ? `All Available Items${items.length > 0 ? ` (${items.length})` : ''}`
                  : `${filterLabel}${items.length > 0 ? ` (${items.length})` : ''}`}
              </SectionTitle>

              {/* Refetch loading overlay */}
              {commoditiesQuery.isFetching && !refreshing && (
                <Text
                  style={{
                    fontFamily: Fonts.sans,
                    fontSize: FontSize.xs,
                    color: Colors.muted,
                    marginBottom: 10,
                  }}
                >
                  Updating…
                </Text>
              )}

              {items.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {items.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onOrder={() => openModal(item)}
                    />
                  ))}
                </View>
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: 40,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 40 }}>🔍</Text>
                  <Text
                    style={{
                      fontFamily: Fonts.sansMedium,
                      fontSize: FontSize.lg,
                      color: Colors.white,
                    }}
                  >
                    No items available
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.sans,
                      fontSize: FontSize.base,
                      color: Colors.muted,
                      textAlign: 'center',
                    }}
                  >
                    {filterLabel === 'All'
                      ? 'No items in stock at the moment. Check back soon.'
                      : `No ${filterLabel.toLowerCase()} items in stock. Try another category.`}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <SectionTitle style={{ marginBottom: 14 }}>My Orders</SectionTitle>
              <OrderHistoryTab />
            </>
          )}
        </ScrollView>
      )}

      {/* Order confirmation modal */}
      <OrderModal
        item={selectedItem}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onClose={closeModal}
        onConfirm={handleOrder}
        isOrdering={orderMutation.isPending}
        orderError={orderMutation.error?.message ?? null}
      />

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}
