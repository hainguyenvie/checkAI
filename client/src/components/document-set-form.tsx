import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";

const mockTemplates = [
  { id: "1", name: "Hóa đơn GTGT", description: "Hóa đơn giá trị gia tăng" },
  { id: "2", name: "Đơn đặt hàng", description: "Purchase Order (PO)" },
  { id: "3", name: "Phiếu giao hàng", description: "Delivery Note" },
];

export function DocumentSetForm() {
  const [setName, setSetName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSubmit = () => {
    console.log("Document set created:", { setName, description, selectedTemplates });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bộ hồ sơ</CardTitle>
          <CardDescription>Nhóm các biểu mẫu thành một bộ hồ sơ hoàn chỉnh</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="set-name">Tên bộ hồ sơ</Label>
            <Input
              id="set-name"
              placeholder="Ví dụ: Bộ hồ sơ Thanh toán Nhà cung cấp"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              data-testid="input-set-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-description">Mô tả</Label>
            <Textarea
              id="set-description"
              placeholder="Mô tả mục đích và phạm vi của bộ hồ sơ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-set-description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chọn biểu mẫu</CardTitle>
          <CardDescription>Chọn các biểu mẫu cần thiết cho bộ hồ sơ này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-start space-x-3 p-3 border rounded-md hover-elevate"
                data-testid={`template-option-${template.id}`}
              >
                <Checkbox
                  id={`template-${template.id}`}
                  checked={selectedTemplates.includes(template.id)}
                  onCheckedChange={() => toggleTemplate(template.id)}
                  data-testid={`checkbox-template-${template.id}`}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`template-${template.id}`}
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    {template.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" data-testid="button-cancel">Hủy</Button>
        <Button onClick={handleSubmit} data-testid="button-save-set">Lưu bộ hồ sơ</Button>
      </div>
    </div>
  );
}
