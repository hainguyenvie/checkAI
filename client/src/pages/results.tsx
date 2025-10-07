import { RuleResults } from "@/components/rule-results";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, History } from "lucide-react";

const mockHistory = [
  { id: "1", date: "2024-01-20 14:30", set: "Thanh toán NCC - ABC Corp", status: "failed" as const },
  { id: "2", date: "2024-01-19 10:15", set: "Thanh toán NCC - XYZ Ltd", status: "passed" as const },
  { id: "3", date: "2024-01-18 16:45", set: "Thanh toán NCC - DEF Inc", status: "passed" as const },
];

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kết quả Kiểm tra</h1>
        <p className="text-muted-foreground mt-2">
          Kết quả thẩm định tự động và lịch sử kiểm tra
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kết quả kiểm tra mới nhất</CardTitle>
              <CardDescription>Bộ hồ sơ Thanh toán NCC - ABC Corp</CardDescription>
            </div>
            <Button data-testid="button-run-check">
              <Play className="w-4 h-4 mr-2" />
              Chạy kiểm tra
            </Button>
          </div>
        </CardHeader>
      </Card>

      <RuleResults />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Lịch sử kiểm tra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                data-testid={`history-item-${item.id}`}
              >
                <div className="flex-1">
                  <p className="font-medium">{item.set}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${
                    item.status === "passed" ? "text-chart-2" : "text-destructive"
                  }`}>
                    {item.status === "passed" ? "Đạt" : "Không đạt"}
                  </span>
                  <Button variant="outline" size="sm" data-testid={`button-view-${item.id}`}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
