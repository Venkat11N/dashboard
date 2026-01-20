import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../types/role"

export function useAuthRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    async function loadRole() {
      const {
        data: { user }, 
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id)
        .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        setRole(data.roles.name as UserRole);
        setLoading(false);
    }

    loadRole();
  }, []);

  return { role, loading };
}