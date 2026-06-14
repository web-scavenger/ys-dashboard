import { describe, expect, it } from 'vitest';
import { widgetRegistry, widgetTypes } from '../registry.js';

describe('widgetRegistry', () => {
  it('has an entry for every widget type', () => {
    expect(widgetTypes.sort()).toEqual(['bar', 'line', 'text']);
    for (const type of widgetTypes) {
      // Charts are `React.lazy` (objects), text is a function component — both
      // are valid component values, so just assert each entry has one.
      expect(widgetRegistry[type].Component).toBeDefined();
      expect(widgetRegistry[type].label).toBeTruthy();
    }
  });

  it('marks only the text widget as editable', () => {
    expect(widgetRegistry.text.editable).toBe(true);
    expect(widgetRegistry.line.editable).toBe(false);
    expect(widgetRegistry.bar.editable).toBe(false);
  });
});
