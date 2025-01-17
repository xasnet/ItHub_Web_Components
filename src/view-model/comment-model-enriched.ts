import type { CommentId, CommentModel } from '../options/models.ts';

export interface CommentModelEnriched extends Readonly<CommentModel> {
    readonly directChildIds: CommentId[];
    readonly allChildIds: CommentId[];
    hasAttachments(): boolean;
    deplete<S extends Partial<CommentModel>>(mergeSource?: S): CommentModel & S;
}
