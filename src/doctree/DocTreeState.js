import BidirectionalMap from "../utils/BidirectionalMap.js";
import {xmlMap, xmlParent, xmlFind, xmlPath, xmlIndex} from "../utils/xml-util.js";
import {nodeInit, nodeId, nodePred} from "../whiskered/whiskered-util.js";
import {elIsOnEdge, elMidpoint, pDist, pDot, pSub, elOnLowerHalf} from "../utils/ui-util.js";
import WhiskerEdSelection from "../whiskered/WhiskerEdSelection.js";

export default class DocTreeState {
	constructor({itemRenderer, edgeSize}) {
		this.itemRenderer=itemRenderer;
		this.edgeSize=edgeSize;
		if (!this.edgeSize)
			this.edgeSize=5;

		this.elById=new BidirectionalMap();
		this.expanded=[];
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

	getNodeComponent(node) {
		let Comp;
		if (node && node.tagName)
			Comp=this.componentLibrary[node.tagName];

		return Comp;
	}

	getInsertIndex(fragment, mouseLocation) {
		let closestIndex=undefined;
		let closestDist=undefined;

		//console.log(fragment);

		for (let i=0; i<fragment.length; i++) {
			let c=fragment[i];
			if (typeof c!="string") {
				let mid=elMidpoint(this.elById.get(nodeId(c)));
				let dist=pDist(mouseLocation,mid);
				if (closestDist===undefined ||
						dist<closestDist) {
					closestIndex=i;
					closestDist=dist;
				}
			}
		}

		let insertIndex=0;
		if (closestIndex!==undefined) {
			let c=fragment[closestIndex];
			let el=this.elById.get(nodeId(c));
			if (elOnLowerHalf(el,mouseLocation))
				insertIndex=closestIndex+1;

			else
				insertIndex=closestIndex;
		}

		return insertIndex;
	}

	getDragParentId() {
		let dragParentNode=xmlParent(this.value,nodePred(this.selection.dragId));
		if (!dragParentNode)
			return;

		return nodeId(dragParentNode);
	}

	setHoverState({hoverId, dropParentId, dropInsertIndex}) {
		this.selection.hoverId=hoverId;
		this.selection.dropParentId=dropParentId;
		this.selection.dropInsertIndex=dropInsertIndex;
	}

	updateHover(el, mousePosition) {
		let hoverId=this.getIdByEl(el);
		let dropParentId=hoverId;

		// Use parent if dropping on edge
		if (dropParentId) {
			let onEdge=elIsOnEdge(this.elById.get(hoverId),mousePosition,this.edgeSize);
			let lowerHalfExpanded=false;
			if (this.expanded.includes(dropParentId))
				lowerHalfExpanded=elOnLowerHalf(this.elById.get(hoverId),mousePosition);

			if (onEdge && !lowerHalfExpanded)
				dropParentId=nodeId(xmlParent(this.value,nodePred(dropParentId)));

		}

		// Use parent if can't have children.
		if (dropParentId) {
			let node=xmlFind(this.value,nodePred(dropParentId));
			let Comp=this.getNodeComponent(node);
			if (!Comp || Comp.containerType!="children")
				dropParentId=nodeId(xmlParent(this.value,nodePred(dropParentId)));
		}

		// Dropping on self or child is illegal.
		if (dropParentId) {
			let path=xmlPath(this.value,nodePred(dropParentId));
			let pathIds=path.map(n=>nodeId(n));
			if (this.selection.dragId && 
					pathIds.includes(this.selection.dragId)) {
				this.setHoverState({
					hoverId: hoverId,
					dropParentId: "illegal",
				});

				return;
			}
		}

		// Find drop index
		let dropInsertIndex;
		if (dropParentId) {
			if (dropParentId!=hoverId) {
				let node=xmlFind(this.value,nodePred(dropParentId));
				if (this.expanded.includes(dropParentId))
					dropInsertIndex=this.getInsertIndex(node.children,mousePosition);
			}
		}

		else {
			dropInsertIndex=this.getInsertIndex(this.value,mousePosition);
		}

		// Special case if dropping at current parent.
		if (dropParentId && 
				dropInsertIndex===undefined &&
				dropParentId==this.getDragParentId())
			dropInsertIndex=0;

		// Not meaningful if dragged to same location.
		if (this.selection.dragId &&
				dropParentId==this.getDragParentId()) {
			let currentIndex=xmlIndex(this.value,nodePred(this.selection.dragId));
			if (dropInsertIndex==currentIndex ||
					dropInsertIndex==currentIndex+1) {
				this.setHoverState({
					hoverId: hoverId,
					dropParentId: "illegal",
				});

				return;
			}
		}

		this.setHoverState({
			hoverId: hoverId,
			dropParentId: dropParentId,
			dropInsertIndex: dropInsertIndex
		});
	}
}
