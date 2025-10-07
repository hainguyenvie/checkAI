import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ResultsPage() {
  const [documentSetId, setDocumentSetId] = useState<string>("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const { toast } = useToast();

  const { data: documentSets = [] } = useQuery({
    queryKey: ["/api/document-sets"],
  });

  useEffect(() => {
    if (documentSets.length > 0 && !documentSetId) {
      setDocumentSetId(documentSets[0].id);
    }
  }, [documentSets, documentSetId]);

  const { data: verificationResults = [] } = useQuery({
    queryKey: ["/api/verification-results", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/verification-results/${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!documentSetId,
  });

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

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/verify/${documentSetId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Kiểm tra hoàn tất",
        description: "Kết quả thẩm định đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/verification-results", documentSetId] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi kiểm tra",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const results = verificationResults.map((vr: any) => {
    const rule = rules.find((r: any) => r.id === vr.ruleId);
    return {
      ...vr,
      ruleName: rule?.name || "Unknown Rule",
    };
  });

  const passedCount = results.filter((r: any) => r.status === "passed").length;
  const failedCount = results.filter((r: any) => r.status === "failed").length;
  const totalCount = results.length;
  const hasResults = results.length > 0;

  const currentSet = documentSets.find((s: any) => s.id === documentSetId);

  const handleExport = () => {
    console.log("Exporting report...");
    toast({
      title: "Xuất báo cáo",
      description: "Đang chuẩn bị file báo cáo...",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kết quả Kiểm tra</h1>
        <p className="text-muted-foreground mt-2">
          Lịch sử thẩm định tự động và kết quả chi tiết
        </p>
      </div>

      {/* Toolbar chọn bộ hồ sơ và chạy kiểm tra */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 min-w-[200px] max-w-md">
                <Select value={documentSetId} onValueChange={setDocumentSetId}>
                  <SelectTrigger data-testid="select-document-set">
                    <SelectValue placeholder="Chọn bộ hồ sơ" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentSets.map((set: any) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentSet && (
                <p className="text-sm text-muted-foreground">
                  {currentSet.description}
                </p>
              )}
            </div>
            <Button 
              onClick={() => verifyMutation.mutate()} 
              disabled={verifyMutation.isPending || !documentSetId}
              data-testid="button-run-check"
            >
              <Play className="w-4 h-4 mr-2" />
              {verifyMutation.isPending ? "Đang kiểm tra..." : "Chạy kiểm tra"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tổng hợp kết quả - chỉ hiện khi có kết quả */}
      {hasResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng số quy tắc</p>
                  <p className="text-2xl font-bold" data-testid="text-total-rules">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-md">
                  <CheckCircle2 className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đạt</p>
                  <p className="text-2xl font-bold text-chart-2" data-testid="text-passed-count">{passedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-md">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Không đạt</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="text-failed-count">{failedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kết quả chi tiết - chỉ hiện khi có kết quả */}
      {hasResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kết quả kiểm tra chi tiết</CardTitle>
              <Button variant="outline" onClick={handleExport} data-testid="button-export-report">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {results.map((result: any) => (
                <AccordionItem key={result.id} value={result.id}>
                  <AccordionTrigger className="hover:no-underline" data-testid={`accordion-trigger-${result.id}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <StatusBadge status={result.status} />
                      <span className="text-left font-medium">{result.ruleName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4 pt-2 space-y-3">
                      <p className="text-sm">{result.message}</p>
                      {result.details && (
                        <div className="bg-muted p-4 rounded-md space-y-2">
                          <p className="text-sm font-medium">Chi tiết:</p>
                          {Object.entries(result.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Lịch sử kiểm tra */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử kiểm tra</CardTitle>
          <CardDescription>
            Các lần kiểm tra trước đây của bộ hồ sơ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasResults ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có lịch sử kiểm tra. Nhấn "Chạy kiểm tra" để bắt đầu.
            </p>
          ) : (
            <div className="space-y-2">
              <div
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                data-testid="history-item-latest"
              >
                <div className="flex-1">
                  <p className="font-medium">{currentSet?.name || "Kiểm tra mới nhất"}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${
                    failedCount === 0 ? "text-chart-2" : "text-destructive"
                  }`}>
                    {failedCount === 0 ? "Đạt" : "Không đạt"}
                  </span>
                  <Button variant="outline" size="sm" data-testid="button-view-latest">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
