import { useState, useEffect } from "react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Upload, CheckCircle2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProcessPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"upload" | "select">("upload");
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [dossierName, setDossierName] = useState("");
  const [dossierPurpose, setDossierPurpose] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [confirmedDocs, setConfirmedDocs] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string }>>([]);
  const [confirmedUploads, setConfirmedUploads] = useState<Record<string, boolean>>({});
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; description: string } | null>(null);
  const [currentRule, setCurrentRule] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: documentSets = [] } = useQuery({
    queryKey: ["/api/document-sets"],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  const { data: stepDocs = [] } = useQuery({
    queryKey: ["/api/documents", selectedSetId],
    enabled: !!selectedSetId,
  });

  useEffect(() => {
    if (documentSets.length > 0 && !selectedSetId) {
      setSelectedSetId(documentSets[0].id);
    }
  }, [documentSets, selectedSetId]);

  async function handleGenerateRule() {
    setIsCreating(true);
    try {
      const payload = {
        prompt,
        templates: (templates as any[]).filter((t:any)=> selectedTemplateIds.includes(t.id)).map((t:any)=> ({
          id: t.id,
          name: t.name,
          fields: t.fields,
        })),
      };
      const res = await fetch('/api/rules/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      let finalData = data && Array.isArray(data.rules) && data.rules.length ? data : { rules: [
        { name: 'Tên nhà cung cấp nhất quán', description: 'Tên supplier khớp giữa các biểu mẫu', ruleType: 'supplier_verification', fields: [
          { templateName: 'Hóa đơn GTGT', fieldName: 'supplier_name' },
          { templateName: 'Đơn đặt hàng', fieldName: 'supplier_name' },
          { templateName: 'Phiếu giao hàng', fieldName: 'supplier_name' },
        ], condition: { equalsAll: ['supplier_name'] } }
      ]};
      setCurrentRule(finalData.rules[0]);
      setPrompt(""); // Clear prompt after generating
    } catch (e) {
      const fallback = { rules: [
        { name: 'Đối chiếu tổng tiền', description: 'Hóa đơn = PO', ruleType: 'amount_comparison', fields: [
          { templateName: 'Hóa đơn GTGT', fieldName: 'final_amount' },
          { templateName: 'Đơn đặt hàng', fieldName: 'total_amount' },
        ], condition: { equals: ['final_amount','total_amount'] } }
      ]};
      setCurrentRule(fallback.rules[0]);
      setPrompt("");
    } finally {
      setIsCreating(false);
    }
  }

  function saveCurrentRule() {
    if (currentRule) {
      setRules(prev => [...prev, currentRule]);
      setCurrentRule(null);
      setPrompt("");
    }
  }

  function discardCurrentRule() {
    setCurrentRule(null);
    setPrompt("");
  }

  function startNewRule() {
    setCurrentRule(null);
    setPrompt("");
  }

  function startEditRule(idx: number) {
    const r = rules[idx];
    setEditingIndex(idx);
    setEditDraft({ name: r.name || '', description: r.description || '' });
  }

  function saveEditRule() {
    if (editingIndex === null || !editDraft) return;
    const next = [...rules];
    next[editingIndex] = { ...next[editingIndex], name: editDraft.name, description: editDraft.description };
    setRules(next);
    setEditingIndex(null);
  }

  function deleteRule(idx: number) {
    const next = rules.filter((_, i) => i !== idx);
    setRules(next);
  }

  function getSelectedTemplates() {
    return (templates as any[]).filter((t:any)=> selectedTemplateIds.includes(t.id));
  }

  function findDocForTemplate(tid: string) {
    return (stepDocs as any[]).find((d:any)=> d.templateId === tid) || null;
  }

  function mockValue(field: any, index: number) {
    const n = (field?.name || '').toLowerCase();
    const l = (field?.label || '').toLowerCase();
    
    // Supplier related
    if (n.includes('supplier') || l.includes('nhà cung cấp') || l.includes('supplier')) {
      return 'Công ty TNHH ABC';
    }
    
    // Document numbers
    if (n.includes('invoice_number') || l.includes('số hóa đơn')) return 'INV-2024-001';
    if (n.includes('po_number') || l.includes('số po') || l.includes('số đơn đặt hàng')) return 'PO-2024-888';
    if (n.includes('delivery_number') || l.includes('số phiếu giao') || l.includes('số giao hàng')) return 'DL-2024-015';
    
    // Dates
    if (n.includes('date') || l.includes('ngày')) return '2024-01-15';
    
    // Amounts and money
    if (n.includes('total_amount') || l.includes('tổng tiền') || l.includes('tổng giá trị')) return 49500000;
    if (n.includes('final_amount') || l.includes('tổng thanh toán') || l.includes('thành tiền')) return 50000000;
    if (n.includes('subtotal') || l.includes('tạm tính') || l.includes('tiền hàng')) return 45000000;
    if (n.includes('tax') || l.includes('thuế') || l.includes('vat')) return 4500000;
    if (n.includes('amount') || l.includes('số tiền')) return 12345678;
    
    // Quantities
    if (n.includes('quantity') || l.includes('số lượng')) return 100;
    
    // Address
    if (n.includes('address') || l.includes('địa chỉ')) return '123 Đường ABC, Quận 1, TP.HCM';
    
    // Phone
    if (n.includes('phone') || l.includes('số điện thoại')) return '0901234567';
    
    // Email
    if (n.includes('email') || l.includes('thư điện tử')) return 'contact@company.com';
    
    // Default fallbacks
    if (field?.fieldType === 'number') return Math.floor(Math.random() * 1000) + 1;
    if (field?.fieldType === 'date') return '2024-01-15';
    if (field?.fieldType === 'email') return 'user@example.com';
    
    return field?.label || field?.name || `Mock ${index + 1}`;
  }

  // Enhanced mock data for better visualization
  function getEnhancedMockData(templateId: string, fieldName: string) {
    const template = (templates as any[]).find(t => t.id === templateId);
    const templateName = (template?.name || '').toLowerCase();
    
    // Invoice specific data
    if (templateName.includes('hóa đơn') || templateName.includes('invoice')) {
      const mockInvoice = {
        supplier_name: 'Công ty TNHH ABC',
        supplier_address: '123 Đường ABC, Quận 1, TP.HCM',
        supplier_phone: '0901234567',
        supplier_email: 'contact@abc.com',
        customer_name: 'Công ty XYZ',
        customer_address: '456 Đường XYZ, Quận 3, TP.HCM',
        invoice_number: 'INV-2024-001',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        subtotal: 45000000,
        tax_rate: 10,
        tax_amount: 4500000,
        discount: 0,
        final_amount: 49500000,
        currency: 'VND',
        payment_method: 'Chuyển khoản',
        quantity: 100,
        unit_price: 450000,
        description: 'Dịch vụ tư vấn kế toán',
        notes: 'Thanh toán trong 30 ngày',
      };
      return mockInvoice[fieldName] || 'N/A';
    }
    
    // Purchase Order specific data
    if (templateName.includes('đơn đặt hàng') || templateName.includes('purchase order') || templateName.includes('po')) {
      const mockPO = {
        supplier_name: 'Công ty TNHH ABC',
        supplier_address: '123 Đường ABC, Quận 1, TP.HCM',
        supplier_phone: '0901234567',
        buyer_name: 'Công ty XYZ',
        buyer_address: '456 Đường XYZ, Quận 3, TP.HCM',
        po_number: 'PO-2024-888',
        order_date: '2024-01-10',
        delivery_date: '2024-01-20',
        total_amount: 49500000,
        currency: 'VND',
        quantity: 100,
        unit_price: 495000,
        description: 'Đơn đặt hàng dịch vụ tư vấn',
        terms: 'Giao hàng trong 10 ngày',
        authorized_by: 'Nguyễn Văn A',
        approved_by: 'Trần Thị B',
      };
      return mockPO[fieldName] || 'N/A';
    }
    
    // Delivery Note specific data
    if (templateName.includes('phiếu giao hàng') || templateName.includes('delivery')) {
      const mockDelivery = {
        supplier_name: 'Công ty TNHH ABC',
        supplier_address: '123 Đường ABC, Quận 1, TP.HCM',
        customer_name: 'Công ty XYZ',
        customer_address: '456 Đường XYZ, Quận 3, TP.HCM',
        delivery_number: 'DL-2024-015',
        delivery_date: '2024-01-12',
        po_number: 'PO-2024-888',
        invoice_number: 'INV-2024-001',
        quantity: 98,
        unit_price: 495000,
        total_value: 48510000,
        driver_name: 'Lê Văn C',
        driver_phone: '0907654321',
        vehicle_number: '51A-12345',
        delivery_address: '456 Đường XYZ, Quận 3, TP.HCM',
        received_by: 'Phạm Thị D',
        notes: 'Giao hàng đúng hạn, khách hàng hài lòng',
      };
      return mockDelivery[fieldName] || 'N/A';
    }
    
    return 'N/A';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Xây dựng bộ hồ sơ thẩm định</h1>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1,2,3].map((s) => (
          <div key={s} className={`p-3 rounded-md border ${step===s? 'bg-primary/5 border-primary' : 'bg-muted/40'}`}>
            <div className="flex items-center gap-2">
              {step> s ? <CheckCircle2 className="w-4 h-4 text-chart-2"/> : <FileText className="w-4 h-4 text-muted-foreground"/>}
              <p className="text-sm font-medium">{s===1? 'Bước 1 · Ingest biểu mẫu' : s===2? 'Bước 2 · Khai báo bộ hồ sơ' : 'Bước 3 · Khai báo quy tắc'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Ingest (upload and select can be done concurrently) */}
      {step===1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bộ hồ sơ</CardTitle>
              <CardDescription>Điền tên và mục đích thẩm định</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dossier-name">Tên bộ hồ sơ</Label>
                <Input id="dossier-name" value={dossierName} onChange={(e)=>setDossierName(e.target.value)} placeholder="VD: Tháng 08/2025 - NCC ABC"/>
              </div>
              <div>
                <Label htmlFor="dossier-purpose">Mục đích</Label>
                <Input id="dossier-purpose" value={dossierPurpose} onChange={(e)=>setDossierPurpose(e.target.value)} placeholder="VD: Thẩm định thanh toán PO-2023-888"/>
              </div>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
              <CardTitle>Ingest biểu mẫu</CardTitle>
              <CardDescription>Có thể đồng thời đẩy file lên và/hoặc chọn biểu mẫu sẵn có</CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-2">Đẩy file lên để trích xuất</p>
                  <FileUploadZone documentSetId={selectedSetId} onUploadComplete={()=>{}} onFilesChange={(fs:any)=> setUploadedFiles((fs||[]).map((x:any)=> ({ id: x.id, name: x.name })))} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Chọn biểu mẫu sẵn có</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(templates as any[]).map((t:any)=> (
                      <label key={t.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <Checkbox checked={selectedTemplateIds.includes(t.id)} onCheckedChange={(v:any)=>{
                          setSelectedTemplateIds((prev)=> v? [...prev, t.id] : prev.filter(x=>x!==t.id));
                        }}/>
                        <span className="text-sm">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={()=>setStep(2)}>
                  Xác nhận và tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      )}

      {/* Step 2: Configure dossier */}
      {step===2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" onClick={()=>setStep(1)}><Upload className="w-4 h-4 mr-2"/>Quay lại bước 1</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cấu trúc bộ hồ sơ</CardTitle>
              <CardDescription>Kiểm tra tên/mục đích và duyệt danh sách biểu mẫu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border bg-muted/40">
                  <p className="text-xs text-muted-foreground">Tên bộ hồ sơ</p>
                  <p className="font-medium">{dossierName || 'Chưa đặt tên'}</p>
                </div>
                <div className="p-3 rounded-md border bg-muted/40">
                  <p className="text-xs text-muted-foreground">Mục đích</p>
                  <p className="font-medium">{dossierPurpose || 'Chưa nhập'}</p>
                </div>
              </div>
              <div className="p-3 rounded-md border bg-muted/40">
                <p className="text-xs text-muted-foreground mb-2">Biểu mẫu và trường thông tin</p>
                <Accordion type="multiple" className="w-full">
                  {((templates as any[]).filter((t:any)=> selectedTemplateIds.includes(t.id))).map((t:any)=> {
                    const doc = (stepDocs as any[]).find((d:any)=> d.templateId === t.id) || null;
                    const extracted = doc?.extractedData || {};
                    return (
                      <AccordionItem key={t.id} value={`tpl-${t.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full border text-chart-2 border-chart-2/60">đã chọn</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="rounded-md border p-2">
                            <p className="text-xs text-muted-foreground mb-2">Trường thông tin</p>
                            <div className="grid md:grid-cols-2 gap-2">
                              {(Array.isArray(t.fields)? t.fields : []).map((f:any, idx:number)=> {
                                const value = extracted[f.name] ?? '';
                                return (
                                  <div key={idx} className="p-2 rounded-md border bg-muted/40">
                                    <p className="text-xs text-muted-foreground mb-1">{f.label} ({f.name})</p>
                                    <p className="text-xs font-mono break-all">{String(value || '-')}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">Kiểu: {f.fieldType}{f.required? ' · bắt buộc':''}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              <div className="p-3 rounded-md border bg-muted/40">
                <p className="text-xs text-muted-foreground mb-2">Tài liệu đã tải lên</p>
                <Accordion type="multiple" className="w-full">
                  {uploadedFiles.map((f:any)=> {
                    const isConfirmed = !!confirmedUploads[f.id];
                    // Chọn một template đại diện để render mock fields
                    const primaryTemplate = (templates as any[]).find((t:any)=> selectedTemplateIds.includes(t.id)) || (templates as any[])[0];
                    const fields = (primaryTemplate?.fields || []) as any[];
                    return (
                      <AccordionItem key={f.id} value={`upload-${f.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{f.name}</span>
                            </div>
                            <Button size="sm" variant={isConfirmed? 'outline' : 'default'} onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setConfirmedUploads((prev)=> ({ ...prev, [f.id]: true })); }}>
                              {isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
            </Button>
          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-3">
                            <div className="rounded-md border p-2">
                              <p className="text-xs text-muted-foreground mb-2">Tài liệu gốc</p>
                              <div className="w-full h-[320px] rounded-md border bg-muted/40">
                                <iframe title={`doc-preview-${f.id}`} src={'/uploads/mock.pdf'} className="w-full h-full rounded-md" />
                              </div>
                            </div>
                            <div className="rounded-md border p-2">
                              <p className="text-xs text-muted-foreground mb-2">Thông tin đã trích xuất (mock)</p>
                              <div className="grid md:grid-cols-2 gap-2">
                                {fields.map((fi:any, idx:number)=> {
                                  const value = (idx===0? 'Công ty TNHH ABC' : idx===1? 'INV-2024-001' : idx===2? '2024-01-15' : idx===3? 45000000 : idx===4? 4500000 : idx===5? 49500000 : '');
                                  return (
                                    <div key={idx} className="p-2 rounded-md border bg-muted/40">
                                      <p className="text-xs text-muted-foreground mb-1">{fi.label} ({fi.name})</p>
                                      <p className="text-xs font-mono break-all">{String(value || '-')}</p>
                                      <div className="mt-2 flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Kiểu: {fi.fieldType}{fi.required? ' · bắt buộc':''}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
              <div className="flex justify-end">
                <Button onClick={()=>setStep(3)}>
                  Tiếp theo: Quy tắc
                  <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Rules */}
      {step===3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" onClick={()=>setStep(2)}><Upload className="w-4 h-4 mr-2"/>Quay lại bước 2</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Tạo quy tắc từ prompt</CardTitle>
              <CardDescription>Nhập yêu cầu tự nhiên, hệ thống sẽ gợi ý các rule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* prompt input */}
              <textarea className="w-full h-32 p-3 rounded-md border font-mono text-sm text-black" placeholder="Ví dụ: Trường Tổng kinh phí trong biểu mẫu A phải bằng tổng của các trường Chi phí nhân sự + Chi phí thiết bị trong biểu mẫu B." id="prompt-input" value={prompt} onChange={(e)=> setPrompt(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button onClick={handleGenerateRule} disabled={!prompt.trim() || isCreating}>
                  {isCreating ? "Đang tạo..." : "Generate quy tắc"}
                </Button>
                {currentRule && (
                  <>
                    <Button onClick={saveCurrentRule} variant="default">
                      Lưu quy tắc
                    </Button>
                    <Button onClick={discardCurrentRule} variant="outline">
                      Xóa và tạo mới
                    </Button>
                  </>
                )}
                {!currentRule && rules.length > 0 && (
                  <Button onClick={startNewRule} variant="outline">
                    Tạo quy tắc mới
                  </Button>
                )}
              </div>

              {/* suggestions from templates */}
              <div className="p-3 rounded-md border bg-muted/40">
                <p className="text-sm font-medium mb-2">Gợi ý nhanh (từ biểu mẫu đã chọn)</p>
                <div className="grid md:grid-cols-2 gap-2">
                  <button type="button" className="p-2 rounded-md border text-left hover:bg-muted" onClick={()=> setPrompt("Đối chiếu tổng tiền trên Hóa đơn bằng tổng trên Đơn đặt hàng")}>Đối chiếu tổng tiền Hóa đơn = Tổng PO</button>
                  <button type="button" className="p-2 rounded-md border text-left hover:bg-muted" onClick={()=> setPrompt("Số lượng trên Hóa đơn phải bằng số lượng trên Phiếu giao hàng")}>Số lượng Hóa đơn = Số lượng Giao hàng</button>
                  <button type="button" className="p-2 rounded-md border text-left hover:bg-muted" onClick={()=> setPrompt("Tên nhà cung cấp phải nhất quán giữa các biểu mẫu")}>Tên nhà cung cấp nhất quán</button>
                </div>
              </div>

              {/* Current rule preview */}
              {currentRule && (
                <div className="p-4 rounded-md border bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-blue-900">Quy tắc đang tạo</h4>
                      <p className="text-sm text-blue-700">{currentRule.name || 'Rule mới'}</p>
                      {currentRule.description && (
                        <p className="text-xs text-blue-600 mt-1">{currentRule.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveCurrentRule}>Lưu quy tắc</Button>
                      <Button size="sm" variant="outline" onClick={discardCurrentRule}>Xóa</Button>
                    </div>
                  </div>
                  
                  {/* Field chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(currentRule.fields||[]).map((f:any, i:number)=> (
                      <span key={i} className="text-xs font-mono px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        {`${f.templateName}.${f.fieldName}`}
                      </span>
                    ))}
                  </div>

                  {/* Enhanced visualization with better mock data */}
                  {(() => {
                    const ValueCell = ({ label, value, highlight=false }: any) => (
                      <div className={`p-2 rounded-md border ${highlight ? 'bg-chart-2/20 border-chart-2 ring-2 ring-chart-2/60' : 'bg-white'}`}>
                        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                        <p className="font-mono text-xs break-all text-gray-900">{String(value ?? '-')}</p>
                      </div>
                    );

                    const sel = getSelectedTemplates();
                    const cols = sel.map((t:any) => {
                      const doc = findDocForTemplate(t.id);
                      const data = doc?.extractedData || {};
                      return { t, doc, data };
                    });
                    const hl = (t:any, field:any) => (currentRule.fields||[]).some((f:any)=> (f.templateName||'').toLowerCase().includes((t.name||'').toLowerCase()) && (f.fieldName||'')===field.name);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cols.map(({t, doc, data}: any, cidx: number) => (
                          <div key={t.id} className="bg-white rounded-md border p-3">
                            <p className="font-medium mb-3 text-gray-900">{t.name}</p>
                            <div className="space-y-2">
                              {(Array.isArray(t.fields)? t.fields : []).map((f:any, findex:number)=> {
                                const enhancedValue = getEnhancedMockData(t.id, f.name);
                                const displayValue = data[f.name] ?? enhancedValue;
                                return (
                                  <ValueCell 
                                    key={`${t.id}-${f.name}`} 
                                    label={f.label} 
                                    value={displayValue} 
                                    highlight={hl(t, f)} 
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Saved rules */}
              {rules && rules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Quy tắc đã lưu ({rules.length})</h4>
                  {rules.map((r:any, idx:number)=> (
                    <div key={idx} className="p-3 rounded-md border bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {editingIndex === idx ? (
                            <div className="space-y-2">
                              <input className="w-full px-2 py-1 rounded border text-sm" value={editDraft?.name||''} onChange={(e)=> setEditDraft(d=> ({ ...(d||{name:'',description:''}), name: e.target.value }))} />
                              <input className="w-full px-2 py-1 rounded border text-sm" value={editDraft?.description||''} onChange={(e)=> setEditDraft(d=> ({ ...(d||{name:'',description:''}), description: e.target.value }))} />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={saveEditRule}>Lưu</Button>
                                <Button size="sm" variant="outline" onClick={()=> setEditingIndex(null)}>Hủy</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-medium">{r.name || `Rule ${idx+1}`}</p>
                              {r.description && <p className="text-xs text-muted-foreground mb-2">{r.description}</p>}
                            </>
                          )}
                        </div>
                        {editingIndex !== idx && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={()=> startEditRule(idx)}>Sửa</Button>
                            <Button size="sm" variant="destructive" onClick={()=> deleteRule(idx)}>Xóa</Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(r.fields||[]).map((f:any, i:number)=> (
                          <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-full border bg-gray-200">{`${f.templateName}.${f.fieldName}`}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
