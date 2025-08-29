
import { supabase } from '@/integrations/supabase/client';

// Fixed namespace UUID for consistent generation
const NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

export const generateConsistentUUID = (userId: string): string => {
  try {
    // Simple hash function to create deterministic UUID (matches server logic)
    let hash = 0;
    const input = userId + NAMESPACE_UUID;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to hex and pad to create UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
  } catch (error) {
    console.error("Error generating consistent UUID:", error);
    // Fallback to a random UUID
    return crypto.randomUUID();
  }
};

// New function to get or create user profile using database function
export const getOrCreateUserProfile = async (
  clerkUserId: string,
  fullName: string,
  userEmail: string,
  userRole: string = 'student'
): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('get_or_create_user_profile', {
      clerk_user_id: clerkUserId,
      full_name: fullName,
      user_email: userEmail,
      user_role: userRole
    });

    if (error) {
      console.error('Error getting or creating user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get or create user profile:', error);
    // Fallback to local UUID generation
    return generateConsistentUUID(clerkUserId);
  }
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
