'use client';

import { useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
};

type CategoryState = {
  categories: Category[];
  loading: boolean;
  error: string | null;
};

export function useCategories(): CategoryState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Failed to load categories (${response.status})`);
        }
        const data = (await response.json()) as Category[];
        if (active) {
          setCategories(data);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Failed to load categories';
          console.error('Failed to fetch categories:', err);
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error };
}
