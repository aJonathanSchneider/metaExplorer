import { ItptNodeModel, ItptNodeModelOptions } from "../_super/ItptNodeModel";
import { DECLARATION_MODEL } from "../node-editor-consts";

export interface DeclarationPartNodeModelOptions extends ItptNodeModelOptions {

} 

export class DeclarationPartNodeModel extends ItptNodeModel {

	static fromVars(nameSelf: string = "Untitled", subItptOf: string = null, canInterpretType: string = "", color: string = "rgb(0,192,255)", id?: string) {
		return new this({
			nameSelf,
			subItptOf,
			canInterpretType,
			color,
			isCompound: false,
			id
		})
	}
	constructor(options: DeclarationPartNodeModelOptions) {
		options.type = DECLARATION_MODEL;
		super(options);
	}
}
