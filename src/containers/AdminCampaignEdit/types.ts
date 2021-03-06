export interface CampaignReadinessType {
  basics: boolean;
  textingHours: boolean;
  contacts: boolean;
  autoassign: boolean;
}

export interface DataSourceItemType {
  text: string;
  rawValue: string;
  value: React.ReactNode;
}
