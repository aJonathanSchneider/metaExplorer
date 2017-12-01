import React from 'react';

import * as redux from 'redux';
import { Provider } from 'react-redux';

import { ExplorerState, configureStore } from 'appstate/store';

//import {Observable} from 'rxjs';
import AppInterpreterDesigner from 'components/appinterpreter-designer';
import ImageUploadComponent from 'components/imageupload-component';
//import { DiagramEngine } from 'storm-react-diagrams'
import './styles/styles.scss';
import DevTools from './appstate/devTools';

const initialState: ExplorerState = {
	ldoptionsMap: {}
};

const isProduction = process.env.NODE_ENV === 'production';

export interface AppRootProps { }
const store: redux.Store<ExplorerState> = configureStore(initialState);

export const AppRoot: React.SFC<AppRootProps> = () => {
	return (
		<Provider store={store}>
			<div>
				<p>React is working</p>
				<AppInterpreterDesigner />
				<ImageUploadComponent />
				{!isProduction && <DevTools />}
			</div>
		</Provider>
	);
};
AppRoot.defaultProps = {};
