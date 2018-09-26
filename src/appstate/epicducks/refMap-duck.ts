import { ILDOptionsMapStatePart, ExplorerState } from "../store";
import { ILDOptions } from "ldaccess/ildoptions";
import ldBlueprint, { BlueprintConfig, IBlueprintItpt, OutputKVMap, OutputKVMapElement } from "ldaccess/ldBlueprint";
import { ActionsObservable } from "redux-observable";
import { Observable } from 'rxjs/Rx';
import { IKvStore } from "ldaccess/ikvstore";
import { ObjectPropertyRef } from "ldaccess/ObjectPropertyRef";
import { LDDict } from "ldaccess/LDDict";
import { UserDefDict } from "ldaccess/UserDefDict";
import { isObjPropertyRef, ldBlueprintCfgDeepCopy } from "ldaccess/ldUtils";
import { getKVStoreByKey } from "ldaccess/kvConvenienceFns";
import { ITPT_REFMAP_BASE } from "ldaccess/iitpt-retriever";
import { refMapBaseTokenStr, ILDToken, NetworkPreferredToken, createConcatNetworkPreferredToken } from "ldaccess/ildtoken";
import { appItptMatcherFn } from "appconfig/appItptMatcher";
import { ReduxItptRetriever } from "ld-react-redux-connect/ReduxItptRetriever";
import { Store, Action } from "redux";
import { isReactComponent } from "components/reactUtils/reactUtilFns";
import { connectNonVisLDComp } from "sidefx/nonVisualConnect";

import { concat as concat$ } from 'rxjs/observable/concat';

/**
 * a duck for ReferenceMap-handling.
 * Note: No epic has been added yet
 */

export const REFMAP_REQUEST = 'shnyder/REFMAP_REQUEST'; //fills all static/non-ObjProp, nonldTkStrngRef,
export const REFMAP_SUCCESS = 'shnyder/REFMAP_SUCCESS';

export type RefMapRequestAction = { type: 'shnyder/REFMAP_REQUEST', ldOptionsBase: ILDOptions, refMap: BlueprintConfig };
export type RefMapSuccessAction = { type: 'shnyder/REFMAP_SUCCESS', ldOptionsBase: ILDOptions };
export type RefMapAction = RefMapRequestAction | RefMapSuccessAction;

//Action factories, return action Objects
export const refMapREQUESTAction = (updatedLDOptions: ILDOptions, refMap: BlueprintConfig): RefMapAction => (
	{ type: REFMAP_REQUEST, ldOptionsBase: updatedLDOptions, refMap }
);

export const refMapSUCCESSAction = (updatedLDOptions: ILDOptions): RefMapAction => (
	{ type: REFMAP_SUCCESS, ldOptionsBase: updatedLDOptions }
);

export const refMapReducer = (
	state: ILDOptionsMapStatePart = {}, action: RefMapAction): ILDOptionsMapStatePart => {
	switch (action.type) {
		case REFMAP_REQUEST:
			let baseRefMap: BlueprintConfig = action.refMap;
			let ldOptionsBase = action.ldOptionsBase;
			let isRefMapNeedsUpdate: boolean = true;
			//make sure the creation algorithm only runs once
			/*if (ldOptionsBase.visualInfo.interpretedBy) {
				if (action.refMap.nameSelf !== ldOptionsBase.visualInfo.interpretedBy) {
					isRefMapNeedsUpdate = true;
				} else {
					isRefMapNeedsUpdate = false;
				}
			} else {
				isRefMapNeedsUpdate = true;
			}*/
			if (isRefMapNeedsUpdate) {
				//makes sure a copy of the RefMap-KV exists in the ILDOptions-Object (basically pushes itpt-declaration
				// to runtime-model, while making sure the declaration isn't changed by being used)
				let stateCopy = { ...state };
				let modBPCfg: BlueprintConfig = ldBlueprintCfgDeepCopy(action.refMap);
				stateCopy = createRuntimeRefMapLinks(stateCopy, modBPCfg, ldOptionsBase);
				stateCopy = assignValuesToRuntimeRefMap(stateCopy, modBPCfg, ldOptionsBase);
				stateCopy = assignOutputKvMaps(stateCopy, modBPCfg, ldOptionsBase);
				ldOptionsBase.resource.kvStores.unshift(modBPCfg.initialKvStores.
					find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType));
				stateCopy[ldOptionsBase.ldToken.get()] = ldOptionsBase;
				return stateCopy;
			} else {
				return state;
			}
		case REFMAP_SUCCESS:
			return state;
		default:
			break;
	}
	return state;
};

