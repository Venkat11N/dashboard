import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export function useSeafarerData(indosNumber: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (indosNumber.length < 4) {
      setData(null);
      return;
    }

    async function fetchDetails() {
      try {
        setLoading(true);
        

        const token = localStorage.getItem('accessToken');


        const response = await fetch(`${API_BASE_URL}/seafarers/${indosNumber}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.status === 'ok' && result.data) {
          setData(result.data);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching seafarer data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [indosNumber]);

  return { data, loading };
}