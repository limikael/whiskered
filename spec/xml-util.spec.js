import {xmlMap, xmlFind, xmlIndex, xmlFragment, xmlPath, xmlMove} from "../src/utils/xml-util.js";
import {parse as parseXml} from "txml/txml";
import {txmlStringify} from "../src/utils/txml-stringify.js";
import {isStringy} from "../src/utils/js-util.js";

describe("xml util",()=>{
	it("can map nodes",()=>{
		let xml=parseXml("<div><a>hello</a><x><y/></x></div><test/>");
		let all=[];
		xmlMap(xml,n=>all.push(n));
		expect(all.length).toEqual(6);
	});

	it("can find a node",()=>{
		let xml=parseXml('<div><a>hello</a><x v="5"><y/></x></div><test/>');
		let all=[];
		let node=xmlFind(xml,n=>typeof n!="string" && n.attributes.v=="5");
		expect(node.tagName).toEqual("x");
	});

	it("can find a node index",()=>{
		let xml=parseXml('<div></div><x/><a><b/><x v="5"/></a><y/>');
		let index=xmlIndex(xml,n=>n.attributes.v=="5");
		expect(index).toEqual(1);
	});

	it("can find a node index among text",()=>{
		let xml=parseXml('<div>hello<x v="5"/></div>');
		let index=xmlIndex(xml,n=>!isStringy(n) && n.attributes.v=="5");
		expect(index).toEqual(1);
	});

	it("can find conaining fragment",()=>{
		let xml=parseXml('<div></div><x/><a><el><b/><x v="5"/><b/></el></a><y/>');
		let frag=xmlFragment(xml,n=>n.attributes.v=="5");
		let index=xmlIndex(xml,n=>n.attributes.v=="5");
		//console.log(frag,index);
		expect(frag.length).toEqual(3);
		expect(index).toEqual(1);
	});

	it("can find conaining fragment among text",()=>{
		let xml=parseXml('<div></div><x/><a><el><b/>hello<x v="5"/><b/></el></a><y/>');
		let frag=xmlFragment(xml,n=>!isStringy(n) && n.attributes.v=="5");
		let index=xmlIndex(xml,n=>!isStringy(n) && n.attributes.v=="5");
		//console.log(frag,index);
		expect(frag.length).toEqual(4);
		expect(index).toEqual(2);
	});

	it("can find the path to and element",()=>{
		//let xml=parseXml('<el><el2><x v="6"/></el2></el>');
		let xml=parseXml('<b/><a><test/><el>hello world<x v="5"/></el></a>');
		let path=xmlPath(xml,n=>typeof n!="string" && n.attributes.v=="5")
		let pathTags=path.map(n=>n.tagName);
		//console.log(pathTags);
		expect(pathTags).toEqual(["a","el","x"]);
	});

	it("can move a node to same parent",()=>{
		let xml=parseXml('<div><a/><b/><c/><d/><e/></div>');
		let parentFragment=xmlFind(xml,n=>n.tagName=="div").children;
		xmlMove(xml,n=>n.tagName=="c",parentFragment,4);

		let res=txmlStringify(xml,{pretty: false});
		//console.log(res);
		expect(res).toEqual("<div><a/><b/><d/><c/><e/></div>");
	});

	it("can move a node to a different parent",()=>{
		let xml=parseXml('<div><a/><b/><c/><d/><e/></div><other/>');
		let parentFragment=xmlFind(xml,n=>n.tagName=="div").children;
		xmlMove(xml,n=>n.tagName=="c",xml,2);

		let res=txmlStringify(xml,{pretty: false});
		expect(res).toEqual("<div><a/><b/><d/><e/></div><other/><c/>");
	});
});