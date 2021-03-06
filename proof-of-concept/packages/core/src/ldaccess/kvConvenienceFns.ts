import { KVL } from "./KVL";
import { ILDOptions } from "./ildoptions";
import { BlueprintConfig } from "./ldBlueprint";
import { LDError } from "../appstate";

export function getKVStoreByKey(input: KVL[], searchKey: string): KVL {
	let rv: KVL = null;
	if (input === undefined || input === null) throw new LDError("input must be set");
	if (!searchKey) throw new LDError("searchKey must be set");
	if (input && input.length > 0) {
		for (let i = 0; i < input.length; i++) {
			const elem = input[i];
			if (elem.key === searchKey) { rv = elem; break; }
		}
	}
	return rv;
}

export function getAllKVStoresByKey(input: KVL[], searchKey: string): KVL[] {
	let rv: KVL[] = [];
	if (input && input.length > 0) {
		for (let i = 0; i < input.length; i++) {
			const elem = input[i];
			if (elem.key === searchKey) { rv.push(elem); }
		}
	}
	return rv;
}

export function getKVStoreByKeyFromLDOptionsOrCfg(ldOptions: ILDOptions, cfg: BlueprintConfig, searchKey: string): KVL {
	let rv: KVL = null;
	let kvs = ldOptions && ldOptions.resource && ldOptions.resource.kvStores ? ldOptions.resource.kvStores : [];
	rv = kvs.find((val) => searchKey === val.key);
	rv = rv ? rv : cfg.ownKVLs.find((val) => searchKey === val.key);
	return rv;
}
