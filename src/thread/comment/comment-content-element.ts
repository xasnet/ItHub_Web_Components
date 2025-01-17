import { defineCustomElement } from '../../common/custom-element.ts';
import type { CommentModelEnriched } from '../../view-model/comment-model-enriched.ts';
import type { AttachmentModel, CommentModel } from '../../options/models.ts';
import type { SuccessFct } from '../../options/callbacks.ts';
import { ButtonElement } from '../basic/button-element.ts';
import { CommentingFieldElement } from '../commenting-field/commenting-field-element.ts';
import { isNil } from '../../common/util.ts';
import { CommentElement } from './comment-element.ts';
import { findParentsBySelector, getHostContainer } from '../../common/html-util.ts';
import { TextareaElement } from '../commenting-field/textarea-element.ts';
import { createElement } from '../../common/html-element-factory.ts';
import { CommentViewModelProvider, OptionsProvider, ServiceProvider } from '../../common/provider.ts';
import { TagFactory } from '../basic/tag-factory.ts';
import { ProfilePictureFactory } from '../basic/profile-picture-factory.ts';
import {
    CommentViewModel,
    CommentViewModelEvent,
    CommentViewModelEventSubscription,
} from '../../view-model/comment-view-model.ts';
import type { CommentsOptions } from '../../options';
import { CommentContentFormatter } from './comment-content-formatter.ts';

export class CommentContentElement extends HTMLElement {
    commentModel!: CommentModelEnriched;

    #subscriptions: CommentViewModelEventSubscription[] = [];

    #options!: Required<CommentsOptions>;
    #commentViewModel!: CommentViewModel;
    #commentContentFormatter!: CommentContentFormatter;
    #profilePictureFactory!: ProfilePictureFactory;
    #tagFactory!: TagFactory;

    static create(options: Pick<CommentContentElement, 'commentModel'>): CommentContentElement {
        const commentContainer: CommentContentElement = document.createElement(
            'ithub-comment-content'
        ) as CommentContentElement;
        Object.assign(commentContainer, options);
        return commentContainer;
    }

