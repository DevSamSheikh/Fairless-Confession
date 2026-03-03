// Reports API - Handle content reporting
import { apiFetchWithAuthHandling } from '../utils/authErrorHandler';

export interface ReportRequest {
  postId: string;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  success: boolean;
  message: string;
  reportId?: string;
}

// Report reasons
export type ReportReason = 
  | 'Inappropriate Content'
  | 'Harassment or Bullying'
  | 'Spam or Misleading Content'
  | 'Hate Speech'
  | 'Violence or Threats'
  | 'Copyright Infringement'
  | 'False Information'
  | 'Other';

export const REPORT_REASONS: ReportReason[] = [
  'Inappropriate Content',
  'Harassment or Bullying',
  'Spam or Misleading Content',
  'Hate Speech',
  'Violence or Threats',
  'Copyright Infringement',
  'False Information',
  'Other'
];

export async function reportContent(request: ReportRequest): Promise<ReportResponse> {
  try {
    const response = await apiFetchWithAuthHandling('/api/reports', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to report content (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data?.message || 'Content reported successfully',
      reportId: data?.reportId
    };
  } catch (error) {
    console.error('Report content error:', error);
    throw error;
  }
}

export async function getReportReasons(): Promise<ReportReason[]> {
  try {
    const response = await apiFetchWithAuthHandling('/api/reports/reasons', {
      method: 'GET',
    });

    if (!response.ok) {
      // If endpoint doesn't exist, return default reasons
      return REPORT_REASONS;
    }

    const data = await response.json();
    return data?.reasons || REPORT_REASONS;
  } catch (error) {
    console.error('Get report reasons error:', error);
    return REPORT_REASONS;
  }
}
