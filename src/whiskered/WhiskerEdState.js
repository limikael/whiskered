import {useConstructor} from "../utils/react-util.jsx";
import {xmlFragmentParse, xmlNodeCreate, xmlFindNode, 
		xmlFindParentNode, xmlFindParentNodeId, xmlFindNodePath,
		xmlNodeFindChildIndex} from "../utils/xml-util.js";
import {elMidpoint, pDist, pSub, pDot, elIsOnEdge} from "../utils/ui-util.js";
import BidirectionalMap from "../utils/BidirectionalMap.js";
import {txmlStringify} from "../utils/txml-stringify.js";

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

	isValidDrag() {
		return (this.getDragState() && this.dropParentId!="illegal")
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
		let prevDragId=this.dragId;

		this.dragCount=0;
		this.dragId=undefined;

		if (this.getDragState()!=prev || prevDragId)
			this.dispatchEvent(new Event("dragChange"));
	}

	handleDragStart(ev) {
		if (this.dragId)
			return;

		this.dragId=this.getIdByEl(ev.target);
		let dragNode=xmlFindNode(this.getValueNode(),this.dragId);
		let xml=txmlStringify([dragNode]);

		//console.log("drag start: "+xml);
		ev.dataTransfer.setData("whiskered",xml);
	}

	handleDragEnd(ev) {
		if (!this.dragId)
			return;

		this.clearDragState();
	}

	setHoverState({hoverId, dropParentId, dropInsertIndex, dropLayoutDirection}) {
		if (hoverId===this.hoverId && 
				dropParentId===this.dropParentId &&
				dropInsertIndex===this.dropInsertIndex &&
				dropLayoutDirection===this.dropLayoutDirection)
			return;

		this.hoverId=hoverId;
		this.dropParentId=dropParentId;
		this.dropInsertIndex=dropInsertIndex;
		this.dropLayoutDirection=dropLayoutDirection;
		this.dispatchEvent(new Event("hoverChange"));
	}

	getInsertIndex(fragment, mouseLocation, layoutDirection) {
		let closestIndex=undefined;
		let closestDist=undefined;
		let layoutVectors={
			up: {x:0,y:-1},
			right: {x:1,y:0},
			down: {x:0,y:1},
			left: {x:-1,y:0},
		}

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
			let dot=pDot(layoutVectors[layoutDirection],v);
			if (dot<0)
				insertIndex=closestIndex;

			else
				insertIndex=closestIndex+1;
		}

		return insertIndex;
	}

	updateHover(ev) {
		//console.log("update hover, dragId="+this.dragId);

		let mouseLocation={x: ev.clientX, y: ev.clientY};
		let hoverId=this.getIdByEl(ev.target);
		let dropParentId=hoverId;

		if (dropParentId) {
			let onEdge=elIsOnEdge(this.elById.get(dropParentId),mouseLocation,this.edgeSize);
			if (onEdge)
				dropParentId=xmlFindParentNodeId(this.getValueNode(),dropParentId);
		}

		if (dropParentId) {
			let node=xmlFindNode(this.getValueNode(),dropParentId);
			let Comp=this.componentLibrary[node.tagName];
			if (Comp.containerType!="children")
				dropParentId=xmlFindParentNodeId(this.getValueNode(),dropParentId);
		}

		let path=xmlFindNodePath(this.getValueNode(),dropParentId);
		let pathIds=path.map(n=>n.id);
		if (this.dragId && pathIds.includes(this.dragId)) {
			this.setHoverState({
				hoverId: hoverId,
				dropParentId: "illegal",
			});

			return;
		}

		let dropLayoutDirection="down";
		let dropInsertIndex;
		if (dropParentId) {
			let node=xmlFindNode(this.getValueNode(),dropParentId);
			let Comp=this.componentLibrary[node.tagName];
			if (Comp.layoutDirection)
				dropLayoutDirection=Comp.layoutDirection;

			dropInsertIndex=this.getInsertIndex(node.children,mouseLocation,dropLayoutDirection);
		}

		else {
			dropInsertIndex=this.getInsertIndex(this.value,mouseLocation,dropLayoutDirection);
		}

		if (this.dragId) {
			let dragParentNode=xmlFindParentNode(this.getValueNode(),this.dragId);
			if (dragParentNode.id==dropParentId) {
				let currentIndex=xmlNodeFindChildIndex(dragParentNode,this.dragId);
				if (dropInsertIndex==currentIndex ||
						dropInsertIndex==currentIndex+1) {
					this.setHoverState({
						hoverId: hoverId,
						dropParentId: "illegal",
					});

					return;
				}
			}
		}

		this.setHoverState({
			hoverId: hoverId,
			dropParentId: dropParentId,
			dropInsertIndex: dropInsertIndex,
			dropLayoutDirection: dropLayoutDirection
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