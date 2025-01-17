export enum SortKey {
    POPULARITY = 'popularity',
    OLDEST = 'oldest',
    NEWEST = 'newest',
}

export interface Misc {
    styles?: CSSStyleSheet[];
    highlightColor?: string;
    deleteButtonColor?: string;
    defaultNavigationSortKey?: SortKey;
    highlightOwnComments?: boolean;
    roundProfilePictures?: boolean;
    textareaRows?: number;
    textareaRowsOnFocus?: number;
    maxRepliesVisible?: number | false;
}
