import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RegistrationInput {
  staffId: string;
  fullName: string;
  agency: string;
  email: string;
  phone: string;
  password: string;
}

export function useRegistration() {
  const register = useCallback(async (input: RegistrationInput): Promise<void> => {
    const { staffId, fullName, agency, email, phone, password } = input;

    // Step 1 — Verify member record exists and has no account yet
    const { data: verifyResult, error: verifyError } = await supabase.rpc(
      'verify_member_for_registration',
      {
        p_staff_id:  staffId.trim().toUpperCase(),
        p_full_name: fullName.trim(),
        p_agency:    agency,
      }
    );

    if (verifyError) {
      throw new Error('Verification failed. Please try again later.');
    }

    const result = verifyResult as { status: string; member_id?: string };

    if (result.status === 'not_found') {
      throw new Error(
        'We could not find a member record matching your details. ' +
        'Please check your information or contact the cooperative office.'
      );
    }

    if (result.status === 'already_registered') {
      throw new Error(
        'An account already exists for this Staff ID. ' +
        'Please sign in or reset your password.'
      );
    }

    const memberId = result.member_id!;

    // Step 2 — Create Supabase auth account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        throw new Error(
          'This email address is already registered. ' +
          'Please sign in or use a different email.'
        );
      }
      throw new Error(signUpError.message);
    }

    if (!signUpData.user) {
      throw new Error('Registration failed. Please try again.');
    }

    const authId = signUpData.user.id;

    // Step 3 — Link auth account to member record, seed preferences, create notification
    const { error: linkError } = await supabase.rpc('link_auth_to_member', {
      p_member_id: memberId,
      p_auth_id:   authId,
      p_email:     email.trim(),
      p_phone:     phone.trim(),
    });

    if (linkError) {
      // signUp succeeded but linking failed — sign out the dangling auth account
      await supabase.auth.signOut();
      throw new Error(
        'Account setup failed. Please try again or contact support.'
      );
    }

    // Ensure the user is not auto-logged in — they must wait for admin activation
    await supabase.auth.signOut();
  }, []);

  return { register };
}
