import { OBJECT_REF } from "./ObjectPropertyRef";
import { ILDOptions } from "./ildoptions";
import { ILDResource, ILDWebResource } from "./ildresource";
import { KVL } from "./KVL";
import { OutputKVMap, BlueprintConfig } from "./ldBlueprint";
import { LDError } from "../appstate/LDError";
import { LDApiConst } from "./LDconsts";

export const isItpt = (input: any): boolean => {
	if (!input) return false;
	return input.hasOwnProperty("cfg");
};

export const isUID = (input: string): boolean => {
	let regExp = new RegExp("^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$");
	return regExp.test(input);
};

export const isObjPropertyRef = (input: any): boolean => {
	if (!input) return false;
	return input.hasOwnProperty(OBJECT_REF);
};

/**
 * 	//iterates and return false at first non-equal value. Only checks KvStores, not the whole Resource!
 * @param a one of the ldOptions-Obj to compare
 * @param b the other ldOptions-Obj
 */
export const isLDOptionsSame = (a: ILDOptions, b: ILDOptions): boolean => {
	if ((!a || !b) && !(!a && !b)) return false;
	if (!a && !b) return true;
	if (a.isLoading !== b.isLoading) return false;
	if (a.lang !== b.lang) return false;
	if (a.ldToken !== b.ldToken) return false;
	if (!a.resource && !b.resource) return true;
	if (!(a.resource && b.resource)) return false;
	let kvsA = a.resource.kvStores;
	let kvsB = b.resource.kvStores;
	if (kvsA.length !== kvsB.length) return false;
	if (a.resource.webInResource || b.resource.webInResource) {
		if (a.resource.webInResource !== b.resource.webInResource) return false;
	}
	if (a.resource.webOutResource || b.resource.webOutResource) {
		if (a.resource.webOutResource !== b.resource.webOutResource) return false; //TODO: resources could have shallow object checks
	}
	let isKVsSame: boolean = kvsA.every((aVal, idx: number) => {
		let bVal = kvsB[idx];
		if (aVal.key !== bVal.key) return false;
		if (aVal.ldType !== bVal.ldType) return false;
		if (aVal.value || bVal.value) {
			if (JSON.stringify(aVal.value) !== JSON.stringify(bVal.value)) return false;
		}
		//if (aVal.intrprtrClass !== bVal.intrprtrClass) return false;
		return true;
	});
	return isKVsSame;
};

export const ldBlueprintCfgDeepCopy = (input: BlueprintConfig): BlueprintConfig => {
	let rv: BlueprintConfig;
	rv = JSON.parse(JSON.stringify(input));
	return rv;
};

export const ldOptionsDeepCopy = (input: ILDOptions): ILDOptions => {
	if (!input) throw new LDError("ldOptionsDeepCopy: input must not be null or undefined");
	let rv: ILDOptions;
	let newKVStores: KVL[] = [];
	input.resource.kvStores.forEach((elem) => {
		let newKey = elem.key ? "" + elem.key : null;
		let newValue = null;
		let valType = typeof elem.value;
		if (elem.value) {
			if (valType === 'object') {
				if (elem.value.constructor === Array) {
					let elemValAsArray: Array<any> = elem.value as Array<any>;
					newValue = elemValAsArray.slice(0, elemValAsArray.length);
				} else
					if (elem.value.constructor === Date) {
						newValue = new Date(elem.value);
					} else {
						newValue = { ...elem.value };
					}
			} else {
				newValue = elem.value;
			}
		}
		if (valType === 'boolean' || valType === 'number')
			newValue = elem.value;
		let newLDType = elem.ldType ? "" + elem.ldType : null;
		let newKvSingle: KVL = {
			//intrprtrClass: elem.intrprtrClass,
			key: newKey,
			value: newValue,
			ldType: newLDType
		};
		newKVStores.push(newKvSingle);
	});
	let newWebInResource: ILDWebResource = null;
	let newWebOutResource: string = null;
	let newResource: ILDResource = { kvStores: newKVStores, webOutResource: newWebOutResource, webInResource: newWebInResource };
	rv = {
		...input,
		resource: newResource
	};
	return rv;
};

export const isOutputKVSame = (a: OutputKVMap, b: OutputKVMap): boolean => {
	if ((!a || !b) && !(!a && !b)) return false;
	if (!a && !b) return true;
	let pnsA = Object.getOwnPropertyNames(a);
	let pnsB = Object.getOwnPropertyNames(b);
	if (pnsA.length !== pnsB.length) return false;
	let isSame = pnsA.every((aPN, idx: number) => {
		let aVal = a[aPN];
		let bVal = b[aPN];
		if (aVal.length !== bVal.length) return false;
		for (let i = 0; i < aVal.length; i++) {
			const elemA = aVal[i];
			const elemB = bVal[i];
			if (!elemA || !elemB) return false;
			if (elemA.targetProperty !== elemB.targetProperty) return false;
			if (elemA.targetLDToken.get() !== elemB.targetLDToken.get()) return false;
		}
		return true;
	});
	return isSame;
};

export const getKVValue = (input: KVL | string | number): any => {
	if (typeof input !== 'object') return input;
	if (!input || input.value === null || input.value === undefined) return null;
	if (input.value.constructor === Array) {
		if ((input.value as Array<any>).length === 1) return input.value[0];
	}
	if (isObjPropertyRef(input.value)) return null;
	return input.value;
};

export const itptKeysFromInputKvs = (inputKvStores: KVL[]): string[] => {
	let rv = [];
	inputKvStores.forEach((value) => {
		rv.push(value.key);
	});
	return rv;
};
/**
 * creates a URL in the ldui.net-namespace in the triplet notation
 * @param s subject
 * @param p verb
 * @param o object
 */
export const createLDUINSUrl = (s: string, p: string, o: string): string => {
	const spoAsVars: string = `spo?s=${s}&p=${p}&o=${o}`;
	const rv: string = `${LDApiConst.baseUrl}${LDApiConst.apiEndpoint}/${spoAsVars}`;
	return rv;
};
