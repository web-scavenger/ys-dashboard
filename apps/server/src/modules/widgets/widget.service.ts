import type { CreateWidgetRequest, UpdateWidgetRequest, Widget } from '@ys/contracts';
import { NotFoundError } from '../../common/errors.js';
import type { WidgetManager } from './entities/widget-manager.js';
import type { WidgetRepository } from './repositories/widget.repository.js';

/**
 * Orchestration for the widgets module. Stays type-agnostic: all per-type
 * behavior (initial data, update rules) is delegated to the {@link WidgetManager},
 * which dispatches to the matching entity. Adding a widget type touches neither
 * this service nor the controller.
 */
export class WidgetService {
  constructor(
    private readonly repository: WidgetRepository,
    private readonly manager: WidgetManager,
  ) {}

  list(): Promise<Widget[]> {
    return this.repository.list();
  }

  async create(input: CreateWidgetRequest): Promise<Widget> {
    // Append at the end. `maxPosition` + 1 is not atomic, but this is a
    // single-user dashboard so concurrent creates aren't a concern; positions
    // are append-only and may leave gaps after deletes, which is fine for
    // ordering. Revisit (e.g. a DB sequence/transaction) if it goes multi-user.
    const max = await this.repository.maxPosition();
    const position = max === undefined ? 0 : max + 1;
    const data = this.manager.createInitialData(input.type);
    return this.repository.create({ type: input.type, position, data });
  }

  async update(id: number, input: UpdateWidgetRequest): Promise<Widget> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Widget ${id} not found`);
    }
    // Throws ValidationError for non-editable types — the service doesn't know
    // or care which types those are.
    const data = this.manager.applyUpdate(existing.type, existing.data, input);
    const updated = await this.repository.updateData(id, data);
    if (!updated) {
      throw new NotFoundError(`Widget ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const removed = await this.repository.delete(id);
    if (!removed) {
      throw new NotFoundError(`Widget ${id} not found`);
    }
  }
}
