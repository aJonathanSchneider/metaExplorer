import { useState } from "react";
import React from "react";
import { IEditorBlockData, EditorDNDItemType } from "../../editorInterfaces";
import { DragContainer, StylableDragItemProps } from "metaexplorer-react-components";

export interface EditorTrayItemProps {
	data: IEditorBlockData;
	onEditBtnPress: (data) => void;
	onTriggerPreview: (data) => void;
	isCompoundBlock: boolean;
	isOpen: boolean;
	onClick?: () => void;
}

export interface EditorTrayState {
}

export const EditorTrayItem: React.FC<EditorTrayItemProps> = (props) => {

	const trayCssClass = props.isOpen ? "editor-tray-item opened" : "editor-tray-item";
	const btnEditCssClass = props.isOpen ? "editor-btn editor-btn-edit opened" : "editor-btn editor-btn-edit";
	//const btnPreviewCssClass = props.isOpen ? "preview-iconbtn opened" : "preview-iconbtn";

	const renderContent = () => {
		return (
			<div
				onClick={
					//	props.isCompoundBlock ? 
					() => props.onClick()
					//	 : () => { return; }
				}
				className={trayCssClass}
			>
				{props.data.label}
				<button className={btnEditCssClass} onClick={(e) => {
					e.stopPropagation();
					props.onEditBtnPress(props.data);
				}} >edit</button>
			</div >
		);
	};
	/*
					<button className={btnPreviewCssClass} onClick={(e) => {
					e.stopPropagation();
					props.onTriggerPreview(props.data);
				}} >preview</button>
	*/

	return (
		<>{renderContent()}</>
	);

};

export const DraggableEditorTrayItem: React.FC<EditorTrayItemProps & StylableDragItemProps<EditorDNDItemType, IEditorBlockData>> = (props) => {

	const [isTrayOpen, setIsTrayOpen] = useState(false);
	function handleClick() {
		setIsTrayOpen(props.isCompoundBlock ? !isTrayOpen : false);
		if (!props.isCompoundBlock) props.onTriggerPreview(props.data);
	}
	//assigns part of the props to properties of a sub-element https://stackoverflow.com/a/39333479/1149845
	const dragContainerProps: StylableDragItemProps<EditorDNDItemType, IEditorBlockData> =
		(({ className, data, id, isWithDragHandle, dragOrigin, sourceBhv, targetBhv, type }) =>
			({ className, data, id, isWithDragHandle, dragOrigin, sourceBhv, targetBhv, type }))(props);
	const editorTrayItemProps: EditorTrayItemProps =
		(({ isCompoundBlock, data, onEditBtnPress, onTriggerPreview: onTriggerPreview, isOpen, onClick }) =>
			({ isCompoundBlock, data, onEditBtnPress, onTriggerPreview, isOpen, onClick }))(props);
	editorTrayItemProps.isOpen = isTrayOpen;
	if (editorTrayItemProps.onClick) {
		editorTrayItemProps.onClick = () => {
			handleClick();
			props.onClick();
		};
	} else {
		editorTrayItemProps.onClick = handleClick;
	}
	return (<DragContainer<EditorDNDItemType, IEditorBlockData>
		{...dragContainerProps}
	>
		<EditorTrayItem {...editorTrayItemProps} />
	</DragContainer >);
};