const createRuntimeRefMapLinks: RefMapIteratorFn<ILDOptionsMapStatePart> = (
	modifiedObj: ILDOptionsMapStatePart,
	rmBPCfg: BlueprintConfig,
	ldOptions: ILDOptions
) => {
	let { subItptOf, canInterpretType, nameSelf } = rmBPCfg;
	let ldTkStr = ldOptions.ldToken.get();
	let ldBaseTokenStr = refMapBaseTokenStr(ldTkStr);
	//RefMaps have only one base, but are stored under individual ids. This will rename the base at runtime, for easier access
	rmBPCfg.interpretableKeys.forEach((a) => {
		if (isObjPropertyRef(a)) {
			let aAsOPR: ObjectPropertyRef = a as ObjectPropertyRef;
			if (aAsOPR.objRef === subItptOf) {
				aAsOPR.objRef = ldBaseTokenStr;
			} else {
				aAsOPR.objRef = createConcatNetworkPreferredToken(ldTkStr, aAsOPR.objRef).get();
			}
		}
	});
	let rmKv: IKvStore = rmBPCfg.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
	for (const rmSubCfgKey in rmKv.value) {
		if (rmKv.value.hasOwnProperty(rmSubCfgKey)) {
			//create links on refMap-Copy
			const rmSubCfg: BlueprintConfig = rmKv.value[rmSubCfgKey];
			rmSubCfg.initialKvStores.forEach((b) => {
				if (isObjPropertyRef(b.value)) {
					let aAsOPR: ObjectPropertyRef = b.value as ObjectPropertyRef;
					if (aAsOPR.objRef === subItptOf) {
						aAsOPR.objRef = ldBaseTokenStr;
					} else {
						aAsOPR.objRef = createConcatNetworkPreferredToken(ldTkStr, aAsOPR.objRef).get();
					}
				}
			});
		}
	}
	rmKv.value[ITPT_REFMAP_BASE] = rmKv.value[subItptOf];
	delete rmKv.value[subItptOf];
	return modifiedObj;
};

const assignValuesToRuntimeRefMap: RefMapIteratorFn<ILDOptionsMapStatePart> = (
	modifiedObj: ILDOptionsMapStatePart,
	rmBPCfg: BlueprintConfig,
	ldOptions: ILDOptions
) => {
	let rmKv: IKvStore = rmBPCfg.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
	let ldTkStr = ldOptions.ldToken.get();
	for (const rmSubCfgKey in rmKv.value) {
		if (rmKv.value.hasOwnProperty(rmSubCfgKey)) {
			const rmSubCfg: BlueprintConfig = rmKv.value[rmSubCfgKey];
			//create runtime-objects
			let rtNewToken: ILDToken = createConcatNetworkPreferredToken(ldTkStr, rmSubCfgKey);
			let rtNewTkStr: string = rtNewToken.get();
			let newInterpretedby: string = rmSubCfgKey === ITPT_REFMAP_BASE ? rmSubCfg.nameSelf : rmSubCfgKey;
			let rtLDOptions: ILDOptions = {
				lang: ldOptions.lang,
				isLoading: false,
				ldToken: rtNewToken,
				visualInfo: { retriever: ldOptions.visualInfo.retriever, interpretedBy: newInterpretedby },
				resource: { webInResource: null, webOutResource: null, kvStores: rmSubCfg.initialKvStores }
			};
			modifiedObj[rtNewTkStr] = rtLDOptions;
		}
	}
	let { interpretableKeys, initialKvStores } = rmBPCfg;
	//let modRefMapKV: IKvStore = rmBPCfg.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
	interpretableKeys.forEach((singleIntrpblKey) => {
		if (isObjPropertyRef(singleIntrpblKey)) {
			//property on another BPConfig
			let sKeyAsObjPropRef: ObjectPropertyRef = singleIntrpblKey as ObjectPropertyRef;
			let propName: string = sKeyAsObjPropRef.propRef;
			let stateLdTkStr: string = sKeyAsObjPropRef.objRef;
			let actualInputKv: IKvStore = ldOptions.resource.kvStores.find((a) => a.key === propName);
			if (!actualInputKv) return;
			let propIdx = modifiedObj[stateLdTkStr].resource.kvStores.findIndex((b) => b.key === propName);
			if (propIdx === -1) {
				modifiedObj[stateLdTkStr].resource.kvStores.unshift(actualInputKv);
			} else {
				modifiedObj[stateLdTkStr].resource.kvStores.splice(propIdx, 1, actualInputKv);
			}
		} else {
			//is string, property on this BPConfig
		}
	});
	return modifiedObj;
};

