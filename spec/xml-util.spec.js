import {xmlFragmentRemoveNode, xmlNodeCreate} from "../src/utils/xml-util.js";

describe("xml util",()=>{
	it("works",()=>{
		let el=xmlNodeCreate("div")
		let fragment=[xmlNodeCreate("other",{},[
			el,
			xmlNodeCreate("bla")
		])];

		console.log(xmlFragmentRemoveNode(fragment,el.id));
	});
})