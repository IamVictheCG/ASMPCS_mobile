import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, FontSize, Surfaces } from '../theme/tokens';

export interface Column {
  key: string;
  label: string;
  flex?: number;
  mono?: boolean;       // render cell in DM Mono
  color?: string;       // static cell color override
  renderCell?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  onRowPress?: (row: Record<string, any>) => void;
}

export function DataTable({ columns, data, onRowPress }: DataTableProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: '100%' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
            backgroundColor: Surfaces.cardBg2,
          }}
        >
          {columns.map((col) => (
            <View key={col.key} style={{ flex: col.flex ?? 1, paddingHorizontal: 14, paddingVertical: 11 }}>
              <Text
                style={{
                  fontFamily: Fonts.sansSemibold,
                  fontSize: FontSize.xs,
                  color: Colors.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.7,
                }}
              >
                {col.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.map((row, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onRowPress?.(row)}
            activeOpacity={onRowPress ? 0.7 : 1}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.04)',
            }}
          >
            {columns.map((col) => (
              <View key={col.key} style={{ flex: col.flex ?? 1, paddingHorizontal: 14, paddingVertical: 13, justifyContent: 'center' }}>
                {col.renderCell ? (
                  col.renderCell(row[col.key], row)
                ) : (
                  <Text
                    style={{
                      fontFamily: col.mono ? Fonts.mono : Fonts.sans,
                      fontSize: FontSize.base,
                      color: col.color ?? Colors.white,
                    }}
                    numberOfLines={1}
                  >
                    {String(row[col.key] ?? '—')}
                  </Text>
                )}
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Pagination bar ───────────────────────────────────────────
interface PaginationProps {
  info: string;
  pages: number[];
  current: number;
  onPage?: (p: number) => void;
  portal?: 'member' | 'admin';
}

export function Pagination({ info, pages, current, onPage, portal = 'member' }: PaginationProps) {
  const activeColor = portal === 'admin' ? Colors.red2 : Colors.mint;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
      <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.sm, color: Colors.muted }}>{info}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {pages.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => onPage?.(p)}
            style={{
              width: 32, height: 32, borderRadius: 6,
              backgroundColor: p === current ? `${activeColor}33` : 'transparent',
              borderWidth: 1,
              borderColor: p === current ? activeColor : 'rgba(255,255,255,0.10)',
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: p === current ? Colors.white : Colors.muted, fontSize: FontSize.base, fontFamily: Fonts.sans }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
