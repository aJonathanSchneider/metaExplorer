import * as SRD from "storm-react-diagrams";
import { BaseDataTypeNodeModel } from "./BaseDataTypeNodeModel";
import { LDPortModel } from "./LDPortModel";

export class BaseDataTypeNodeFactory extends SRD.AbstractInstanceFactory<BaseDataTypeNodeModel> {
	constructor() {
		super("BaseDataTypeNodeModel");
	}

	getInstance() {
		return new BaseDataTypeNodeModel();
	}
}
