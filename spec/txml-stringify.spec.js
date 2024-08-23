import {txmlParse} from "../src/utils/txml-stringify.js";

describe("txml stringify",()=>{
	it("can parse xml with entities",()=>{
		let x=txmlParse("<div a='x&apos;y'>hello&apos;world</div>");
		expect(x).toEqual(
			[
			  {
			    tagName: 'div',
			    attributes: { a: "x'y" },
			    children: [ "hello'world" ]
			  }
			]
		);
	})
});