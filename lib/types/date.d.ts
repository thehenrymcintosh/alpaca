import AlpacaType from "./type";
import { AlpacaTypeOptions } from "./tsdefs";
export default class AlpacaDate extends AlpacaType {
    primitive: DateConstructor;
    constructor(props?: AlpacaTypeOptions);
}
