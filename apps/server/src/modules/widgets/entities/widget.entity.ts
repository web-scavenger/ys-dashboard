import type { UpdateWidgetRequest, WidgetData, WidgetType } from '@ys/contracts';
import { ValidationError } from '../../../common/errors.js';

/**
 * Polymorphic domain entity for a widget type. All per-type behavior lives here
 * (and in subclasses), so the service can stay type-agnostic and the
 * {@link WidgetManager} can dispatch by type. Adding a widget type = a new
 * subclass + a registry entry; no service or controller changes.
 *
 * The generic `TData` narrows each subclass to its own payload while the manager
 * stores instances as the union-typed `WidgetEntity`. Persisted data is validated
 * by `type` through the contract's discriminated union in the repository, so the
 * entity owns only creation and update behavior.
 */
export abstract class WidgetEntity<TData extends WidgetData = WidgetData> {
  abstract readonly type: WidgetType;

  /** Build the payload for a freshly created widget of this type. */
  abstract createInitialData(): TData;

  /** Human-readable title assigned to a freshly created widget of this type. */
  abstract defaultTitle(): string;

  /**
   * Apply an update to this widget's data. Non-editable types inherit this
   * base, which rejects the edit; editable types override it.
   */
  applyUpdate(_current: TData, _patch: UpdateWidgetRequest): TData {
    throw new ValidationError(`Widget type "${this.type}" is not editable`);
  }
}
