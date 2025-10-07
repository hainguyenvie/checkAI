import { 
  type Template, 
  type InsertTemplate,
  type DocumentSet,
  type InsertDocumentSet,
  type Rule,
  type InsertRule,
  type Document,
  type InsertDocument,
  type VerificationResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Document Sets
  getDocumentSet(id: string): Promise<DocumentSet | undefined>;
  getAllDocumentSets(): Promise<DocumentSet[]>;
  createDocumentSet(set: InsertDocumentSet): Promise<DocumentSet>;
  updateDocumentSet(id: string, set: Partial<InsertDocumentSet>): Promise<DocumentSet | undefined>;
  deleteDocumentSet(id: string): Promise<boolean>;

  // Rules
  getRule(id: string): Promise<Rule | undefined>;
  getRulesByDocumentSet(documentSetId: string): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, rule: Partial<InsertRule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<boolean>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsBySet(documentSetId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Verification Results
  createVerificationResult(result: Omit<VerificationResult, 'id' | 'checkedAt'>): Promise<VerificationResult>;
  getVerificationResults(documentSetId: string): Promise<VerificationResult[]>;
}

export class MemStorage implements IStorage {
  private templates: Map<string, Template>;
  private documentSets: Map<string, DocumentSet>;
  private rules: Map<string, Rule>;
  private documents: Map<string, Document>;
  private verificationResults: Map<string, VerificationResult>;

  constructor() {
    this.templates = new Map();
    this.documentSets = new Map();
    this.rules = new Map();
    this.documents = new Map();
    this.verificationResults = new Map();
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { 
      id,
      name: insertTemplate.name,
      description: insertTemplate.description || null,
      fields: insertTemplate.fields || []
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existing = this.templates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Document Sets
  async getDocumentSet(id: string): Promise<DocumentSet | undefined> {
    return this.documentSets.get(id);
  }

  async getAllDocumentSets(): Promise<DocumentSet[]> {
    return Array.from(this.documentSets.values());
  }

  async createDocumentSet(insertSet: InsertDocumentSet): Promise<DocumentSet> {
    const id = randomUUID();
    const documentSet: DocumentSet = { 
      id,
      name: insertSet.name,
      description: insertSet.description || null,
      templateIds: insertSet.templateIds || []
    };
    this.documentSets.set(id, documentSet);
    return documentSet;
  }

  async updateDocumentSet(id: string, updates: Partial<InsertDocumentSet>): Promise<DocumentSet | undefined> {
    const existing = this.documentSets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.documentSets.set(id, updated);
    return updated;
  }

  async deleteDocumentSet(id: string): Promise<boolean> {
    return this.documentSets.delete(id);
  }

  // Rules
  async getRule(id: string): Promise<Rule | undefined> {
    return this.rules.get(id);
  }

  async getRulesByDocumentSet(documentSetId: string): Promise<Rule[]> {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.documentSetId === documentSetId
    );
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    const id = randomUUID();
    const rule: Rule = { 
      id,
      documentSetId: insertRule.documentSetId,
      name: insertRule.name,
      description: insertRule.description || null,
      ruleType: insertRule.ruleType,
      condition: insertRule.condition
    };
    this.rules.set(id, rule);
    return rule;
  }

  async updateRule(id: string, updates: Partial<InsertRule>): Promise<Rule | undefined> {
    const existing = this.rules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.rules.set(id, updated);
    return updated;
  }

  async deleteRule(id: string): Promise<boolean> {
    return this.rules.delete(id);
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsBySet(documentSetId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.documentSetId === documentSetId
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      id,
      documentSetId: insertDocument.documentSetId,
      templateId: insertDocument.templateId,
      fileName: insertDocument.fileName,
      fileType: insertDocument.fileType,
      fileUrl: insertDocument.fileUrl,
      extractedData: insertDocument.extractedData || null,
      verified: insertDocument.verified || "false",
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Verification Results
  async createVerificationResult(result: Omit<VerificationResult, 'id' | 'checkedAt'>): Promise<VerificationResult> {
    const id = randomUUID();
    const verificationResult: VerificationResult = {
      ...result,
      id,
      checkedAt: new Date()
    };
    this.verificationResults.set(id, verificationResult);
    return verificationResult;
  }

  async getVerificationResults(documentSetId: string): Promise<VerificationResult[]> {
    return Array.from(this.verificationResults.values()).filter(
      (result) => result.documentSetId === documentSetId
    );
  }
}

export const storage = new MemStorage();
