import * as React from "react";
import { AbstractLabelFactory, DefaultLabelModel, DiagramEngine } from "@projectstorm/react-diagrams";
import { SettingsLabelWidget } from "./SettingsLabelWidget";

/**
 * @author Jonathan Schneider
 */
export class SettingsLabelFactory extends AbstractLabelFactory<DefaultLabelModel> {
	constructor() {
		super("default");
	}

	generateReactWidget(diagramEngine: DiagramEngine, label: DefaultLabelModel): JSX.Element {
		return <SettingsLabelWidget model={label} />;
	}

	getNewInstance(initialConfig?: any): DefaultLabelModel {
		return new DefaultLabelModel();
	}
}
