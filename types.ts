export interface DeliveryRecord {
  id: string;
  // Timestamps & Dates
  customerPlacedOrderDate: string;
  customerPlacedOrderTime: string;
  orderWithRestaurantTime: string; // New column from screenshot
  driverAtRestaurantTime: string;
  deliveredToConsumerDate: string;
  deliveredToConsumerTime: string;
  
  // Metrics
  totalDeliveryTimeMinutes: number;
  
  // Identifiers
  driverId: string;
  restaurantId: string;
  consumerId: string;
  deliveryRegion: string;
  
  // Details
  isAsap: boolean;
  
  // Financials
  orderTotal: number;
  amountOfDiscount: number;
  percentDiscount: number; // New
  amountOfTip: number;
  percentTip: number; // New
  refundedAmount: number;
  refundPercentage: number;
  
  // Engineered Features (Calculated)
  prepTimeMinutes?: number;
  driveTimeMinutes?: number;
  dataQualityIssue?: string;
}

export interface KPIMetric {
  label: string;
  value: string;
  change: number; // percentage
  isPositive: boolean; // simplified trend
}

export interface KPISettings {
  maxAcceptablePrepTime: number; // minutes
  maxAcceptableDriveTime: number; // minutes
  highRefundThreshold: number; // dollars
  lateDeliveryThreshold: number; // minutes
}

export interface DataQualityReport {
  missingValues: number;
  duplicates: number;
  outliers: number;
  score: number; // 0-100
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DATA_GRID = 'DATA_GRID',
  AUTOMATION_LAB = 'AUTOMATION_LAB',
  AI_INSIGHTS = 'AI_INSIGHTS',
  IMPORT = 'IMPORT',
  ACTION_CENTER = 'ACTION_CENTER',
  KPI_BUILDER = 'KPI_BUILDER'
}

export interface ActionItem {
  id: string;
  orderId: string;
  stakeholder: 'Merchant' | 'Dasher' | 'Customer';
  issueType: string;
  suggestedAction: string;
  priority: 'High' | 'Medium' | 'Low';
}