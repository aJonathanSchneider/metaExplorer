import { createStore, applyMiddleware, Store, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './rootduck';
import { ajax } from 'rxjs/observable/dom/ajax';
import { ImageUploadAPI } from 'apis/image-upload';
import { ILDOptions } from 'ldaccess/ildoptions';
import { LDOptionsAPI } from 'apis/ldoptions-api';
import DevTools from './devTools';
import { IBlueprintInterpreter } from 'ldaccess/ldBlueprint';

const imgUploader: ImageUploadAPI = new ImageUploadAPI();
const ldOptionsAPI: LDOptionsAPI = new LDOptionsAPI();

const epicMiddleware = createEpicMiddleware(rootEpic, {
  dependencies: {
    imgULAPI: imgUploader,
    ldOptionsAPI: ldOptionsAPI
  }
});

export interface ILDOptionsMapStatePart {
  [s: string]: ILDOptions;
}

export interface ILDNonvisualIntrprtrMapStatePart {
  [s: string]: IBlueprintInterpreter;
}

const isProduction = process.env.NODE_ENV === 'production';
let middleWare = isProduction ? applyMiddleware(epicMiddleware) : (applyMiddleware(epicMiddleware), DevTools.instrument());
export interface ExplorerState {
  isSaving?: boolean;
  isLoading?: boolean;
  //error: string,
  ldoptionsMap: ILDOptionsMapStatePart;
  ldNonVisualMap: ILDNonvisualIntrprtrMapStatePart;
}
export function configureStore(initialState: ExplorerState): Store<ExplorerState> {
  const store: Store<ExplorerState> = createStore<ExplorerState>(
    rootReducer,
    initialState,
    (applyMiddleware(epicMiddleware),
      DevTools.instrument())
  );
  return store;
}

export default configureStore;
