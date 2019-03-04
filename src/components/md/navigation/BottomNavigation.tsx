import { connect } from 'react-redux';
import { LDDict } from 'ldaccess/LDDict';
import { IKvStore } from 'ldaccess/ikvstore';
import ldBlueprint, { BlueprintConfig, IBlueprintItpt, OutputKVMap } from 'ldaccess/ldBlueprint';
import { ILDOptions } from 'ldaccess/ildoptions';
import { LDConnectedState, LDConnectedDispatch, LDOwnProps, LDLocalState } from 'appstate/LDProps';
import { mapStateToProps, mapDispatchToProps } from 'appstate/reduxFns';
import { UserDefDict } from 'ldaccess/UserDefDict';
import { VisualKeysDict, VisualTypesDict } from '../../visualcomposition/visualDict';

import { Tab, TabTheme } from 'react-toolbox/lib/tabs/';
import { Tabs, TabsTheme } from 'react-toolbox/lib/tabs/';

import { generateItptFromCompInfo, gdsfpLD, initLDLocalState } from '../../generic/generatorFns';
import { checkAllFilled } from 'GeneralUtils';
import { Redirect, Route } from 'react-router';
import { Component, ComponentClass, StatelessComponent } from 'react';
import { cleanRouteString } from '../../routing/route-helper-fns';
import { classNamesLD } from 'components/reactUtils/compUtilFns';

export const ICON_URLS: string[] = [
	"IconURL_1",
	"IconURL_2",
	"IconURL_3",
	"IconURL_4",
	"IconURL_5",
];
export const ICON_URLS_DISABLED: string[] = [
	"IconURL_1_Disabled",
	"IconURL_2_Disabled",
	"IconURL_3_Disabled",
	"IconURL_4_Disabled",
	"IconURL_5_Disabled"
];
export const ROUTES_SEND: string[] = [
	"RouteSend_1",
	"RouteSend_2",
	"RouteSend_3",
	"RouteSend_4",
	"RouteSend_5"
];

export const BOTTOMNAV_VALUE_FIELDS: string[] = [
	...ICON_URLS,
	...ICON_URLS_DISABLED,
	...ROUTES_SEND,
	VisualKeysDict.cssClassName,
	UserDefDict.outputKVMapKey
];

export const CHANGED_ROUTE_OUTPUT = "ChangedRoute";

export const BottomNavigationName = "shnyder/md/BottomNavigation";
export const TopNavigationName = "shnyder/md/TopNavigation";

let cfgIntrprtKeys: string[] =
	[VisualKeysDict.freeContainer];
let initialKVStores: IKvStore[] = [
	{
		key: VisualKeysDict.freeContainer,
		value: undefined,
		ldType: UserDefDict.intrprtrClassType
	}
];

for (let i = 0; i < ICON_URLS.length; i++) {
	cfgIntrprtKeys.push(ICON_URLS[i]);
	cfgIntrprtKeys.push(ICON_URLS_DISABLED[i]);
	cfgIntrprtKeys.push(ROUTES_SEND[i]);
	initialKVStores.push({
		key: ICON_URLS[i],
		value: undefined,
		ldType: LDDict.Text
	});
	initialKVStores.push({
		key: ICON_URLS_DISABLED[i],
		value: undefined,
		ldType: LDDict.Text
	});
	initialKVStores.push({
		key: ROUTES_SEND[i],
		value: undefined,
		ldType: VisualTypesDict.route_added
	});
}
cfgIntrprtKeys.push(VisualKeysDict.cssClassName);
initialKVStores.push({
	key: VisualKeysDict.cssClassName,
	value: undefined,
	ldType: LDDict.Text
});

initialKVStores.push({
	key: CHANGED_ROUTE_OUTPUT,
	value: undefined,
	ldType: VisualTypesDict.route_added
});

let bottomBpCfg: BlueprintConfig = {
	subItptOf: null,
	nameSelf: BottomNavigationName,
	initialKvStores: initialKVStores,
	interpretableKeys: cfgIntrprtKeys,
	crudSkills: "cRud"
};

