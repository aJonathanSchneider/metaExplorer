//import { PureMailChimpSignup, MailChimpSignupName } from "./condensedSignup";
import { ITPT_TAG_ATOMIC, appItptRetrFn, SingleModStateKeysDict, IModStatus  } from "@metaexplorer/core";
import { KeyCloakAuthCfg, kcloakAuthCfgName } from "./sidefx/KeyCloakAuthCfg";
import { KCAuthenticatorBtnName, KCAuthenticatorBtn } from "./components/KeyCloakLoginRegisterBtn";
import { keyCloakTokenStateName, KeyCloakTokenRetriever } from "./components/KeyCloakTokenRetriever";

export const MOD_KEYCLOAK_ID = "keycloak";
export const MOD_KEYCLOAK_NAME = "Keycloak Mod";

export function initKeycloakMod(): Promise<IModStatus> {
	const appIntRetr = appItptRetrFn();
	const rv: Promise<IModStatus> = new Promise((resolve, reject) => {
		appIntRetr.addItpt(kcloakAuthCfgName, KeyCloakAuthCfg, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(keyCloakTokenStateName, KeyCloakTokenRetriever, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(KCAuthenticatorBtnName, KCAuthenticatorBtn, "cRud", [ITPT_TAG_ATOMIC]);
		resolve({ id: MOD_KEYCLOAK_ID, name: MOD_KEYCLOAK_NAME, state: SingleModStateKeysDict.readyToUse, errorMsg: null });
	});
	return rv;
}
