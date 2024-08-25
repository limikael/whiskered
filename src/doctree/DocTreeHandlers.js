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
		let prev=this.docTreeState.selection.clone();
		this.docTreeState.selection.changeDragCount(1);
		if (!prev.equals(this.docTreeState))
			this.notifySelectionChange();

		this.handleMouseMove(ev);
	}

	handleDragLeave=(ev)=>{
		ev.preventDefault();
		let prev=this.docTreeState.selection.clone();
		this.docTreeState.selection.changeDragCount(-1);
		if (!prev.equals(this.docTreeState))
			this.notifySelectionChange();
	}

	handleDragStart=(ev, id)=>{
		if (this.docTreeState.selection.dragId)
			return;

		this.docTreeState.selection.dragId=id;
	}

	handleDrop=(ev)=>{
		ev.preventDefault();

		if (!this.docTreeState.selection.dragId ||
				this.docTreeState.selection.dropParentId=="illegal") {
			this.docTreeState.selection.clearDrag();
			this.notifySelectionChange();
			return;
		}

		let doc=this.docTreeState.value;
		let fragment=doc;
		if (this.docTreeState.selection.dropParentId)
			fragment=xmlFind(fragment,nodePred(this.docTreeState.selection.dropParentId)).children;

		//console.log(this.docTreeState.selection.dropInsertIndex);

		let di=this.docTreeState.selection.dropInsertIndex;
		xmlMove(doc,nodePred(this.docTreeState.selection.dragId),fragment,di);
		this.docTreeState.selection.clearDrag();
		this.notifySelectionChange();
		this.notifyValueChange();
	}

	hanleDragEnd=(ev)=>{
		if (!this.selection.dragId)
			return;

		this.docTreeState.selection.clearDrag();
		this.notifySelectionChange();
	}

	handleMouseMove=(ev)=>{
		if (ev.type=="dragover")
			ev.preventDefault();

		let prev=this.docTreeState.selection.clone();
		let mousePosition={x: ev.clientX, y: ev.clientY};
		this.docTreeState.updateHover(ev.target,mousePosition);
		if (!prev.equals(this.docTreeState.selection))
			this.notifySelectionChange();
	}

	handleToggleExpand=(id)=>{
		if (this.docTreeState.expanded.includes(id))
			arrayRemove(this.docTreeState.expanded,id);

		else
			this.docTreeState.expanded.push(id);

		this.forceUpdate();
	}

	handleSelect=(id)=>{
		this.docTreeState.selection.selectedId=id;
		this.notifySelectionChange();
	}

	handleMouseDown=(ev)=>{
		let id=this.docTreeState.getIdByEl(ev.target);
		this.docTreeState.selection.selectedId=id;
		this.notifySelectionChange();
	}
}