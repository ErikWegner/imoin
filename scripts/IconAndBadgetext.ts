import { Status } from './monitors';

export interface IBadgeIcon {
  16: string;
  20: string;
  24?: string;
  32: string;
  40: string;
}

/** Microsoft Edge only allows these sizes */
export interface IEdgeBadgeIcon {
  19?: string;
  20: string;
  25?: string;
  30?: string;
  38?: string;
  40: string;
}

export class IconAndBadgetextV2 {
  constructor(
    public badgeText = '',
    public badgeColor = '',
    public badgeIcon: IBadgeIcon = { 16: '', 20: '', 24: '', 32: '', 40: '' },
  ) {}
}

export enum BadgeColor {
  GREEN = '#83b225',
  YELLOW = '#b29a25',
  RED = '#b25425',
}

export interface IconAndBadgetext {
  readonly badgeColor: BadgeColor;
  readonly badgeIcon: IBadgeIcon;
  readonly badgeText: string;
  readonly badgeTooltip: string;
  readonly overallStatus: Status;
}
