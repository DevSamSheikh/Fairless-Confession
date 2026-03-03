// Report Controller - Handle content reporting
export interface ReportRequest {
  postId: string;
  userId: string;
  reason: string;
  description?: string;
  createdAt: Date;
}

export interface ReportResponse {
  success: boolean;
  message: string;
  reportId?: string;
}

export class ReportController {
  // Mock database for reports (replace with actual database implementation)
  private static reports: Map<string, ReportRequest> = new Map();
  private static reportIdCounter = 1;

  static async createReport(request: Omit<ReportRequest, 'createdAt' | 'reportId'>): Promise<ReportResponse> {
    try {
      // Validate input
      if (!request.postId || !request.userId || !request.reason) {
        return {
          success: false,
          message: 'Missing required fields: postId, userId, and reason are required'
        };
      }

      // Check if user already reported this post
      const existingReport = Array.from(this.reports.values())
        .find(report => report.postId === request.postId && report.userId === request.userId);

      if (existingReport) {
        return {
          success: false,
          message: 'You have already reported this content'
        };
      }

      // Create new report
      const reportId = `report_${this.reportIdCounter++}`;
      const newReport: ReportRequest = {
        ...request,
        createdAt: new Date()
      };

      // Store report (in production, use actual database)
      this.reports.set(reportId, newReport);

      console.log('Report created:', {
        reportId,
        postId: request.postId,
        userId: request.userId,
        reason: request.reason,
        description: request.description,
        createdAt: newReport.createdAt
      });

      return {
        success: true,
        message: 'Content reported successfully. Our team will review it shortly.',
        reportId
      };
    } catch (error) {
      console.error('Error creating report:', error);
      return {
        success: false,
        message: 'Failed to create report. Please try again later.'
      };
    }
  }

  static async getReportsByPost(postId: string): Promise<ReportRequest[]> {
    try {
      const reports = Array.from(this.reports.values())
        .filter(report => report.postId === postId);
      
      return reports;
    } catch (error) {
      console.error('Error getting reports for post:', error);
      return [];
    }
  }

  static async getReportsByUser(userId: string): Promise<ReportRequest[]> {
    try {
      const reports = Array.from(this.reports.values())
        .filter(report => report.userId === userId);
      
      return reports;
    } catch (error) {
      console.error('Error getting reports by user:', error);
      return [];
    }
  }

  static async getAllReports(): Promise<ReportRequest[]> {
    try {
      const reports = Array.from(this.reports.values());
      return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting all reports:', error);
      return [];
    }
  }

  static async getReportStats(): Promise<{
    totalReports: number;
    reportsByReason: Record<string, number>;
    recentReports: number;
  }> {
    try {
      const allReports = Array.from(this.reports.values());
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const reportsByReason: Record<string, number> = {};
      allReports.forEach(report => {
        reportsByReason[report.reason] = (reportsByReason[report.reason] || 0) + 1;
      });

      const recentReports = allReports.filter(report => report.createdAt >= oneWeekAgo).length;

      return {
        totalReports: allReports.length,
        reportsByReason,
        recentReports
      };
    } catch (error) {
      console.error('Error getting report stats:', error);
      return {
        totalReports: 0,
        reportsByReason: {},
        recentReports: 0
      };
    }
  }

  // For development/testing
  static clearAllReports(): void {
    this.reports.clear();
    this.reportIdCounter = 1;
  }

  static getReportCount(): number {
    return this.reports.size;
  }
}
