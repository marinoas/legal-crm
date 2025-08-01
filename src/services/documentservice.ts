// src/services/documentService.ts
import { apiClient, uploadFile, downloadFile } from './api';
import { Document, DocumentFormData, DocumentType, DocumentCategory } from '../types/document';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface DocumentFilters extends QueryParams {
  clientId?: string;
  courtId?: string;
  type?: DocumentType;
  category?: DocumentCategory;
  uploadedFrom?: string;
  uploadedTo?: string;
  uploadedBy?: string;
  tags?: string[];
  hasWatermark?: boolean;
  search?: string;
}

interface DocumentVersion {
  id: string;
  version: number;
  filename: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  changes?: string;
  isCurrent: boolean;
}

interface DocumentMetadata {
  title: string;
  description?: string;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  pages?: number;
  fileType: string;
  extractedText?: string;
  ocrProcessed?: boolean;
  language?: string;
}

interface DocumentPermissions {
  canView: string[]; // user IDs or roles
  canEdit: string[];
  canDelete: string[];
  canDownload: string[];
  isPublic: boolean;
  clientAccess: boolean;
  watermarkRequired: boolean;
}

interface DocumentShare {
  id: string;
  documentId: string;
  sharedWith: {
    type: 'email' | 'link';
    value: string;
  };
  permissions: 'view' | 'download';
  expiresAt?: string;
  accessCount: number;
  lastAccessed?: string;
  password?: boolean;
  createdBy: string;
  createdAt: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  filename: string;
  description?: string;
  variables: Array<{
    name: string;
    type: 'text' | 'date' | 'number' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }>;
  isActive: boolean;
}

interface DocumentGenerateRequest {
  templateId: string;
  variables: Record<string, any>;
  clientId?: string;
  courtId?: string;
  format?: 'pdf' | 'docx';
}

interface DocumentStatistics {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalSize: number;
  averageSize: number;
  uploadedThisMonth: number;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    uploads: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

interface BulkOperation {
  action: 'delete' | 'move' | 'tag' | 'share' | 'watermark';
  documentIds: string[];
  params?: any;
}

interface OCRRequest {
  documentId: string;
  language?: 'el' | 'en';
  enhanceQuality?: boolean;
}

class DocumentService {
  private readonly basePath = '/documents';

