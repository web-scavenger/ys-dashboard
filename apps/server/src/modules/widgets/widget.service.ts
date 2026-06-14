import type {
  CreateWidgetRequest,
  ListWidgetsQuery,
  UpdateWidgetRequest,
  Widget,
} from '@ys/contracts';
import { NotFoundError } from '../../common/errors.js';
import type { WidgetManager } from './entities/widget-manager.js';
import type { UpdateWidgetInput, WidgetRepository } from './repositories/widget.repository.js';

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

  list(query: ListWidgetsQuery): Promise<Widget[]> {
    return this.repository.list(query);
  }

  async nextPosition(): Promise<number> {
    const max = await this.repository.maxPosition();
    return max === undefined ? 0 : max + 1;
  }

  async create(input: CreateWidgetRequest): Promise<Widget> {
    const position = await this.nextPosition();
    const data = this.manager.createInitialData(input.type);
    const title = this.manager.defaultTitle(input.type);
    return this.repository.create({ type: input.type, position, title, data });
  }

  async update(id: number, input: UpdateWidgetRequest): Promise<Widget> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Widget ${id} not found`);
    }
    const patch: UpdateWidgetInput = {};
    if (input.title !== undefined) {
      patch.title = input.title;
    }
    if (input.content !== undefined) {
      // Throws ValidationError for non-editable types — the service doesn't know
      // or care which types those are.
      patch.data = this.manager.applyUpdate(existing.type, existing.data, input);
    }
    const updated = await this.repository.update(id, patch);
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
