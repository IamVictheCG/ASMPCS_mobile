import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenError } from '../../src/components/ScreenError';
import { Toast, useToast } from '../../src/components/Toast';
import { FilterChips } from '../../src/components/FilterChips';
import { FormInput } from '../../src/components/FormInput';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SectionTitle } from '../../src/components/ui/SectionTitle';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { placeOrder } from '../../src/api';
import { useCommodities } from '../../src/hooks/useCommodities';
import { AppTopbar } from '../../src/navigation/AppTopbar';
import type { Commodity } from '../../src/types';
import { Colors, Fonts, FontSize, Radii, Shadows } from '../../src/theme/tokens';

function stockColor(level: Commodity['stockLevel']) {
  if (level === 'high') return Colors.green2;
  if (level === 'med')  return Colors.gold;
  return Colors.red2;
}

function stockVariant(level: Commodity['stockLevel']): 'teal' | 'gold' | 'red' {
  if (level === 'high') return 'teal';
  if (level === 'med')  return 'gold';
  return 'red';
}

function CommoditiesSkeleton() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Skeleton height={36} borderRadius={20} style={{ marginBottom: 16 }} />
      <Skeleton width={140} height={18} style={{ marginBottom: 14 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: Radii.md, overflow: 'hidden' }}>
            <Skeleton height={80} borderRadius={0} />
            <View style={{ padding: 12, gap: 8 }}>
              <Skeleton width="80%" height={14} />
              <Skeleton width="60%" height={16} />
              <Skeleton height={5} borderRadius={3} />
              <Skeleton height={32} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
      <Skeleton width={160} height={18} style={{ marginBottom: 14 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} style={{ width: '47%' }} height={80} borderRadius={Radii.md} />
        ))}
      </View>
    </ScrollView>
  );
}

