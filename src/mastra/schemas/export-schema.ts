import { z } from 'zod';

// Export format options
export const ExportFormatSchema = z.enum([
  'json',
  'pdf',
  'html',
  'markdown',
  'txt',
  'csv',
  'xml'
]).describe('Available export formats');

// PDF layout options
export const PDFLayoutSchema = z.enum([
  'cinematic',
  'storybook',
  'comic',
  'minimal',
  'professional',
  'presentation'
]).describe('PDF layout styles');

// Page size options
export const PageSizeSchema = z.enum([
  'a4',
  'letter',
  'a3',
  'legal',
  'tabloid'
]).describe('Page size options');

// Export metadata schema
export const ExportMetadataSchema = z.object({
  title: z.string().optional().describe('Export title'),
  author: z.string().optional().describe('Export author'),
  creationDate: z.string().describe('Export creation date'),
  version: z.string().optional().describe('Export version'),
  description: z.string().optional().describe('Export description'),
  tags: z.array(z.string()).optional().describe('Export tags'),
  source: z.string().optional().describe('Source of the exported data'),
});

// Export configuration schema
export const ExportConfigSchema = z.object({
  format: ExportFormatSchema.describe('Export format'),
  layout: PDFLayoutSchema.optional().describe('Layout style (for PDF exports)'),
  pageSize: PageSizeSchema.default('a4').describe('Page size (for PDF exports)'),
  includeMetadata: z.boolean().default(true).describe('Whether to include metadata'),
  includeScript: z.boolean().default(true).describe('Whether to include script text'),
  includePrompts: z.boolean().default(false).describe('Whether to include image prompts'),
  includeImages: z.boolean().default(true).describe('Whether to include images'),
  watermark: z.boolean().default(false).describe('Whether to add watermark'),
  password: z.string().optional().describe('Password protection (for PDF)'),
  compression: z.boolean().default(true).describe('Whether to compress the export'),
  quality: z.enum(['low', 'medium', 'high']).default('medium').describe('Export quality'),
  customStyling: z.record(z.string(), z.any()).optional().describe('Custom styling options'),
});

// Export result schema
export const ExportResultSchema = z.object({
  success: z.boolean().describe('Whether the export was successful'),
  data: z.string().describe('Exported data (base64 for binary formats)'),
  filename: z.string().describe('Suggested filename for the export'),
  fileSize: z.number().describe('File size in bytes'),
  mimeType: z.string().describe('MIME type of the exported file'),
  metadata: ExportMetadataSchema.describe('Export metadata'),
  config: ExportConfigSchema.describe('Export configuration used'),
  errors: z.array(z.string()).optional().describe('Any errors that occurred'),
  warnings: z.array(z.string()).optional().describe('Any warnings that occurred'),
});

// PDF-specific export schema
export const PDFExportSchema = z.object({
  layout: PDFLayoutSchema.default('cinematic').describe('PDF layout style'),
  pageSize: PageSizeSchema.default('a4').describe('Page size'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait').describe('Page orientation'),
  margins: z.object({
    top: z.number().min(0).default(20),
    bottom: z.number().min(0).default(20),
    left: z.number().min(0).default(20),
    right: z.number().min(0).default(20),
  }).optional().describe('Page margins in mm'),
  header: z.boolean().default(true).describe('Whether to include header'),
  footer: z.boolean().default(true).describe('Whether to include footer'),
  pageNumbers: z.boolean().default(true).describe('Whether to include page numbers'),
  tableOfContents: z.boolean().default(false).describe('Whether to include table of contents'),
  bookmarks: z.boolean().default(true).describe('Whether to include bookmarks'),
  password: z.string().optional().describe('Password protection'),
  encryption: z.enum(['none', '40bit', '128bit']).default('none').describe('Encryption level'),
});

// HTML export schema
export const HTMLExportSchema = z.object({
  template: z.enum(['default', 'modern', 'classic', 'minimal']).default('default').describe('HTML template'),
  responsive: z.boolean().default(true).describe('Whether to make the HTML responsive'),
  includeCSS: z.boolean().default(true).describe('Whether to include CSS styles'),
  includeJS: z.boolean().default(false).describe('Whether to include JavaScript'),
  externalCSS: z.boolean().default(false).describe('Whether to use external CSS files'),
  externalJS: z.boolean().default(false).describe('Whether to use external JS files'),
  metaTags: z.record(z.string(), z.string()).optional().describe('Additional meta tags'),
  customCSS: z.string().optional().describe('Custom CSS styles'),
  customJS: z.string().optional().describe('Custom JavaScript'),
});

// JSON export schema
export const JSONExportSchema = z.object({
  pretty: z.boolean().default(true).describe('Whether to format JSON with indentation'),
  includeNulls: z.boolean().default(false).describe('Whether to include null values'),
  maxDepth: z.number().min(1).max(10).default(5).describe('Maximum nesting depth'),
  dateFormat: z.enum(['iso', 'timestamp', 'custom']).default('iso').describe('Date format'),
  customDateFormat: z.string().optional().describe('Custom date format string'),
});

// Markdown export schema
export const MarkdownExportSchema = z.object({
  style: z.enum(['github', 'gitlab', 'bitbucket', 'custom']).default('github').describe('Markdown style'),
  includeImages: z.boolean().default(true).describe('Whether to include image references'),
  imageFormat: z.enum(['markdown', 'html', 'base64']).default('markdown').describe('Image format'),
  includeMetadata: z.boolean().default(true).describe('Whether to include metadata as frontmatter'),
  includeTableOfContents: z.boolean().default(false).describe('Whether to include table of contents'),
  tocDepth: z.number().min(1).max(6).default(3).describe('Table of contents depth'),
  customExtensions: z.array(z.string()).optional().describe('Custom markdown extensions'),
});

// Export request schema
export const ExportRequestSchema = z.object({
  data: z.any().describe('Data to export'),
  config: ExportConfigSchema.describe('Export configuration'),
  metadata: ExportMetadataSchema.optional().describe('Export metadata'),
});

// Export types
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type PDFLayout = z.infer<typeof PDFLayoutSchema>;
export type PageSize = z.infer<typeof PageSizeSchema>;
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;
export type ExportConfig = z.infer<typeof ExportConfigSchema>;
export type ExportResult = z.infer<typeof ExportResultSchema>;
export type PDFExport = z.infer<typeof PDFExportSchema>;
export type HTMLExport = z.infer<typeof HTMLExportSchema>;
export type JSONExport = z.infer<typeof JSONExportSchema>;
export type MarkdownExport = z.infer<typeof MarkdownExportSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;