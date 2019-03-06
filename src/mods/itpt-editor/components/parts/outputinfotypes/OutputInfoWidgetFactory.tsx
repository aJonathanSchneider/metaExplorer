import { DiagramEngine, AbstractNodeFactory } from "storm-react-diagrams";
import { OutputInfoNodeWidgetFactory } from "./OutputInfoNodeWidget";
import { OUTPUT_INFO_MODEL } from "../editor-consts";
import { OutputInfoPartNodeModel } from "./OutputInfoNodeModel";

export class OutputInfoWidgetFactory extends AbstractNodeFactory<OutputInfoPartNodeModel> {
	constructor() {
		super(OUTPUT_INFO_MODEL);
	}

	generateReactWidget(diagramEngine: DiagramEngine, node: OutputInfoPartNodeModel): JSX.Element {
		return OutputInfoNodeWidgetFactory({
			node: node,
			diagramEngine: diagramEngine
		});
	}

	getNewInstance() {
		return new OutputInfoPartNodeModel();
	}
}
