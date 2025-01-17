import type { CommentsOptions } from '../options';

function createStyle(css: string): CSSStyleSheet {
    const styleSheet: CSSStyleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(css);
    return styleSheet;
}

export function createDynamicStylesheet(options: CommentsOptions): CSSStyleSheet {
    let css: string = '';

    css += `#comments-container .navigation li.active, #comments-container .navigation .dropdown-menu {border-bottom: 2px solid ${options.highlightColor} !important;}`;

    css += `#comments-container .navigation .dropdown .active {border: none;background: ${options.highlightColor} !important;}`;

    css += `#comments-container .highlight-background {background: ${options.highlightColor} !important;}`;

    if (options.highlightOwnComments) {
        css += `#comments-container .comment.by-current-user > ithub-comment-content > .comment-wrapper {border-left: 2px solid ${options.highlightColor};margin-left: -2px;border-radius: 3px}`;
    }

    css += `#comments-container .highlight-font {color: ${options.highlightColor} !important;}`;
    css += `#comments-container .highlight-font-bold {color: ${options.highlightColor} !important;font-weight: bold;}`;

    return createStyle(css);
}
