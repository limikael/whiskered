import {txmlParse, txmlStringify} from "../src/utils/txml-stringify.js";

describe("txml stringify",()=>{
	//it("",()=>{});

	it("can handle errors",()=>{
		expect(()=>txmlParse(`
<div>
	<
	<hello/>
</div>
`)).toThrow(new Error("Empty tag name"));
		expect(()=>txmlParse(`<div><<hello/></div>`)).toThrow(new Error("Bad chars in tag name: <hello"));
	});

	it("can parse with sensible whitespace handling",()=>{
		let x=txmlParse(`
			hello<b> world&quot;&#xa;&#10;&nbsp;  </b>
			<div text="bla&quot;&nbsp;">
				test&nbsp;
			</div>
		`);

		//console.log(x);
		expect(x.length).toEqual(3);
		expect(x[2].attributes.text).toEqual("bla\" ");
		expect(x[2].children[0]).toEqual("test ");
	});

	it("can stringify a string",()=>{
		let s=txmlStringify("hello ",{pretty: true, level: 1});
		//console.log("s:\n"+s);
		expect(s).toEqual("  hello&nbsp;\n");
		let t=txmlStringify("hello ",{pretty: false});
		expect(t).toEqual("hello ");
	});

	it("can stringify",()=>{
		let x=txmlParse("hello<div/><div><a href='bla'>blipp </a>world</div>");
		//console.log(x);
		//console.log(txmlStringify(x,{pretty: false}));
		expect(txmlStringify(x,{pretty: false})).toEqual('hello<div/><div><a href="bla">blipp </a>world</div>');

		//console.log(txmlStringify(x));
		expect(txmlStringify(x)).toEqual(`hello
<div/>
<div>
  <a href="bla">
    blipp&nbsp;
  </a>
  world
</div>
`);
	});
});
