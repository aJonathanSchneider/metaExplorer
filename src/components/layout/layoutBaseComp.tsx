import { connect } from 'react-redux';
import { IKvStore } from 'ldaccess/ikvstore';
import ldBlueprint, { BlueprintConfig, IBlueprintItpt, OutputKVMap } from 'ldaccess/ldBlueprint';
import { ILDOptions } from 'ldaccess/ildoptions';
import { LDConnectedState, LDConnectedDispatch, LDOwnProps, LDLocalState } from 'appstate/LDProps';
import { mapStateToProps, mapDispatchToProps } from 'appstate/reduxFns';
import { UserDefDict } from 'ldaccess/UserDefDict';
import { VisualDict } from '../visualcomposition/visualDict';

import { initLDLocalState, generateItptFromCompInfo, getDerivedItptStateFromProps, getDerivedKVStateFromProps } from '../generic/generatorFns';
import { Component, ComponentClass, StatelessComponent } from 'react';

let cfgIntrprtKeys: string[] =
	[VisualDict.freeContainer];
let initialKVStores: IKvStore[] = [
	{
		key: VisualDict.freeContainer,
		value: undefined,
		ldType: UserDefDict.intrprtrClassType
	}
];
export const createLayoutBpCfg: (nameSelf: string) => BlueprintConfig = (nameSelf: string) => {
	return {
		subItptOf: null,
		nameSelf: nameSelf,
		initialKvStores: initialKVStores,
		interpretableKeys: cfgIntrprtKeys,
		crudSkills: "cRud"
	};
};

export interface LayoutComponentState extends LDLocalState {
}

export abstract class PureLayoutComponent extends Component<LDConnectedState & LDConnectedDispatch & LDOwnProps, LayoutComponentState>
	implements IBlueprintItpt {

	static getDerivedStateFromProps(
		nextProps: LDConnectedState & LDConnectedDispatch & LDOwnProps,
		prevState: LayoutComponentState): null | LayoutComponentState {
		let rvLD = getDerivedItptStateFromProps(
			nextProps, prevState, [VisualDict.freeContainer]);
		let rvLocal = getDerivedKVStateFromProps(
			nextProps, prevState, []);
		if (!rvLD && !rvLocal) {
			return null;
		}
		let rvNew = { ...rvLD, ...rvLocal };
		return {
			...rvNew
		};
	}

	cfg: BlueprintConfig;
	outputKVMap: OutputKVMap;
	consumeLDOptions: (ldOptions: ILDOptions) => any;
	initialKvStores: IKvStore[];
	styleClassName: string;

	private renderFreeContainer = generateItptFromCompInfo.bind(this, VisualDict.freeContainer);

	constructor(props: any) {
		super(props);
		this.cfg = (this.constructor["cfg"] as BlueprintConfig);
		const ldState = initLDLocalState(this.cfg, props, [VisualDict.freeContainer],
			[]);
		this.state = {
			...ldState,
		};
	}
	render() {
		return <div className={this.styleClassName}>{this.renderFreeContainer()}</div>;
	}
}

export const LayoutVHCenteredColumnName = 'shnyder/layout/vh-centered-column';
@ldBlueprint(createLayoutBpCfg(LayoutVHCenteredColumnName))
export class PureVHcenteredColumnLayout extends PureLayoutComponent {
	styleClassName = "vh-centered-column";
}

export default connect<LDConnectedState, LDConnectedDispatch, LDOwnProps>(mapStateToProps, mapDispatchToProps)(PureVHcenteredColumnLayout);
