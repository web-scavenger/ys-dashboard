import type { ListWidgetsQuery, Widget, WidgetData, WidgetType } from '@ys/contracts';

export interface CreateWidgetInput {
  type: WidgetType;
  position: number;
  title: string;
  data: WidgetData;
}

/** Fields a widget update may touch. `title` applies to any widget; `data` to
 * editable ones. Only the provided keys are written. */
export interface UpdateWidgetInput {
  title?: string;
  data?: WidgetData;
}

/**
 * Repository port for the widgets module. The service depends on this interface
 * only, so the storage backend can be swapped by binding a different class in
 * the module.
 */
export interface WidgetRepository {
  list(sort: ListWidgetsQuery): Promise<Widget[]>;
  findById(id: number): Promise<Widget | undefined>;
  create(input: CreateWidgetInput): Promise<Widget>;
  update(id: number, patch: UpdateWidgetInput): Promise<Widget | undefined>;
  delete(id: number): Promise<boolean>;
  /** Highest assigned position, or `undefined` when there are no widgets. */
  maxPosition(): Promise<number | undefined>;
}
