'use client';

import * as React from 'react';
import type { DialogProps } from './types';
import { DialogClient } from './dialog-client';

export function DialogWrapper(props: DialogProps) {
  // We can simplify this component since DialogClient now handles all the effects
  // This is just a pass-through component for client-side rendering
  if (!props.open) return null;
  return <DialogClient {...props} />;
}