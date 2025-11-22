
export type DeliveryRecord = Record<string, any>;

export interface SchemaConfig {
  // Semantic Roles mapping to actual CSV/Excel Headers
  dateColumn: string;
  timeColumn: string;
  regionColumn: string;
  totalTimeColumn: string;
  orderTotalColumn: string;
  refundAmountColumn: string;
  restaurantIdColumn: string;
  driverIdColumn: string;
  prepTimeColumn?: string;
  driveTimeColumn?: string;
}

export interface KPIMetric {
  label: string;
  value: string;
  change: number; 
  isPositive: boolean; 
}

export interface KPISettings {
  maxAcceptablePrepTime: number; 
  maxAcceptableDriveTime: number; 
  highRefundThreshold: number; 
  lateDeliveryThreshold: number; 
}

export interface DataQualityReport {
  missingValues: number;
  duplicates: number;
  outliers: number;
  score: number; 
}

export interface DataModificationProposal {
  id: string;
  type: 'CLEANING' | 'ENGINEERING' | 'IMPUTATION' | 'REMOVAL';
  description: string;
  reason: string;
  affectedRows: number;
  isSelected: boolean;
  args?: any; 
}

export interface ColumnProfile {
  name: string; 
  mappedField: string; 
  currentFormat: string;
  expectedFormat: string;
  missingCount: number;
  invalidCount: number; 
  sampleValue: string;
  isFormatValid: boolean;
  description?: string; 
  kpiUtility?: string; 
  imputationTip?: string; 
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DATA_GRID = 'DATA_GRID',
  AUTOMATION_LAB = 'AUTOMATION_LAB',
  AI_INSIGHTS = 'AI_INSIGHTS',
  IMPORT = 'IMPORT',
  ACTION_CENTER = 'ACTION_CENTER',
  KPI_BUILDER = 'KPI_BUILDER',
  SQL_WORKBENCH = 'SQL_WORKBENCH'
}

export interface ActionItem {
  id: string;
  orderId: string;
  stakeholder: 'Merchant' | 'Dasher' | 'Customer';
  issueType: string;
  suggestedAction: string;
  priority: 'High' | 'Medium' | 'Low';
}
