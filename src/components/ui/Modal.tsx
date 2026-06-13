import React from 'react';
import { Modal as RNModal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, FontSize, Radii, Shadows, Surfaces } from '../../theme/tokens';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ visible, onClose, title, children, wide }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay — backdrop-filter blur not available in RN; dark overlay approximates the intent */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: Surfaces.overlayBg, alignItems: 'center', justifyContent: 'center' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: Surfaces.modalBg,
              borderWidth: 1,
              borderColor: 'rgba(0,198,216,0.20)',
              borderRadius: Radii.xl,
              padding: 32,
              width: wide ? 560 : 460,
              maxWidth: '95%',
              ...Shadows.loginCard,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: Fonts.playfair, fontSize: FontSize['2xl'], color: Colors.white }}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: Colors.white, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
