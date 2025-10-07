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

  async function handleGenerateRules() {
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
      setGenerated(finalData);
      setRules(finalData.rules);
      setEditingIndex(null);
    } catch (e) {
      const fallback = { rules: [
        { name: 'Đối chiếu tổng tiền', description: 'Hóa đơn = PO', ruleType: 'amount_comparison', fields: [
          { templateName: 'Hóa đơn GTGT', fieldName: 'final_amount' },
          { templateName: 'Đơn đặt hàng', fieldName: 'total_amount' },
        ], condition: { equals: ['final_amount','total_amount'] } }
      ]};
      setGenerated(fallback);
      setRules(fallback.rules);
      setEditingIndex(null);
    }
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
    if (n.includes('supplier')) return 'Công ty TNHH ABC';
    if (n.includes('invoice_number') || n.includes('po_number') || n.includes('delivery_number')) return 'INV-2024-001';
    if (n.includes('date')) return '2024-01-15';
    if (n.includes('total') || n.includes('amount') || n.includes('subtotal') || n.includes('tax')) return 12345678;
    if (field?.fieldType === 'number') return 100;
    return field?.label || field?.name || `value-${index}`;
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
                <Button onClick={handleGenerateRules}>Generate quy tắc</Button>
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

              {/* visualization */}
              {rules && rules.length > 0 && (
                <div className="space-y-3">
                  {rules.map((r:any, idx:number)=> (
                    <div key={idx} className="p-3 rounded-md border">
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
                          <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-full border">{`${f.templateName}.${f.fieldName}`}</span>
                        ))}
                      </div>

                      {/* Document comparison visualization */}
                      {(() => {
                        const ValueCell = ({ label, value, highlight=false }: any) => (
                          <div className={`p-2 rounded-md border ${highlight ? 'bg-chart-2/10 border-chart-2 ring-1 ring-chart-2/50' : 'bg-muted/40'}`}>
                            <p className="text-[11px] text-muted-foreground">{label}</p>
                            <p className="font-mono text-xs break-all">{String(value ?? '-')}</p>
                          </div>
                        );

                        // dynamic columns using selected templates (same as step 2)
                        const sel = getSelectedTemplates();
                        const cols = sel.map((t:any) => {
                          const doc = findDocForTemplate(t.id);
                          const data = doc?.extractedData || {};
                          return { t, doc, data };
                        });
                        const hl = (t:any, field:any) => (r.fields||[]).some((f:any)=> (f.templateName||'').toLowerCase().includes((t.name||'').toLowerCase()) && (f.fieldName||'')===field.name);

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {cols.map(({t, doc, data}: any, cidx: number) => (
                              <div key={t.id}>
                                <p className="font-medium mb-2">{t.name}</p>
                                <div className="space-y-2">
                                  {(Array.isArray(t.fields)? t.fields : []).map((f:any, findex:number)=> (
                                    <ValueCell key={`${t.id}-${f.name}`} label={`${f.label}`} value={(data[f.name] ?? mockValue(f, findex))} highlight={hl(t, f)} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
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
