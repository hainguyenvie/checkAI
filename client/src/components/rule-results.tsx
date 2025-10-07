import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const mockResults = [
  {
    id: "1",
    ruleName: "Đối chiếu tổng tiền",
    status: "passed" as const,
    message: "Tổng tiền hóa đơn khớp với đơn đặt hàng",
    details: {
      invoice_amount: "55,000,000 VNĐ",
      po_amount: "55,000,000 VNĐ",
      difference: "0 VNĐ",
    },
  },
  {
    id: "2",
    ruleName: "Xác thực nhà cung cấp",
    status: "passed" as const,
    message: "Tên nhà cung cấp khớp trên tất cả chứng từ",
    details: {
      invoice_supplier: "Công ty TNHH ABC",
      po_supplier: "Công ty TNHH ABC",
      delivery_supplier: "Công ty TNHH ABC",
    },
  },
  {
    id: "3",
    ruleName: "Kiểm tra dòng thời gian",
    status: "failed" as const,
    message: "Ngày hóa đơn không hợp lệ - sớm hơn ngày giao hàng",
    details: {
      invoice_date: "2024-01-15",
      delivery_date: "2024-01-18",
      po_date: "2024-01-10",
      issue: "Ngày hóa đơn phải sau ngày giao hàng",
    },
  },
  {
    id: "4",
    ruleName: "Đối chiếu số lượng",
    status: "passed" as const,
    message: "Số lượng hàng hóa khớp giữa các chứng từ",
    details: {
      invoice_quantity: "100 sản phẩm",
      delivery_quantity: "100 sản phẩm",
      po_quantity: "100 sản phẩm",
    },
  },
  {
    id: "5",
    ruleName: "Kiểm tra tính toán",
    status: "passed" as const,
    message: "Công thức tính toán chính xác",
    details: {
      subtotal: "50,000,000 VNĐ",
      tax: "5,000,000 VNĐ (10%)",
      total: "55,000,000 VNĐ",
      calculation: "50,000,000 + 5,000,000 = 55,000,000 ✓",
    },
  },
];

export function RuleResults() {
  const passedCount = mockResults.filter(r => r.status === "passed").length;
  const totalCount = mockResults.length;

  const handleExport = () => {
    console.log("Exporting report...");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Tổng số quy tắc</CardDescription>
            <CardTitle className="text-3xl font-mono">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Đạt</CardDescription>
            <CardTitle className="text-3xl font-mono text-chart-2">{passedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Không đạt</CardDescription>
            <CardTitle className="text-3xl font-mono text-destructive">{totalCount - passedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Kết quả kiểm tra chi tiết</CardTitle>
            <CardDescription>Kết quả thẩm định cho từng quy tắc</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {mockResults.map((result) => (
              <AccordionItem key={result.id} value={result.id}>
                <AccordionTrigger className="hover:no-underline" data-testid={`accordion-trigger-${result.id}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <StatusBadge status={result.status} />
                    <span className="font-medium text-left">{result.ruleName}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pt-2 space-y-3">
                    <p className="text-sm">{result.message}</p>
                    <div className="bg-muted p-4 rounded-md space-y-2">
                      <p className="text-sm font-medium">Chi tiết:</p>
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
