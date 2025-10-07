import { StatusBadge } from '../status-badge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap p-4">
      <StatusBadge status="passed" />
      <StatusBadge status="failed" />
      <StatusBadge status="pending" />
      <StatusBadge status="warning" />
    </div>
  );
}
