import jasmine from 'jasmine';
import ldBlueprint, { BlueprintConfig, IBlueprintInterpreter, OutputKVMap } from 'ldaccess/ldBlueprint';
import { ILDOptions } from 'ldaccess/ildoptions';
import { IKvStore } from 'ldaccess/ikvstore';
import { DefaultInterpreterRetriever } from 'defaults/DefaultInterpreterRetriever';
import { ImgHeadSubDescIntrprtrName } from 'components/visualcomposition/ImgHeadSubDescIntrprtr';

let bpCfg: BlueprintConfig = {
    //TODO: property forType needs to be renamed, maybe split up into multiple properties. I need a clear
    //conflicting use case to tackle the whole problem space though (e.g. schema:ViewAction vs. schema:image).
    //Needs to be re-designed with crud-skills in mind though. Clear separation of concerns and DRY should
    //be applicable to the end result
    subInterpreterOf: null,
    canInterpretType: "http://shnyder.com/Testtype",
    nameSelf: "shnyder/testTypeInterpreter",
    initialKvStores: [],
    interpretableKeys: [],
    crudSkills: "cRud"
};

@ldBlueprint(bpCfg)
export class LDBlueprintContainerClass implements IBlueprintInterpreter {
    cfg: BlueprintConfig;
    outputKVMap: OutputKVMap;
    consumeLDOptions: (ldOptions: ILDOptions) => any;
    initialKvStores: IKvStore[];
}

describe("ldBlueprint decorator func", () => {

    //const wrappedContainerClass = ldBlueprint(bpCfg);
    //const wrapped2 = wrappedContainerClass(LDBlueprintContainerClass);
    describe("for a correct LDBlueprintContainerClass object to be constructed...", () => {
        var newLDContainer: LDBlueprintContainerClass = new LDBlueprintContainerClass();
        //var newLDContainer = bpCfg;
        //var dir: PureImgDisplay = new PureImgDisplay({});
        //var ihsdi = dir.getInterpreterByNameSelf(ImgHeadSubDescIntrprtrName);
        it("POJO should be created", () => {
            expect(newLDContainer).toBeDefined();
          //  expect(dir).toBeDefined();
        });
        /* it("should have a consumeWebResource function", () => {
             expect(newLDContainer.consumeLDOptions).toBeDefined();
         });*/
    });
});
