import {useConstructor} from "../utils/react-util.jsx";
import {xmlFragmentParse} from "../utils/xml-util.js";

export default class WhiskerEdState extends EventTarget {
	constructor({xml, componentLibrary}={}) {
		super();
		this.value=[];
		if (xml)
			this.value=xmlFragmentParse(xml);

		this.componentLibrary=componentLibrary;

		this.elById={};
		this.idByEl=new Map();
		this.dragCount=0;
	}

	setNodeEl(nodeId, el) {
		if (this.elById[nodeId]) {
			let currentEl=this.elById[nodeId];
			this.idByEl.delete(el);
			delete this.elById[nodeId];
		}

		if (!el)
			return;

		this.elById[nodeId]=el;
		this.idByEl.set(el,nodeId);
	}

	getIdByEl(el) {
		while (el) {
			let id=this.idByEl.get(el)
			if (id)
				return id;

			el=el.parentElement;
		}
	}

	setSelectedId(id) {
		this.selectedId=id;
		this.dispatchEvent(new Event("selectionChange"));
	}

	setFocusState(focusState) {
		if (focusState===this.focusState)
			return;

		this.focusState=focusState;
		this.dispatchEvent(new Event("focusChange"));
	}

	getDragState() {
		return (this.dragCount>0);
	}

	changeDragCount(v) {
		let prev=this.getDragState();
		this.dragCount+=v;
		if (this.dragCount<0)
			this.dragCount=0;

		if (this.getDragState()!=prev)
			this.dispatchEvent(new Event("dragChange"));
	}

	clearDragState() {
		let prev=this.getDragState();
		this.dragCount=0;

		if (this.getDragState()!=prev)
			this.dispatchEvent(new Event("dragChange"));
	}

	setHoverId(id) {
		this.hoverId=id;
		this.dispatchEvent(new Event("hoverChange"));
	}

	setValue(v) {
		if (this.value===v)
			return;

		this.value=v;
		this.dispatchEvent(new Event("change"));
	}
}

export function useWhiskerEdState(init) {
	return useConstructor(()=>new WhiskerEdState(init));
}