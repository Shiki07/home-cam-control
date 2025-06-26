
import { supabase } from '@/integrations/supabase/client';
import { validatePassword } from '@/utils/passwordValidation';
import { validateEmail, sanitizeInput } from '@/utils/inputSanitization';

export interface AuthError {
  message: string;
  type: 'validation' | 'auth' | 'network';
}

export class AuthService {
  static async signUp(email: string, password: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Input validation
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase(), 254);
      
      if (!validateEmail(sanitizedEmail)) {
        return {
          success: false,
          error: { message: 'Please enter a valid email address', type: 'validation' }
        };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: { 
            message: passwordValidation.errors.join('. '), 
            type: 'validation' 
          }
        };
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        // Generic error messages to prevent information disclosure
        let message = 'An error occurred during registration';
        
        if (error.message.includes('already registered')) {
          message = 'An account with this email may already exist';
        } else if (error.message.includes('invalid')) {
          message = 'Please check your email and password';
        }
        
        return {
          success: false,
          error: { message, type: 'auth' }
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: { message: 'Network error. Please try again.', type: 'network' }
      };
    }
  }

  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Input validation
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase(), 254);
      
      if (!validateEmail(sanitizedEmail)) {
        return {
          success: false,
          error: { message: 'Please enter a valid email address', type: 'validation' }
        };
      }

      if (!password || password.length < 1) {
        return {
          success: false,
          error: { message: 'Password is required', type: 'validation' }
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        // Generic error message to prevent user enumeration
        return {
          success: false,
          error: { message: 'Invalid email or password', type: 'auth' }
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: { message: 'Network error. Please try again.', type: 'network' }
      };
    }
  }
}
