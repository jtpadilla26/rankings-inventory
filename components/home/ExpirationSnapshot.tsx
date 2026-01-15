'use client';

import { InventoryItem } from '@/lib/types';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
  items: InventoryItem[];
};

export function ExpirationSnapshot({ items }: Props) {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const itemsWithExpiry = items.filter(item => item.expiration_date);

  const expired = itemsWithExpiry.filter(item => {
    const expDate = new Date(item.expiration_date!);
    return expDate < now;
  });

  const expiring30 = itemsWithExpiry.filter(item => {
    const expDate = new Date(item.expiration_date!);
    return expDate >= now && expDate <= in30Days;
  });

  const expiring60 = itemsWithExpiry.filter(item => {
    const expDate = new Date(item.expiration_date!);
    return expDate > in30Days && expDate <= in60Days;
  });

  const expiring90 = itemsWithExpiry.filter(item => {
    const expDate = new Date(item.expiration_date!);
    return expDate > in60Days && expDate <= in90Days;
  });

  if (itemsWithExpiry.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Chemical Expiration Tracking</h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No items with expiration dates tracked
          </p>
        </div>
      </div>
    );
  }

  const categories = [
    { label: 'Expired', items: expired, color: 'destructive', icon: AlertTriangle },
    { label: 'Expiring in 30 days', items: expiring30, color: 'destructive', icon: AlertTriangle },
    { label: 'Expiring in 60 days', items: expiring60, color: 'default', icon: Clock },
    { label: 'Expiring in 90 days', items: expiring90, color: 'secondary', icon: Clock },
  ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Chemical Expiration Tracking</h2>
        <Badge variant="outline" className="ml-auto">
          {itemsWithExpiry.length} items tracked
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${category.items.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <h3 className="text-sm font-medium">{category.label}</h3>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className={`text-2xl font-bold ${category.items.length > 0 && category.color === 'destructive' ? 'text-destructive' : ''}`}>
                  {category.items.length}
                </p>
                {category.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {category.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs truncate text-muted-foreground">
                        • {item.name}
                      </div>
                    ))}
                    {category.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{category.items.length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
