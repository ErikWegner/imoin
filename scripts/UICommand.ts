export interface UICommand {
  command: string;
  data?: unknown;
  hostname?: string;
  instanceindex?: number;
  remoteCommand?: string;
  servicename?: string;
  url?: string;
}
