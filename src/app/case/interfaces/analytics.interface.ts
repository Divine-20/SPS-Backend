export interface WeeklyAnalytics {
  weekNumber: number;
  startDate: string;
  endDate: string;
  count: number;
}

export interface AnalyticsResponse {
  monthly?: number[];
  weekly?: WeeklyAnalytics[];
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
}
