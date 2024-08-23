import {arrayRemove} from "../utils/js-util.js";
import {xmlFind, xmlFragment, xmlIndex} from "../utils/xml-util.js";
import {nodePred, nodeId, nodeClean, nodeInit} from "../whiskered/whiskered-util.js";
import {parse as parseXml} from "txml/txml";
import {txmlStringify} from "../utils/txml-stringify.js";

export default class DocTreeHandlers {
	constructor(docTreeState, forceUpdate) {
		this.docTreeState=docTreeState;
		this.forceUpdate=forceUpdate;
	}

	handleDragEnter=(ev)=>{
		ev.preventDefault();
		let prev=this.docTreeState.isDrag();
		this.docTreeState.changeDragCount(1);
		if (prev!=this.docTreeState.isDrag())
			this.forceUpdate();

		this.handleMouseMove(ev);
	}

	handleDragLeave=(ev)=>{
		ev.preventDefault();
		let prev=this.docTreeState.isDrag();
		this.docTreeState.changeDragCount(-1);
		if (prev!=this.docTreeState.isDrag())
			this.forceUpdate();
	}

	handleDragStart=(ev, id)=>{
		if (this.docTreeState.dragId)
			return;

		this.docTreeState.dragId=id; //this.docTreeState.getIdByEl(ev.target);

		//console.log("drag start, dragid: "+this.docTreeState.dragId);
	}

	handleDrop=(ev)=>{
		ev.preventDefault();

		if (!this.docTreeState.dragId ||
				this.docTreeState.dropParentId=="illegal") {
			this.docTreeState.clearDrag();
			this.forceUpdate();
			return;
		}

		let dragNode=xmlFind(this.docTreeState.value,nodePred(this.docTreeState.dragId));
		let oldDragId=nodeId(dragNode);
		dragNode=parseXml(txmlStringify(dragNode))[0];
		nodeClean(dragNode);
		nodeInit(dragNode);

		let fragment=this.docTreeState.value;
		if (this.docTreeState.dropParentId) {
			let p=nodePred(this.docTreeState.dropParentId);
			fragment=xmlFind(fragment,p).children;
		}

		let insertIndex=this.docTreeState.dropInsertIndex;
		if (insertIndex===undefined)
			insertIndex=fragment.length;

		fragment.splice(insertIndex,0,dragNode);

		let oldFragment=xmlFragment(this.docTreeState.value,nodePred(oldDragId));
		let oldIndex=xmlIndex(this.docTreeState.value,nodePred(oldDragId));
		oldFragment.splice(oldIndex,1);

		this.docTreeState.clearDrag();
		this.forceUpdate();
	}

	hanleDragEnd=(ev)=>{
		if (!this.dragId)
			return;

		this.clearDragState();
		this.forceUpdate();
	}

	handleMouseMove=(ev)=>{
		if (ev.type=="dragover")
			ev.preventDefault();

		let prev={
			hoverId: this.docTreeState.hoverId,
			dropParentId: this.docTreeState.dropParentId,
			dropInsertIndex: this.docTreeState.dropInsertIndex
		};

		let mousePosition={x: ev.clientX, y: ev.clientY};
		this.docTreeState.updateHover(ev.target,mousePosition);

		if (prev.hoverId!==this.docTreeState.hoverId ||
				prev.dropParentId!==this.docTreeState.dropParentId ||
				prev.dropInsertIndex!==this.docTreeState.dropInsertIndex)
			this.forceUpdate();
	}

	handleToggleExpand(id) {
		if (this.docTreeState.expanded.includes(id))
			arrayRemove(this.docTreeState.expanded,id);

		else
			this.docTreeState.expanded.push(id);

		this.forceUpdate();
	}
}