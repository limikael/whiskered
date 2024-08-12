export default class BidirectionalMap {
	constructor() {
		this.forward=new Map();
		this.backward=new Map();
	}

	set(key, value) {
		if (this.forward.has(key)) {
			let v=this.forward.get(key);
			this.backward.delete(v);
		}

		if (this.backward.has(value)) {
			let k=this.backward.get(value);
			this.forward.delete(k);
		}

		this.forward.set(key,value);
		this.backward.set(value,key);
	}

	get(key) {
		return this.forward.get(key);
	}

	getKey(value) {
		return this.backward.get(value);
	}

	delete(key) {
		let value=this.forward.get(key);
		this.forward.delete(key);
		this.backward.delete(value);
	}

	deleteValue(value) {
		let key=this.backward.get(value);
		this.forward.delete(key);
		this.backward.delete(value);
	}
}