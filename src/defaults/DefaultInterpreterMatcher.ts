import { LDConsts } from "ldaccess/LDConsts";

import { IItptMatcher } from "ldaccess/iinterpreter-matcher";
import { IKvStore } from "ldaccess/ikvstore";

import appIntRetrFn from 'appconfig/appInterpreterRetriever';
import { LDDict } from "ldaccess/LDDict";

//import ImageUploadComponent from 'components/imageupload-component';
import { PureImgDisplay } from 'components/imagedisplay-component';
import { PureBoolInput, PureIntInput, PureDoubleInput, PureTextInput, PureDateInput, PureDateTimeInput } from "components/basedatatypeinterpreter/BaseDataTypeInput";
import ImgHeadSubDescIntrprtr, { ImgHeadSubDescIntrprtrName, PureImgHeadSubDesc } from "components/visualcomposition/ImgHeadSubDescIntrprtr";
import { BottomNavigationName, PureBottomNavigation } from "components/ywqd/navigation/BottomNavigation";
import { PureNavBarWActions, NavBarWActionsName } from "components/ywqd/navigation/NavBarWActions";
import { ImageRetriever, imageRetrieverName } from "sidefx/ImageRetriever";
import { productRetrieverName, ProductRetriever } from "sidefx/ProductRetriever";
import { PureRefMapIntrprtr } from "components/generic/InterpreterReferenceMapType-component";
import { UserDefDict } from "ldaccess/UserDefDict";
import { organizationRetrieverName, OrganizationRetriever } from "sidefx/OrganizationRetriever";
import { RouteComponentName, PureRouteComponent } from "components/routing/route-component";
import { IItptRetriever } from "ldaccess/iinterpreter-retriever";
import { ILDOptions } from "ldaccess/ildoptions";
import { DEFAULT_ITPT_RETRIEVER_NAME } from "./DefaultInterpreterRetriever";

let matchIsType = (a: IKvStore) => a.key === LDConsts.type || a.key === LDConsts.isA;
let matchIsLang = (a: IKvStore) => a.key === LDConsts.lang;
let matchIsId = (a: IKvStore) => a.key === LDConsts.id || a.key === LDConsts.iri;

/**
 * the matcher is used for encapsuling the decision process that associates keys and values in a kv-store a matching interpreter.
 * Currently, this is also the place where additional Interpreters are registered to the AppInterpreterRetriever, because it's not
 * possible there
 */
export class DefaultItptMatcher implements IItptMatcher {
	private itptRetrieverMap: Map<string, IItptRetriever> = new Map();

getItptRetriever(itptRetrieverId: string): IItptRetriever {
	if (!itptRetrieverId) throw new Error("key must be defined");
	let rvCandidate = this.itptRetrieverMap.get(itptRetrieverId);
	if (!rvCandidate) {
		if (itptRetrieverId === DEFAULT_ITPT_RETRIEVER_NAME) {
			throw new Error("no default interpreter set for matcher");
		} else {
			rvCandidate = this.getItptRetriever(DEFAULT_ITPT_RETRIEVER_NAME); //fallback
		}
	}
	return rvCandidate;
}
setItptRetriever(itptRetrieverId: string, retriever: IItptRetriever) {
	if (!itptRetrieverId || !retriever) throw new Error("both key and retriever must be defined");
	this.itptRetrieverMap.set(itptRetrieverId, retriever);
}

matchSingleKV(single: IKvStore, crudSkills: string): ILDOptions {
	throw new Error("Method not implemented.");
}
matchLDOptions(matchInput: ILDOptions, crudSkills: string, itptRetrieverId: string): ILDOptions[] {
	let rv: ILDOptions[] = [];
	return rv;
	/*let ldType = multi.find(matchIsType);
	let ldLang = multi.find(matchIsLang);
	let ldId = multi.find(matchIsId);
	if (ldId !== null) {
		//this is a base object and has an id, if an interpreter-retriever for special IDs is defined, then it could be used here
		//return;
	}
	let searchTerm: Array<IKvStore>;
	if (ldType) {
		//this is a typed base object then
		let singleSearch: IKvStore = { key: undefined, value: undefined, ldType: ldType.value };
		searchTerm = [singleSearch];
	} else {
		searchTerm = [];
		for (let idx = 0; idx < multi.length; idx++) {
			const itm = multi[idx];
			if (itm && itm.ldType) {
				searchTerm.push(itm);
			}
		}

	}
	if (searchTerm) {
		if (searchTerm.length === 1) {
			let intrprtr = appIntRetrFn().searchForObjItpt(searchTerm[0].ldType, crudSkills);
			searchTerm[0].intrprtrClass = intrprtr;
			let rvAdd: IKvStore = searchTerm[0];
			rv.push(rvAdd);
			return rv;
		} else {
			searchTerm.forEach((elem) => {
				let intrprtr = appIntRetrFn().searchForObjItpt(elem.ldType, crudSkills);
				elem.intrprtrClass = intrprtr;
				//let rvAddMulti: IKvStore = { key: null, value: null, intrprtrClass: intrprtr, ldType: elem };
				rv.push(elem);
			});
			return rv;
		}

	}*/
}

}
