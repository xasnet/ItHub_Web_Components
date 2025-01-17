/**
 * Ссылка на конкретный кастомный класс элемента;
 */
type CustomElementConstructor<E extends HTMLElement> = new (...args: any[]) => E;

export function defineCustomElement(
    ctor: CustomElementConstructor<HTMLElement>,
    selector: string,
    options?: ElementDefinitionOptions
): void {
    customElements.define(selector, ctor, options);
}
