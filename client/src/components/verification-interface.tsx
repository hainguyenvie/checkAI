import { useState } from "react";
import { DocumentViewer } from "./document-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const mockExtractedData = {
  supplier_name: "Công ty TNHH ABC",
  invoice_number: "INV-2024-001",
  invoice_date: "2024-01-15",
  total_amount: "50000000",
  tax_amount: "5000000",
  final_amount: "55000000",
};

export function VerificationInterface() {
  const [data, setData] = useState(mockExtractedData);
  const [verified, setVerified] = useState(false);

  const updateField = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerify = () => {
    setVerified(true);
    console.log("Data verified:", data);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-3">
        <DocumentViewer fileName="hoa-don-gtgt.pdf" fileType="pdf" />
      </div>
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Thông tin đã trích xuất</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Tên nhà cung cấp</Label>
              <Input
                id="supplier_name"
                value={data.supplier_name}
                onChange={(e) => updateField("supplier_name", e.target.value)}
                data-testid="input-supplier-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Số hóa đơn</Label>
              <Input
                id="invoice_number"
                value={data.invoice_number}
                onChange={(e) => updateField("invoice_number", e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Ngày hóa đơn</Label>
              <Input
                id="invoice_date"
                type="date"
                value={data.invoice_date}
                onChange={(e) => updateField("invoice_date", e.target.value)}
                data-testid="input-invoice-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Tổng tiền hàng</Label>
              <Input
                id="total_amount"
                type="number"
                value={data.total_amount}
                onChange={(e) => updateField("total_amount", e.target.value)}
                className="font-mono"
                data-testid="input-total-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_amount">Thuế GTGT</Label>
              <Input
                id="tax_amount"
                type="number"
                value={data.tax_amount}
                onChange={(e) => updateField("tax_amount", e.target.value)}
                className="font-mono"
                data-testid="input-tax-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="final_amount">Tổng thanh toán</Label>
              <Input
                id="final_amount"
                type="number"
                value={data.final_amount}
                onChange={(e) => updateField("final_amount", e.target.value)}
                className="font-mono"
                data-testid="input-final-amount"
              />
            </div>
          </CardContent>
          <div className="border-t p-4">
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={verified}
              data-testid="button-verify"
            >
              {verified ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đã xác nhận
                </>
              ) : (
                "Xác nhận thông tin"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
