import { defineCustomElement } from '../common/custom-element.ts';
import { CommentElement } from './comment/comment-element.ts';
import { CommentSorter } from '../view-model/comment-sorter.ts';
import { CommentViewModel, CommentViewModelEvent } from '../view-model/comment-view-model.ts';
import type { CommentsOptions } from '../options';
import { CommentViewModelProvider, OptionsProvider, ServiceProvider } from '../common/provider.ts';
import { getHostContainer } from '../common/html-util.ts';
import type { CommentModelEnriched } from '../view-model/comment-model-enriched.ts';
import { SortKey } from '../options/misc.ts';
import { ToggleAllButtonElement } from './basic/toggle-all-button-element.ts';

export class ThreadElement extends CommentElement {
    #initialized: boolean = false;

    #options!: Required<CommentsOptions>;
    #commentViewModel!: CommentViewModel;
    #commentSorter!: CommentSorter;

    constructor() {
        super();
        this.innerHTML = `
            <ul class="child-comments"></ul>
        `;
    }

    static create(options: Pick<ThreadElement, 'commentModel'>): ThreadElement {
        const threadEl: ThreadElement = document.createElement('li', { is: 'ithub-thread' }) as ThreadElement;
        Object.assign(threadEl, options);
        return threadEl;
    }

    connectedCallback(): void {
        if (this.#initialized) return;

        super.connectedCallback();
        this.#initServices();
        this.#initElement();
        this.#initEmitterListeners();
        this.#initialized = true;
    }

    #initServices(): void {
        if (this.#initialized) return;
        const container: HTMLElement = getHostContainer(this);
        this.#options = OptionsProvider.get(container);
        this.#commentViewModel = CommentViewModelProvider.get(container);
        this.#commentSorter = ServiceProvider.get(container, CommentSorter);
    }

    #initElement(): void {
        // Child comments
        const replies: CommentModelEnriched[] = this.#commentViewModel.getChildComments(
            this.commentModel.id,
            this.#commentSorter.getSorter(SortKey.OLDEST)
        );

        replies.forEach((reply) => {
            this.#addComment(reply);
        });
        this.#prependToggleAllButton();
    }

    #addComment(commentModel: CommentModelEnriched): void {
        const commentEl: CommentElement = CommentElement.create({ commentModel: commentModel });

        const directParentEl: CommentElement =
            commentModel.parentId === this.commentModel.id
                ? this
                : this.querySelector(`li.comment[data-id="${commentModel.parentId}"]`)!;

        // Re-render action bar of direct parent element
        directParentEl.reRenderCommentActionBar();

        // Append element to DOM
        const childCommentsEl: HTMLElement = this.querySelector('.child-comments')!;
        const childComments = childCommentsEl.querySelectorAll(`li.comment[data-id="${commentModel.id}"]`);
        childComments?.forEach((el, idx) => {
            if (childComments[idx].id === el.id) {
                el.remove();
            }
        });

        childCommentsEl.append(commentEl);
    }

    #prependToggleAllButton(): void {
        ToggleAllButtonElement.prependToggleAllButton(this, this.#options);
    }

    #initEmitterListeners(): void {
        this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_ADDED, (commentId) => {
            const comment: CommentModelEnriched = this.#commentViewModel.getComment(commentId)!;
            if (this.commentModel.allChildIds.includes(commentId)) {
                this.#addComment(comment);
                this.#updateToggleAllButton();
            }
        });
    }

    #updateToggleAllButton(): void {
        ToggleAllButtonElement.updateToggleAllButton(this);
    }
}

defineCustomElement(ThreadElement, 'ithub-thread', { extends: 'li' });
