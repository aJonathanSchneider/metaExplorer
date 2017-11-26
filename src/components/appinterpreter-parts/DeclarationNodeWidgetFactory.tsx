import * as SRD from "storm-react-diagrams";
import { DeclarationNodeWidgetFactory } from "components/appinterpreter-parts/DeclarationNodeWidget";
import { DECLARATION_MODEL } from "components/appinterpreter-parts/designer-consts";

export class DeclarationWidgetFactory extends SRD.NodeWidgetFactory {
	constructor() {
		super(DECLARATION_MODEL);
	}

	generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.DefaultNodeModel): JSX.Element {
		return DeclarationNodeWidgetFactory({ node: node,
			diagramEngine: diagramEngine });
	}
}
