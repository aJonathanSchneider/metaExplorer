import {
	ldBlueprint, NavProcessAtomBpCfg, AbstractNavProcessAtom,
	classNamesLD, VisualKeysDict, generateItptFromCompInfo
} from '@metaexplorer/core';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';
@ldBlueprint(NavProcessAtomBpCfg)
export class MDNavProcessAtom extends AbstractNavProcessAtom {

	protected renderSub = generateItptFromCompInfo.bind(this);

	protected renderCore(headerText: string, cancelTxt: string, confirmTxt: string, isHideBottom: boolean) {
		const { localValues } = this.state;
		return <div className="bottom-nav">
			<AppBar position="static"
				className={classNamesLD(null, localValues)}
			>
				<Toolbar>
					<IconButton edge="start" color="inherit" aria-label={headerText ? headerText : "cancel"}
						onClick={() => this.onCancelClick()}>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant="h6">
						{headerText ? headerText : "cancel"}
					</Typography>
				</Toolbar>
			</AppBar>
			<div className="bottom-nav-topfree mdscrollbar">
				{this.renderSub(VisualKeysDict.inputContainer)}
			</div>
			{isHideBottom ? null :
				<div className="bottom-nav-tabs flex-container">
					<Button
						className="flex-filler"
						onClick={() => this.onCancelClick()}>
						{cancelTxt ? cancelTxt : "cancel"}
					</Button>
					<Button
						className="flex-filler"
						onClick={() => this.onConfirmClick()}>
						{confirmTxt ? confirmTxt : "confirm"}
					</Button>
				</div>
			}
		</div>;
	}
}
