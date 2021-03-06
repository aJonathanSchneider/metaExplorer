import { LDRetrieverSuperRewrite, KVL, itptKeysFromInputKvs, ldBlueprint, BlueprintConfig,LDDict } from "@metaexplorer/core";
import { tokenStr } from "@metaexplorer-mods/keycloak";
import { RESPONSE_CONTENT } from "../apis/datatypes";
import { OnboardingAPI } from "../apis/onboardingAPI";

export const signinSignupName = "metaexplorer.io/onboarding/signinSignupRequest";
let inputKVStores: KVL[] = [
	{
		key: "payload",
		value: undefined,
		ldType: undefined
	},
	{
		key: tokenStr,
		value: undefined,
		ldType: LDDict.Text
	},
];

let outputKVStores: KVL[] = [
	{
		key: RESPONSE_CONTENT,
		value: undefined,
		ldType: LDDict.Text
	},
];

let ownKVLs = [...inputKVStores, ...outputKVStores];

let inKeys = itptKeysFromInputKvs(inputKVStores);
let bpCfg: BlueprintConfig = {
	subItptOf: null,
	nameSelf: signinSignupName,
	ownKVLs: ownKVLs,
	inKeys,
	crudSkills: "cRud"
};

@ldBlueprint(bpCfg)
export class SignInSignupRequest extends LDRetrieverSuperRewrite {
	constructor(parameters) {
		super(parameters, inKeys);
		this.apiCallOverride = () => new Promise((resolve, reject) => {
			const tokenValue = this.state.localValues.get(tokenStr);
			OnboardingAPI.getOnboardingAPISingleton().loginFetch(resolve, reject, tokenValue);
		});
	}
}
