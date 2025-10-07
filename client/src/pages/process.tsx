import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { VerificationInterface } from "@/components/verification-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Upload } from "lucide-react";

export default function ProcessPage() {
  const [step, setStep] = useState<"upload" | "verify">("upload");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Xử lý Hồ sơ</h1>
        <p className="text-muted-foreground mt-2">
          Tải lên chứng từ, trích xuất và xác minh thông tin
        </p>
      </div>

      {step === "upload" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chọn bộ hồ sơ</CardTitle>
              <CardDescription>Chọn loại bộ hồ sơ cần xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-primary/5 border-primary/20">
                <p className="font-medium">Bộ hồ sơ Thanh toán Nhà cung cấp</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Yêu cầu: Hóa đơn GTGT, Đơn đặt hàng, Phiếu giao hàng
                </p>
              </div>
            </CardContent>
          </Card>

          <FileUploadZone />

          <div className="flex justify-end">
            <Button onClick={() => setStep("verify")} data-testid="button-next-verify">
              Tiếp tục xác minh
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => setStep("upload")}
              data-testid="button-back-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              Quay lại upload
            </Button>
          </div>
          <VerificationInterface />
        </>
      )}
    </div>
  );
}
