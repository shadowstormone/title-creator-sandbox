import { supabase } from "@/lib/supabaseClient";

export const getClientIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return '';
  }
};

export const trackIpSession = async (userId: string) => {
  try {
    const ip = await getClientIp();
    if (!ip) {
      console.error('Failed to get client IP');
      return;
    }

    const { error } = await supabase
      .from('ip_sessions')
      .upsert({
        user_id: userId,
        ip_address: ip,
        last_active: new Date().toISOString(),
      }, {
        onConflict: 'user_id, ip_address'
      });

    if (error) {
      console.error('Error tracking IP session:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to track IP session:', error);
    throw error;
  }
};

export const checkIpSession = async (userId: string): Promise<boolean> => {
  try {
    const ip = await getClientIp();
    if (!ip) return false;

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data, error } = await supabase
      .from('ip_sessions')
      .select('last_active')
      .eq('user_id', userId)
      .eq('ip_address', ip)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Запись не найдена
        return false;
      }
      console.error('Error checking IP session:', error);
      return false;
    }

    if (!data) return false;

    const lastActive = new Date(data.last_active);
    return lastActive > oneHourAgo;
  } catch (error) {
    console.error('Failed to check IP session:', error);
    return false;
  }
};

export const updateIpActivity = async (userId: string) => {
  try {
    const ip = await getClientIp();
    if (!ip) return;

    const { error } = await supabase
      .from('ip_sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('ip_address', ip);

    if (error) {
      console.error('Error updating IP activity:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update IP activity:', error);
    throw error;
  }
};