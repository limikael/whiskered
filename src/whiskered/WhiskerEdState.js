import {useConstructor} from "../utils/react-util.jsx";
import {xmlForEach, xmlFind, xmlPath, xmlParent, xmlIndex} from "../utils/xml-util.js";
import {elMidpoint, elPointDist, pDist, pSub, pDot, elIsOnEdge} from "../utils/ui-util.js";
import BidirectionalMap from "../utils/BidirectionalMap.js";
import {txmlStringify} from "../utils/txml-stringify.js";
import {nodeInit, nodePred, nodeId} from "./whiskered-util.js";
import WhiskerEdSelection from "./WhiskerEdSelection.js";

export default class WhiskerEdState {
	constructor({edgeSize}) {
		this.elById=new BidirectionalMap();
		this.dragCount=0;
		this.edgeSize=edgeSize;

		if (!this.edgeSize)
			this.edgeSize=5;
	}

	preRender({value, componentLibrary, selection, rewriteUrl}) {
		xmlForEach(value,nodeInit);
		this.value=value;
		this.componentLibrary=componentLibrary;
		this.rewriteUrl=rewriteUrl;
		if (selection)
			this.selection=selection;

		if (!this.selection)
			this.selection=new WhiskerEdSelection();
	}

	// todo: when is this not an element?
	setNodeEl(nodeId, el) {
		if (!(el instanceof Element))
			el=null;

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

	setHoverState({hoverId, dropParentId, dropInsertIndex}) {
		this.selection.hoverId=hoverId;
		this.selection.dropParentId=dropParentId;
		this.selection.dropInsertIndex=dropInsertIndex;
	}

	getNodeComponent(node) {
		let Comp;
		if (node && node.tagName)
			Comp=this.componentLibrary[node.tagName];

		return Comp;
	}

	getClosestChildIndex(parentId, mouseLocation) {
		let fragment=this.value;
		if (parentId)
			fragment=xmlFind(this.value,nodePred(parentId)).children;

		let closestIndex=undefined;
		let closestDist=undefined;
		let layoutVectors={
			up: {x:0,y:-1},
			right: {x:1,y:0},
			down: {x:0,y:1},
			left: {x:-1,y:0},
		}

		for (let i=0; i<fragment.length; i++) {
			let el=this.elById.get(nodeId(fragment[i]));
			if (el) {
				let dist=elPointDist(el,mouseLocation);
				if (closestDist===undefined ||
						dist<closestDist) {
					closestIndex=i;
					closestDist=dist;
				}
			}
		}

		return closestIndex;
	}

	getDropInsertIndex(parentId, closestIndex, mouseLocation) {
		let layoutDirection=this.getDropLayoutDirection(parentId,closestIndex);
		let fragment=this.value;
		if (parentId)
			fragment=xmlFind(this.value,nodePred(parentId)).children;

		let layoutVectors={
			up: {x:0,y:-1},
			right: {x:1,y:0},
			down: {x:0,y:1},
			left: {x:-1,y:0},
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

	getDropLayoutDirection(parentId, index) {
		let parentNode,parentComp;
		let fragment=this.value;
		if (parentId) {
			parentNode=xmlFind(this.value,nodePred(parentId));
			parentComp=this.getNodeComponent(parentNode);
			fragment=parentNode.children;
		}

		let layoutDirection="down";
		if (parentComp && parentComp.childLayoutDirection) {
			if (typeof parentComp.childLayoutDirection=="function")
				layoutDirection=parentComp.childLayoutDirection(parentNode.attributes,layoutDirection);

			else
				layoutDirection=parentComp.childLayoutDirection;
		}

		if (index>=fragment.length)
			index=fragment.length-1;

		let childNode=fragment[index];
		let childComp=this.getNodeComponent(childNode);
		if (childComp && childComp.layoutDirection) {
			if (typeof childComp.layoutDirection=="function")
				layoutDirection=childComp.layoutDirection(childNode.attributes,layoutDirection);

			else
				layoutDirection=childComp.layoutDirection;
		}

		return layoutDirection;
	}

	getCurrentDropLayoutDirection() {
		return this.getDropLayoutDirection(
			this.selection.dropParentId,
			this.selection.dropInsertIndex
		);
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
			if (this.selection.dragId && pathIds.includes(this.selection.dragId)) {
				this.setHoverState({
					hoverId: hoverId,
					dropParentId: "illegal",
				});

				return;
			}
		}

		// Set layout direction and index.
		let closestIndex=this.getClosestChildIndex(dropParentId,mouseLocation);
		let dropLayoutDirection=this.getDropLayoutDirection(dropParentId,closestIndex);
		let dropInsertIndex=this.getDropInsertIndex(dropParentId,closestIndex,mouseLocation);

		/*console.log(closestIndex);


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
		}*/

		// Not meaningful if dragged to same location.
		if (this.selection.dragId) {
			let dragParentNodeId;
			let dragParentNode=xmlParent(this.value,nodePred(this.selection.dragId));
			if (dragParentNode)
				dragParentNodeId=nodeId(dragParentNode);

			if (dragParentNodeId==dropParentId) {
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
		}

		this.setHoverState({
			hoverId: hoverId,
			dropParentId: dropParentId,
			dropInsertIndex: dropInsertIndex,
			//dropLayoutDirection: dropLayoutDirection
		});
	}
}
