import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";
import { TemplateForm } from "@/components/template-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TemplatesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Biểu mẫu</h1>
          <p className="text-muted-foreground mt-2">
            Khai báo các loại chứng từ và trường thông tin cần trích xuất
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="w-4 h-4 mr-2" />
              Tạo biểu mẫu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo biểu mẫu mới</DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {Array.isArray(template.fields) ? template.fields.length : 0} trường
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" data-testid={`button-edit-${template.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid={`button-delete-${template.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
