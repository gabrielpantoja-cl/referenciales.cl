export interface DocItem {
  id: string;
  title: string;
  path: string;
  children?: DocItem[];
}