import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, Settings, Upload, CheckCircle, ArrowRight } from "lucide-react";

const adminCards = [
  {
    icon: FileText,
    title: "Quản lý Biểu mẫu",
    description: "Khai báo loại chứng từ và trường thông tin",
    href: "/admin/templates",
    color: "text-chart-1",
  },
  {
    icon: LayoutDashboard,
    title: "Quản lý Bộ hồ sơ",
    description: "Nhóm các biểu mẫu thành bộ hồ sơ hoàn chỉnh",
    href: "/admin/document-sets",
    color: "text-chart-2",
  },
  {
    icon: Settings,
    title: "Quản lý Quy tắc",
    description: "Định nghĩa logic Thẩm định tự động",
    href: "/admin/rules",
    color: "text-chart-3",
  },
];

const accountantCards = [
  {
    icon: Upload,
    title: "Xử lý Hồ sơ",
    description: "Upload và xác minh thông tin chứng từ",
    href: "/process",
    color: "text-chart-4",
  },
  {
    icon: CheckCircle,
    title: "Kết quả Thẩm định",
    description: "Xem kết quả thẩm định và báo cáo",
    href: "/results",
    color: "text-chart-5",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Hệ thống Thẩm định Tài chính - Kế toán</h1>
        <p className="text-lg text-muted-foreground mt-3">
          Tự động hóa quy trình Thẩm định hồ sơ thanh toán, giảm 90% thời gian xử lý
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Tổng biểu mẫu</CardDescription>
            <CardTitle className="text-3xl font-mono">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Bộ hồ sơ</CardDescription>
            <CardTitle className="text-3xl font-mono">1</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Quy tắc Thẩm định</CardDescription>
            <CardTitle className="text-3xl font-mono">5</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quản trị viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-${card.href.replace(/\//g, '-')}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Kế toán viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accountantCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-${card.href.replace(/\//g, '-')}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
