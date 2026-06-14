import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../../common/errors.js';
import { BarWidgetEntity } from '../bar-widget.entity.js';
import { LineWidgetEntity } from '../line-widget.entity.js';
import { TextWidgetEntity } from '../text-widget.entity.js';

describe('chart widget entities', () => {
  it.each([
    ['line', new LineWidgetEntity()],
    ['bar', new BarWidgetEntity()],
  ] as const)('%s: generates chart points', (type, entity) => {
    expect(entity.type).toBe(type);

    const data = entity.createInitialData();
    expect(data.points).toHaveLength(7);
  });

  it('rejects updates to a non-editable widget', () => {
    const entity = new LineWidgetEntity();

    expect(() => entity.applyUpdate({ points: [] }, { content: 'x' })).toThrow(ValidationError);
  });
});

describe('TextWidgetEntity', () => {
  const entity = new TextWidgetEntity();

  it('starts with empty content', () => {
    expect(entity.type).toBe('text');
    expect(entity.createInitialData()).toEqual({ content: '' });
  });

  it('applies a content update', () => {
    expect(entity.applyUpdate({ content: 'old' }, { content: 'new' })).toEqual({
      content: 'new',
    });
  });
});
