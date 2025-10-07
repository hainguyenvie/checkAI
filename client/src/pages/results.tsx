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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { DocumentSet, Rule, VerificationResult, Document, Template } from "@shared/schema";

export default function ResultsPage() {
  const [documentSetId, setDocumentSetId] = useState<string>("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [focusedRuleKey, setFocusedRuleKey] = useState<string | null>(null);
  const [focusedRuleFailed, setFocusedRuleFailed] = useState<boolean>(false);
  const [previewKey, setPreviewKey] = useState<null | 'invoice' | 'po' | 'delivery'>(null);
  const { toast } = useToast();

  const { data: documentSets = [] } = useQuery<DocumentSet[]>({
    queryKey: ["/api/document-sets"],
  });

  useEffect(() => {
    if (documentSets.length > 0 && !documentSetId) {
      setDocumentSetId(documentSets[0].id);
    }
  }, [documentSets, documentSetId]);

  const { data: verificationResults = [] } = useQuery<VerificationResult[]>({
    queryKey: ["/api/verification-results", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/verification-results/${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!documentSetId,
  });

  const { data: rules = [] } = useQuery<Rule[]>({
    queryKey: ["/api/rules", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/rules?documentSetId=${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
    enabled: !!documentSetId,
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/documents?documentSetId=${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: !!documentSetId,
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const templateIdToName: Record<string, string> = (templates as any[]).reduce((acc, t: any) => {
    acc[t.id] = t.name || "";
    return acc;
  }, {} as Record<string, string>);

  // Local mock documents used when there is no data yet
  const sampleDocuments: any[] = [
    {
      id: "sample-invoice",
      fileName: "invoice.pdf",
      extractedData: {
        supplier_name: "Công ty TNHH ABC",
        invoice_number: "INV-2024-001",
        invoice_date: "2024-01-15",
        subtotal: 45000000,
        tax_amount: 4500000,
        final_amount: 50000000, // mismatch vs PO and calculation
        quantity: 100,
      },
      fileUrl: "/uploads/mock.pdf",
    },
    {
      id: "sample-po",
      fileName: "po.pdf",
      extractedData: {
        supplier_name: "Công ty TNHH ABC",
        po_number: "PO-2023-888",
        order_date: "2024-01-10",
        total_amount: 49500000,
        quantity: 100,
      },
      fileUrl: "/uploads/mock.pdf",
    },
    {
      id: "sample-delivery",
      fileName: "delivery.pdf",
      extractedData: {
        supplier_name: "Công ty TNHH XYZ", // mismatch supplier
        delivery_number: "DL-2024-015",
        delivery_date: "2024-01-12",
        quantity: 98, // mismatch quantity
      },
      fileUrl: "/uploads/mock.pdf",
    },
  ];

  const effectiveDocuments: any[] = (documents as any[])?.length ? (documents as any[]) : sampleDocuments;

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/verify/${documentSetId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thẩm định hoàn tất",
        description: "Kết quả thẩm định đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/verification-results", documentSetId] });
      queryClient.invalidateQueries({ queryKey: ["/api/history", documentSetId] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi Thẩm định",
        description: error.message === "No documents to verify" 
          ? "Chưa có hồ sơ nào để Thẩm định. Vui lòng tải lên hồ sơ trước."
          : error.message,
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

  // Fallback sample history when API returns empty
  const sampleHistory = [
    {
      id: "sample-1",
      name: "Bộ hồ sơ tháng 08/2025 - Công ty Global Tech",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toLocaleString("vi-VN"),
      status: "Đạt",
      failedCount: 0,
    },
    {
      id: "sample-2",
      name: "Bộ hồ sơ tháng 07/2025 - Công ty Global Tech",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toLocaleString("vi-VN"),
      status: "Không đạt",
      failedCount: 3,
    },
  ];

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/history", documentSetId],
    queryFn: async () => {
      if (!documentSetId) return [];
      const response = await fetch(`/api/history/${documentSetId}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    enabled: !!documentSetId,
  });

  const handleExport = () => {
    console.log("Exporting report...");
    toast({
      title: "Xuất báo cáo",
      description: "Đang chuẩn bị file báo cáo...",
    });
  };

  const openDetails = () => {
    setFocusedRuleKey(null);
    setFocusedRuleFailed(false);
    setShowDetails(true);
  };
  const openDetailsForRule = (result: any) => {
    const key = inferFocusedKeyFromResult(result);
    setFocusedRuleKey(key);
    setFocusedRuleFailed(result?.status !== "passed");
    setShowDetails(true);
  };
  const closeDetails = () => setShowDetails(false);

  function focusAndScroll(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }

  function findDocByKeywords(keywords: string[]): Document | undefined {
    const lower = keywords.map(k => k.toLowerCase());
    return (effectiveDocuments as any[]).find((d: any) => {
      const nameFromTemplate = templateIdToName[d.templateId] || "";
      const t = (nameFromTemplate || d.fileName || "").toString().toLowerCase();
      const inName = lower.some(k => t.includes(k));
      if (inName) return true;
      // Fallback: check fileName hints
      return lower.some(k => (d.fileName || "").toLowerCase().includes(k));
    });
  }

  // Attempt to infer by typical Vietnamese/English template names used in server rule engine
  let invoiceDoc = findDocByKeywords(["hóa đơn", "invoice"]);
  let poDoc = findDocByKeywords(["đơn đặt hàng", "purchase order", "po"]);
  let deliveryDoc = findDocByKeywords(["phiếu giao hàng", "delivery", "delivery note"]);

  // Fallback inference by field signatures if names not found
  if (!invoiceDoc) {
    invoiceDoc = (effectiveDocuments as any[]).find((d: any) => {
      const x = d.extractedData || {};
      return x.invoice_number || x.invoice_date || x.final_amount || x.subtotal;
    });
  }
  if (!poDoc) {
    poDoc = (effectiveDocuments as any[]).find((d: any) => {
      const x = d.extractedData || {};
      return x.po_number || x.order_date || x.total_amount;
    });
  }
  if (!deliveryDoc) {
    deliveryDoc = (effectiveDocuments as any[]).find((d: any) => {
      const x = d.extractedData || {};
      return x.delivery_number || x.delivery_date;
    });
  }

  function ValueCell({ label, value, highlight = false, variant = "error" as "error" | "focus" }: { label: string; value: any; highlight?: boolean; variant?: "error" | "focus" }) {
    return (
      <div className={`p-2 rounded-md border ${highlight
        ? (variant === "error"
            ? "bg-destructive/20 border-destructive ring-1 ring-destructive/60"
            : "bg-chart-2/10 border-chart-2 ring-1 ring-chart-2/50")
        : "bg-muted/40"}`}>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="font-mono text-xs break-all">{String(value ?? "-")}</p>
      </div>
    );
  }

  function inferFocusedKeyFromResult(result: any): string | null {
    if (!result) return null;
    const name = (result.ruleName || "").toLowerCase();
    const keys = Object.keys(result.details || {}).join(" ").toLowerCase();
    if (name.includes("tổng") || keys.includes("invoice_amount") || keys.includes("po_amount")) return "amount";
    if (name.includes("nhà cung cấp") || keys.includes("supplier")) return "supplier";
    if (name.includes("ngày") || keys.includes("_date") || keys.includes("po_date")) return "date";
    if (name.includes("số lượng") || keys.includes("quantity")) return "quantity";
    if (name.includes("tính toán") || keys.includes("subtotal") || keys.includes("tax") || keys.includes("total") || keys.includes("calculated")) return "calculation";
    return null;
  }

  // Derived conflict booleans from current docs
  const amountMismatch = ((Number(invoiceDoc?.extractedData?.final_amount || invoiceDoc?.extractedData?.total_amount) || 0) !== (Number(poDoc?.extractedData?.total_amount) || 0));
  const supplierMismatch = !((String(invoiceDoc?.extractedData?.supplier_name || "") === String(poDoc?.extractedData?.supplier_name || "")) && (String(invoiceDoc?.extractedData?.supplier_name || "") === String(deliveryDoc?.extractedData?.supplier_name || "")));
  const dateInvalid = (() => {
    const inv = new Date(invoiceDoc?.extractedData?.invoice_date || invoiceDoc?.extractedData?.date || 0).getTime();
    const del = new Date(deliveryDoc?.extractedData?.delivery_date || deliveryDoc?.extractedData?.date || 0).getTime();
    const po = new Date(poDoc?.extractedData?.order_date || poDoc?.extractedData?.date || 0).getTime();
    return !(inv > del && del > po);
  })();
  const qtyMismatch = Number(invoiceDoc?.extractedData?.quantity) !== Number(deliveryDoc?.extractedData?.quantity);
  const calcMismatch = (() => {
    const subtotal = Number(invoiceDoc?.extractedData?.subtotal || 0);
    const tax = Number(invoiceDoc?.extractedData?.tax_amount || invoiceDoc?.extractedData?.tax || 0);
    const total = Number(invoiceDoc?.extractedData?.final_amount || invoiceDoc?.extractedData?.total || invoiceDoc?.extractedData?.total_amount || 0);
    return Math.abs(subtotal + tax - total) >= 0.01;
  })();

  const keyToRuleType: Record<string, string> = {
    amount: "amount_comparison",
    supplier: "supplier_verification",
    date: "date_validation",
    quantity: "quantity_comparison",
    calculation: "calculation_check",
  };

  function getRuleByKey(key: string | null) {
    if (!key) return null;
    return (rules as any[]).find((r: any) => r.ruleType === keyToRuleType[key]);
  }

  function getResultByKey(key: string | null) {
    const rule = getRuleByKey(key);
    if (!rule) return null;
    return (results as any[]).find((res: any) => res.ruleId === rule.id) || null;
  }

  const focusedRule = getRuleByKey(focusedRuleKey);
  const focusedRuleResult = getResultByKey(focusedRuleKey);

  function conflictItemClasses(status: string | null, isFocused: boolean) {
    if (status === "passed") return `border-chart-2/60 bg-chart-2/10 ring-1 ring-chart-2/50 ${isFocused ? 'outline outline-1 outline-chart-2/70' : ''}`;
    if (status === "failed") return `border-destructive/60 bg-destructive/20 ring-1 ring-destructive/70 ${isFocused ? 'outline outline-1 outline-destructive/70' : ''}`;
    return `border-muted bg-muted/40 ${isFocused ? 'outline outline-1 outline-muted/60' : ''}`;
  }

  function getResultStatusForKey(key: string): "passed" | "failed" | null {
    const res = getResultByKey(key);
    return res ? (res.status as any) : null;
  }

  function Tag({ children, variant = "neutral" as "neutral" | "success" | "error" }) {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-mono";
    const cls = variant === 'success'
      ? 'bg-chart-2/10 text-chart-2 border border-chart-2/60'
      : variant === 'error'
      ? 'bg-destructive/20 text-destructive border border-destructive/60'
      : 'bg-muted/60 text-muted-foreground border border-muted';
    return <span className={`${base} ${cls}`}>{children}</span>;
  }

  function renderInlinePanel(key: string) {
    if (focusedRuleKey !== key) return null;
    const r = getRuleByKey(key);
    const vr = getResultByKey(key);
    const statusPassed = vr?.status === 'passed';
    const variant = statusPassed ? 'success' : 'error';

    // Build compact tags per rule
    const tags: JSX.Element[] = [] as any;
    const d: any = vr?.details || {};
    switch (key) {
      case 'amount':
        if (d.invoice_amount != null) tags.push(<Tag variant={variant}>INV: {String(d.invoice_amount)}</Tag>);
        if (d.po_amount != null) tags.push(<Tag variant={variant}>PO: {String(d.po_amount)}</Tag>);
        if (d.difference != null) tags.push(<Tag variant={variant}>Δ: {String(d.difference)}</Tag>);
        break;
      case 'supplier':
        if (d.supplier) tags.push(<Tag variant={variant}>Supplier: {String(d.supplier)}</Tag>);
        if (Array.isArray(d.suppliers)) tags.push(<Tag variant={variant}>Set: {d.suppliers.join(', ')}</Tag>);
        if (d.documents_checked != null) tags.push(<Tag variant={variant}>Docs: {String(d.documents_checked)}</Tag>);
        break;
      case 'date':
        if (d.po_date) tags.push(<Tag variant={variant}>PO: {String(d.po_date)}</Tag>);
        if (d.delivery_date) tags.push(<Tag variant={variant}>Giao: {String(d.delivery_date)}</Tag>);
        if (d.invoice_date) tags.push(<Tag variant={variant}>HĐ: {String(d.invoice_date)}</Tag>);
        if (d.issue) tags.push(<Tag variant={variant}>{String(d.issue)}</Tag>);
        break;
      case 'quantity':
        if (d.invoice_quantity != null) tags.push(<Tag variant={variant}>INV: {String(d.invoice_quantity)}</Tag>);
        if (d.delivery_quantity != null) tags.push(<Tag variant={variant}>Giao: {String(d.delivery_quantity)}</Tag>);
        if (d.difference != null) tags.push(<Tag variant={variant}>Δ: {String(d.difference)}</Tag>);
        break;
      case 'calculation':
        if (d.subtotal != null) tags.push(<Tag variant={variant}>Tạm tính: {String(d.subtotal)}</Tag>);
        if (d.tax != null) tags.push(<Tag variant={variant}>Thuế: {String(d.tax)}</Tag>);
        if (d.total != null) tags.push(<Tag variant={variant}>Tổng: {String(d.total)}</Tag>);
        if (d.calculated != null) tags.push(<Tag variant={variant}>Tính lại: {String(d.calculated)}</Tag>);
        if (d.difference != null) tags.push(<Tag variant={variant}>Δ: {String(d.difference)}</Tag>);
        break;
    }

    return (
      <div className="mt-2 rounded-md border bg-muted/40 p-3">
        {r && (
          <>
            <p className="text-sm">{r.name}</p>
            {r.description && (
              <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
            )}
          </>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t, i) => (<span key={i}>{t}</span>))}
          </div>
        )}
      </div>
    );
  }

  function togglePreview(key: 'invoice' | 'po' | 'delivery') {
    setPreviewKey(prev => (prev === key ? null : key));
  }

  function getDocByKey(key: 'invoice' | 'po' | 'delivery' | null) {
    if (!key) return null;
    if (key === 'invoice') return invoiceDoc;
    if (key === 'po') return poDoc;
    if (key === 'delivery') return deliveryDoc;
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kết quả Thẩm định</h1>
        <p className="text-muted-foreground mt-2">
          Lịch sử thẩm định tự động và kết quả chi tiết
        </p>
      </div>

      {/* Toolbar chọn bộ hồ sơ và chạy Thẩm định */}
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
              {verifyMutation.isPending ? "Đang Thẩm định..." : "Chạy Thẩm định"}
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
              <CardTitle>Kết quả Thẩm định chi tiết</CardTitle>
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
                      <div className="pt-2">
                        <Button variant="outline" size="sm" onClick={() => openDetailsForRule(result)} data-testid={`button-view-details-${result.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết so sánh
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Lịch sử Thẩm định */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử Thẩm định</CardTitle>
          <CardDescription>
            Các lần Thẩm định trước đây của bộ hồ sơ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md hover-elevate">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${item.failedCount === 0 ? 'text-chart-2' : 'text-destructive'}`}>{item.status}</span>
                    <Button variant="outline" size="sm" onClick={openDetails}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2" data-testid="history-sample-list">
              {sampleHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                  data-testid={`history-item-${item.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        item.failedCount === 0 ? "text-chart-2" : "text-destructive"
                      }`}
                    >
                      {item.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={openDetails} data-testid={`button-view-details-${item.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[92vw] md:max-w-5xl h-[82vh] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Chi tiết</DialogTitle>
          </DialogHeader>
          {/* External headings above each column */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 mb-1">
            <p className="text-sm text-muted-foreground">So sánh chi tiết chứng từ</p>
            <p className="text-sm text-muted-foreground">{previewKey ? 'Tài liệu gốc' : 'Quy tắc'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4" style={{ maxHeight: "calc(82vh - 120px)" }}>
            {/* Left: comparison table */}
            <div className="overflow-auto pr-1 rounded-lg border p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Hóa đơn</p>
                    <button type="button" className="text-muted-foreground text-xs underline" onClick={() => togglePreview('invoice')}>
                      {previewKey === 'invoice' ? 'Đóng' : 'Xem' }
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div id="cell-invoice-supplier"><ValueCell label="Nhà cung cấp" value={invoiceDoc?.extractedData?.supplier_name} highlight={focusedRuleKey === 'supplier'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <ValueCell label="Số hóa đơn" value={invoiceDoc?.extractedData?.invoice_number} />
                    <div id="cell-invoice-date"><ValueCell label="Ngày hóa đơn" value={invoiceDoc?.extractedData?.invoice_date || invoiceDoc?.extractedData?.date} highlight={focusedRuleKey === 'date'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-invoice-qty"><ValueCell label="Số lượng" value={invoiceDoc?.extractedData?.quantity} highlight={focusedRuleKey === 'quantity'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-invoice-total"><ValueCell label="Tổng tiền" value={invoiceDoc?.extractedData?.final_amount || invoiceDoc?.extractedData?.total_amount} highlight={focusedRuleKey === 'amount'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-invoice-tax"><ValueCell label="Thuế" value={invoiceDoc?.extractedData?.tax_amount || invoiceDoc?.extractedData?.tax} highlight={focusedRuleKey === 'calculation'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-invoice-subtotal"><ValueCell label="Tạm tính" value={invoiceDoc?.extractedData?.subtotal} highlight={focusedRuleKey === 'calculation'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Đơn đặt hàng</p>
                    <button type="button" className="text-muted-foreground text-xs underline" onClick={() => togglePreview('po')}>
                      {previewKey === 'po' ? 'Đóng' : 'Xem' }
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div id="cell-po-supplier"><ValueCell label="Nhà cung cấp" value={poDoc?.extractedData?.supplier_name} highlight={focusedRuleKey === 'supplier'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <ValueCell label="Số PO" value={poDoc?.extractedData?.po_number} />
                    <div id="cell-po-date"><ValueCell label="Ngày đặt" value={poDoc?.extractedData?.order_date || poDoc?.extractedData?.date} highlight={focusedRuleKey === 'date'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-po-total"><ValueCell label="Tổng tiền" value={poDoc?.extractedData?.total_amount} highlight={focusedRuleKey === 'amount'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <ValueCell label="Số lượng dự kiến" value={poDoc?.extractedData?.quantity} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Phiếu giao hàng</p>
                    <button type="button" className="text-muted-foreground text-xs underline" onClick={() => togglePreview('delivery')}>
                      {previewKey === 'delivery' ? 'Đóng' : 'Xem' }
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div id="cell-delivery-supplier"><ValueCell label="Nhà cung cấp" value={deliveryDoc?.extractedData?.supplier_name} highlight={focusedRuleKey === 'supplier'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <ValueCell label="Số phiếu" value={deliveryDoc?.extractedData?.delivery_number} />
                    <div id="cell-delivery-date"><ValueCell label="Ngày giao" value={deliveryDoc?.extractedData?.delivery_date || deliveryDoc?.extractedData?.date} highlight={focusedRuleKey === 'date'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                    <div id="cell-delivery-qty"><ValueCell label="Số lượng giao" value={deliveryDoc?.extractedData?.quantity} highlight={focusedRuleKey === 'quantity'} variant={focusedRuleFailed ? 'error' : 'focus'} /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: rules column or document preview */}
            <div className="overflow-auto pl-1 rounded-lg border p-3">
              {!previewKey ? (
              <div className="space-y-2">
                <button type="button" onClick={() => { setFocusedRuleKey('amount'); setFocusedRuleFailed(amountMismatch); focusAndScroll('cell-invoice-total'); }} className={`w-full text-left p-2.5 rounded-md ${conflictItemClasses(getResultStatusForKey('amount'), focusedRuleKey==='amount')}`}>
                  <p className="text-sm font-medium">Tổng tiền Hóa đơn vs Đơn đặt hàng</p>
                  <p className="text-sm">Hóa đơn: {(invoiceDoc?.extractedData?.final_amount ?? invoiceDoc?.extractedData?.total_amount) ?? "-"} | PO: {poDoc?.extractedData?.total_amount ?? "-"}</p>
                </button>
                {renderInlinePanel('amount')}
                <button type="button" onClick={() => { setFocusedRuleKey('supplier'); setFocusedRuleFailed(supplierMismatch); focusAndScroll('cell-invoice-supplier'); }} className={`w-full text-left p-2.5 rounded-md ${conflictItemClasses(getResultStatusForKey('supplier'), focusedRuleKey==='supplier')}`}>
                  <p className="text-sm font-medium">Tên nhà cung cấp nhất quán</p>
                  <p className="text-sm">Hóa đơn: {invoiceDoc?.extractedData?.supplier_name ?? "-"} | PO: {poDoc?.extractedData?.supplier_name ?? "-"} | Giao hàng: {deliveryDoc?.extractedData?.supplier_name ?? "-"}</p>
                </button>
                {renderInlinePanel('supplier')}
                <button type="button" onClick={() => { setFocusedRuleKey('date'); setFocusedRuleFailed(dateInvalid); focusAndScroll('cell-invoice-date'); }} className={`w-full text-left p-2.5 rounded-md ${conflictItemClasses(getResultStatusForKey('date'), focusedRuleKey==='date')}`}>
                  <p className="text-sm font-medium">Thứ tự ngày: Đơn hàng &lt; Giao hàng &lt; Hóa đơn</p>
                  <p className="text-sm">PO: {(poDoc?.extractedData?.order_date ?? poDoc?.extractedData?.date) ?? "-"} → Giao: {(deliveryDoc?.extractedData?.delivery_date ?? deliveryDoc?.extractedData?.date) ?? "-"} → Hóa đơn: {(invoiceDoc?.extractedData?.invoice_date ?? invoiceDoc?.extractedData?.date) ?? "-"}</p>
                </button>
                {renderInlinePanel('date')}
                <button type="button" onClick={() => { setFocusedRuleKey('quantity'); setFocusedRuleFailed(qtyMismatch); focusAndScroll('cell-invoice-qty'); }} className={`w-full text-left p-2.5 rounded-md ${conflictItemClasses(getResultStatusForKey('quantity'), focusedRuleKey==='quantity')}`}>
                  <p className="text-sm font-medium">Số lượng Hóa đơn vs Giao hàng</p>
                  <p className="text-sm">Hóa đơn: {invoiceDoc?.extractedData?.quantity ?? "-"} | Giao hàng: {deliveryDoc?.extractedData?.quantity ?? "-"}</p>
                </button>
                {renderInlinePanel('quantity')}
                <button type="button" onClick={() => { setFocusedRuleKey('calculation'); setFocusedRuleFailed(calcMismatch); focusAndScroll('cell-invoice-subtotal'); }} className={`w-full text-left p-2.5 rounded-md ${conflictItemClasses(getResultStatusForKey('calculation'), focusedRuleKey==='calculation')}`}>
                  <p className="text-sm font-medium">Thẩm định tính toán trên Hóa đơn</p>
                  <p className="text-sm">Tạm tính + Thuế = {Number(invoiceDoc?.extractedData?.subtotal || 0) + Number(invoiceDoc?.extractedData?.tax_amount || invoiceDoc?.extractedData?.tax || 0)} | Tổng: {(invoiceDoc?.extractedData?.final_amount ?? invoiceDoc?.extractedData?.total ?? invoiceDoc?.extractedData?.total_amount) ?? "-"}</p>
                </button>
                {renderInlinePanel('calculation')}
              </div>
              ) : (
                (() => {
                  const d = getDocByKey(previewKey);
                  const url = (d as any)?.fileUrl || (d as any)?.file_url || '';
                  return (
                    <div className="h-full w-full">
                      {url ? (
                        <iframe title="document-preview" src={url} className="w-full h-[70vh] rounded-md border" />
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có tệp để xem.</p>
                    )}
                  </div>
                  );
                })()
                )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={closeDetails}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
