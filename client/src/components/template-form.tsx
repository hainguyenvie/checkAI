import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Field {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
}

export function TemplateForm() {
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: "",
      label: "",
      fieldType: "text",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = () => {
    console.log("Template created:", { templateName, description, fields });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin biểu mẫu</CardTitle>
          <CardDescription>Định nghĩa loại chứng từ và các trường thông tin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Tên biểu mẫu</Label>
            <Input
              id="template-name"
              placeholder="Ví dụ: Hóa đơn GTGT"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              data-testid="input-template-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn gọn về biểu mẫu này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-template-description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Các trường thông tin</CardTitle>
            <CardDescription>Định nghĩa các trường cần trích xuất từ chứng từ</CardDescription>
          </div>
          <Button onClick={addField} data-testid="button-add-field">
            <Plus className="w-4 h-4 mr-2" />
            Thêm trường
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có trường nào. Nhấn "Thêm trường" để bắt đầu.
            </p>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="flex gap-4 items-start p-4 border rounded-md">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tên trường</Label>
                    <Input
                      placeholder="supplier_name"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      data-testid={`input-field-name-${field.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nhãn hiển thị</Label>
                    <Input
                      placeholder="Tên nhà cung cấp"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      data-testid={`input-field-label-${field.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại dữ liệu</Label>
                    <Select
                      value={field.fieldType}
                      onValueChange={(value) => updateField(field.id, { fieldType: value })}
                    >
                      <SelectTrigger data-testid={`select-field-type-${field.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Văn bản</SelectItem>
                        <SelectItem value="number">Số</SelectItem>
                        <SelectItem value="date">Ngày tháng</SelectItem>
                        <SelectItem value="select">Lựa chọn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                      data-testid={`switch-required-${field.id}`}
                    />
                    <Label>Bắt buộc</Label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                  data-testid={`button-remove-field-${field.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" data-testid="button-cancel">Hủy</Button>
        <Button onClick={handleSubmit} data-testid="button-save-template">Lưu biểu mẫu</Button>
      </div>
    </div>
  );
}
