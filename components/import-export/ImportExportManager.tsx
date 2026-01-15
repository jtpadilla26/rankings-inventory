'use client';

import { useState } from 'react';
import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';

export function ImportExportManager() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ExportSection />
      <ImportSection />
    </div>
  );
}
