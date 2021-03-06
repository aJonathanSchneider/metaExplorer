import * as React from 'react';
import { ITPTFullscreen } from './content/ITPTFullscreen';
import { LDRouteProps, BaseContainerRewrite } from '@metaexplorer/core';
import { ITransitComp, ITabData, Tabs, MiniToolBox, DragItem, StylableDragItemProps, ActiveStates } from 'metaexplorer-react-components';
import { EditorDNDItemType, IEditorBlockData, IEditorPreviewData, EditorClientPosition } from './editorInterfaces';
import { EditorTrayItem, EditorTrayItemProps } from './content/blockselection/EditorTrayItem';
import { PreviewMoveLayer, MTBItemDragContainer } from './panels/PreviewMoveLayer';

import { DNDEnabler } from './panels/DNDEnabler';
import { MainEditorDropLayer } from './panels/MainEditorDropLayer';
import { EditorTrayProps, EditorTray } from './content/blockselection/EditorTray';
// import { UserInfo } from './content/status/UserInfo';
import { TabDropLayer } from './panels/TabDropLayer';
import { NewItptPanel } from './new-itpt/newItptPanel';
import { NewItptNode, IITPTNameObj } from './new-itpt/newItptNodeDummy';
import { SaveStatus } from './content/status/SaveStatus';
import { IAsyncRequestWrapper } from '@metaexplorer/core';
import { LibraryPreviewVisual } from './content/librarypreview/LibraryPreviewVisuals';

const DND_CLASS = 'entrypoint-editor';
const TRANSIT_CLASS = 'editor-transit';

export interface EditorMainProps {
	isPreviewFullScreen: boolean;
	previewLDTokenString: string;
	libraryPreviewToken: string;
	routes: LDRouteProps;
	trayProps: EditorTrayProps;
	isLeftDrawerActive: boolean;
	isPreviewHidden: boolean;
	currentlyEditingItpt: string;
	onBlockItemDropped: (blockItem: DragItem<EditorDNDItemType, IEditorBlockData>, clientPosition: EditorClientPosition) => void;
	changeNodeCurrentlyEditing: (data: IEditorBlockData) => {};
	onNewBtnClick: (newNameObj: IITPTNameObj) => void;
	saveStatus: IAsyncRequestWrapper;
	onMiniChanged?: (isMini: boolean) => void;
	onUpClick?: () => void;
	onActiveStateChanged?: (activeState: ActiveStates) => void;
	isMini?: boolean;
	activeState?: ActiveStates;
}

type TabTypes = "nodeEditor" | "newNode";

