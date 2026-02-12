import { useEffect, useState } from "react";
import type { UserRole } from "../types/role";

export function useAuthRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadRole() {
      try {

        const token = localStorage.getItem('accessToken');

        if (!token) {
          setLoading(false);
          return;
        }


        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));


        if (decodedPayload && decodedPayload.role) {
          setRole(decodedPayload.role as UserRole);
        }

      } catch (error) {
        console.error("Error decoding auth role:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRole();
  }, []);

  return { role, loading };
}