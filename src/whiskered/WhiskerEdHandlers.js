import {nodePred, nodeClean, nodeInit, nodeId} from "./whiskered-util.js";
import {xmlIndex, xmlFragment, xmlFind, xmlMove} from "../utils/xml-util.js";
import {txmlStringify, txmlParse} from "../utils/txml-stringify.js";
import {isStringy} from "../utils/js-util.js";

export default class WhiskerEdHandlers {
	constructor({whiskerEdState, forceUpdate, onChange, onSelectionChange}) {
		this.whiskerEdState=whiskerEdState;
		this.forceUpdate=forceUpdate;
		this.onChange=onChange;
		this.onSelectionChange=onSelectionChange;
	}

	notifyValueChange() {
		this.forceUpdate();
		if (this.onChange)
			this.onChange([...this.whiskerEdState.value]);
	}

	notifySelectionChange() {
		this.forceUpdate();
		if (this.onSelectionChange)
			this.onSelectionChange(this.whiskerEdState.selection.clone());
	}

	handleMouseDown=(ev)=>{
		let id=this.whiskerEdState.getIdByEl(ev.target);
		if (id==this.whiskerEdState.selection.selectedId)
			return;

		this.whiskerEdState.editTextMode=false;
		this.whiskerEdState.selection.selectedId=id;
		this.notifySelectionChange();
	}

	handleDblClick=(ev)=>{
		let id=this.whiskerEdState.getIdByEl(ev.target);
		this.whiskerEdState.selection.selectedId=id;
		this.whiskerEdState.editTextMode=false;

		if (id) {
			let node=xmlFind(this.whiskerEdState.value,nodePred(id))
			let Component=this.whiskerEdState.getNodeComponent(node);
			if (Component && Component.containerType=="richtext")
				this.whiskerEdState.editTextMode=true;
		}

		this.notifySelectionChange();
	}

	/*handleClick=(ev)=>{
		let id=this.whiskerEdState.getIdByEl(ev.target);
		this.whiskerEdState.selection.selectedId=id;
		this.whiskerEdState.editTextMode=false;

		if (id) {
			let node=xmlFind(this.whiskerEdState.value,nodePred(id))
			let Component=this.whiskerEdState.componentLibrary[node.tagName];
			if (Component.containerType=="richtext")
				this.whiskerEdState.editTextMode=true;
		}

		this.forceUpdate();
	}*/

	handleFocus=(ev)=>{
		console.log("focus...");
		if (this.whiskerEdState.focus)
			return;

		this.whiskerEdState.focus=true;
		this.forceUpdate();
	}

	handleBlur=(ev)=> {
		console.log("blur...");
		if (!this.whiskerEdState.focus)
			return;

		this.whiskerEdState.focus=false;
		this.forceUpdate();
	}

	handleKeyDown=(ev)=> {
		if (this.whiskerEdState.editTextMode)
			return;

		if (ev.code=="Delete" || ev.code=="Backspace") {
			if (!this.whiskerEdState.selection.selectedId)
				return;

			let v=this.whiskerEdState.value;
			let p=nodePred(this.whiskerEdState.selection.selectedId);
			let fragment=xmlFragment(v,p);
			let index=xmlIndex(v,p);

			fragment.splice(index,1);
			this.whiskerEdState.selection.selectedId=undefined;
			this.notifyValueChange();
			this.notifySelectionChange();
		}
	}

	handleDragEnter=(ev)=>{
		//console.log("drag enter");
		ev.preventDefault();
		let prev=this.whiskerEdState.selection.clone();
		this.whiskerEdState.selection.changeDragCount(1);
		if (!prev.equals(this.whiskerEdState.selection))
			this.notifySelectionChange();
	}

	handleDragLeave=(ev)=>{
		//console.log("drag leave");
		ev.preventDefault();
		let prev=this.whiskerEdState.selection.clone();
		this.whiskerEdState.selection.changeDragCount(-1);
		if (!prev.equals(this.whiskerEdState.selection))
			this.notifySelectionChange();
	}

	handleMouseMove=(ev)=>{
		if (ev.type=="dragover")
			ev.preventDefault();

		let prev=this.whiskerEdState.selection.clone();
		let mousePosition={x: ev.clientX, y: ev.clientY};
		this.whiskerEdState.updateHover(ev.target,mousePosition);
		if (!prev.equals(this.whiskerEdState.selection))
			this.notifySelectionChange();
	}

	handleMouseOut=(ev)=>{
		this.whiskerEdState.selection.hoverId=undefined;
		this.notifySelectionChange();
	}

	handleDrop=(ev)=>{
		ev.preventDefault();

		if (this.whiskerEdState.selection.isValidDrag()) {
			if (this.whiskerEdState.selection.dragId) {
				let doc=this.whiskerEdState.value;
				let fragment=doc;
				if (this.whiskerEdState.selection.dropParentId)
					fragment=xmlFind(fragment,nodePred(this.whiskerEdState.selection.dropParentId)).children;

				let di=this.whiskerEdState.selection.dropInsertIndex;
				xmlMove(doc,nodePred(this.whiskerEdState.selection.dragId),fragment,di);
			}

			else if (ev.dataTransfer.getData("whiskered")) {
				let dropData=ev.dataTransfer.getData("whiskered");
				let dpi=this.whiskerEdState.selection.dropParentId;
				let fragment=this.whiskerEdState.value;
				if (dpi)
					fragment=xmlFind(fragment,nodePred(dpi)).children;

				let childNode=txmlParse(dropData)[0];
				nodeInit(childNode);
				fragment.splice(this.whiskerEdState.selection.dropInsertIndex,0,childNode);
				this.whiskerEdState.selection.selectedId=nodeId(childNode);

				let g=ev.dataTransfer.getData("whiskered-set-global");
				if (g) {
					//console.log("setting global to signal drop handled: "+g);
					globalThis[g]=true;
				}
			}
		}

		this.whiskerEdState.selection.clearDrag();
		this.notifySelectionChange();
		this.notifyValueChange();
	}

	handleDragStart=(ev)=>{
		if (this.whiskerEdState.selection.dragId)
			return;

		this.whiskerEdState.selection.dragId=this.whiskerEdState.getIdByEl(ev.target);
		this.forceUpdate();
	}

	handleDragEnd=(ev)=>{
		if (!this.whiskerEdState.selection.dragId)
			return;

		this.clearDragState();
		this.forceUpdate();
	}

	handleTextChange=(html)=>{
		if (!this.whiskerEdState.editTextMode)
			return;

		let editNode=xmlFind(this.whiskerEdState.value,nodePred(this.whiskerEdState.selection.selectedId));
		editNode.children=txmlParse(html);
		this.notifyValueChange();
	}

	handleTextBlur=(ev)=>{
		this.whiskerEdState.editTextMode=false;
		this.forceUpdate();
	}
}