import { useState, useEffect } from "react";
import { RuleResults } from "@/components/rule-results";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, History } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const [documentSetId, setDocumentSetId] = useState<string>("");
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

  const verifyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/verify/${documentSetId}`, {
        method: "POST",
      });
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kết quả Kiểm tra</h1>
        <p className="text-muted-foreground mt-2">
          Kết quả thẩm định tự động và lịch sử kiểm tra
        </p>
      </div>

      {documentSets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kết quả kiểm tra</CardTitle>
                <CardDescription>{documentSets[0]?.name}</CardDescription>
              </div>
              <Button 
                onClick={() => verifyMutation.mutate()} 
                disabled={verifyMutation.isPending}
                data-testid="button-run-check"
              >
                <Play className="w-4 h-4 mr-2" />
                {verifyMutation.isPending ? "Đang kiểm tra..." : "Chạy kiểm tra"}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <RuleResults documentSetId={documentSetId} />
    </div>
  );
}
