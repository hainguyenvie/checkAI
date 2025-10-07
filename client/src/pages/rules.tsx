import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { RuleBuilder } from "@/components/rule-builder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const ruleTypeLabels: Record<string, string> = {
  amount_comparison: "Đối chiếu tổng tiền",
  supplier_verification: "Xác thực nhà cung cấp",
  date_validation: "Kiểm tra thời gian",
  quantity_comparison: "Đối chiếu số lượng",
  calculation_check: "Kiểm tra tính toán",
};

export default function RulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentSetId, setDocumentSetId] = useState<string>("");

  const { data: documentSets = [] } = useQuery({
    queryKey: ["/api/document-sets"],
  });

  useEffect(() => {
    if (documentSets.length > 0 && !documentSetId) {
      setDocumentSetId(documentSets[0].id);
    }
  }, [documentSets, documentSetId]);

  const { data: rules = [] } = useQuery({
    queryKey: ["/api/rules", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/rules?documentSetId=${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
    enabled: !!documentSetId,
  });

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
        {rules.map((rule: any) => (
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
                      <Badge variant="outline">{ruleTypeLabels[rule.ruleType] || rule.ruleType}</Badge>
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
                <p className="text-sm font-medium mb-1">Loại quy tắc:</p>
                <code className="text-xs font-mono">{rule.ruleType}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
