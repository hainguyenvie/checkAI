import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type StatusType = "passed" | "failed" | "pending" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig = {
  passed: {
    icon: CheckCircle,
    label: "Đạt",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  failed: {
    icon: XCircle,
    label: "Không Đạt",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  pending: {
    icon: Clock,
    label: "Đang chờ",
    className: "bg-muted text-muted-foreground border-muted",
  },
  warning: {
    icon: AlertCircle,
    label: "Cảnh báo",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={config.className} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label || config.label}
    </Badge>
  );
}
