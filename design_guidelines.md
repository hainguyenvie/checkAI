# Design Guidelines: Hệ thống Thẩm định Tài chính - Kế toán

## Design Approach

**Selected Approach**: Design System - Ant Design Enterprise Pattern

**Justification**: This is a data-intensive, productivity-focused enterprise application requiring exceptional usability, data clarity, and professional credibility. Ant Design's enterprise-grade components and patterns are specifically optimized for complex financial workflows, form-heavy interfaces, and Asian market expectations.

**Key Design Principles**:
- **Clarity First**: Every element must serve the user's task - no decorative noise
- **Trust Through Precision**: Professional, accurate visual presentation builds confidence in financial data
- **Efficient Workflows**: Minimize cognitive load through consistent patterns and predictable interactions
- **Contextual Guidance**: Help users understand their current state and next actions

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary)**:
- Primary Brand: `217 91% 60%` (Professional blue for actions, links, primary buttons)
- Success: `102 48% 52%` (Rule passed, successful validations)
- Warning: `38 92% 50%` (Attention needed, missing data)
- Error: `0 84% 60%` (Rule failed, critical issues)
- Neutral Gray Scale: `0 0% 98%` (backgrounds), `0 0% 85%` (borders), `0 0% 45%` (secondary text), `0 0% 13%` (primary text)

**Dark Mode (Available)**:
- Primary Brand: `217 91% 65%`
- Background: `0 0% 8%` (main), `0 0% 12%` (elevated surfaces)
- Text: `0 0% 95%` (primary), `0 0% 65%` (secondary)
- Borders: `0 0% 18%`

**Semantic Colors**:
- Document Status: `217 91% 60%` (verified), `38 92% 50%` (pending), `0 0% 45%` (draft)
- Rule Results: `102 48% 52%` (passed), `0 84% 60%` (failed)

### B. Typography

**Font Families**:
- Primary: 'Inter', -apple-system, system-ui, sans-serif (UI text, forms, data)
- Monospace: 'Roboto Mono', 'Courier New', monospace (numbers, IDs, codes)

**Type Scale**:
- Display (Module Titles): 32px/40px, font-weight 700
- Heading 1 (Section Headers): 24px/32px, font-weight 600
- Heading 2 (Subsections): 18px/26px, font-weight 600
- Heading 3 (Card Titles): 16px/24px, font-weight 600
- Body (Default): 14px/22px, font-weight 400
- Body Small (Secondary Info): 12px/20px, font-weight 400
- Caption (Metadata): 11px/18px, font-weight 400

**Special Treatments**:
- Financial Numbers: Monospace font, 16px, font-weight 500, right-aligned
- Form Labels: 14px, font-weight 500, text-gray-700
- Rule Descriptions: 13px/20px, font-weight 400, max-width 65ch

### C. Layout System

**Spacing Primitives**: Consistently use Tailwind units of `2, 4, 6, 8, 12, 16` for all spacing (padding, margin, gaps)

**Grid Structure**:
- Admin Configuration Pages: Single-column max-w-5xl centered with sidebar navigation
- Document Processing: Two-column split (60/40) - left: document preview, right: extracted data form
- Dashboard/List Views: Full-width with max-w-7xl container
- Forms: Single-column max-w-2xl for optimal input focus

**Vertical Rhythm**:
- Page padding: `py-8` mobile, `py-12` desktop
- Section spacing: `space-y-8` between major sections
- Card/Component spacing: `space-y-6` internal, `gap-4` for grids
- Form field spacing: `space-y-4`

### D. Component Library

**Navigation**:
- Top App Bar: Fixed header with logo, module switcher, user menu - height 64px, shadow on scroll
- Side Navigation (Admin): 240px width, collapsible, grouped menu items with icons
- Breadcrumbs: Above page title, interactive with chevron separators

**Forms & Inputs**:
- Text Inputs: 40px height, 12px padding, border-1, rounded corners 6px, clear focus states with 2px blue outline
- Select Dropdowns: Same height as inputs, chevron icon, searchable for long lists
- File Upload: Drag-and-drop zone with dashed border, preview thumbnails in grid below
- Form Sections: Grouped with subtle backgrounds (`bg-gray-50`), 16px padding, 8px rounded corners
- Validation: Inline error messages below fields in red, success checkmarks for verified fields

