export interface IBadgeIcon {
    16: string
    24?: string
    32: string
}
export class IconAndBadgetext {
    constructor(
        public badgeText = "",
        public badgeColor = "",
        public badgeIcon: IBadgeIcon = {16:"",24:"",32:""}
        ) {

    }
}