    connectedCallback(): void {
        this.#initServices();
        this.#initElement();
        this.#subscriptions.push(
            this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_UPDATED, (commentId) => {
                if (commentId !== this.commentModel.id) {
                    return;
                }
                // Re-render the comment
                this.#initElement();
            })
        );
    }

    disconnectedCallback(): void {
        this.#subscriptions.forEach((s) => s.unsubscribe());
        this.#subscriptions = [];
    }

    #initServices(): void {
        if (this.#options) return;
        const container: HTMLElement = getHostContainer(this);
        this.#options = OptionsProvider.get(container);
        this.#commentViewModel = CommentViewModelProvider.get(container);
        this.#commentContentFormatter = ServiceProvider.get(container, CommentContentFormatter);
        this.#profilePictureFactory = ServiceProvider.get(container, ProfilePictureFactory);
        this.#tagFactory = ServiceProvider.get(container, TagFactory);
    }

    #initElement(): void {
        this.innerHTML = '';
        const commentWrapper: HTMLDivElement = document.createElement('div');
        commentWrapper.classList.add('comment-wrapper');

        // Profile picture
        const profilePicture: HTMLElement = this.#profilePictureFactory.createProfilePictureElement(
            this.commentModel.creatorUserId,
            this.commentModel.creatorProfilePictureURL
        );

        // Time
        const time: HTMLTimeElement = createElement(`
            <time title="${this.commentModel.createdAt.toLocaleString()}" datetime="${this.commentModel.createdAt.toISOString()}">
                <a href="${document.location.href}#comment-${this.commentModel.id}">
                    ${this.#options.timeFormatter(this.commentModel.createdAt)}
                </a>
            </time>
        `);

        // Comment header element
        const commentHeaderEl: HTMLDivElement = document.createElement('div');
        commentHeaderEl.classList.add('comment-header');

        // Name element
        const nameEl: HTMLSpanElement = document.createElement('span');
        nameEl.textContent = this.commentModel.createdByCurrentUser
            ? this.#options.youText
            : this.commentModel.creatorDisplayName || this.commentModel.creatorUserId;
        nameEl.classList.add('name');
        nameEl.setAttribute('data-user-id', this.commentModel.creatorUserId);
        commentHeaderEl.append(nameEl);

        // Highlight admin names
        if (this.commentModel.createdByAdmin) {
            nameEl.classList.add('highlight-font-bold');
        }

        // Show reply-to name if parent of parent exists
        if (this.commentModel.parentId) {
            const parent = this.#commentViewModel.getComment(this.commentModel.parentId)!;
            if (parent.parentId) {
                const replyTo: HTMLSpanElement = document.createElement('span');
                replyTo.classList.add('reply-to');
                replyTo.setAttribute('data-user-id', parent.creatorUserId);
                const parentLink: HTMLAnchorElement = document.createElement('a');
                parentLink.textContent = parent.creatorDisplayName || parent.creatorUserId;
                parentLink.href = `${document.location.href}#comment-${parent.id}`;

                // reply icon
                const replyIcon: HTMLElement = document.createElement('i');
                replyIcon.classList.add('fa', 'fa-share');

                if (this.#options.replyIconURL.length) {
                    replyIcon.style.backgroundImage = `url("${this.#options.replyIconURL}")`;
                    replyIcon.classList.add('image');
                }

                parentLink.prepend(replyIcon);
                replyTo.append(parentLink);
                commentHeaderEl.append(replyTo);
            }
        }

        // New tag
        if (this.commentModel.isNew) {
            const newTag: HTMLSpanElement = document.createElement('span');
            newTag.classList.add('new', 'highlight-background');
            newTag.textContent = this.#options.newText;
            commentHeaderEl.append(newTag);
        }

        // Wrapper
        const wrapper: HTMLDivElement = document.createElement('div');
        wrapper.classList.add('wrapper');

        // Content
        // =======
        const content: HTMLDivElement = document.createElement('div');
        content.classList.add('content');
        content.append(this.#commentContentFormatter.getFormattedCommentContent(this.commentModel));

        // Edited timestamp
        if (this.commentModel.modifiedAt && this.commentModel.modifiedAt !== this.commentModel.createdAt) {
            const editedTime: string = this.#options.timeFormatter(this.commentModel.modifiedAt);
            const edited: HTMLTimeElement = document.createElement('time');
            edited.classList.add('edited');
            edited.textContent = `${this.#options.editedText} ${editedTime}`;
            edited.setAttribute('title', this.commentModel.modifiedAt.toLocaleString());
            edited.setAttribute('datetime', this.commentModel.modifiedAt.toISOString());

            content.append(edited);
        }

        // Attachments
        // ===========
        const attachments: HTMLDivElement = document.createElement('div');
        attachments.classList.add('attachments');
        const attachmentPreviews: HTMLDivElement = document.createElement('div');
        attachmentPreviews.classList.add('previews');
        const attachmentTags: HTMLDivElement = document.createElement('div');
        attachmentTags.classList.add('tags');
        attachments.append(attachmentPreviews, attachmentTags);

        if (this.#options.enableAttachments && this.commentModel.hasAttachments()) {
            (this.commentModel.attachments as AttachmentModel<string>[])?.forEach((attachment) => {
                let type = undefined;

                // Type and format
                if (attachment.mimeType) {
                    const mimeTypeParts = attachment.mimeType.split('/');
                    if (mimeTypeParts.length === 2) {
                        type = mimeTypeParts[0];
                    }
                }

                // Preview
                if (type === 'image' || type === 'video') {
                    const previewRow = document.createElement('div');

                    // Preview element
                    const preview: HTMLAnchorElement = document.createElement('a');
                    preview.classList.add('preview');
                    preview.href = attachment.file;
                    preview.target = '_blank';
                    previewRow.append(preview);

                    if (type === 'image') {
                        // Case: image preview
                        const image: HTMLImageElement = document.createElement('img');
                        image.src = attachment.file;
                        preview.append(image);
                    } else {
                        // Case: video preview
                        const video: HTMLVideoElement = document.createElement('video');
                        video.controls = true;
                        const videoSource: HTMLSourceElement = document.createElement('source');
                        videoSource.src = attachment.file;
                        videoSource.type = attachment.mimeType;
                        video.append(videoSource);
                        preview.append(video);
                    }
                    attachmentPreviews.append(previewRow);
                }

                // Tag element
                const attachmentTag: HTMLElement = this.#tagFactory.createAttachmentTagElement(attachment);
                attachmentTags.append(attachmentTag);
            });
        }

        // Actions
        // =======
        const actions: HTMLSpanElement = this.#createActions(this.commentModel);

        wrapper.append(content, attachments, actions);
        commentWrapper.append(profilePicture, time, commentHeaderEl, wrapper);
        this.append(commentWrapper);
    }

    #createActions(commentModel: CommentModelEnriched): HTMLSpanElement {
        const actions: HTMLSpanElement = document.createElement('span');
        actions.classList.add('actions');

        // Separator
        const separator: HTMLSpanElement = document.createElement('span');
        separator.classList.add('separator');
        separator.textContent = '·';

        // Append buttons for actions that are enabled
        // Reply
        if (this.#options.enableReplying) {
            const reply: ButtonElement = ButtonElement.createActionButton('reply', this.#options.replyText, {
                onclick: this.#replyButtonClicked,
            });
            actions.append(reply);
        }

        // Upvotes
        if (this.#options.enableUpvoting) {
            const upvotes: ButtonElement = ButtonElement.createUpvoteButton(commentModel);
            actions.append(upvotes);
        }

        // Edit
        if ((commentModel.createdByCurrentUser || this.#options.currentUserIsAdmin) && !commentModel.isDeleted) {
            const editButton: ButtonElement = ButtonElement.createActionButton('edit', this.#options.editText, {
                onclick: this.#editButtonClicked,
            });
            actions.append(editButton);
        }

        // Delete
        if (this.#isAllowedToDelete(commentModel)) {
            const deleteButton: HTMLSpanElement = ButtonElement.createDeleteButton({
                onclick: this.#deleteButtonClicked,
            });
            actions.append(deleteButton);
        }

        // Append separators between the actions
        const actionsChildren: HTMLElement[] = [...actions.children] as HTMLElement[];
        for (let i: number = 0; i < actionsChildren.length; i++) {
            const action: HTMLElement = actionsChildren[i];
            if (action.nextSibling) {
                action.after(separator.cloneNode(true));
            }
        }

        return actions;
    }

    #replyButtonClicked: (e: MouseEvent) => void = (e) => {
        const replyButton: HTMLElement = e.currentTarget as HTMLElement;
        const outermostParent: HTMLElement = findParentsBySelector(replyButton, 'li.comment').last()!;
        const parentId: string | null = findParentsBySelector(replyButton, '.comment').first()!.getAttribute('data-id');

        // Remove existing field
        let replyField: CommentingFieldElement | null = outermostParent.querySelector(':scope > .commenting-field');
        let previousParentId: string | null = null;
        if (replyField) {
            previousParentId = replyField.querySelector<TextareaElement>('.textarea')!.parentId;
            replyField.remove();
        }

        // Create the reply field (do not re-create)
        if (previousParentId !== parentId) {
            replyField = CommentingFieldElement.create({ parentId: parentId });
            outermostParent.append(replyField);

            // Move cursor to end
            const textarea: TextareaElement = replyField.querySelector('.textarea')!;
            this.#moveCursorToEnd(textarea);

            // Ensure element stays visible
            replyField.scrollIntoView(false);
        }
    };

    #editButtonClicked: (e: MouseEvent) => void = (e) => {
        const editButton: HTMLElement = e.currentTarget as HTMLElement;
        const commentEl: CommentElement = findParentsBySelector<CommentElement>(editButton, 'li.comment').first()!;
        const commentWrapper: HTMLElement = commentEl.querySelector('.comment-wrapper')!;
        const commentModel: CommentModelEnriched = commentEl.commentModel;
        commentEl.classList.add('edit');

        // Get or create the editing field
        let editField: CommentingFieldElement | null = commentWrapper.querySelector(':scope > ithub-commenting-field');
        if (isNil(editField)) {
            editField = CommentingFieldElement.create({
                parentId: commentModel.parentId,
                existingCommentId: commentModel.id,
                onClosed: () => {
                    commentEl.classList.remove('edit');
                },
            });
            commentWrapper.append(editField);
        }

        // Move cursor to end
        const textarea: HTMLElement = editField.querySelector('.textarea')!;
        this.#moveCursorToEnd(textarea);

        // Ensure element stays visible
        editField.scrollIntoView(false);
    };

    #isAllowedToDelete(commentModel: CommentModelEnriched): boolean {
        return (
            this.#options.enableDeleting &&
            (this.#options.enableDeletingCommentWithReplies || !commentModel.directChildIds.length) &&
            (this.#options.currentUserIsAdmin || !!commentModel.createdByCurrentUser)
        );
    }

    #deleteButtonClicked: (e: MouseEvent) => void = (e) => {
        const deleteButton: ButtonElement = e.currentTarget as ButtonElement;
        if (!deleteButton.classList.contains('enabled')) {
            return;
        }
        const commentEnriched: CommentModelEnriched = Object.assign({}, this.commentModel);

        // Set button state to loading
        deleteButton.setButtonState(false, true);

        const success: SuccessFct<CommentModel> = (deletedComment) => {
            // Just to be sure
            deletedComment.isDeleted = true;
            // Notify about update and re-render the comment
            this.#commentViewModel.updateComment(deletedComment);

            // Reset button state
            deleteButton.setButtonState(false, false);
        };

        const error: () => void = () => {
            // Reset button state
            deleteButton.setButtonState(true, false);
        };

        this.#options.deleteComment(commentEnriched.deplete(), success, error);
    };

    #moveCursorToEnd(element: HTMLElement): void {
        // Focus
        element.focus();
    }

    reRenderCommentActionBar(): void {
        const commentModel: CommentModelEnriched = this.commentModel;
        const actions: HTMLSpanElement = this.#createActions(commentModel);

        this.querySelector('.actions')!.replaceWith(actions);
    }
}

defineCustomElement(CommentContentElement, 'ithub-comment-content');
