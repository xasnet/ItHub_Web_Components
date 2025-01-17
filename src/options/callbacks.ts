import type {
    AttachmentModel,
    CommentModel,
    CommentModelWithUpvotes,
    PingableUser,
    ReferenceableHashtag,
} from './models.ts';

export type SuccessFct<T> = (data: T) => void;
export type AcceptFct<T> = (data: T) => void;
export type ErrorFct = (e: unknown) => void;

export interface Callbacks {
    refresh?(): void;
    getComments(success: SuccessFct<CommentModel[]>, error: ErrorFct): void;
    searchUsers?(term: string, success: SuccessFct<PingableUser[]>, error: ErrorFct): void;
    searchTags?(term: string, success: SuccessFct<ReferenceableHashtag[]>, error: ErrorFct): void;
    postComment(comment: CommentModel, success: SuccessFct<CommentModel>, error: ErrorFct): void;
    putComment?(comment: CommentModel, success: SuccessFct<CommentModel>, error: ErrorFct): void;
    deleteComment?(comment: CommentModel, success: SuccessFct<CommentModel>, error: ErrorFct): void;
    upvoteComment?(
        comment: CommentModelWithUpvotes,
        success: SuccessFct<CommentModelWithUpvotes>,
        error: ErrorFct
    ): void;
    validateAttachments?(attachments: AttachmentModel<File>[], accept: AcceptFct<AttachmentModel<File>[]>): void;
    hashtagClicked?(hashtag: string): void;
    pingClicked?(userId: string): void;
}