const assignOutputKvMaps: RefMapIteratorFn<ILDOptionsMapStatePart> = (
	modifiedObj: ILDOptionsMapStatePart,
	rmBPCfg: BlueprintConfig,
	ldOptions: ILDOptions
) => {
	let rmKv: IKvStore = rmBPCfg.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
	let ldTkStr = ldOptions.ldToken.get();
	const okvmMap: Map<string, OutputKVMap> = new Map();
	for (const rmSubCfgKey in rmKv.value) {
		if (rmKv.value.hasOwnProperty(rmSubCfgKey)) {
			const concatNWTk = createConcatNetworkPreferredToken(ldTkStr, rmSubCfgKey);
			const concatNWTkStr = concatNWTk.get();
			const rmSubCfg: BlueprintConfig = rmKv.value[rmSubCfgKey];
			let targetLDToken: ILDToken = new NetworkPreferredToken(concatNWTkStr);
			let outputKVs: OutputKVMap = {};
			rmSubCfg.initialKvStores.forEach((kv) => {
				const iKey = rmSubCfg.interpretableKeys.find((a) => a === kv.key);
				const iKeyStr: string = iKey as string;
				if (!iKeyStr) return;
				if (!isObjPropertyRef(kv.value)) return;
				const srcObjPropRef: ObjectPropertyRef = kv.value as ObjectPropertyRef;
				const srcObjRef: string = srcObjPropRef.objRef;
				if (!okvmMap.has(srcObjRef)) {
					okvmMap.set(srcObjRef, {});
				}
				okvmMap.get(srcObjRef)[srcObjPropRef.propRef] = { targetLDToken: targetLDToken, targetProperty: iKeyStr };
			});
		}
	}
	okvmMap.forEach((val, key) => {
		modifiedObj[key].resource.kvStores.push({ key: UserDefDict.outputKVMapKey, value: val, ldType: UserDefDict.outputKVMapType });
	});
	return modifiedObj;
};

/*
const itptRefMapTypeRMReqFn: RefMapIteratorFn<ILDOptionsMapStatePart> = (
	modifiedObj: ILDOptionsMapStatePart,
	rmBPCfg: BlueprintConfig,
	ldOptions: ILDOptions
) => {
	let rmKvVal: { [s: string]: BlueprintConfig } = originalRefMapKv.value;
	for (const rmSubCfgKey in rmKvVal) {
		if (rmKvVal.hasOwnProperty(rmSubCfgKey)) {
			const rmSubCfg = rmKvVal[rmSubCfgKey];

		}
	}
	return modifiedObj;
};*/

type RefMapIteratorFn<T> = (modifiedObj: T, rmBPCfg: BlueprintConfig, ldOptions: ILDOptions) => T;
/*
function traverseRefMap<MO>(
	modifiedObj: MO,
	rmBPCfg: BlueprintConfig,
	topLayerFn: RefMapIteratorFn<MO>,
	ioSigFn: RefMapIteratorFn<MO>,
	refMapFN: RefMapIteratorFn<MO>,
	ldOptions: ILDOptions): MO {
	let rv: MO = topLayerFn(modifiedObj, rmBPCfg, ldOptions);
	let refMapKV: IKvStore = rmBPCfg.initialKvStores && rmBPCfg.initialKvStores.length > 0
		? rmBPCfg.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType)
		: null;
	rv = ioSigFn(modifiedObj, rmBPCfg, ldOptions);
	rv = refMapKV ? refMapFN(modifiedObj, rmBPCfg, ldOptions) : rv;
	return rv;
	}*/

/*
function assignDerivedItpt(retriever: string, newLDTokenStr: string, bpCfg: BlueprintConfig, ldOptions: ILDOptions): void {
	let baseItpt = appItptMatcherFn().getItptRetriever(retriever).getItptByNameSelf(bpCfg.nameSelf);
	let wrappedItpt = ldBlueprint(bpCfg)(baseItpt);
	appItptMatcherFn().getItptRetriever(retriever).setDerivedItpt(newLDTokenStr, wrappedItpt);
}*/

export const refMapEpic = (action$: ActionsObservable<any>, store: Store<ExplorerState>) => {
	return action$.ofType(REFMAP_REQUEST)
		/*.do(() => console.log("REQUESTing Refmap Async part (itpt-retrieval)"))*/
		.mergeMap((action: RefMapRequestAction) => {
			let ldOptionsObj: ILDOptions = action.ldOptionsBase;
			let baseRefMap: BlueprintConfig = action.refMap;
			//let refMapREQUESTPromise = new Promise((resolve, reject) => {
			let rv = createItpts(ldOptionsObj, store);
			//	ldOptionsObj.isLoading = false;
			//	resolve(ldOptionsObj);
			//});
			//let rv = Observable.from(refMapREQUESTPromise);
			return concat$(
				rv,
				() => {
					ldOptionsObj.isLoading = false;
					return Observable.of(refMapSUCCESSAction(ldOptionsObj));
				});
		});
};

interface InstancePrepItm {
	outputKVs: OutputKVMap;
	concatNWTk: ILDToken;
	concatNWTkStr: string;
	originalBPCfgCopy: BlueprintConfig;
	subCfg: BlueprintConfig;
	itpt: any;
}

