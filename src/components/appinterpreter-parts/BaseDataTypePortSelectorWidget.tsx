import * as React from "react";
import { PortWidget, DefaultPortModel } from "storm-react-diagrams";
import { SinglePortWidget } from "components/appinterpreter-parts/SinglePortWidget";
import { LDPortModel } from "components/appinterpreter-parts/LDPortModel";
import { BaseDataTypeDropDown } from "components/basedatatypeinterpreter/BaseDataTypeDropDown";
import { GenericContainer } from "components/generic/genericContainer-component";

export interface BaseDataTypePortSelectorProps {
	model?: LDPortModel;
	in?: boolean;
	label?: string;
}

export interface BaseDataTypePortSelectorState {
	portType: string;
}

export class BaseDataTypePortSelector extends React.Component<BaseDataTypePortSelectorProps, BaseDataTypePortSelectorState> {
	public static defaultProps: BaseDataTypePortSelectorProps = {
		in: true,
		label: "port"
	};

	constructor(props: BaseDataTypePortSelectorProps) {
		super(props);
		this.state = { portType: null };
	}

	onPortTypeChange = (newType: string) => {
		this.setState({ portType: newType });
	}

	render() {
		var port = <SinglePortWidget node={this.props.model.getParent()} name={this.props.model.name} isMulti={true} />;
		var label = <div className="name">{this.props.model.label}</div>;

		return (
			<div className={"out-port top-port"}>
				<div>
					{label}
					<BaseDataTypeDropDown selectionChange={(newType) => { this.onPortTypeChange(newType); }} />
					<GenericContainer ldTokenString={this.props.model.id} displayedType={this.state.portType} searchCrudSkills="CrUd" />
				</div>
				{port}
			</div>
		);
	}
}
