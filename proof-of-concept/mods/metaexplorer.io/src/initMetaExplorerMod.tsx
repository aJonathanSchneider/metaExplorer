import { ImgHeadSubDescIntrprtrName, PureImgHeadSubDesc } from "./ImgHeadSubDescIntrprtr";
import { ITPT_TAG_ATOMIC, appItptRetrFn, IModStatus, SingleModStateKeysDict } from "@metaexplorer/core";
import { PureHeroGallery, HeroGalleryName } from "./hero-gallery";
import { PureTitleTextAndImage, TitleTextAndImageName } from "./TitleTextAndImage";
import { GooeyNavName, PureGooeyNav } from "./gooey-nav";
import { PureImprint, ImprintName } from "./compliance/imprint";
import { LayoutCircleDisplayName, PureCircleLayout } from "./circleview";

import BP_CFG from './sidefx/BlogPreviewRetriever-bpcfg';
import {BlogPreviewRetriever} from './sidefx/BlogPreviewRetriever';

export const MOD_METAEXPLORERIO_ID = "METAEXPLORERIO_MOD";
export const MOD_METAEXPLORERIO_NAME = "MetaExplorer component Mod";

export function initMetaExplorerMod() {
	let appIntRetr = appItptRetrFn();
	const rv: Promise<IModStatus> = new Promise((resolve) => {
		appIntRetr.addItpt(HeroGalleryName, PureHeroGallery, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(ImgHeadSubDescIntrprtrName, PureImgHeadSubDesc, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(TitleTextAndImageName, PureTitleTextAndImage, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(GooeyNavName, PureGooeyNav, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(ImprintName, PureImprint, "cRud", [ITPT_TAG_ATOMIC]);
		appIntRetr.addItpt(LayoutCircleDisplayName, PureCircleLayout, "cRud", [ITPT_TAG_ATOMIC]);

		//sidefx
		appIntRetr.addItpt(BP_CFG.nameSelf, BlogPreviewRetriever, "cRud", [ITPT_TAG_ATOMIC])
		resolve({ id: MOD_METAEXPLORERIO_ID, name: MOD_METAEXPLORERIO_NAME, state: SingleModStateKeysDict.readyToUse, errorMsg: null });
	});
	return rv;
}
