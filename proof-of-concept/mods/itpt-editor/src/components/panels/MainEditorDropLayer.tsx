import * as React from 'react';
import { DropContainer, StylableDropContainerProps, DragItem } from 'metaexplorer-react-components';
import { EditorDNDItemType, IEditorBlockData, IEditorPreviewData } from '../editorInterfaces';

export interface MainEditorDropLayerProps {
	onDrop(item: DragItem<EditorDNDItemType, (IEditorBlockData | IEditorPreviewData)>, left: number, top: number);
}

const itptEditorDropContainerProps: StylableDropContainerProps<EditorDNDItemType, (IEditorBlockData | IEditorPreviewData)> = {
	onlyAppearOnDrag: true,
	acceptedItemTypes: [EditorDNDItemType.block, EditorDNDItemType.preview],
	className: 'editor-dropcontainer'
}

export function MainEditorDropLayer(props: MainEditorDropLayerProps) {
	return (<DropContainer<EditorDNDItemType, (IEditorBlockData | IEditorPreviewData)> {...itptEditorDropContainerProps}
		onItemDropped={(item, pos) => {
			props.onDrop(item, pos.left, pos.top)}
		}
		style={{ height: '100%', width: '100%', backgroundColor: 'red', opacity: 0.0 }}
	>

	</DropContainer>)
}