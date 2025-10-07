import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { insertTemplateSchema, insertDocumentSetSchema, insertRuleSchema } from "@shared/schema";
import OpenAI from "openai";
import fs from "fs/promises";
import { PDFExtract } from "pdf.js-extract";
import { seedData } from "./seed";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let isSeeded = false;

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data
  if (!isSeeded) {
    await seedData();
    isSeeded = true;
  }

  // Templates API
  app.get("/api/templates", async (req, res) => {
    const templates = await storage.getAllTemplates();
    res.json(templates);
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const data = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(data);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    const template = await storage.updateTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  });

  app.delete("/api/templates/:id", async (req, res) => {
    const deleted = await storage.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ success: true });
  });

  // Document Sets API
  app.get("/api/document-sets", async (req, res) => {
    const sets = await storage.getAllDocumentSets();
    res.json(sets);
  });

  app.post("/api/document-sets", async (req, res) => {
    try {
      const data = insertDocumentSetSchema.parse(req.body);
      const documentSet = await storage.createDocumentSet(data);
      res.json(documentSet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/document-sets/:id", async (req, res) => {
    const documentSet = await storage.updateDocumentSet(req.params.id, req.body);
    if (!documentSet) {
      return res.status(404).json({ error: "Document set not found" });
    }
    res.json(documentSet);
  });

  app.delete("/api/document-sets/:id", async (req, res) => {
    const deleted = await storage.deleteDocumentSet(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Document set not found" });
    }
    res.json({ success: true });
  });

  // Rules API
  app.get("/api/rules", async (req, res) => {
    const { documentSetId } = req.query;
    if (documentSetId) {
      const rules = await storage.getRulesByDocumentSet(documentSetId as string);
      res.json(rules);
    } else {
      res.status(400).json({ error: "documentSetId is required" });
    }
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const data = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(data);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/rules/:id", async (req, res) => {
    const rule = await storage.updateRule(req.params.id, req.body);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  });

  app.delete("/api/rules/:id", async (req, res) => {
    const deleted = await storage.deleteRule(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json({ success: true });
  });

  // Document Upload & Extraction API
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { documentSetId, templateId } = req.body;
      if (!documentSetId || !templateId) {
        return res.status(400).json({ error: "documentSetId and templateId are required" });
      }

      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const fileType = path.extname(req.file.originalname).toLowerCase();

      // Extract text from document
      let extractedText = "";
      if (fileType === ".pdf") {
        const pdfExtract = new PDFExtract();
        const data = await pdfExtract.extract(req.file.path, {});
        extractedText = data.pages.map(page => 
          page.content.map(item => item.str).join(" ")
        ).join("\n");
      } else if (fileType === ".txt") {
        extractedText = await fs.readFile(req.file.path, "utf-8");
      }

      // Use OpenAI to extract structured data based on template fields
      const fields = (template.fields as any[]) || [];
      const fieldDescriptions = fields.map(f => 
        `${f.name} (${f.label}): ${f.fieldType} ${f.required ? '(required)' : ''}`
      ).join("\n");

      const prompt = `Extract the following information from this document text and return as JSON:

Fields to extract:
${fieldDescriptions}

Document text:
${extractedText}

Return ONLY a JSON object with the field names as keys and extracted values. If a field is not found, use null.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a document data extraction expert. Extract structured data from documents and return it as JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const extractedData = JSON.parse(response.choices[0].message.content || "{}");

      // Create document record
      const document = await storage.createDocument({
        documentSetId,
        templateId,
        fileName: req.file.originalname,
        fileType,
        fileUrl,
        extractedData,
        verified: "false"
      });

      res.json(document);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Documents API
  app.get("/api/documents", async (req, res) => {
    const { documentSetId } = req.query;
    if (documentSetId) {
      const documents = await storage.getDocumentsBySet(documentSetId as string);
      res.json(documents);
    } else {
      res.status(400).json({ error: "documentSetId is required" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    const document = await storage.updateDocument(req.params.id, req.body);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(document);
  });

  // Verification Engine API
  app.post("/api/verify/:documentSetId", async (req, res) => {
    try {
      const { documentSetId } = req.params;
      
      const rules = await storage.getRulesByDocumentSet(documentSetId);
      const documents = await storage.getDocumentsBySet(documentSetId);

      if (documents.length === 0) {
        return res.status(400).json({ error: "No documents to verify" });
      }

      const results = [];

      for (const rule of rules) {
        const result = await evaluateRule(rule, documents);
        const verificationResult = await storage.createVerificationResult({
          documentSetId,
          ruleId: rule.id,
          status: result.status,
          message: result.message,
          details: result.details
        });
        results.push(verificationResult);
      }

      res.json(results);
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/verification-results/:documentSetId", async (req, res) => {
    const results = await storage.getVerificationResults(req.params.documentSetId);
    res.json(results);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Rule evaluation engine
async function evaluateRule(rule: any, documents: any[]): Promise<{
  status: string;
  message: string;
  details: any;
}> {
  const condition = rule.condition as any;
  const ruleType = rule.ruleType;

  // Build document data map
  const docData: Record<string, any> = {};
  for (const doc of documents) {
    const template = await storage.getTemplate(doc.templateId);
    if (template) {
      docData[template.name.toLowerCase().replace(/\s+/g, '_')] = doc.extractedData;
    }
  }

  try {
    switch (ruleType) {
      case "amount_comparison": {
        const invoice = docData['hóa_đơn_gtgt'] || docData['invoice'];
        const po = docData['đơn_đặt_hàng'] || docData['purchase_order'];
        
        if (!invoice || !po) {
          return {
            status: "failed",
            message: "Missing required documents for comparison",
            details: { available: Object.keys(docData) }
          };
        }

        const invoiceAmount = parseFloat(invoice.total_amount || invoice.final_amount || 0);
        const poAmount = parseFloat(po.total_amount || 0);

        if (invoiceAmount === poAmount) {
          return {
            status: "passed",
            message: "Tổng tiền hóa đơn khớp với đơn đặt hàng",
            details: {
              invoice_amount: invoiceAmount,
              po_amount: poAmount,
              difference: 0
            }
          };
        } else {
          return {
            status: "failed",
            message: "Tổng tiền không khớp",
            details: {
              invoice_amount: invoiceAmount,
              po_amount: poAmount,
              difference: invoiceAmount - poAmount
            }
          };
        }
      }

      case "supplier_verification": {
        const docs = Object.values(docData);
        const suppliers = docs.map(d => d.supplier_name || d.supplier).filter(Boolean);
        const uniqueSuppliers = Array.from(new Set(suppliers));

        if (uniqueSuppliers.length === 1) {
          return {
            status: "passed",
            message: "Tên nhà cung cấp khớp trên tất cả chứng từ",
            details: { supplier: uniqueSuppliers[0], documents_checked: suppliers.length }
          };
        } else {
          return {
            status: "failed",
            message: "Tên nhà cung cấp không khớp",
            details: { suppliers: uniqueSuppliers }
          };
        }
      }

      case "date_validation": {
        const invoice = docData['hóa_đơn_gtgt'] || docData['invoice'];
        const delivery = docData['phiếu_giao_hàng'] || docData['delivery_note'];
        const po = docData['đơn_đặt_hàng'] || docData['purchase_order'];

        if (!invoice || !delivery || !po) {
          return {
            status: "failed",
            message: "Missing required documents for date validation",
            details: { available: Object.keys(docData) }
          };
        }

        const invoiceDate = new Date(invoice.date || invoice.invoice_date);
        const deliveryDate = new Date(delivery.date || delivery.delivery_date);
        const poDate = new Date(po.date || po.order_date);

        if (invoiceDate > deliveryDate && deliveryDate > poDate) {
          return {
            status: "passed",
            message: "Dòng thời gian hợp lệ",
            details: {
              invoice_date: invoiceDate.toISOString(),
              delivery_date: deliveryDate.toISOString(),
              po_date: poDate.toISOString()
            }
          };
        } else {
          return {
            status: "failed",
            message: "Dòng thời gian không hợp lệ",
            details: {
              invoice_date: invoiceDate.toISOString(),
              delivery_date: deliveryDate.toISOString(),
              po_date: poDate.toISOString(),
              issue: "Ngày phải theo thứ tự: Đơn hàng < Giao hàng < Hóa đơn"
            }
          };
        }
      }

      case "quantity_comparison": {
        const invoice = docData['hóa_đơn_gtgt'] || docData['invoice'];
        const delivery = docData['phiếu_giao_hàng'] || docData['delivery_note'];

        if (!invoice || !delivery) {
          return {
            status: "failed",
            message: "Missing required documents",
            details: { available: Object.keys(docData) }
          };
        }

        const invoiceQty = parseFloat(invoice.quantity || 0);
        const deliveryQty = parseFloat(delivery.quantity || 0);

        if (invoiceQty === deliveryQty) {
          return {
            status: "passed",
            message: "Số lượng khớp",
            details: {
              invoice_quantity: invoiceQty,
              delivery_quantity: deliveryQty
            }
          };
        } else {
          return {
            status: "failed",
            message: "Số lượng không khớp",
            details: {
              invoice_quantity: invoiceQty,
              delivery_quantity: deliveryQty,
              difference: invoiceQty - deliveryQty
            }
          };
        }
      }

      case "calculation_check": {
        const invoice = docData['hóa_đơn_gtgt'] || docData['invoice'];

        if (!invoice) {
          return {
            status: "failed",
            message: "Missing invoice document",
            details: {}
          };
        }

        const subtotal = parseFloat(invoice.subtotal || invoice.total_amount || 0);
        const tax = parseFloat(invoice.tax || invoice.tax_amount || 0);
        const total = parseFloat(invoice.total || invoice.final_amount || 0);

        const calculatedTotal = subtotal + tax;
        const diff = Math.abs(calculatedTotal - total);

        if (diff < 0.01) {
          return {
            status: "passed",
            message: "Tính toán chính xác",
            details: {
              subtotal,
              tax,
              total,
              calculated: calculatedTotal
            }
          };
        } else {
          return {
            status: "failed",
            message: "Sai lệch trong tính toán",
            details: {
              subtotal,
              tax,
              total,
              calculated: calculatedTotal,
              difference: diff
            }
          };
        }
      }

      default:
        return {
          status: "failed",
          message: `Unknown rule type: ${ruleType}`,
          details: {}
        };
    }
  } catch (error: any) {
    return {
      status: "failed",
      message: `Error evaluating rule: ${error.message}`,
      details: { error: error.message }
    };
  }
}