export default function MemberCommodities() {
  const { list: listQuery, filters: filtersQuery, summary: summaryQuery } = useCommodities();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Commodity | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const isLoading = listQuery.isLoading || filtersQuery.isLoading || summaryQuery.isLoading;
  const isError = listQuery.isError || filtersQuery.isError || summaryQuery.isError;

  const handleRetry = () => {
    if (listQuery.isError) listQuery.refetch();
    if (filtersQuery.isError) filtersQuery.refetch();
    if (summaryQuery.isError) summaryQuery.refetch();
  };

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([listQuery.refetch(), filtersQuery.refetch(), summaryQuery.refetch()]);
    setRefreshing(false);
  }

  async function handleOrder() {
    if (!selectedItem || isOrdering) return;
    setIsOrdering(true);
    try {
      await placeOrder(selectedItem.name, quantity);
      setSelectedItem(null);
      setQuantity(1);
      toast.show(`${selectedItem.name} × ${quantity} ordered successfully!`);
    } finally {
      setIsOrdering(false);
    }
  }

  const filters = filtersQuery.data ?? [];
  const currentFilter = activeFilter ?? filters[0] ?? 'All Items';
  const allCommodities = listQuery.data ?? [];

  const displayed = currentFilter === 'All Items' || currentFilter === 'My Orders'
    ? (currentFilter === 'My Orders' ? [] : allCommodities)
    : allCommodities.filter((c) => c.category === currentFilter);

  const sum = summaryQuery.data;
  const orderTotal = selectedItem ? parsePriceNum(selectedItem.price) * quantity : 0;

  function parsePriceNum(p: string) {
    return Number(p.replace(/[₦,]/g, '')) || 0;
  }

  function fmtPrice(n: number) {
    return '₦' + n.toLocaleString('en-NG');
  }

  return (
    <View style={{ flex: 1 }}>
      <AppTopbar title="Commodities" onNotifPress={() => router.push('/(member)/notifications' as any)} />
      {isLoading ? (
        <CommoditiesSkeleton />
      ) : isError ? (
        <ScreenError onRetry={handleRetry} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mint} />}
        >
          <FilterChips
            options={filters}
            value={currentFilter}
            onChange={(v) => setActiveFilter(v)}
          />

          <SectionTitle>{`${currentFilter === 'All Items' ? 'All Available Items' : currentFilter}${displayed.length > 0 ? ` (${displayed.length})` : ''}`}</SectionTitle>

          {displayed.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {displayed.map((item) => (
                <View
                  key={item.name}
                  style={[
                    { width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.md, overflow: 'hidden' },
                    Shadows.card,
                  ]}
                >
                  <View style={{ backgroundColor: item.bg, alignItems: 'center', paddingVertical: 22 }}>
                    <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white, marginBottom: 3 }}>{item.name}</Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: 16, color: Colors.mint, fontWeight: '700', marginBottom: 10 }}>{item.price}</Text>
                    <View style={{ marginBottom: 5 }}>
                      <ProgressBar percent={item.stockPct} height={4} variant={stockVariant(item.stockLevel)} />
                    </View>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: stockColor(item.stockLevel), marginBottom: 12 }}>
                      {item.stock}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => { setSelectedItem(item); setQuantity(1); }}
                      style={{ backgroundColor: 'rgba(0,198,216,0.15)', borderWidth: 1, borderColor: 'rgba(0,198,216,0.30)', borderRadius: Radii.sm, paddingVertical: 10, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
                    >
                      <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 13, color: Colors.mint }}>Order Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10, marginBottom: 24 }}>
              <Text style={{ fontSize: 40 }}>
                {currentFilter === 'My Orders' ? '📦' : '🔍'}
              </Text>
              <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 16, color: Colors.white }}>
                {currentFilter === 'My Orders' ? 'No orders placed yet' : `No items in "${currentFilter}"`}
              </Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 14, color: Colors.muted, textAlign: 'center' }}>
                {currentFilter === 'My Orders'
                  ? 'Items you order will appear here for tracking.'
                  : 'Check back soon — new stock arrives regularly.'}
              </Text>
            </View>
          )}

          <SectionTitle>Your Order Summary</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              { label: 'Commodity Credit Limit', val: sum?.creditLimit     ?? '₦100,000', color: Colors.mint   },
              { label: 'Credit Used (Q2 2026)',  val: sum?.creditUsed      ?? '₦42,000',  color: Colors.gold   },
              { label: 'Available Credit',        val: sum?.availableCredit ?? '₦58,000',  color: Colors.green2 },
              { label: 'Pending Orders',          val: String(sum?.pendingOrders ?? 0),    color: Colors.white  },
            ].map((item) => (
              <View
                key={item.label}
                style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: Radii.md, padding: 16 }}
              >
                <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginBottom: 5 }}>{item.label}</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: 18, color: item.color, fontWeight: '700' }}>{item.val}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Order confirmation modal */}
      <Modal
        visible={selectedItem !== null}
        onClose={() => { setSelectedItem(null); setQuantity(1); }}
        title="Place Order"
      >
        {selectedItem && (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radii.sm, padding: 14 }}>
              <View style={{ backgroundColor: selectedItem.bg, borderRadius: 10, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{selectedItem.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: 14, color: Colors.white }}>{selectedItem.name}</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: 16, color: Colors.mint, marginTop: 2 }}>{selectedItem.price}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: stockColor(selectedItem.stockLevel), marginTop: 2 }}>
                  {selectedItem.stock}
                </Text>
              </View>
            </View>

            <View>
              <Text style={{ fontFamily: Fonts.sansSemibold, fontSize: FontSize.xs, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>
                Quantity
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: Colors.white, fontSize: 20 }}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: Fonts.mono, fontSize: 24, color: Colors.white, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: Colors.mint, fontSize: 20 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 14 }}>
              <View>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.xs, color: Colors.muted }}>Order Total</Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: 22, color: Colors.mint, fontWeight: '700' }}>
                  {fmtPrice(orderTotal)}
                </Text>
              </View>
              <Button
                variant="primary"
                label={isOrdering ? 'Confirming…' : 'Confirm Order →'}
                disabled={isOrdering}
                onPress={handleOrder}
              />
            </View>
          </View>
        )}
      </Modal>

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}
