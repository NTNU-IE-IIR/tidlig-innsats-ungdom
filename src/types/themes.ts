/**
 * Represents a single node in a theme tree.
 */
export interface ThemeNode {
  id: number;
  name: string;
  parentId?: number;
  children: ThemeNode[];
}