  /**
   * Get paginated list of documents
   */
  async getDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    const { data } = await apiClient.get<PaginatedResponse<Document>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<Document> {
    const { data } = await apiClient.get<Document>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Upload document
   */
  async uploadDocument(
    file: File,
    documentData: DocumentFormData,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Append document data
    Object.keys(documentData).forEach(key => {
      const value = documentData[key as keyof DocumentFormData];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const { data } = await uploadFile(
      this.basePath,
      file,
      onProgress,
      documentData
    );
    return data;
  }

  /**
   * Upload multiple documents
   */
  async uploadMultiple(
    files: File[],
    commonData: Partial<DocumentFormData>,
    onProgress?: (progress: number, fileIndex: number) => void
  ): Promise<Document[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Append common data
    Object.keys(commonData).forEach(key => {
      const value = commonData[key as keyof DocumentFormData];
      if (value !== undefined && value !== null) {
        formData.append(key, JSON.stringify(value));
      }
    });

    const { data } = await apiClient.post<Document[]>(
      `${this.basePath}/upload-multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress, -1);
          }
        },
      }
    );
    return data;
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    id: string,
    documentData: Partial<DocumentFormData>
  ): Promise<Document> {
    const { data } = await apiClient.put<Document>(
      `${this.basePath}/${id}`,
      documentData
    );
    return data;
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Download document
   */
  async downloadDocument(
    id: string,
    options?: {
      version?: number;
      watermark?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<void> {
    const params = new URLSearchParams();
    if (options?.version) params.append('version', options.version.toString());
    if (options?.watermark !== undefined) params.append('watermark', options.watermark.toString());

    const { data: metadata } = await apiClient.get<{ filename: string }>(
      `${this.basePath}/${id}/metadata`
    );

    await downloadFile(
      `${this.basePath}/${id}/download?${params}`,
      metadata.filename,
      options?.onProgress
    );
  }

  /**
   * Get document versions
   */
  async getVersions(id: string): Promise<DocumentVersion[]> {
    const { data } = await apiClient.get<DocumentVersion[]>(
      `${this.basePath}/${id}/versions`
    );
    return data;
  }

  /**
   * Upload new version
   */
  async uploadVersion(
    id: string,
    file: File,
    changes?: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentVersion> {
    const { data } = await uploadFile(
      `${this.basePath}/${id}/versions`,
      file,
      onProgress,
      { changes }
    );
    return data;
  }

  /**
   * Restore version
   */
  async restoreVersion(id: string, versionId: string): Promise<Document> {
    const { data } = await apiClient.post<Document>(
      `${this.basePath}/${id}/versions/${versionId}/restore`
    );
    return data;
  }

  /**
   * Get document preview
   */
  async getPreview(id: string, page?: number): Promise<string> {
    const { data } = await apiClient.get<{ url: string }>(
      `${this.basePath}/${id}/preview`,
      { params: { page } }
    );
    return data.url;
  }

  /**
   * Share document
   */
  async shareDocument(
    id: string,
    share: {
      type: 'email' | 'link';
      recipient?: string;
      permissions: 'view' | 'download';
      expiresIn?: number; // hours
      password?: string;
      message?: string;
    }
  ): Promise<DocumentShare> {
    const { data } = await apiClient.post<DocumentShare>(
      `${this.basePath}/${id}/share`,
      share
    );
    return data;
  }

  /**
   * Get document shares
   */
  async getShares(id: string): Promise<DocumentShare[]> {
    const { data } = await apiClient.get<DocumentShare[]>(
      `${this.basePath}/${id}/shares`
    );
    return data;
  }

  /**
   * Revoke share
   */
  async revokeShare(documentId: string, shareId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${documentId}/shares/${shareId}`);
  }

  /**
   * Get document templates
   */
  async getTemplates(category?: DocumentCategory): Promise<DocumentTemplate[]> {
    const { data } = await apiClient.get<DocumentTemplate[]>(
      `${this.basePath}/templates`,
      { params: { category } }
    );
    return data;
  }

  /**
   * Generate document from template
   */
  async generateFromTemplate(request: DocumentGenerateRequest): Promise<Document> {
    const { data } = await apiClient.post<Document>(
      `${this.basePath}/generate`,
      request
    );
    return data;
  }

  /**
   * OCR processing
   */
  async processOCR(request: OCRRequest): Promise<{
    text: string;
    confidence: number;
    language: string;
  }> {
    const { data } = await apiClient.post(
      `${this.basePath}/${request.documentId}/ocr`,
      {
        language: request.language,
        enhanceQuality: request.enhanceQuality,
      }
    );
    return data;
  }

  /**
   * Add watermark
   */
  async addWatermark(
    id: string,
    watermark: {
      text?: string;
      image?: File;
      position?: 'center' | 'diagonal' | 'corners';
      opacity?: number;
    }
  ): Promise<Document> {
    const formData = new FormData();
    if (watermark.text) formData.append('text', watermark.text);
    if (watermark.image) formData.append('image', watermark.image);
    if (watermark.position) formData.append('position', watermark.position);
    if (watermark.opacity) formData.append('opacity', watermark.opacity.toString());

    const { data } = await apiClient.post<Document>(
      `${this.basePath}/${id}/watermark`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  /**
   * Merge documents
   */
  async mergeDocuments(
    documentIds: string[],
    options?: {
      filename?: string;
      deleteOriginals?: boolean;
    }
  ): Promise<Document> {
    const { data } = await apiClient.post<Document>(
      `${this.basePath}/merge`,
      { documentIds, ...options }
    );
    return data;
  }

  /**
   * Bulk operations
   */
  async bulkOperation(operation: BulkOperation): Promise<{
    success: number;
    failed: number;
    errors: Array<{ documentId: string; error: string }>;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/bulk`, operation);
    return data;
  }

  /**
   * Get document statistics
   */
  async getStatistics(
    filters?: Omit<DocumentFilters, 'page' | 'limit' | 'sort'>
  ): Promise<DocumentStatistics> {
    const { data } = await apiClient.get<DocumentStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Search documents with full text
   */
  async searchFullText(
    query: string,
    filters?: Omit<DocumentFilters, 'search'>
  ): Promise<PaginatedResponse<Document>> {
    const { data } = await apiClient.post<PaginatedResponse<Document>>(
      `${this.basePath}/search`,
      { query, filters }
    );
    return data;
  }

  /**
   * Get document tags
   */
  async getTags(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/tags`);
    return data;
  }

  /**
   * Add tags to document
   */
  async addTags(id: string, tags: string[]): Promise<Document> {
    const { data } = await apiClient.post<Document>(
      `${this.basePath}/${id}/tags`,
      { tags }
    );
    return data;
  }

  /**
   * Remove tags from document
   */
  async removeTags(id: string, tags: string[]): Promise<Document> {
    const { data } = await apiClient.delete<Document>(
      `${this.basePath}/${id}/tags`,
      { data: { tags } }
    );
    return data;
  }

  /**
   * Lock document for editing
   */
  async lockDocument(id: string): Promise<{ locked: boolean; lockedBy: string }> {
    const { data } = await apiClient.post(`${this.basePath}/${id}/lock`);
    return data;
  }

  /**
   * Unlock document
   */
  async unlockDocument(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/unlock`);
  }

  /**
   * Get document audit log
   */
  async getAuditLog(id: string): Promise<Array<{
    action: string;
    user: string;
    timestamp: string;
    details?: any;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/${id}/audit`);
    return data;
  }
}

// Create singleton instance
const documentService = new DocumentService();

// Export singleton
export default documentService;

// Export types
export type {
  DocumentFilters,
  DocumentVersion,
  DocumentMetadata,
  DocumentPermissions,
  DocumentShare,
  DocumentTemplate,
  DocumentGenerateRequest,
  DocumentStatistics,
  BulkOperation,
  OCRRequest,
};
