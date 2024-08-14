import {nodePred, nodeClean, nodeInit, nodeId} from "./whiskered-util.js";
import {xmlIndex, xmlFragment, xmlFind} from "../utils/xml-util.js";
import {parse as parseXml} from "txml/txml";
import {txmlStringify} from "../utils/txml-stringify.js";

export default class WhiskerEdHandlers {
	constructor({whiskerEdState, forceUpdate}) {
		this.whiskerEdState=whiskerEdState;
		this.forceUpdate=forceUpdate;
	}

	handleMouseDown=(ev)=>{
		let id=this.whiskerEdState.getIdByEl(ev.target);
		if (id==this.whiskerEdState.selectedId)
			return;

		this.whiskerEdState.selectedId=id;
		this.forceUpdate();
	}

	handleFocus=(ev)=>{
		if (this.whiskerEdState.focus)
			return;

		this.whiskerEdState.focus=true;
		this.forceUpdate();
	}

	handleBlur=(ev)=> {
		if (!this.whiskerEdState.focus)
			return;

		this.whiskerEdState.focus=false;
		this.forceUpdate();
	}

	handleKeyDown=(ev)=> {
		if (ev.code=="Delete" || ev.code=="Backspace") {
			if (!this.whiskerEdState.selectedId)
				return;

			let v=this.whiskerEdState.value;
			let p=nodePred(this.whiskerEdState.selectedId);
			let fragment=xmlFragment(v,p);
			let index=xmlIndex(v,p);

			fragment.splice(index,1);
			this.whiskerEdState.selectedId=undefined;
			this.forceUpdate();
		}
	}

	handleDragEnter=(ev)=>{
		ev.preventDefault();
		let prev=this.whiskerEdState.isDrag();
		this.whiskerEdState.changeDragCount(1);
		if (prev!=this.whiskerEdState.isDrag())
			this.forceUpdate();
	}

	handleDragLeave=(ev)=>{
		ev.preventDefault();
		let prev=this.whiskerEdState.isDrag();
		this.whiskerEdState.changeDragCount(-1);
		if (prev!=this.whiskerEdState.isDrag())
			this.forceUpdate();
	}

	handleMouseMove=(ev)=>{
		if (ev.type=="dragover")
			ev.preventDefault();

		let prev={
			hoverId: this.whiskerEdState.hoverId,
			dropParentId: this.whiskerEdState.dropParentId,
			dropInsertIndex: this.whiskerEdState.dropInsertIndex,
			dropLayoutDirection: this.whiskerEdState.dropLayoutDirection
		};

		let mousePosition={x: ev.clientX, y: ev.clientY};
		this.whiskerEdState.updateHover(ev.target,mousePosition);

		if (prev.hoverId!==this.whiskerEdState.hoverId ||
				prev.dropParentId!==this.whiskerEdState.dropParentId ||
				prev.dropInsertIndex!==this.whiskerEdState.dropInsertIndex ||
				prev.dropLayoutDirection!==this.whiskerEdState.dropLayoutDirection)
			this.forceUpdate();
	}

	handleDrop=(ev)=>{
		ev.preventDefault();

		let dropData=ev.dataTransfer.getData("whiskered");
		if (!dropData ||
				!this.whiskerEdState.isValidDrag()) {
			this.whiskerEdState.clearDrag();
			this.forceUpdate();
			return;
		}

		let oldDragId;
		if (this.whiskerEdState.dragId) {
			let dragNode=xmlFind(this.whiskerEdState.value,nodePred(this.whiskerEdState.dragId));
			nodeClean(dragNode);
			nodeInit(dragNode);
			oldDragId=nodeId(dragNode);
		}

		let fragment=this.whiskerEdState.value;
		if (this.whiskerEdState.dropParentId) {
			let p=nodePred(this.whiskerEdState.dropParentId);
			fragment=xmlFind(fragment,p).children;
		}

		let childNode=parseXml(dropData)[0];
		fragment.splice(this.whiskerEdState.dropInsertIndex,0,childNode);

		if (oldDragId) {
			let v=this.whiskerEdState.value;
			let fragment=xmlFragment(v,nodePred(oldDragId));
			let index=xmlIndex(v,nodePred(oldDragId));
			fragment.splice(index,1);
		}

		this.whiskerEdState.clearDrag();
		this.forceUpdate();
	}

	handleDragStart=(ev)=>{
		if (this.whiskerEdState.dragId)
			return;

		this.whiskerEdState.dragId=this.whiskerEdState.getIdByEl(ev.target);
		let dragNode=xmlFind(this.whiskerEdState.value,nodePred(this.whiskerEdState.dragId));
		let xml=txmlStringify(dragNode);

		ev.dataTransfer.setData("whiskered",xml);
		this.forceUpdate();
	}

	handleDragEnd=(ev)=>{
		if (!this.dragId)
			return;

		this.clearDragState();
		this.forceUpdate();
	}
}