export const EditorMain = (props: React.PropsWithChildren<EditorMainProps>) => {

	const [activeTab, setActiveTab] = React.useState<TabTypes>("nodeEditor");

	const [isPreviewFullScreen, setIsPreviewFullScreen] = React.useState<boolean>(props.isPreviewFullScreen);

	const [previewPosition, setPreviewPosition] = React.useState<{ top: number, left: number }>({ top: 120, left: 600 });

	const mtbProps: {
		onMiniChanged?: (isMini: boolean) => void;
		onMaxiClick?: () => void;
		onUpClick?: () => void;
		onActiveStateChanged?: (activeState: ActiveStates) => void;
		isMini?: boolean;
		activeState?: ActiveStates;
	} = {
		onMiniChanged: (mini) => props.onMiniChanged(mini),
		onMaxiClick: () => setIsPreviewFullScreen(true),
		onActiveStateChanged: (activeState) => props.onActiveStateChanged(activeState),
		//isMini: isMini,
		activeState: props.activeState
	};

	const mtbDragItem: DragItem<EditorDNDItemType, IEditorPreviewData> = {
		id: 'mtb',
		type: EditorDNDItemType.preview,
		sourceBhv: 'sGone',
		targetBhv: 'tCopy',
		data: {
			activeState: props.activeState,
			isMini: props.isMini
		}
	};

	const mtbStylableDragItem: StylableDragItemProps<EditorDNDItemType, IEditorPreviewData> = {
		...mtbDragItem,
		isWithDragHandle: true,
		className: 'mtb-dragcontainer',
		dragOrigin: { top: -10, left: -163 },
		isTransitDummy: true
	};

	const createTransitComponents: () => ITransitComp<EditorDNDItemType, (IEditorBlockData | IEditorPreviewData)>[] = () => {
		const rv: ITransitComp<EditorDNDItemType, (IEditorBlockData | IEditorPreviewData)>[] = [];
		//Blocks
		const editorTrayItemProps: EditorTrayItemProps = {
			isCompoundBlock: true,
			data: {
				type: 'bdt',
				label: 'TODO'
			},
			isOpen: false,
			// tslint:disable-next-line:no-empty
			onEditBtnPress: () => { },
			// tslint:disable-next-line:no-empty
			onTriggerPreview: () => { }
		};
		rv.push({
			forType: EditorDNDItemType.block,
			componentFactory: (dragItem) => (fProps) => <EditorTrayItem {...editorTrayItemProps}
				data={(fProps.data as IEditorBlockData)}
			></EditorTrayItem>
		});
		//Minitoolbox
		rv.push({
			forType: EditorDNDItemType.preview,
			componentFactory: (dragItem: DragItem<EditorDNDItemType, IEditorPreviewData>) => () => (
				<MTBItemDragContainer {...mtbStylableDragItem}>
					<MiniToolBox
						className='minitoolbox'
						activeState={dragItem.data.activeState}
						isMini={dragItem.data.isMini}
					></MiniToolBox>
				</MTBItemDragContainer>)
		});
		return rv;
	};

	const tabDatas: ITabData<TabTypes>[] = [
		{ data: 'nodeEditor', label: `current compound block: ${props.currentlyEditingItpt}` },
		{ data: 'newNode', label: 'new*' }
	];

	const onTabDrop = (item: DragItem<EditorDNDItemType, (IEditorBlockData)>, left, top) => {
		props.changeNodeCurrentlyEditing(item.data);
	};

	const onMainEditorDrop = (item, left, top) => {
		if (item.type === EditorDNDItemType.preview) {
			setPreviewPosition({ left, top });
		}
		if (item.type === EditorDNDItemType.block) {
			const clientPosition: EditorClientPosition = { clientX: left, clientY: top };
			props.onBlockItemDropped(item, clientPosition);
		}
	};

	//conditional returns
	if (isPreviewFullScreen) {
		return (
			<ITPTFullscreen
				onExitFullscreen={() => setIsPreviewFullScreen(false)}
				ldTokenString={props.previewLDTokenString}
				routes={props.routes} />
		);
	}
	if (activeTab === 'newNode') {
		return (
			<div className={DND_CLASS}>
				<div className="hidden-editor">{props.children}</div>
				<div className={`${DND_CLASS}-inner`}>
					<Tabs<TabTypes>
						className='editor-tabs'
						selectedIdx={1}
						tabs={tabDatas}
						onSelectionChange={(tabData) => { setActiveTab(tabData.data); }}
					></Tabs>
					<NewItptPanel>
						<NewItptNode onNewBtnClick={(newNameObj) => {
							props.onNewBtnClick(newNameObj);
							setActiveTab('nodeEditor');
						}} />
					</NewItptPanel>
				</div>
			</div>
		);
	}
	return (
		<DNDEnabler
			className={DND_CLASS}
			transitClassName={TRANSIT_CLASS}
			transitComponents={createTransitComponents()}
		>
			{props.children}
			<Tabs<TabTypes>
				className='editor-tabs'
				selectedIdx={0}
				tabs={tabDatas}
				onSelectionChange={(tabData) => {
					setActiveTab(tabData.data);
				}}
			></Tabs>
			<TabDropLayer onDrop={onTabDrop} ></TabDropLayer>
			<MainEditorDropLayer onDrop={onMainEditorDrop}></MainEditorDropLayer>
			{
				props.isPreviewHidden ?
					null
					: <PreviewMoveLayer<EditorDNDItemType>
						{...mtbProps}
						isMini={props.isMini}
						onUpClick={() => props.onUpClick()}
						previewPos={{ left: previewPosition.left, top: previewPosition.top }}
						previewItemType={EditorDNDItemType.preview}>
						<div className="app-content mdscrollbar">
							<BaseContainerRewrite key={props.previewLDTokenString} routes={props.routes} ldTokenString={props.previewLDTokenString} />
						</div>
					</PreviewMoveLayer>
			}
			<div className={`nav-drawer-wrapper ${props.isLeftDrawerActive ? "active" : "inactive"}`}>
				<EditorTray
					itpts={props.trayProps.itpts}
					onEditTrayItem={props.trayProps.onEditTrayItem.bind(this)}
					onTriggerPreview={props.trayProps.onTriggerPreview.bind(this)}
					onZoomAutoLayoutPress={() => props.trayProps.onZoomAutoLayoutPress()}
				>
					<div className="editor-library-trayheader">
						<LibraryPreviewVisual ldTokenString={props.libraryPreviewToken} />
						{/*
							<UserInfo userLabel="John Doe" projectLabel="JohnsPersonalProject" userIconSrc="" />
						*/}
					</div>
				</EditorTray>
			</div>
			<SaveStatus {...props.saveStatus} />
		</DNDEnabler>
	);
};
