import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const ruleTypes = [
  { value: "amount_comparison", label: "Đối chiếu tổng tiền" },
  { value: "supplier_verification", label: "Xác thực nhà cung cấp" },
  { value: "date_validation", label: "Kiểm tra thời gian" },
  { value: "quantity_comparison", label: "Đối chiếu số lượng" },
  { value: "calculation_check", label: "Kiểm tra tính toán" },
];

export function RuleBuilder() {
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [ruleType, setRuleType] = useState("");
  const [condition, setCondition] = useState("");

  const handleSubmit = () => {
    console.log("Rule created:", { ruleName, description, ruleType, condition });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin quy tắc</CardTitle>
          <CardDescription>Định nghĩa logic kiểm tra cho bộ hồ sơ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Tên quy tắc</Label>
            <Input
              id="rule-name"
              placeholder="Ví dụ: Đối chiếu tổng tiền hóa đơn và đơn hàng"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              data-testid="input-rule-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-description">Mô tả</Label>
            <Textarea
              id="rule-description"
              placeholder="Mô tả chi tiết về quy tắc kiểm tra..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-rule-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-type">Loại quy tắc</Label>
            <Select value={ruleType} onValueChange={setRuleType}>
              <SelectTrigger id="rule-type" data-testid="select-rule-type">
                <SelectValue placeholder="Chọn loại quy tắc" />
              </SelectTrigger>
              <SelectContent>
                {ruleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Điều kiện kiểm tra</CardTitle>
          <CardDescription>Định nghĩa logic kiểm tra bằng biểu thức hoặc ngôn ngữ tự nhiên</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Điều kiện</Label>
            <Textarea
              id="condition"
              placeholder="Ví dụ: invoice.total_amount == purchase_order.total_amount"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="font-mono text-sm"
              rows={4}
              data-testid="input-condition"
            />
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Ví dụ điều kiện:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <code className="font-mono">invoice.supplier_name == delivery_note.supplier_name</code></li>
              <li>• <code className="font-mono">invoice.date {'>'} delivery_note.date</code></li>
              <li>• <code className="font-mono">invoice.quantity == delivery_note.quantity</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" data-testid="button-cancel">Hủy</Button>
        <Button onClick={handleSubmit} data-testid="button-save-rule">
          <Plus className="w-4 h-4 mr-2" />
          Tạo quy tắc
        </Button>
      </div>
    </div>
  );
}
