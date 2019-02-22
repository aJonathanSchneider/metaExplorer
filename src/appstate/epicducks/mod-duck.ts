import { Action, Store } from 'redux';
import { ActionsObservable, Epic, Options, ofType } from "redux-observable";
import { AjaxError, Observable } from "rxjs/Rx";
import { tap, mergeMap, map, catchError } from 'rxjs/operators';
import { IModStatePart, SingleModStateKeysDict, IModStatus } from 'appstate/modstate';
import { of, from } from 'rxjs';
import { ModAPI } from 'apis/mod-api';

export const MOD_LOAD_REQUEST = "Mod/MOD_LOAD_REQUEST";
export const MOD_LOAD_RESULT = "Mod/MOD_LOAD_RESULT";
export const MOD_LOAD_ERROR = "Mod/MOD_LOAD_ERROR";

export type ModAction =
	{ type: 'Mod/MOD_LOAD_REQUEST', modId: string }
	| { type: 'Mod/MOD_LOAD_RESULT', statusResult: IModStatus }
	| { type: 'Mod/MOD_LOAD_ERROR', modId: string, message: string };

export interface IModAjaxError {
	type: string;
	message: string;
}

export const loadMod = (modId: string) => ({
	type: MOD_LOAD_REQUEST,
	id: modId
});

export const loadModResult = (statusResult: IModStatus) => ({
	type: MOD_LOAD_RESULT,
	statusResult
});

export const loadModFailure = (modId: string, message: string): IModAjaxError => ({
	type: MOD_LOAD_ERROR,
	modId,
	message
});

export const modStatePartReducer = (
	state: IModStatePart, action: ModAction): IModStatePart => {
	let newState = Object.assign({}, state);
	switch (action.type) {
		case MOD_LOAD_REQUEST:
			newState.map[action.modId] = { id: action.modId, name: null, state: SingleModStateKeysDict.loading };
			return newState;
		case MOD_LOAD_RESULT:
			newState.map[action.statusResult.id] = action.statusResult;
			return newState;
		case MOD_LOAD_ERROR:
			newState.map[action.modId] = { id: action.modId, name: null, state: SingleModStateKeysDict.error, errorMsg: action.message };
			return newState;
		default:
			return newState;
	}
};

export const loadModEpic = (action$: ActionsObservable<any>, store: any, { modAPI }: any) => {
	const _MODAPI: ModAPI = modAPI;
	return action$.pipe(
		ofType(MOD_LOAD_REQUEST),
		tap(() => console.log("requesting Mod...")), // debugging
		mergeMap((action) => {
			let rv = from(_MODAPI.getModData(action.modId));
			return rv.pipe(
				map((response) => loadModResult(response as any))
				,
				catchError((error: Error) =>
					of(loadModFailure(action.modId,
						`An error occurred: ${error.message}`
					))));
		}
		)
	);
};

export default loadModEpic;