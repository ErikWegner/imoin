export type UICommandAction =
  | 'OpenConfiguration'
  | 'SettingsChanged'
  | 'TriggerRefresh'
  | 'UpdatePanelData';

export interface UICommand {
  command: UICommandAction;
  data?: unknown;
  hostname?: string;
  instanceindex?: number;
  remoteCommand?: string;
  servicename?: string;
  url?: string;
}
