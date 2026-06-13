import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAvailability {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { isAvailable: false, isEnrolled: false, biometricType: 'none' };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let biometricType: BiometricAvailability['biometricType'] = 'none';
  if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    biometricType = 'facial';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    biometricType = 'fingerprint';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    biometricType = 'iris';
  }

  return { isAvailable: hasHardware, isEnrolled, biometricType };
}

export async function authenticateWithBiometric(
  promptMessage = 'Confirm your identity to sign in'
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
