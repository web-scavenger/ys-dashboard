import type { Widget, WidgetData, WidgetType } from '@ys/contracts';

export interface CreateWidgetInput {
  type: WidgetType;
  position: number;
  data: WidgetData;
}

/**
 * Repository port for the widgets module. The service depends on this interface
 * only, so the storage backend can be swapped by binding a different class in
 * the module.
 */
export interface WidgetRepository {
  list(): Promise<Widget[]>;
  findById(id: number): Promise<Widget | undefined>;
  create(input: CreateWidgetInput): Promise<Widget>;
  updateData(id: number, data: WidgetData): Promise<Widget | undefined>;
  delete(id: number): Promise<boolean>;
  /** Highest assigned position, or `undefined` when there are no widgets. */
  maxPosition(): Promise<number | undefined>;
}
