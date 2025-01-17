import { CommentId, CommentModel } from '../options/models.ts';
import { CommentModelEnriched } from './comment-model-enriched.ts';

export interface CommentsById {
    readonly size: number;

    getComment(id: CommentId): CommentModelEnriched | undefined;

    setComment(comment: CommentModelEnriched): void;

    deleteComment(comment: CommentModel): boolean;

    getRootComments(): CommentModelEnriched[];

    getChildComments(parentId: CommentId): CommentModelEnriched[];

    merge(other: CommentsById): CommentsById;
}
