import ldBlueprint from 'ldaccess/ldBlueprint';
import { LDLocalState } from 'appstate/LDProps';
import { Redirect } from 'react-router';
import { AbstractNavSearchBar, NavSearchBarBpCfg } from 'components/essentials/navigation/AbstractNavSearchBar';
import { cleanRouteString } from 'components/routing/route-helper-fns';
import { Toolbar, IconButton, AppBar, Input, InputBase } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import { classNamesLD } from 'components/reactUtils/compUtilFns';
import { VisualKeysDict } from 'components/visualcomposition/visualDict';

export const NavSearchBarName = "shnyder/material-design/NavSearchBar";
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
					{/*
					<Input
						onChange={(evt) => this.onSearchChange(evt.currentTarget.value)}>
						{searchValue}
					</Input>*/}
					<InputBase
						placeholder="Search…"
						defaultValue={searchValue}
						inputProps={{ onChange: (evt) => this.onSearchChange(evt.currentTarget.value) }}
					>{searchValue}</InputBase>
					{/*<SearchIcon />*/}
				</Toolbar>
			</AppBar>
			{this.renderInputContainer()}
		</>
		);
		/*
		<>
			<AppBar
				className={classNamesLD(null, localValues)}
			leftIcon='arrow_back' onLeftIconClick={() => this.onBackBtnClick()} rightIcon='search'>
				<Input type='text'
					className='searchbar-input'
					label=""
					name="searchInput"
					value={searchValue}
					onChange={(evt) => this.onSearchChange(evt)} />
			</AppBar>
			{this.renderInputContainer()}
		</>
		*/
	}
}
