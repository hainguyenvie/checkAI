import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fieldTypes = ["text", "number", "date", "select"] as const;

export const templateFields = pgTable("template_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull(),
  required: text("required").notNull().default("false"),
  options: jsonb("options"),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().default([]),
});

export const documentSets = pgTable("document_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  templateIds: jsonb("template_ids").notNull().default([]),
});

export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentSetId: varchar("document_set_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ruleType: text("rule_type").notNull(),
  condition: jsonb("condition").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentSetId: varchar("document_set_id").notNull(),
  templateId: varchar("template_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  extractedData: jsonb("extracted_data"),
  verified: text("verified").notNull().default("false"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const verificationResults = pgTable("verification_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentSetId: varchar("document_set_id").notNull(),
  ruleId: varchar("rule_id").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  details: jsonb("details"),
  checkedAt: timestamp("checked_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export const insertDocumentSetSchema = createInsertSchema(documentSets).omit({ id: true });
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true });

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type DocumentSet = typeof documentSets.$inferSelect;
export type InsertDocumentSet = z.infer<typeof insertDocumentSetSchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type VerificationResult = typeof verificationResults.$inferSelect;
