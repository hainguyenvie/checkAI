import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { RuleBuilder } from "@/components/rule-builder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const mockRules = [
  {
    id: "1",
    name: "Đối chiếu tổng tiền",
    description: "So sánh tổng tiền thanh toán trên Hóa đơn với tổng giá trị trên Đơn đặt hàng",
    type: "amount_comparison",
    condition: "invoice.total_amount == purchase_order.total_amount",
  },
  {
    id: "2",
    name: "Xác thực nhà cung cấp",
    description: "Đảm bảo tên nhà cung cấp khớp nhau trên các chứng từ",
    type: "supplier_verification",
    condition: "invoice.supplier_name == delivery_note.supplier_name",
  },
  {
    id: "3",
    name: "Kiểm tra dòng thời gian",
    description: "Xác minh tính hợp lệ của ngày tháng",
    type: "date_validation",
    condition: "invoice.date > delivery_note.date AND delivery_note.date > purchase_order.date",
  },
];

const ruleTypeLabels: Record<string, string> = {
  amount_comparison: "Đối chiếu tổng tiền",
  supplier_verification: "Xác thực nhà cung cấp",
  date_validation: "Kiểm tra thời gian",
  quantity_comparison: "Đối chiếu số lượng",
  calculation_check: "Kiểm tra tính toán",
};

export default function RulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Quy tắc</h1>
          <p className="text-muted-foreground mt-2">
            Định nghĩa logic kiểm tra chéo giữa các chứng từ
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-rule">
              <Plus className="w-4 h-4 mr-2" />
              Tạo quy tắc mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo quy tắc mới</DialogTitle>
            </DialogHeader>
            <RuleBuilder />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockRules.map((rule) => (
          <Card key={rule.id} className="hover-elevate" data-testid={`card-rule-${rule.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <Badge variant="outline">{ruleTypeLabels[rule.type]}</Badge>
                    </div>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" data-testid={`button-edit-${rule.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid={`button-delete-${rule.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Điều kiện:</p>
                <code className="text-xs font-mono">{rule.condition}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
