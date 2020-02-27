import { AlpacaValidator, AlpacaCaster, AlapacaPrimitive, AlpacaTypeOptions } from "./tsdefs";
declare class AlpacaType {
    constructor(props: AlpacaTypeOptions);
    primitive: AlapacaPrimitive;
    null_or_non_empty_trimmed_string: boolean;
    validators: AlpacaValidator[];
    castings: AlpacaCaster[];
    cast(value: any): any;
    validate(value: any): boolean;
}
export default AlpacaType;
