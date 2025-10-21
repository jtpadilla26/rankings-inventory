'use client';

import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem } from '@/lib/types';
import { gbp } from '@/lib/currency';

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Units', accessorKey: 'units',
    cell: ({ getValue }) => Number(getValue() ?? 0).toLocaleString('en-GB') },
  { header: 'Unit Type', accessorKey: 'unit_type' },
  {
    header: 'Price / Unit',
    accessorKey: 'price_per_unit',
    cell: ({ getValue }) => gbp.format(Number(getValue() ?? 0)),
  },
  {
    header: 'Total Value',
    accessorKey: 'total_value',
    cell: ({ row }) => {
      const p = Number(row.original.price_per_unit ?? 0);
      const u = Number(row.original.units ?? 0);
      const t = row.original.total_value ?? p * u;
      return gbp.format(Number(t || 0));
    },
  },
  { header: 'Location', accessorKey: 'location' },
];
