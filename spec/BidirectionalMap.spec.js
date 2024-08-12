import BidirectionalMap from "../src/utils/BidirectionalMap.js";

describe("BidirectionalMap",()=>{
	it("works",()=>{
		let m=new BidirectionalMap();

		m.set("key",undefined);
		m.deleteValue(undefined);
		console.log(m.getKey(undefined));
	});
})