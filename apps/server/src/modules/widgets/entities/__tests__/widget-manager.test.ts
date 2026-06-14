import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../../common/errors.js';
import { WidgetManager } from '../widget-manager.js';

describe('WidgetManager', () => {
  const manager = new WidgetManager();

  it('dispatches createInitialData by type', () => {
    expect(manager.createInitialData('text')).toEqual({ content: '' });
    expect(manager.createInitialData('bar').points).toHaveLength(7);
  });

  it('applies updates for editable types and rejects others', () => {
    expect(manager.applyUpdate('text', { content: 'a' }, { content: 'b' })).toEqual({
      content: 'b',
    });
    expect(() => manager.applyUpdate('line', { points: [] }, { content: 'b' })).toThrow(
      ValidationError,
    );
  });
});
