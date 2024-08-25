import {useConstructor} from "../utils/react-util.jsx";
import {xmlMap, xmlFind, xmlPath, xmlParent, xmlIndex} from "../utils/xml-util.js";
import {elMidpoint, pDist, pSub, pDot, elIsOnEdge} from "../utils/ui-util.js";
import BidirectionalMap from "../utils/BidirectionalMap.js";
import {txmlStringify} from "../utils/txml-stringify.js";
import {nodeInit, nodePred, nodeId} from "./whiskered-util.js";
import WhiskerEdSelection from "./WhiskerEdSelection.js";

export default class WhiskerEdState {
	constructor() {
		this.elById=new BidirectionalMap();
		this.dragCount=0;
		this.edgeSize=5;
	}

	preRender({value, componentLibrary, selection}) {
		xmlMap(value,nodeInit);
		this.value=value;
		this.componentLibrary=componentLibrary;
		if (selection)
			this.selection=selection;

		if (!this.selection)
			this.selection=new WhiskerEdSelection();
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

	isDrag() {
		return (this.dragCount>0);
	}

	isValidDrag() {
		return (this.isDrag() && this.dropParentId!="illegal")
	}

	changeDragCount(v) {
		this.dragCount+=v;
		if (this.dragCount<0)
			this.dragCount=0;
	}

	clearDrag() {
		this.dragCount=0;
		this.dragId=undefined;
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
			let mid=elMidpoint(this.elById.get(nodeId(c)));
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
			let mid=elMidpoint(this.elById.get(nodeId(c)));
			let v=pSub(mouseLocation,mid);
			let dot=pDot(layoutVectors[layoutDirection],v);
			if (dot<0)
				insertIndex=closestIndex;

			else
				insertIndex=closestIndex+1;
		}

		return insertIndex;
	}

	setHoverState({hoverId, dropParentId, dropInsertIndex/*, dropLayoutDirection*/}) {
		this.hoverId=hoverId;
		this.dropParentId=dropParentId;
		this.dropInsertIndex=dropInsertIndex;
		//this.dropLayoutDirection=dropLayoutDirection;
	}

	getNodeComponent(node) {
		let Comp;
		if (node && node.tagName)
			Comp=this.componentLibrary[node.tagName];

		return Comp;
	}

	getDropLayoutDirection() {
		if (!this.dropParentId)
			return "down";

		let node=xmlFind(this.value,nodePred(this.dropParentId));
		let Comp=this.getNodeComponent(node);
		if (Comp && Comp.layoutDirection)
			return Comp.layoutDirection;

		return "down";
	}

	updateHover(el, mouseLocation) {
		let hoverId=this.getIdByEl(el);
		let dropParentId=hoverId;

		// Use parent if dropping on edge.
		if (dropParentId) {
			let onEdge=elIsOnEdge(this.elById.get(dropParentId),mouseLocation,this.edgeSize);
			if (onEdge)
				dropParentId=nodeId(xmlParent(this.value,nodePred(dropParentId)));
		}

		// Use parent if can't have children.
		if (dropParentId) {
			let Comp=this.getNodeComponent(xmlFind(this.value,nodePred(dropParentId)));
			if (!Comp || Comp.containerType!="children")
				dropParentId=nodeId(xmlParent(this.value,nodePred(dropParentId)));
		}

		// Dropping on self or child is illegal.
		if (dropParentId) {
			let path=xmlPath(this.value,nodePred(dropParentId));
			let pathIds=path.map(n=>nodeId(n));
			if (this.dragId && pathIds.includes(this.dragId)) {
				this.setHoverState({
					hoverId: hoverId,
					dropParentId: "illegal",
				});

				return;
			}
		}

		// Set layout direction and index.
		let dropLayoutDirection="down";
		let dropInsertIndex;
		if (dropParentId) {
			let node=xmlFind(this.value,nodePred(dropParentId));
			let Comp=this.getNodeComponent(node);
			if (!Comp)
				return this.setHoverState({
					hoverId: hoverId,
					dropParentId: "illegal",
				});

			if (Comp.layoutDirection)
				dropLayoutDirection=Comp.layoutDirection;

			dropInsertIndex=this.getInsertIndex(node.children,mouseLocation,dropLayoutDirection);
		}

		else {
			dropInsertIndex=this.getInsertIndex(this.value,mouseLocation,dropLayoutDirection);
		}

		// Not meaningful if dragged to same location.
		if (this.dragId) {
			let dragParentNodeId;
			let dragParentNode=xmlParent(this.value,nodePred(this.dragId));
			if (dragParentNode)
				dragParentNodeId=nodeId(dragParentNode);

			if (dragParentNodeId==dropParentId) {
				let currentIndex=xmlIndex(this.value,nodePred(this.dragId));
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
			//dropLayoutDirection: dropLayoutDirection
		});
	}
}
