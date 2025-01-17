import type { CommentModelEnriched } from '../../view-model/comment-model-enriched.ts';
import { isNil, normalizeSpaces } from '../../common/util.ts';
import type { Functionalities } from '../../options/functionalities.ts';
import type { Callbacks } from '../../options/callbacks.ts';
import { TagFactory } from '../basic/tag-factory.ts';
import { OptionsProvider, ServiceProvider } from '../../common/provider.ts';
import DOMPurify from 'dompurify';

export class CommentContentFormatter {
    static readonly PING_REGEXP: RegExp = /(^|\s)@([a-z\u00C0-\u00FF\d-_]+)/gim;
    static readonly HASHTAG_REGEXP: RegExp = /(^|\s)#([a-z\u00C0-\u00FF\d-_]+)/gim;

    readonly #options: Required<Functionalities & Callbacks>;
    readonly #tagFactory: TagFactory;

    constructor(container: HTMLElement) {
        this.#options = OptionsProvider.get(container);
        this.#tagFactory = ServiceProvider.get(container, TagFactory);
    }

    getFormattedCommentContent(commentModel: CommentModelEnriched, replaceNewLines?: boolean): HTMLElement {
        const content: HTMLSpanElement = document.createElement('span');
        let html: string = this.escape(DOMPurify.sanitize(commentModel.content));
        if (commentModel.isDeleted) {
            const deletedContent: HTMLElement = document.createElement('i');
            deletedContent.style.color = 'gray';
            deletedContent.innerHTML = html;
            content.append(deletedContent);
            return content;
        }

        html = this.linkify(html);
        html = this.highlightTags(commentModel, html);
        if (replaceNewLines) {
            html = html.replace(/(?:\n)/g, '<br>');
        }

        content.innerHTML = html;
        content
            .querySelectorAll<HTMLElement>('.hashtag')
            .forEach((hashtag) => (hashtag.onclick = this.#hashtagClicked));
        content.querySelectorAll<HTMLElement>('.ping').forEach((hashtag) => (hashtag.onclick = this.#pingClicked));

        return content;
    }

    private escape(inputText: string): string {
        const escaped: HTMLPreElement = document.createElement('pre');
        escaped.textContent = normalizeSpaces(inputText);
        return escaped.innerHTML;
    }

    private linkify(inputText: string): string {
        let replacedText: string;

        // URLs starting with http://, https://, ftp:// or file://
        const replacePattern1: RegExp =
            /(\b(https?|ftp|file):\/\/[-A-ZÄÖÅ0-9+&@#\/%?=~_|!:,.;{}]*[-A-ZÄÖÅ0-9+&@#\/%=~_|{}])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        // URLs starting with "www." (without // before it, or it would re-link the ones done above).
        const replacePattern2: RegExp = /(^|[^\/f])(www\.[-A-ZÄÖÅ0-9+&@#\/%?=~_|!:,.;{}]*[-A-ZÄÖÅ0-9+&@#\/%=~_|{}])/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="https://$2" target="_blank">$2</a>');

        // Change email addresses to mailto: links.
        const replacePattern3: RegExp = /(([A-ZÄÖÅ0-9\-\_\.])+@[A-ZÄÖÅ\_]+?(\.[A-ZÄÖÅ]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>');

        // If there are hrefs in the original text, let's split
        // the text up and only work on the parts that don't have urls yet.
        const count: string[] = inputText.match(/<a href/g) || [];

        if (count.length > 0) {
            // Keep delimiter when splitting
            const splitInput: string[] = inputText.split(/(<\/a>)/g);
            for (let i: number = 0; i < splitInput.length; i++) {
                if (isNil(splitInput[i].match(/<a href/g))) {
                    splitInput[i] = splitInput[i]
                        .replace(replacePattern1, '<a href="$1" target="_blank">$1</a>')
                        .replace(replacePattern2, '$1<a href="https://$2" target="_blank">$2</a>')
                        .replace(replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>');
                }
            }
            return splitInput.join('');
        }
        return replacedText;
    }

    private highlightTags(commentModel: CommentModelEnriched, html: string): string {
        if (this.#options.enableHashtags) {
            html = this.highlightHashtags(commentModel, html);
        }
        if (this.#options.enablePinging) {
            html = this.highlightPings(commentModel, html);
        }
        return html;
    }

    private highlightHashtags(_commentModel: CommentModelEnriched, html: string): string {
        if (html.indexOf('#') !== -1) {
            const regex: RegExp = CommentContentFormatter.HASHTAG_REGEXP;
            html = html.replace(regex, (_$0, $1, $2) => $1 + this.createHashTag($2));
        }
        return html;
    }

    private createHashTag(hashTagText: string): string {
        const tag: HTMLElement = this.#tagFactory.createTagElement('#' + hashTagText, 'hashtag', hashTagText, {
            'data-type': '#',
        });
        return tag.outerHTML;
    }

    private highlightPings(commentModel: CommentModelEnriched, html: string): string {
        if (html.indexOf('@') !== -1) {
            for (const userId in commentModel.pings) {
                const displayName: string = commentModel.pings[userId] || userId;
                const pingText: string = '@' + userId;
                html = html.replace(new RegExp(pingText, 'g'), this.createUserTag(`@${displayName}`, userId));
            }
        }
        return html;
    }

    private createUserTag(pingText: string, userId: string): string {
        const tag: HTMLElement = this.#tagFactory.createTagElement(pingText, 'ping', userId, {
            'data-user-id': userId,
            'data-type': '@',
        });
        return tag.outerHTML;
    }

    #hashtagClicked: (e: MouseEvent) => void = (e) => {
        const el: HTMLElement = e.currentTarget as HTMLElement;
        const value: string = el.getAttribute('data-value')!;
        this.#options.hashtagClicked(value);
    };

    #pingClicked: (e: MouseEvent) => void = (e) => {
        const el: HTMLElement = e.currentTarget as HTMLElement;
        const value: string = el.getAttribute('data-value')!;
        this.#options.pingClicked(value);
    };
}
