export interface DialogButton {
  label: string;
  onClick: () => void;
  variant: 'secondary' | 'danger';
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttons: DialogButton[];
}