const createItpts: (
	ldOptions: ILDOptions,
	store: Store<ExplorerState>
) => ActionsObservable<RefMapAction> = (
	ldOptions: ILDOptions,
	store: Store<ExplorerState>
) => {
		let { retriever, interpretedBy } = ldOptions.visualInfo;
		let itptRetriever: ReduxItptRetriever = appItptMatcherFn().getItptRetriever(retriever) as ReduxItptRetriever;
		let ldTkStr = ldOptions.ldToken.get();
		let rmKv = ldOptions.resource.kvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
		let rmKvVal = rmKv.value;
		let instancePrep: Map<string, InstancePrepItm> = new Map();
		for (const rmSubCfgKey in rmKvVal) {
			if (rmKvVal.hasOwnProperty(rmSubCfgKey)) {
				const concatNWTk = createConcatNetworkPreferredToken(ldTkStr, rmSubCfgKey);
				const concatNWTkStr = concatNWTk.get();
				let newOutputKvMap: OutputKVMap = {};
				let newInstancePrepItm: InstancePrepItm = {
					concatNWTk: concatNWTk,
					concatNWTkStr: concatNWTkStr,
					outputKVs: newOutputKvMap,
					originalBPCfgCopy: null,
					subCfg: rmKvVal[rmSubCfgKey],
					itpt: null
				};
				instancePrep.set(concatNWTkStr, newInstancePrepItm);
			}
		}
		//prepare data
		instancePrep.forEach((element, prepSubCfgKey) => {
			let { subCfg, concatNWTkStr } = element;
			const subCfgsubItptOf: string = subCfg.subItptOf;
			let itpt: any = null;
			itpt = itptRetriever.getUnconnectedByNameSelf(subCfgsubItptOf);
			let originalBPCfgCopy: BlueprintConfig = ldBlueprintCfgDeepCopy(itpt.cfg);

			//let nonRMKvStores = ldOptions.resource.kvStores.filter(
			//	(itm, idx) => itm.key !== UserDefDict.intrprtrBPCfgRefMapKey);
			/*let targetLDToken: ILDToken = new NetworkPreferredToken(concatNWTkStr);
			let outputKVs: OutputKVMap = {};
			subCfg.initialKvStores.forEach((kv) => {
				const iKey = subCfg.interpretableKeys.find((a) => a === kv.key);
				const iKeyStr: string = iKey as string;
				if (!iKeyStr) return;
				if (!isObjPropertyRef(kv.value)) return;
				const srcObjPropRef: ObjectPropertyRef = kv.value as ObjectPropertyRef;
				instancePrep.get(srcObjPropRef.objRef).outputKVs[srcObjPropRef.propRef] = { targetLDToken: targetLDToken, targetProperty: iKeyStr };
			});*/
			instancePrep.set(prepSubCfgKey, { ...element, subCfg, originalBPCfgCopy, itpt });
		});
		let rvActions: Array<RefMapAction> = [];
		//assign data, create instances
		instancePrep.forEach((element, prepSubCfgKey) => {
			let { itpt, outputKVs, subCfg, originalBPCfgCopy, concatNWTkStr, concatNWTk } = element;
			//subCfg.initialKvStores.push({ key: UserDefDict.outputKVMapKey, value: outputKVs, ldType: UserDefDict.outputKVMapType });
			//this line will do the inheritance
			itpt = ldBlueprint(subCfg)(itpt);
			if (!isReactComponent(itpt)) {
				//instantiation of non-visual blueprints here
				connectNonVisLDComp(concatNWTkStr, new itpt());
				// TODO: determine outputKVMap here, maybe assign it to itpt-Blueprint-Class earlier, so that delta is always output
			} else {
				//instantiation done in React, Class defined here
				itptRetriever.setDerivedItpt(concatNWTkStr, itpt);
			}
			let itptAsCfg: BlueprintConfig = itpt.cfg as BlueprintConfig;
			if (!originalBPCfgCopy.initialKvStores) return;
			let itptRM = originalBPCfgCopy.initialKvStores.find((a) => a.ldType === UserDefDict.intrprtrBPCfgRefMapType);
			if (itptRM) {
				let newSubRMInputs: IKvStore[] = subCfg.initialKvStores;
				let newRMLDOptions: ILDOptions = {
					lang: ldOptions.lang,
					isLoading: false,
					ldToken: concatNWTk,
					visualInfo: { retriever: ldOptions.visualInfo.retriever, interpretedBy: itpt.nameSelf },
					resource: { webInResource: null, webOutResource: null, kvStores: newSubRMInputs }
				};
				rvActions.push(refMapREQUESTAction(newRMLDOptions, originalBPCfgCopy));
			}
		});
		let rv: ActionsObservable<RefMapAction> = ActionsObservable.from(rvActions);
		return rv;
	};
