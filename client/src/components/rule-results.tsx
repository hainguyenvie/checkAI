import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RuleResultsProps {
  documentSetId: string;
}

export function RuleResults({ documentSetId }: RuleResultsProps) {
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

  const results = verificationResults.map((vr: any) => {
    const rule = rules.find((r: any) => r.id === vr.ruleId);
    return {
      ...vr,
      ruleName: rule?.name || "Unknown Rule",
    };
  });

  const passedCount = results.filter((r: any) => r.status === "passed").length;
  const totalCount = results.length;

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
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có kết quả kiểm tra. Nhấn "Chạy kiểm tra" để bắt đầu.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {results.map((result: any) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
