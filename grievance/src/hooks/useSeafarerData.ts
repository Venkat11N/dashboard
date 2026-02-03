import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSeafarerData(indosNumber: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (indosNumber.length < 4) return;

    async function fetchDetails() {
      setLoading(true);
      const { data: seafarer, error } = await supabase
        .from('seafarers')
        .select('first_name, last_name, cdc_number, date_of_birth, email')
        .eq('indos_number', indosNumber)
        .single();

      if (!error && seafarer) setData(seafarer);
      setLoading(false);
    }

    fetchDetails();
  }, [indosNumber]);

  return { data, loading };
}