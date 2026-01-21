import { supabase } from "../lib/supabase";
import { CURRENT_USER } from "../lib/currentUser";

export async function getGrievanceCounts() {
  const statuses = ["PENDING", "RESOLVED", "ESCALATED"];

  const results = await Promise.all (
    statuses.map(status =>
      supabase
      .from("grievacne")
      .select("*", {count: "exact", head: true})
      .eq("user_id", CURRENT_USER.id)
      .eq("status", status)
    )
  );

  const [pending, resolved, escalated] = results.map((r) => r.count || 0);

  const {count: total } = await supabase
  .from("grievances")
  .select("*", {count: "exact", head: true})
  .eq("user_id", CURRENT_USER.id);

  return {
    total: total || 0,
    pending,
    resolved,
    escalated,
  };
}