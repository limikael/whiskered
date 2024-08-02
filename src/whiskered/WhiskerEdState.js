import {useConstructor} from "../utils/react-util.jsx";
import {xmlFragmentParse, xmlNodeCreate, xmlFindNode} from "../utils/xml-util.js";
import {elMidpoint, pDist, pSub, pDot} from "../utils/ui-util.js";

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

	setHoverId(id, insertIndex) {
		if (id===this.hoverId && insertIndex===this.insertIndex)
			return;

		this.hoverId=id;
		this.insertIndex=insertIndex;
		this.dispatchEvent(new Event("hoverChange"));
	}

	getInsertIndex(fragment, mouseLocation) {
		let closestIndex=undefined;
		let closestDist=undefined;

		for (let i=0; i<fragment.length; i++) {
			let c=fragment[i];
			let mid=elMidpoint(this.elById[c.id]);
			let dist=pDist(mouseLocation,mid);
			if (closestDist===undefined ||
					dist<closestDist) {
				closestIndex=i;
				closestDist=dist;
			}
		}

		let insertIndex=0;
		if (closestIndex!==undefined) {
			let c=fragment[closestIndex];
			let mid=elMidpoint(this.elById[c.id]);
			let v=pSub(mouseLocation,mid);
			let dot=pDot({x:0,y:1},v);
			if (dot<0)
				insertIndex=closestIndex;

			else
				insertIndex=closestIndex+1;
		}

		return insertIndex;
	}

	updateHover(ev) {
		let mouseLocation={x: ev.clientX, y: ev.clientY};
		let id=this.getIdByEl(ev.target);
		if (id) {
			let node=xmlFindNode(this.getValueNode(),id);
			let insertIndex=this.getInsertIndex(node.children,mouseLocation);
			this.setHoverId(id,insertIndex);
		}

		else {
			let insertIndex=this.getInsertIndex(this.value,mouseLocation);
			this.setHoverId(undefined,insertIndex);
		}
	}

	setValue(v) {
		if (this.value===v)
			return;

		this.value=v;
		this.dispatchEvent(new Event("change"));
	}

	getValueNode() {
		let top=xmlNodeCreate("top",{},this.value);
		top.id="top";

		return top;
	}

	setValueNode(valueNode) {
		this.value=valueNode.children;
		this.dispatchEvent(new Event("change"));
	}
}

export function useWhiskerEdState(init) {
	return useConstructor(()=>new WhiskerEdState(init));
}