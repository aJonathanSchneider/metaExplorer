import {
	changeMainAppItpt,
	IModSpec,
	SingleModStateKeysDict,
} from "@metaexplorer/core";
import {
	MOD_MATERIALDESIGN_ID,
	initMaterialDesignMod,
} from "@metaexplorer-mods/material-design";
import {
	MOD_USERITPT_ID,
	initUSERITPTClientMod,
} from "@metaexplorer-mods/useritpt";
import {
	initMetaExplorerMod,
	MOD_METAEXPLORERIO_ID,
} from "@metaexplorer-mods/metaexplorer.io";
import {
	MOD_QRCODEGENSCAN_ID,
	initQRCODEGENClientMod,
} from "@metaexplorer-mods/qr-code-genscan";
import {
	MOD_ITPTEDITOR_ID,
	initItptEditorMod,
} from "@metaexplorer-mods/itpt-editor";
import { isProduction } from "@metaexplorer/core";
import { initGoogleMod, MOD_GOOGLE_ID } from "@metaexplorer-mods/google";

export function setupRequiredMods(): IModSpec[] {
	//mod initialization functions
	const modSpecs: IModSpec[] = [];
	modSpecs.push({
		id: MOD_QRCODEGENSCAN_ID,
		initFn: () => initQRCODEGENClientMod(),
		dependencies: [],
	});
	modSpecs.push({
		id: MOD_ITPTEDITOR_ID,
		initFn: () =>
			initItptEditorMod(),
		dependencies: [],
	});
	modSpecs.push({
		id: MOD_MATERIALDESIGN_ID,
		initFn: () => initMaterialDesignMod(),
		dependencies: [],
	});
	modSpecs.push({
		id: MOD_GOOGLE_ID,
		initFn: () => initGoogleMod(),
		dependencies: [],
	});
	modSpecs.push({
		id: MOD_USERITPT_ID,
		initFn: () => initUSERITPTClientMod(isProduction),
		dependencies: [],
	});
	modSpecs.push({
		id: MOD_METAEXPLORERIO_ID,
		initFn: () => initMetaExplorerMod(),
		dependencies: [MOD_USERITPT_ID],
	});
	//the final app is also a mod
	const MOD_NAME = "mxp-init-name";
	const MOD_ID = "mxp-init-id";
	modSpecs.push({
		id: MOD_ID,
		initFn: () => {
			const startItpt = "sitewide/navigation/index";
			changeMainAppItpt(startItpt, []);
			return new Promise((resolve, reject) => {
				resolve({
					id: MOD_ID,
					name: MOD_NAME,
					state: SingleModStateKeysDict.readyToUse,
				});
			});
		},
		dependencies: [MOD_METAEXPLORERIO_ID],
	});
	return modSpecs;
}
