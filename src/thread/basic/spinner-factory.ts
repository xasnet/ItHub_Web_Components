import { Icons } from '../../options/icons.ts';
import { OptionsProvider } from '../../common/provider.ts';
import { createElement } from '../../common/html-element-factory.ts';

export class SpinnerFactory {
    readonly #options: Icons;

    constructor(container: HTMLElement) {
        this.#options = OptionsProvider.get(container)!;
    }

    createSpinner(inline: boolean = false): HTMLElement {
        const spinnerClasses: string = inline ? 'spinner inline' : 'spinner';
        const spinnerIconClasses: string = this.#options.spinnerIconURL?.length
            ? 'fa fa-circle-notch fa-spin image'
            : 'fa fa-circle-notch fa-spin';
        const spinnerIconStyles: string = this.#options.spinnerIconURL?.length
            ? `background-image: url('${this.#options.spinnerIconURL}')`
            : '';
        return createElement(`
            <span class="${spinnerClasses}">
                <i class="${spinnerIconClasses}" style="${spinnerIconStyles}">
                </i>
            </span>
        `);
    }
}
