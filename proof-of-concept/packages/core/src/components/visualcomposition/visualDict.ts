export enum VisualKeysDict {
	//Base data types:
	headerTxt = "HeaderText",
	subHeaderTxt = "SubHeaderText",
	description = "Description",
	cancelTxt = "cancelTxt",
	confirmTxt = "confirmTxt",
	copyTxt = "copyTxt",

	//layout
	switchVerticalDirection = "switchVerticalDirection",
	switchHorizontalDirection = "switchHorizontalDirection",
	directionChangeBreakPoint = "directionChangeBreakPoint",
	cssClassName = "cssClass", //TODO: follow development of http://pending.schema.org/cssSelector and adjust
	/**
	 * id of the html element. User is responsible for making it unique
	 */
	elementId = "elementId",

	//other
	popOverContent = "PopOverContent",
	iconImg = "IconImage",
	videoId = "VideoID",
	iconName = "iconName",
	utf8textData = "utf8textData",

	//Interpreters
	primaryItpt = "primaryInterpreter", //e.g. left icon of a list, upper content of ImgHeadSubDesc
	secondaryItpt = "secondaryInterpreter", //e.g. right icon of a list, bottom content of ImgHeadSubDesc
	inputContainer = "inputContainer", //e.g. for the bottomNavigation anything that is "top"

	//NavigationElement-keys
	routeSend_search = "RouteSend_Search",
	routeSend_back = "RouteSend_Back",
	searchText = "searchText",
	routeSend_confirm = "RouteSend_confirm",
	routeSend_cancel = "RouteSend_cancel",
}

export enum VisualTypesDict {
	//List-relevant Types
	compactInfoElement = "CompactInformationElement",
	//Router-related Types
	route_added = "Route_Added",
	route_new = "Route_New",
	route_popLast = "Route_PopLast", //for back-navigation
}
