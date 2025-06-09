import type { DialogProps } from './types';
import { DialogClient } from './dialog-client';

export function Dialog(props: DialogProps) {
  return <DialogClient {...props} />;
}

export type { DialogProps, DialogButton } from './types';