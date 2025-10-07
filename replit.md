# Financial Document Verification System

## Overview

This is an enterprise-grade financial document verification system designed for Vietnamese accounting and finance departments. The application automates the process of validating supplier payment documentation by extracting data from documents (invoices, purchase orders, delivery notes), cross-checking information across multiple documents, and applying business rules to verify accuracy and compliance.

The system aims to reduce processing time by 90% and eliminate manual errors in the document verification workflow. It follows a professional, data-intensive design approach using Ant Design Enterprise patterns with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite as the build tool

**Routing**: wouter for client-side routing with pages organized by functionality:
- Admin pages: templates, document-sets, rules management
- Accountant pages: document processing and verification results
- Home page with navigation cards

**UI Component System**: 
- shadcn/ui components (Radix UI primitives) configured with "new-york" style
- Custom theme system supporting light/dark modes with HSL-based color tokens
- Tailwind CSS with custom design tokens for enterprise aesthetics
- Typography using Inter font family for UI and Roboto Mono for numerical data

**State Management**:
- TanStack React Query for server state and API data fetching
- React hooks for local component state
- Query client configured with infinite stale time and disabled auto-refetch

**Key UI Patterns**:
- Document viewer with zoom, rotation, and pagination controls
- Drag-and-drop file upload zones with preview
- Split-screen verification interface (document viewer + data extraction form)
- Rule builder with visual condition configuration
- Status badges with semantic colors (passed/failed/pending/warning)

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**API Design**: RESTful endpoints organized by resource:
- `/api/templates` - Document template CRUD operations
- `/api/document-sets` - Document set management
- `/api/rules` - Business rule configuration
- `/api/documents` - Individual document handling
- `/api/upload` - File upload with multipart/form-data
- `/api/verify/:documentSetId` - Trigger verification process
- `/api/verification-results/:documentSetId` - Fetch verification results

**Document Processing Pipeline**:
1. File upload via multer middleware
2. PDF text extraction using pdf.js-extract library
3. OCR and data extraction using OpenAI API (GPT-4)
4. Storage of extracted data in JSON format
5. Rule-based verification across document sets
6. Result persistence and retrieval

**Business Logic**:
- Template-based field extraction (configurable fields per document type)
- Cross-document validation rules (amount comparison, supplier verification, date validation, quantity matching, calculation checks)
- Seed data initialization for demo templates and rules

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Provider**: Neon Database (serverless PostgreSQL via @neondatabase/serverless)

**Schema Design**:
- `templates` - Document type definitions with configurable field structures (stored as JSONB)
- `document_sets` - Collections of related templates for complete verification workflows
- `rules` - Business validation rules with type and condition (stored as JSONB)
- `documents` - Uploaded files with extracted data, verification status, and metadata
- `verification_results` - Rule execution results with pass/fail status and details

**In-Memory Storage**: Fallback MemStorage class implementing IStorage interface for development/testing without database

**Data Types**:
- UUIDs for primary keys (gen_random_uuid())
- JSONB for flexible schema fields (template fields, rule conditions, extracted data)
- Timestamps for audit trails
- Text/varchar for standard fields

### External Dependencies

**AI/ML Services**:
- OpenAI API (GPT-4) for intelligent document data extraction from PDFs
- Configured with API key from environment variables

**File Processing**:
- pdf.js-extract for PDF text extraction
- multer for multipart file upload handling
- File storage in `uploads/` directory

**Session Management**:
- connect-pg-simple for PostgreSQL-backed sessions
- Session storage linked to database

**Development Tools**:
- Replit-specific plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- Vite dev server with HMR support
- TypeScript for type safety across client and server

**UI Libraries**:
- 30+ Radix UI primitives for accessible components
- react-dropzone for file upload UX
- react-day-picker for date selection
- recharts for data visualization (chart components)
- lucide-react for consistent iconography

**Form Handling**:
- react-hook-form for form state management
- @hookform/resolvers with zod for schema validation
- drizzle-zod for database schema validation