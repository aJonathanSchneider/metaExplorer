import { connect } from 'react-redux';
import { ExplorerState } from 'appstate/store';
import { uploadImgRequestAction } from 'appstate/epicducks/image-upload';
import { LDDict } from 'ldaccess/LDDict';
import { IKvStore } from 'ldaccess/ikvstore';
import ldBlueprint, { BlueprintConfig, IBlueprintItpt, OutputKVMap } from 'ldaccess/ldBlueprint';
import { ILDOptions } from 'ldaccess/ildoptions';
import { LDConnectedState, LDConnectedDispatch, LDOwnProps } from 'appstate/LDProps';
import { mapStateToProps, mapDispatchToProps } from 'appstate/reduxFns';
import { compNeedsUpdate } from 'components/reactUtils/compUtilFns';
import { getKVStoreByKey, getKVStoreByKeyFromLDOptionsOrCfg } from 'ldaccess/kvConvenienceFns';
import { getKVValue } from 'ldaccess/ldUtils';
import { Component, ComponentClass, StatelessComponent } from 'react';

type OwnProps = {
	singleImage;
};
type ConnectedState = {
};

type ConnectedDispatch = {
};

/*const mapStateToProps = (state: ExplorerState, ownProps: OwnProps): ConnectedState => ({
});

const mapDispatchToProps = (dispatch: redux.Dispatch<ExplorerState>): ConnectedDispatch => ({
});*/

let cfgType: string = LDDict.ViewAction;
let cfgIntrprtKeys: string[] =
	[LDDict.name, LDDict.fileFormat, LDDict.contentUrl];
let initialKVStores: IKvStore[] = [];
let bpCfg: BlueprintConfig = {
	subItptOf: null,
	canInterpretType: cfgType,
	nameSelf: "shnyder/imageDisplay",
	initialKvStores: initialKVStores,
	interpretableKeys: cfgIntrprtKeys,
	crudSkills: "cRud"
};

@ldBlueprint(bpCfg)
export class PureImgDisplay extends Component<LDConnectedState & LDConnectedDispatch & LDOwnProps, {}>
	implements IBlueprintItpt {
	cfg: BlueprintConfig;
	outputKVMap: OutputKVMap;
	imgLink: string;

	initialKvStores: IKvStore[];
	constructor(props: any) {
		super(props);
		this.cfg = (this.constructor["cfg"] as BlueprintConfig);
		if (props) {
			this.handleKVs(props);
		}
	}
	componentWillReceiveProps(nextProps: LDOwnProps & LDConnectedDispatch & LDConnectedState, nextContext): void {
		if (compNeedsUpdate(nextProps, this.props)) {
			this.handleKVs(nextProps);
			//this.consumeLDOptions(nextProps.ldOptions);
		}
	}
	consumeLDOptions = (ldOptions: ILDOptions) => {
		/*if (ldOptions && ldOptions.resource && ldOptions.resource.kvStores) {
			let kvs = ldOptions.resource.kvStores;
			this.imgLink = getKVValue(getKVStoreByKey(kvs, LDDict.contentUrl));
		}*/
	}

	render() {
		const { ldOptions } = this.props;
		let imgLnk: string = this.imgLink;
		if (this.imgLink && !this.imgLink.startsWith("http://")) {
			imgLnk = "http://localhost:1111/api/ysj/media/jpgs/" + this.imgLink;
		}
		if (!ldOptions) return <div>no Image data</div>;
		return <div className="imgdisplay">
			<img alt="" src={imgLnk} className="imgdisplay" />
			{this.imgLink}
			{this.props.children}
		</div>;
	}

	private handleKVs(props: LDOwnProps & LDConnectedState) {
		let pLdOpts: ILDOptions = props && props.ldOptions && props.ldOptions ? props.ldOptions : null;
		this.imgLink = getKVValue(getKVStoreByKeyFromLDOptionsOrCfg(pLdOpts, this.cfg, LDDict.contentUrl));
	}

}
export default connect<LDConnectedState, LDConnectedDispatch, LDOwnProps>(mapStateToProps, mapDispatchToProps)(PureImgDisplay);
