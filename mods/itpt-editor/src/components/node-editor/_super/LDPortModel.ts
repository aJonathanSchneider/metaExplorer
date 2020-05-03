import { PortModel, LinkModel, DefaultLinkModel, PortModelOptions, PortModelGenerics, PortModelAlignment } from "@projectstorm/react-diagrams";
import { merge } from "lodash";
import { IKvStore, isInputValueValidFor, arrayMove } from "@metaexplorer/core";
import { LD_PORTMODEL } from "../node-editor-consts";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";

export interface LDPortModelOptions extends PortModelOptions {
	in: boolean;
	label?: string;
	kv: IKvStore;
	linkSortOrder?: string[];
}

export interface LDPortModelGenerics extends PortModelGenerics {
	OPTIONS: LDPortModelOptions;
}

/**
 * @author Jonathan Schneider
 */
export class LDPortModel extends PortModel<LDPortModelGenerics> {
	in: boolean;
	label: string;
	kv: IKvStore;
	linkSortOrder: string[];

	static fromVars(isInput: boolean, name: string, kv: IKvStore, label: string = null, id?: string) {
		return new this({
			in: isInput,
			name,
			kv,
			label,
			id
		});
	}
	constructor(options: LDPortModelOptions){
		super({
			alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			type: LD_PORTMODEL,
			linkSortOrder: [],
			...options
		});
	}

	deSerialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
			//object, engine);
		this.in = event.data.in;
		this.label = event.data.label;
		this.kv = event.data.kv;
	}

	serialize() {
		return merge(super.serialize(), {
			in: this.in,
			label: this.label,
			kv: this.kv
		});
	}

	link(port: PortModel): LinkModel {
		let link = this.createLinkModel();
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link;
	}

	canLinkToPort(port: PortModel): boolean {
		let rv: boolean = true;
		if (port instanceof LDPortModel) {
			if (this.in === port.in) return false;
		} else {
			return false;
		}
		let ldPort = port as LDPortModel;
		if (ldPort.in) {
			rv = isInputValueValidFor(this.kv, ldPort.kv);
		} else {
			rv = isInputValueValidFor(ldPort.kv, this.kv);
		}
		return rv;
	}

	createLinkModel(): LinkModel {
		let link = super.createLinkModel();
		if (link) return link;
		let defaultLink = new DefaultLinkModel();
		defaultLink.addLabel("");
		return defaultLink;
	}

	removeLink(link: LinkModel) {
		super.removeLink(link);
		var idx = this.linkSortOrder.indexOf(link.getID());
		if (idx > -1) {
			this.linkSortOrder.splice(idx, 1);
		}
	}

	addLink(link: LinkModel) {
		super.addLink(link);
		this.linkSortOrder.push(link.getID());
	}

	decreaseLinksSortOrder(link: LinkModel) {
		const idx = this.linkSortOrder.indexOf(link.getID());
		if (idx > 0) {
			arrayMove(this.linkSortOrder, idx, idx - 1);
		}
	}

	increaseLinksSortOrder(link: LinkModel) {
		const idx = this.linkSortOrder.indexOf(link.getID());
		if (idx > -1 && idx <= this.linkSortOrder.length - 1) {
			arrayMove(this.linkSortOrder, idx, idx + 1);
		}
	}

	getLinksSortOrder(): string[] {
		return this.linkSortOrder;
	}
}
