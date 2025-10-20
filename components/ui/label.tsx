import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

type LabelRef = React.ElementRef<typeof LabelPrimitive.Root>;

const Label = React.forwardRef<LabelRef, LabelProps>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...rest}
    />
  );
});

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
