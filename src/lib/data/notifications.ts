import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleNotifications } from "@/lib/sample-data";
import type { AppNotification } from "@/lib/types";

export async function getNotifications(
  limite = 30
): Promise<AppNotification[]> {
  if (!isSupabaseConfigured) return sampleNotifications.slice(0, limite);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(limite);

  return (data as AppNotification[]) ?? [];
}

export async function compterNonLues(): Promise<number> {
  const notifications = await getNotifications(100);
  return notifications.filter((n) => !n.lu).length;
}
