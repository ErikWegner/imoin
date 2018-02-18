export interface IBadgeIcon {
    16: string
    20: string
    24?: string
    32: string
    40: string
}

/** Microsoft Edge only allows these sizes */
export interface IEdgeBadgeIcon {
    19?: string
    20: string
    25?: string
    30?: string
    38?: string
    40: string
}

export class IconAndBadgetext {
    constructor(
        public badgeText = '',
        public badgeColor = '',
        public badgeIcon: IBadgeIcon = { 16: '', 20: '', 24: '', 32: '', 40: '' }
    ) {

    }
}
