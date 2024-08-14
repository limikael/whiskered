import {parse as parseXml} from "txml/txml";
import {xmlMap, xmlFind, xmlIndex, xmlFragment, xmlPath} from "../src/utils/xml-util.js";

describe("xml util",()=>{
	it("can map nodes",()=>{
		let xml=parseXml("<div><a>hello</a><x><y/></x></div><test/>");
		let all=[];
		xmlMap(xml,n=>all.push(n));
		expect(all.length).toEqual(5);
	});

	it("can find a node",()=>{
		let xml=parseXml('<div><a>hello</a><x v="5"><y/></x></div><test/>');
		let all=[];
		let node=xmlFind(xml,n=>n.attributes.v=="5");
		expect(node.tagName).toEqual("x");
	});

	it("can find a node index",()=>{
		let xml=parseXml('<div></div><x/><a><b/><x v="5"/></a><y/>');
		let index=xmlIndex(xml,n=>n.attributes.v=="5");
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

	it("can find the path to and element",()=>{
		//let xml=parseXml('<el><el2><x v="6"/></el2></el>');
		let xml=parseXml('<b/><a><test/><el><x v="5"/></el></a>');
		let path=xmlPath(xml,n=>n.attributes.v=="5")
		let pathTags=path.map(n=>n.tagName);
		//console.log(pathTags);
		expect(pathTags).toEqual(["a","el","x"]);
	});
});