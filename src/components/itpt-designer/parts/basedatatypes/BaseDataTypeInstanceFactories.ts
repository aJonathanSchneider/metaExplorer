import { AbstractInstanceFactory } from "storm-react-diagrams";
import { BaseDataTypeNodeModel } from "./BaseDataTypeNodeModel";
import { LDPortModel } from "./../LDPortModel";
import { BASEDATATYPE_MODEL } from "./../designer-consts";

export class BaseDataTypeNodeFactory extends AbstractInstanceFactory<BaseDataTypeNodeModel> {
	constructor() {
		super(BASEDATATYPE_MODEL);
	}

	getInstance() {
		return new BaseDataTypeNodeModel();
	}
}