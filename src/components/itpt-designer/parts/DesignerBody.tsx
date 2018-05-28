import { keys } from "lodash";

import { DesignerLogic, designerSpecificNodesColor } from "./designer-logic";
import { DefaultNodeModel, DefaultPortModel, DiagramWidget } from "storm-react-diagrams";
import { DesignerTray } from "./DesignerTray";
import { DesignerTrayItem } from "./DesignerTrayItem";
import { IItptInfoItem } from "defaults/DefaultitptRetriever";
import { BaseDataTypeNodeModel } from "./basedatatypes/BaseDataTypeNodeModel";
import { LDPortModel } from "./LDPortModel";
import { IBlueprintItpt } from "ldaccess/ldBlueprint";
import { IKvStore } from "ldaccess/ikvstore";
import { GeneralDataTypeNodeModel } from "./generaldatatypes/GeneralDataTypeNodeModel";
import * as appStyles from 'styles/styles.scss';
import { UserDefDict } from "ldaccess/UserDefDict";
import { DeclarationPartNodeModel } from "./declarationtypes/DeclarationNodeModel";
import { Component } from "react";
import { URLToMenuTree, treeDemoData } from "./URLsToMenuTree";

export interface DesignerBodyProps {
	logic: DesignerLogic;
}

export interface DesignerBodyState { }

/**
 * @author Jonathan Schneider
 */
export class DesignerBody extends Component<DesignerBodyProps, DesignerBodyState> {
	constructor(props: DesignerBodyProps) {
		super(props);
		this.state = {};
	}

	public trayItemsFromItptList() {
		let itpts: IItptInfoItem[] = this.props.logic.getItptList();
		itpts.sort((a, b) => {
			var x = a.nameSelf.toLowerCase();
			var y = b.nameSelf.toLowerCase();
			if (x < y) { return -1; }
			if (x > y) { return 1; }
			return 0;
		});

		itpts.splice(1, 0, null);
		let reactCompClasses: JSX.Element[] = itpts.map((itm, idx) => {
			if (idx === 0) {
				return <DesignerTrayItem key={idx} model={{ type: "bdt" }} name="Simple Data Type" color={appStyles["$designer-secondary-color"]} />;
			}
			if (idx === 1) {
				return <DesignerTrayItem key={idx} model={{ type: "inputtype" }} name="External Input Marker" color={appStyles["$designer-secondary-color"]} />;
			}
			let ldBPCfg = (itm.itpt as IBlueprintItpt).cfg;
			let trayName = ldBPCfg ? ldBPCfg.nameSelf : "unnamed";
			let trayItptType = ldBPCfg ? ldBPCfg.canInterpretType : itm.canInterpretType;
			return <DesignerTrayItem key={idx} model={{ type: "ldbp", bpname: trayName, canInterpretType: trayItptType, subItptOf: null }} name={trayName} color={appStyles["$designer-secondary-color"]} />;
		});
		return reactCompClasses;
	}

	render() {
		return (
			<div className="diagram-body">
				<DesignerTray>
					{this.trayItemsFromItptList()}
				</DesignerTray>
				<div
					className="diagram-layer"
					onDrop={(event) => {
						var data = JSON.parse(event.dataTransfer.getData("ld-node"));
						var nodesCount = keys(
							this.props.logic
								.getDiagramEngine()
								.getDiagramModel()
								.getNodes()
						).length;

						var node = null;
						switch (data.type) {
							case "ldbp":
								let nodeName: string = "Node " + (nodesCount + 1) + ":";
								node = new GeneralDataTypeNodeModel(nodeName, null, null, "rgba(250,250,250,0.2)");
								if (data.bpname) {
									this.props.logic.addLDPortModelsToNode(node, data.bpname);
									/*let newPorts: LDPortModel[] = data.ports as LDPortModel[];
									console.log("test1");
									console.dir(newPorts);
									for (var index = 0; index < newPorts.length; index++) {
										console.log(index +"index");
										var element: LDPortModel = newPorts[index];
										element.parentNode = node;
										node.addPort(element);
										//node.addPort(new LDPortModel(true, "test", "test" + "-out"));
									}*/
								}
								if (data.canInterpretType) node.canInterpretType = data.canInterpretType;
								break;
							case "bdt":
								var baseDataTypeKVStore: IKvStore = {
									key: UserDefDict.exportSelfKey,
									value: undefined,
									ldType: undefined
								};
								node = new BaseDataTypeNodeModel("Simple Data Type", null, null, "rgba(250,250,250,0.2)");
								node.addPort(new LDPortModel(false, "out-3", baseDataTypeKVStore, "output"));
								break;
							case "inputtype":
								var inputDataTypeKVStore: IKvStore = {
									key: UserDefDict.externalInput,
									value: undefined,
									ldType: undefined
								};
								node = new DeclarationPartNodeModel("External Input Marker", null, null, designerSpecificNodesColor);
								node.addPort(new LDPortModel(false, "out-4", inputDataTypeKVStore, UserDefDict.externalInput));
								break;
							default:
								break;
						}
						var points = this.props.logic.getDiagramEngine().getRelativeMousePoint(event);
						node.x = points.x;
						node.y = points.y;
						this.props.logic
							.getDiagramEngine()
							.getDiagramModel()
							.addNode(node);
						this.forceUpdate();
					}}
					onDragOver={(event) => {
						event.preventDefault();
					}}
				>
					<DiagramWidget diagramEngine={this.props.logic.getDiagramEngine()} />
				</div>
			</div>
		);
	}
}