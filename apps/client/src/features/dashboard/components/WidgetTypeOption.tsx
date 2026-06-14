import { Button } from '@/components/ui/button';
import { widgetRegistry } from '../registry.js';
import type { WidgetType } from '../types.js';

interface WidgetTypeOptionProps {
  type: WidgetType;
  disabled: boolean;
  onSelect: (type: WidgetType) => void;
}

export function WidgetTypeOption({ type, disabled, onSelect }: WidgetTypeOptionProps) {
  const handleClick = () => {
    onSelect(type);
  };

  return (
    <Button variant="outline" className="justify-start" disabled={disabled} onClick={handleClick}>
      {widgetRegistry[type].label}
    </Button>
  );
}