export interface BottomNavState extends LDLocalState {
	isInitial: boolean;
	tabIdx: number;
	iconEnabledURLs: string[];
	iconDisabledURLs: string[];
	routes: string[];
	isGenerateAtPositions: boolean[];
	hasTabChanged: boolean;
	numTabs: number;
}
@ldBlueprint(bottomBpCfg)
export class PureBottomNavigation extends Component<LDConnectedState & LDConnectedDispatch & LDOwnProps, BottomNavState>
	implements IBlueprintItpt {

	static getDerivedStateFromProps(
		nextProps: LDConnectedState & LDConnectedDispatch & LDOwnProps,
		prevState: null | BottomNavState & LDLocalState)
		: null | BottomNavState & LDLocalState {
		let rvLD = gdsfpLD(
			nextProps, prevState, [VisualKeysDict.freeContainer], BOTTOMNAV_VALUE_FIELDS);
		let rvNew;
		if (!rvLD) {
			if (prevState.isInitial) {
				rvNew = prevState;
			} else {
				return null;
			}
		} else {
			rvNew = { ...rvLD, };
		}
		const iconEnabledURLs: string[] = [];
		const iconDisabledURLs: string[] = [];
		const routes: string[] = [];
		const isGenerateAtPositions: boolean[] = [];
		//handle KVs
		for (let idx = 0; idx < prevState.numTabs; idx++) {
			iconEnabledURLs[idx] = rvNew.localValues.get(ICON_URLS[idx]);
			iconDisabledURLs[idx] = rvNew.localValues.get(ICON_URLS_DISABLED[idx]);
			routes[idx] = rvNew.localValues.get(ROUTES_SEND[idx]);
			isGenerateAtPositions[idx] = checkAllFilled(
				iconEnabledURLs[idx],
				iconDisabledURLs[idx],
				routes[idx]
			);
		}
		//handle routes if some tabs are not entirely filled
		let tabIdx = prevState.tabIdx;
		if (nextProps.routes) {
			const { match } = nextProps.routes;
			if (!match) {
				console.error("BottomNavigation: No route information passed to BottomNavigation, can't switch tabs");
				return null;
			}
			//if (!match.params) match.params = { nextPath: null };

			let tabIdxCounter = 0;
			if (!prevState.hasTabChanged || prevState.isInitial) {
				let lastPath = location.pathname.replace(match.path, "");
				let isOnTopLayer = false;
				if (match.path === '/') {
					isOnTopLayer = true;
				}
				//lastPath = lastPath.startsWith("/") ? lastPath.substr(1) : lastPath;
				//lastPath = lastPath.split("/")[0];
				for (let idx = 0; idx < prevState.numTabs; idx++) {
					if (lastPath === routes[idx] || (isOnTopLayer && ('/' + lastPath === routes[idx]))) tabIdx = tabIdxCounter;
					if (isGenerateAtPositions[idx]) tabIdxCounter++;
				}
			}
		}
		return {
			...prevState, ...rvNew,
			isInitial: false,
			tabIdx,
			iconEnabledURLs,
			iconDisabledURLs,
			routes,
			isGenerateAtPositions
		};
	}

	cfg: BlueprintConfig;
	outputKVMap: OutputKVMap;
	consumeLDOptions: (ldOptions: ILDOptions) => any;
	initialKvStores: IKvStore[];

	protected renderFreeContainer = generateItptFromCompInfo.bind(this, VisualKeysDict.freeContainer);
	constructor(props: any) {
		super(props);
		this.cfg = (this.constructor["cfg"] as BlueprintConfig);
		this.state = {
			isInitial: true,
			tabIdx: 0,
			numTabs: 5,
			iconEnabledURLs: [],
			iconDisabledURLs: [],
			routes: [],
			isGenerateAtPositions: [],
			hasTabChanged: true,
			...initLDLocalState(this.cfg, props, [VisualKeysDict.freeContainer], BOTTOMNAV_VALUE_FIELDS)
		};
	}

	onTabChanged = (tabIdx) => {
		if (this.state.tabIdx !== tabIdx) {
			this.setState({ ...this.state, tabIdx, hasTabChanged: true });
		}
		const outRouteKV: IKvStore = {
			key: CHANGED_ROUTE_OUTPUT,
			value: undefined,
			ldType: VisualTypesDict.route_added
		};
		const outputKVMap = this.state.localValues.get(UserDefDict.outputKVMapKey);
		if (!outputKVMap) return;
		this.props.dispatchKvOutput([outRouteKV], this.props.ldTokenString, outputKVMap);
	}
	generateTab(imgSrcActive, imgSrcInActive: string, route: string, isActive: boolean, key: string): JSX.Element {
		//const mustRedirect = match && isActive && (match.params.lastPath !== undefined || match.params.lastPath !== null) && match.params.lastPath !== route;
		return <Tab label='' key={key} className="bottom-nav-tab" icon={isActive
			? <img src={imgSrcActive} height="inherit" />
			: <img src={imgSrcInActive} height="inherit" />}>
		</Tab>;
	}
	generateRedirect(tabIdx: number): JSX.Element {
		if (!this.props.routes || !this.state.hasTabChanged) return null;
		const { match, location } = this.props.routes;
		let cleanedTabIdx: number = tabIdx;
		for (let idx = tabIdx; idx >= 0; idx--) {
			if (!this.state.isGenerateAtPositions[idx]) {
				cleanedTabIdx++;
			}
		}
		let route: string = this.state.routes[cleanedTabIdx];
		//if (match.params.nextPath === undefined) match.params.nextPath = route;
		let newPath: string = cleanRouteString(route, this.props.routes);
		this.setState({ ...this.state, hasTabChanged: false });
		if (location.pathname === newPath) return null;
		return <Redirect to={newPath} />;
	}

	render() {
		const { numTabs, isGenerateAtPositions, iconEnabledURLs, iconDisabledURLs, routes, tabIdx, localValues } = this.state;

		let tabs = [];
		let cleanedTabIdx = tabIdx;
		for (let idx = 0; idx < numTabs; idx++) {
			const isGen = isGenerateAtPositions[idx];
			if (!isGen) {
				cleanedTabIdx++;
				continue;
			}
			let newTab = this.generateTab(
				iconEnabledURLs[idx],
				iconDisabledURLs[idx],
				routes[idx],
				cleanedTabIdx === idx,
				"t-" + idx);
			tabs.push(newTab);
		}
		return <div className={classNamesLD("bottom-nav", localValues)}>
			<div className="bottom-nav-topfree mdscrollbar">
				{this.generateRedirect(tabIdx)}
				<Route component={this.renderFreeContainer} />
				{this.props.children}
			</div>
			<Tabs index={tabIdx} onChange={this.onTabChanged} fixed className="bottom-nav-tabs">
				{tabs}
			</Tabs>
		</div>;
	}
}

