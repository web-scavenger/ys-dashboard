import { AddWidgetDialog } from './AddWidgetDialog.js';

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <AddWidgetDialog />
    </header>
  );
}
