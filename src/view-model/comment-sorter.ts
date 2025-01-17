import type { Functionalities } from '../options/functionalities.ts';
import type { CommentModelEnriched } from './comment-model-enriched.ts';
import { OptionsProvider } from '../common/provider.ts';
import { SortKey } from '../options/misc.ts';

export class CommentSorter {
    readonly #options: Required<Functionalities>;

    constructor(container: HTMLElement) {
        this.#options = OptionsProvider.get(container)!;
    }

    getSorter(sortKey: SortKey): (a: CommentModelEnriched, b: CommentModelEnriched) => number {
        if (sortKey === SortKey.POPULARITY) {
            // Sort by popularity
            return (commentA, commentB) => {
                let pointsOfA = commentA.allChildIds?.length ?? 0;
                let pointsOfB = commentB.allChildIds?.length ?? 0;

                if (this.#options.enableUpvoting) {
                    pointsOfA += commentA.upvoteCount ?? 0;
                    pointsOfB += commentB.upvoteCount ?? 0;
                }

                if (pointsOfB != pointsOfA) {
                    return pointsOfB - pointsOfA;
                }
                // Return newer if popularity is the same
                const createdA = commentA.createdAt.getTime();
                const createdB = commentB.createdAt.getTime();
                return createdB - createdA;
            };
        } // Sort by date
        return (commentA, commentB) => {
            const createdA = commentA.createdAt.getTime();
            const createdB = commentB.createdAt.getTime();
            if (sortKey === SortKey.OLDEST) {
                return createdA - createdB;
            }
            return createdB - createdA;
        };
    }
}