let topBpCfg: BlueprintConfig = {
	subItptOf: null,
	nameSelf: TopNavigationName,
	initialKvStores: initialKVStores,
	interpretableKeys: cfgIntrprtKeys,
	crudSkills: "cRud"
};
@ldBlueprint(topBpCfg)
export class PureTopNavigation extends PureBottomNavigation {
	render() {
		const { numTabs, isGenerateAtPositions, iconEnabledURLs, iconDisabledURLs, routes, tabIdx, localValues } = this.state;

		let tabs = [];
		let cleanedTabIdx = tabIdx;
		for (let idx = 0; idx < numTabs; idx++) {
			const isGen = isGenerateAtPositions[idx];
			if (!isGen) {
				cleanedTabIdx++;
				continue;
			}
			let newTab = this.generateTab(
				iconEnabledURLs[idx],
				iconDisabledURLs[idx],
				routes[idx],
				cleanedTabIdx === idx,
				't-' + idx);
			tabs.push(newTab);
		}
		return <div className="top-nav">
			<Tabs index={tabIdx} onChange={this.onTabChanged} fixed className={classNamesLD("top-nav-tabs", localValues)}>
				{tabs}
			</Tabs>
			<div className="mdscrollbar top-nav-bottomfree">
				{this.generateRedirect(tabIdx)}
				<Route component={this.renderFreeContainer} />
				{this.props.children}
			</div>
		</div>;
	}
}
// export default connect<LDConnectedState, LDConnectedDispatch, LDOwnProps>(mapStateToProps, mapDispatchToProps)(PureBottomNavigation);