**Data Display**:
- Tables: Alternating row backgrounds, sticky headers, sortable columns, row hover states
- Rule Builder: Card-based interface with condition inputs, visual connectors (AND/OR), drag-to-reorder
- Document Viewer: PDF/image preview with zoom controls, navigation arrows, page indicators
- Comparison View: Side-by-side with synchronized scroll, highlighting differences
- Status Badges: 24px height pills with colored backgrounds, medium font-weight

**Cards & Containers**:
- Document Cards: White background, 1px border, 8px rounded, 16px padding, shadow on hover
- Configuration Cards: Grouped settings with headers, dividers between sections
- Result Cards: Rule name, status badge, expandable details showing comparison data

**Buttons & Actions**:
- Primary Button: Blue background, white text, 40px height, 16px horizontal padding, 6px rounded
- Secondary Button: White background, blue border, blue text, same dimensions
- Text Button: No background, blue text with underline on hover
- Icon Buttons: 40px square, subtle hover background, commonly used for edit/delete/view actions

**Feedback & Overlays**:
- Modals: Centered, max-width 600px for forms/confirmations, max-width 90vw for document previews
- Toast Notifications: Top-right corner, 4-second auto-dismiss, action buttons for critical messages
- Loading States: Skeleton screens for lists/tables, spinner for actions, progress bars for uploads
- Empty States: Centered illustrations with descriptive text and primary action button

**Data Visualization**:
- Progress Indicators: For rule checking progress (e.g., "Checking 3 of 5 rules...")
- Timeline View: For document flow showing PO → Delivery Note → Invoice with date stamps
- Comparison Highlights: Yellow background for differences, green for matches in side-by-side views

### E. Animations

**Minimal, Purposeful Motion**:
- Page Transitions: Simple 150ms fade for route changes
- Accordion/Expand: 200ms ease-out height transition
- Modal Entry: 200ms scale from 0.95 to 1.0 with fade
- Loading Spinners: Continuous rotation for indefinite waits
- Toast Slide-in: 250ms slide from right with fade
- Hover States: 150ms background/border color transitions only

**Explicitly Avoid**: Page scroll effects, parallax, decorative animations, entrance animations for static content

---

## Module-Specific Guidelines

### Admin Configuration Module
- **Layout**: Sidebar navigation (Templates, Document Sets, Rules) with main content area
- **Template Builder**: Form-based with field type selection (text, number, date), drag-to-reorder fields
- **Rule Builder**: Card-based conditions with dropdown operators, natural language preview of rule
- **Visual Hierarchy**: Clear separation between navigation, form, and action areas

### Document Processing Module
- **Upload Interface**: Large drop zone (300px height) with file type icons, multiple file preview in grid
- **Verification View**: 60% left (scrollable document preview), 40% right (form with extracted data), sticky action buttons at bottom right
- **Document Viewer**: Toolbar with zoom, rotate, page navigation, thumbnail sidebar (collapsible)
- **Form Highlighting**: When user clicks a field in the form, highlight corresponding area in document preview

### Results & Reporting Module
- **Dashboard**: Summary cards at top (total documents, pass rate, pending reviews), filterable table below
- **Rule Results**: Accordion list with green/red status indicators, expand to show detailed comparison
- **Report Export**: Secondary button to download PDF/Excel with timestamp in filename
- **Historical View**: Timeline showing all checks performed on a document set with timestamps

---

## Accessibility & Quality Standards

- **Contrast**: Minimum 4.5:1 for body text, 7:1 for financial numbers and critical data
- **Focus Indicators**: 2px blue outline with 2px offset for keyboard navigation
- **Form Labels**: Always visible, properly associated with inputs, required fields marked with asterisk
- **Error Recovery**: Clear error messages with actionable solutions, prevent data loss on errors
- **Responsive**: Tablet layouts use single column, mobile shows document preview in modal instead of split view
- **Loading States**: Never show empty content - use skeletons, progress indicators, or placeholder messages

---

## Images

**No hero images or marketing imagery.** This is a business productivity tool. Use:
- **Icon Library**: Ant Design Icons via CDN for all UI icons (file types, actions, status indicators)
- **Document Previews**: Actual uploaded file thumbnails and full previews
- **Empty State Illustrations**: Simple, professional line illustrations (consider unDraw or similar) for "No documents uploaded yet" states
- **Logo**: Company/product logo in top-left corner of app bar (max 40px height)