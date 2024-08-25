import {arrayRemove} from "../utils/js-util.js";
import {xmlFind, xmlFragment, xmlIndex, xmlMove} from "../utils/xml-util.js";
import {nodePred, nodeId, nodeClean, nodeInit} from "../whiskered/whiskered-util.js";
import {parse as parseXml} from "txml/txml";
import {txmlStringify} from "../utils/txml-stringify.js";

export default class DocTreeHandlers {
	constructor({docTreeState, forceUpdate, onChange, onSelectionChange}) {
		this.docTreeState=docTreeState;
		this.forceUpdate=forceUpdate;
		this.onChange=onChange;
		this.onSelectionChange=onSelectionChange;
	}

	notifyValueChange() {
		this.forceUpdate();
		if (this.onChange)
			this.onChange([...this.docTreeState.value]);
	}

	notifySelectionChange() {
		this.forceUpdate();
		if (this.onSelectionChange)
			this.onSelectionChange(this.docTreeState.selection.clone());
	}

	handleFocus=(ev)=>{
		console.log("handle focus");

		if (this.docTreeState.focus)
			return;

		this.docTreeState.focus=true;
		this.forceUpdate();
	}

	handleBlur=(ev)=> {
		if (!this.docTreeState.focus)
			return;

		this.docTreeState.focus=false;
		this.forceUpdate();
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

		this.docTreeState.dragId=id;
	}

	handleDrop=(ev)=>{
		ev.preventDefault();

		if (!this.docTreeState.dragId ||
				this.docTreeState.dropParentId=="illegal") {
			this.docTreeState.clearDrag();
			this.forceUpdate();
			return;
		}

		let doc=this.docTreeState.value;
		let fragment=doc;
		if (this.docTreeState.dropParentId)
			fragment=xmlFind(fragment,nodePred(this.docTreeState.dropParentId)).children;

		//console.log(this.docTreeState.dropInsertIndex);

		let di=this.docTreeState.dropInsertIndex;
		xmlMove(doc,nodePred(this.docTreeState.dragId),fragment,di);
		this.docTreeState.clearDrag();
		this.forceUpdate();
		this.notifyValueChange();
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

	handleSelect(id) {
		this.docTreeState.selection.selectedId=id;
		this.notifySelectionChange();
	}
}