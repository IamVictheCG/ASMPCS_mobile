import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const isSmallScreen = width < 380;
export const DRAWER_WIDTH = Math.min(width * 0.78, 300);

export function wp(percentage: number): number {
  return (width * percentage) / 100;
}

export function hp(percentage: number): number {
  return (height * percentage) / 100;
}
