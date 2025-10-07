import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Edit, Trash2, FileText } from "lucide-react";
import { DocumentSetForm } from "@/components/document-set-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const mockSets = [
  {
    id: "1",
    name: "Bộ hồ sơ Thanh toán Nhà cung cấp",
    description: "Bộ hồ sơ hoàn chỉnh cho thanh toán nhà cung cấp",
    templates: ["Hóa đơn GTGT", "Đơn đặt hàng", "Phiếu giao hàng"],
    ruleCount: 5,
  },
];

export default function DocumentSetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Bộ hồ sơ</h1>
          <p className="text-muted-foreground mt-2">
            Nhóm các biểu mẫu thành bộ hồ sơ nghiệp vụ hoàn chỉnh
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-set">
              <Plus className="w-4 h-4 mr-2" />
              Tạo bộ hồ sơ mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo bộ hồ sơ mới</DialogTitle>
            </DialogHeader>
            <DocumentSetForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockSets.map((set) => (
          <Card key={set.id} className="hover-elevate" data-testid={`card-set-${set.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{set.name}</CardTitle>
                    <CardDescription className="mt-2">{set.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" data-testid={`button-edit-${set.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid={`button-delete-${set.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Biểu mẫu bao gồm:</p>
                <div className="flex flex-wrap gap-2">
                  {set.templates.map((template, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <FileText className="w-3 h-3" />
                      {template}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {set.ruleCount} quy tắc kiểm tra
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
