import {xmlForEach, xmlFind, xmlIndex, xmlFragment, xmlPath, xmlMove, xmlMap} from "../src/utils/xml-util.js";
import {parse as parseXml} from "txml/txml";
//import {txmlStringify} from "../src/utils/txml-stringify.js";
import {isStringy} from "../src/utils/js-util.js";

describe("xml util",()=>{
	it("can for each nodes",()=>{
		let xml=parseXml("<div><a>hello</a><x><y/></x></div><test/>");
		let all=[];
		xmlForEach(xml,n=>all.push(n));
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
		//console.log(JSON.stringify(xml));

		expect(JSON.stringify(xml)).toEqual('[{"tagName":"div","attributes":{},"children":[{"tagName":"a","attributes":{},"children":[]},{"tagName":"b","attributes":{},"children":[]},{"tagName":"d","attributes":{},"children":[]},{"tagName":"c","attributes":{},"children":[]},{"tagName":"e","attributes":{},"children":[]}]}]');

		//let res=txmlStringify(xml,{pretty: false});
		//expect(res).toEqual("<div><a/><b/><d/><c/><e/></div>");
	});

	it("can move a node to a different parent",()=>{
		let xml=parseXml('<div><a/><b/><c/><d/><e/></div><other/>');
		let parentFragment=xmlFind(xml,n=>n.tagName=="div").children;
		xmlMove(xml,n=>n.tagName=="c",xml,2);

		expect(JSON.stringify(xml)).toEqual('[{"tagName":"div","attributes":{},"children":[{"tagName":"a","attributes":{},"children":[]},{"tagName":"b","attributes":{},"children":[]},{"tagName":"d","attributes":{},"children":[]},{"tagName":"e","attributes":{},"children":[]}]},{"tagName":"other","attributes":{},"children":[]},{"tagName":"c","attributes":{},"children":[]}]');

		//console.log(JSON.stringify(xml));

		/*let res=txmlStringify(xml,{pretty: false});
		expect(res).toEqual("<div><a/><b/><d/><e/></div><other/><c/>");*/
	});

	it("can map",()=>{
		let xml=parseXml(`
			<div>
				hello
				<a/>
				world
			</div>
			x
			<other/>`,{keepWhitespace: true});

		xml=xmlMap(xml,n=>{
			//console.log("called",n);

			if (isStringy(n) && !n.trim())
				return;

			return n;
		});

		//expect(xml).toEqual([{"tagName":"div","attributes":{},"children":["hello",{"tagName":"a","attributes":{},"children":[]},"world"]}," \n x",{"tagName":"other","attributes":{},"children":[]}]);

		//console.log(JSON.stringify(xml));
		//expect(JSON.stringify(xml)).toEqual('[{"tagName":"div","attributes":{},"children":["hello",{"tagName":"a","attributes":{},"children":[]},"world"]}," \n x",{"tagName":"other","attributes":{},"children":[]}]');
		//console.log(JSON.stringify(xml));
	});
});