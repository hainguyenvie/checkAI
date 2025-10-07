import { storage } from "./storage";

export async function seedData() {
  // Create templates
  const invoiceTemplate = await storage.createTemplate({
    name: "Hóa đơn GTGT",
    description: "Hóa đơn giá trị gia tăng",
    fields: [
      { name: "supplier_name", label: "Tên nhà cung cấp", fieldType: "text", required: true },
      { name: "invoice_number", label: "Số hóa đơn", fieldType: "text", required: true },
      { name: "invoice_date", label: "Ngày hóa đơn", fieldType: "date", required: true },
      { name: "subtotal", label: "Tiền hàng", fieldType: "number", required: true },
      { name: "tax_amount", label: "Thuế GTGT", fieldType: "number", required: true },
      { name: "final_amount", label: "Tổng thanh toán", fieldType: "number", required: true },
      { name: "quantity", label: "Số lượng", fieldType: "number", required: false },
    ]
  });

  const poTemplate = await storage.createTemplate({
    name: "Đơn đặt hàng",
    description: "Purchase Order (PO)",
    fields: [
      { name: "supplier_name", label: "Tên nhà cung cấp", fieldType: "text", required: true },
      { name: "po_number", label: "Số đơn hàng", fieldType: "text", required: true },
      { name: "order_date", label: "Ngày đặt hàng", fieldType: "date", required: true },
      { name: "total_amount", label: "Tổng giá trị", fieldType: "number", required: true },
      { name: "quantity", label: "Số lượng", fieldType: "number", required: false },
    ]
  });

  const deliveryTemplate = await storage.createTemplate({
    name: "Phiếu giao hàng",
    description: "Delivery Note",
    fields: [
      { name: "supplier_name", label: "Tên nhà cung cấp", fieldType: "text", required: true },
      { name: "delivery_number", label: "Số phiếu giao", fieldType: "text", required: true },
      { name: "delivery_date", label: "Ngày giao hàng", fieldType: "date", required: true },
      { name: "quantity", label: "Số lượng thực nhận", fieldType: "number", required: true },
    ]
  });

  // Create document set
  const documentSet = await storage.createDocumentSet({
    name: "Bộ hồ sơ Thanh toán Nhà cung cấp",
    description: "Bộ hồ sơ hoàn chỉnh cho thanh toán nhà cung cấp",
    templateIds: [invoiceTemplate.id, poTemplate.id, deliveryTemplate.id]
  });

  // Create rules
  await storage.createRule({
    documentSetId: documentSet.id,
    name: "Đối chiếu tổng tiền",
    description: "So sánh tổng tiền thanh toán trên Hóa đơn với tổng giá trị trên Đơn đặt hàng",
    ruleType: "amount_comparison",
    condition: {}
  });

  await storage.createRule({
    documentSetId: documentSet.id,
    name: "Xác thực nhà cung cấp",
    description: "Đảm bảo tên nhà cung cấp khớp nhau trên các chứng từ",
    ruleType: "supplier_verification",
    condition: {}
  });

  await storage.createRule({
    documentSetId: documentSet.id,
    name: "Kiểm tra dòng thời gian",
    description: "Xác minh tính hợp lệ của ngày tháng (ngày hóa đơn phải sau ngày giao hàng, ngày giao hàng phải sau ngày đặt hàng)",
    ruleType: "date_validation",
    condition: {}
  });

  await storage.createRule({
    documentSetId: documentSet.id,
    name: "Đối chiếu số lượng",
    description: "So sánh số lượng hàng trên hóa đơn với số lượng thực nhận trên phiếu giao hàng",
    ruleType: "quantity_comparison",
    condition: {}
  });

  await storage.createRule({
    documentSetId: documentSet.id,
    name: "Kiểm tra tính toán",
    description: "Xác thực các phép tính ngay trên một chứng từ (tiền hàng + thuế GTGT = tổng tiền thanh toán)",
    ruleType: "calculation_check",
    condition: {}
  });

  console.log("✅ Seeded templates, document set, and rules");
  
  return {
    invoiceTemplate,
    poTemplate,
    deliveryTemplate,
    documentSet
  };
}
