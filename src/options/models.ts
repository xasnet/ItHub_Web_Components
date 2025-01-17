export type UserId = string;
export type CommentId = string;
export type AttachmentId = string;

export interface UserDisplayNamesById {
    [userId: UserId]: string;
}

export interface AttachmentModel<F extends File | string = File | string> {
    id: AttachmentId;
    file: F;
    mimeType: string;
}

export interface CommentModel {
    id: CommentId;
    // Обязательно, если ответы включены
    parentId?: CommentId | null;
    createdAt: Date;
    // Обязательно, если редактирование включено
    modifiedAt?: Date;
    content: string;
    // Обязательно, если прикрепленные файлы включены
    attachments?: AttachmentModel[];
    // Обязательно, если пинг включен
    pings?: UserDisplayNamesById;
    creatorUserId: UserId;
    creatorDisplayName?: string;
    creatorProfilePictureURL?: string;
    isNew?: boolean;
    isDeleted?: boolean;
    createdByAdmin?: boolean;
    // Обязательно, если редактирование включено
    createdByCurrentUser?: boolean;
    // Обязательно, если голосование (лайки) включено
    upvoteCount?: number;
    // Обязательно, если голосование (лайки) включено
    upvotedByCurrentUser?: boolean;
}

export interface CommentModelWithUpvotes extends CommentModel {
    upvoteCount: number;
    upvotedByCurrentUser: boolean;
}

export interface PingableUser {
    id: UserId;
    displayName?: string;
    email?: string;
    profilePictureURL?: string;
}

export interface ReferenceableHashtag {
    tag: string;
    description?: string;
}