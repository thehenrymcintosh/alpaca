declare class AlpacaType {
    constructor(props: any);
    primitive: StringConstructor;
    null_or_non_empty_trimmed_string: boolean;
    validators: never[];
    castings: never[];
    cast(value: any): any;
    validate(value: any): boolean;
}
