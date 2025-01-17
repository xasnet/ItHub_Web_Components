import { noop } from '../common/util.ts';
import { SortKey } from './misc.ts';
import type { CommentsOptions } from './index.ts';
import { STYLE_SHEET } from '../css/stylesheet.ts';

function getDefaultTimeFormatter(): (timestamp: Date) => string {
    const rtf: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat();

    return (timestamp) => {
        const epochNow = Math.floor(new Date().getTime() / 1000);
        const epochTimestamp = Math.floor(timestamp.getTime() / 1000);
        // Difference in seconds
        let diff = epochTimestamp - epochNow;
        diff ||= -1;

        if (diff > -60) {
            // Менее минуты назад
            return rtf.format(diff, 'second');
        } else if (diff > -3_600) {
            // Меньше часа назад
            return rtf.format(Math.floor(diff / 60), 'minute');
        } else if (diff > -86_400) {
            // Меньше дня назад
            return rtf.format(Math.floor(diff / 3_600), 'hour');
        } else if (diff > -2_620_800) {
            // Менее месяца назад
            return rtf.format(Math.floor(diff / 86_400), 'day');
        } else if (diff > -7_862_400) {
            // Меньше трех месяцев
            return rtf.format(Math.floor(diff / 2_620_800), 'week');
        } // Давно
        return (
            timestamp.toLocaleDateString(undefined, { dateStyle: 'short' }) +
            ' ' +
            timestamp.toLocaleTimeString(undefined, { timeStyle: 'short' })
        );
    };
}

export function getDefaultOptions(): Required<CommentsOptions> {
    return {
        // Текущий пользователь
        profilePictureURL: '',
        currentUserIsAdmin: false,
        currentUserId: '',

        // Кастомизация иконок
        spinnerIconURL: '',
        upvoteIconURL: '',
        replyIconURL: '',
        uploadIconURL: '',
        attachmentIconURL: '',
        noCommentsIconURL: '',
        closeIconURL: '',

        // Подписи
        textareaPlaceholderText: 'Добавить комментарий',
        newestText: 'Сначала новые',
        oldestText: 'Сначала старые',
        popularText: 'Популярные',
        commentsHeaderText: 'Комментарии (__commentCount__)',
        sendText: 'Отправить',
        replyText: 'Ответить',
        editText: 'Редактировать',
        editedText: 'Отредактировано',
        youText: 'Вы',
        saveText: 'Сохранить',
        deleteText: 'Удалить',
        newText: 'Новые',
        viewAllRepliesText: 'Посмотреть все ответы (__replyCount__)',
        hideRepliesText: 'Скрыть ответы',
        noCommentsText: 'Нет комментариев',
        attachmentDropText: 'Перетащи файлы сюда',

        // Функциональность (true - включено, false - выключено)
        enableReplying: true,
        enableEditing: true,
        enableUpvoting: true,
        enableDeleting: true,
        enableAttachments: false,
        enableHashtags: false,
        enablePinging: false,
        enableDeletingCommentWithReplies: false,
        postCommentOnEnter: false,
        forceResponsive: false,
        readOnly: false,
        defaultNavigationSortKey: SortKey.NEWEST,

        // Коллбэки, тут настраиваем кастомные события
        searchUsers: (_term, success) => success([]),
        searchTags: (term, success) => success([{ tag: term }]),
        getComments: (success) => success([]),
        postComment: (comment, success) => success(comment),
        putComment: (comment, success) => success(comment),
        deleteComment: (comment, success) =>
            success({
                ...comment,
                content: 'Удалено',
                isDeleted: true,
            }),
        upvoteComment: (comment, success) => success(comment),
        validateAttachments: (attachments, accept) => accept(attachments),
        hashtagClicked: noop,
        pingClicked: noop,
        refresh: noop,

        // Форматтеры (например для пола / времени итп)
        timeFormatter: getDefaultTimeFormatter(),

        // Общие настройки
        styles: [STYLE_SHEET],
        highlightColor: '#2793e6',
        deleteButtonColor: '#c9302c',

        highlightOwnComments: true,
        roundProfilePictures: false,
        textareaRows: 2,
        textareaRowsOnFocus: 3,
        maxRepliesVisible: 2,
    };
}
