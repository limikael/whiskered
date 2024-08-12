import {useConstructor} from "../utils/react-util.jsx";
import {xmlFragmentParse, xmlNodeCreate, xmlFindNode, xmlFindParentNode} from "../utils/xml-util.js";
import {elMidpoint, pDist, pSub, pDot, elIsOnEdge} from "../utils/ui-util.js";
import BidirectionalMap from "../utils/BidirectionalMap.js";

export default class WhiskerEdState extends EventTarget {
	constructor({xml, componentLibrary, edgeSize}={}) {
		super();
		this.value=[];
		if (xml)
			this.value=xmlFragmentParse(xml);

		this.componentLibrary=componentLibrary;
		this.elById=new BidirectionalMap();
		this.dragCount=0;
		this.hoverState={};
		this.edgeSize=edgeSize;

		if (this.edgeSize===undefined)
			this.edgeSize=5;
	}

	setNodeEl(nodeId, el) {
		if (!el) {
			this.elById.delete(nodeId)
			return;
		}

		this.elById.set(nodeId,el);
	}

	getIdByEl(el) {
		while (el) {
			let id=this.elById.getKey(el)
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

	changeDragCount(v, ev) {
		ev.preventDefault();

		//console.log("change drag count: "+v);
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

	setHoverState({hoverId, dropParentId, dropInsertIndex}) {
		if (hoverId===this.hoverId && 
				dropParentId===this.dropParentId &&
				dropInsertIndex===this.dropInsertIndex)
			return;

		this.hoverId=hoverId;
		this.dropParentId=dropParentId;
		this.dropInsertIndex=dropInsertIndex;
		this.dispatchEvent(new Event("hoverChange"));
	}

	getInsertIndex(fragment, mouseLocation) {
		let closestIndex=undefined;
		let closestDist=undefined;

		for (let i=0; i<fragment.length; i++) {
			let c=fragment[i];
			let mid=elMidpoint(this.elById.get(c.id));
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
			let mid=elMidpoint(this.elById.get(c.id));
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
		//console.log("update hover");

		let mouseLocation={x: ev.clientX, y: ev.clientY};
		let hoverId=this.getIdByEl(ev.target);
		let dropParentId=hoverId;

		if (dropParentId) {
			let onEdge=elIsOnEdge(this.elById.get(dropParentId),mouseLocation,this.edgeSize);
			if (onEdge) {
				let node=xmlFindParentNode(this.getValueNode(),dropParentId);
				if (node)
					dropParentId=node.id;

				else
					dropParentId=undefined;
			}
		}

		let dropInsertIndex;
		if (dropParentId) {
			let node=xmlFindNode(this.getValueNode(),dropParentId);
			dropInsertIndex=this.getInsertIndex(node.children,mouseLocation);
		}

		else {
			dropInsertIndex=this.getInsertIndex(this.value,mouseLocation);
		}

		this.setHoverState({
			hoverId: hoverId,
			dropParentId: dropParentId,
			dropInsertIndex: dropInsertIndex
		});
	}

	setValue(v) {
		if (this.value===v)
			return;

		this.value=v;
		this.dispatchEvent(new Event("change"));
	}

	getValueNode() {
		let top=xmlNodeCreate("top",{},this.value);
		top.id=undefined;

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