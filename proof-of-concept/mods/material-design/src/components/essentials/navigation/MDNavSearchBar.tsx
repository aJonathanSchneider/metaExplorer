import {ldBlueprint, LDLocalState, AbstractNavSearchBar, NavSearchBarBpCfg,
	cleanRouteString, classNamesLD, VisualKeysDict} from '@metaexplorer/core';
import { Redirect } from 'react-router';
import { Toolbar, IconButton, AppBar, InputBase } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';

export const NavSearchBarName = "metaexplorer.io/material-design/NavSearchBar";
export interface NavSearchBarState extends LDLocalState {
	searchValue: string;
	routeSendBack: string;
	isDoRedirect: boolean;
}
@ldBlueprint(NavSearchBarBpCfg)
export class MDNavSearchBar extends AbstractNavSearchBar {

	render() {
		const { isDoRedirect, routeSendBack, localValues } = this.state;
		if (isDoRedirect) {
			let route: string = cleanRouteString(routeSendBack, this.props.routes);
			this.setState({ ...this.state, isDoRedirect: false });
			return <Redirect to={route} />;
		}
		const searchValue = localValues.get(VisualKeysDict.searchText);
		return (<>
			<AppBar position="static"
				className={classNamesLD(null, localValues)}
			>
				<Toolbar>
					<IconButton edge="start" color="inherit"
						onClick={() => this.onBackBtnClick()}>
						<ArrowBackIcon />
					</IconButton>
					<InputBase
						placeholder="Search…"
						defaultValue={searchValue}
						inputProps={{ onChange: (evt) => this.onSearchChange(evt.currentTarget.value) }}
						value={searchValue}
					/>
				</Toolbar>
			</AppBar>
			{this.renderInputContainer()}
		</>
		);
	}
}
