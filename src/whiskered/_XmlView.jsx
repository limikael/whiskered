import {useRef, useLayoutEffect, useState} from "react";
import {useConstructor} from "../utils/react-util.jsx";
import {cloneElement} from "react";
import {classStringAdd} from "../utils/js-util.js";

class XmlViewState {
	constructor() {
		this.elById={};
		this.idByEl=new Map();
		this.dragRefCount=0;
	}

	setNodeEl(nodeId, el) {
		if (this.elById[nodeId]) {
			let currentEl=this.elById[nodeId];
			this.idByEl.delete(el);
			delete this.elById[nodeId];
		}

		if (!el)
			return;

		this.elById[nodeId]=el;
		this.idByEl.set(el,nodeId);
	}

	getIdByEl(el) {
		while (el) {
			let id=this.idByEl.get(el)
			if (id)
				return id;

			el=el.parentElement;
		}
	}
}

function XmlNodeView({node, xmlViewState, classes}) {
	let Component=xmlViewState.componentLibrary[node.tagName];
	let props=node.attributes;

	let children=node.children.map(c=>
		<XmlNodeView 
			node={c} 
			xmlViewState={xmlViewState}
			classes={classes}/>
	);

	function interjectProps(props) {
		props.ref=el=>xmlViewState.setNodeEl(node.id,el);

		if (classes[node.id])
			props.class=classStringAdd(props.class,classes[node.id]);
	}

	return (
		<InterjectRender
				interjectComponent={Component}
				interjectProps={interjectProps}
				{...props}>
			<>{children}</>
		</InterjectRender>
	);
}

export default function XmlView({value, componentLibrary, classes,
		onNodeClick, onHoverChange, onDragChange, onFocusChange,
		onKeyDown,
		class: cls}) {
	let xmlViewState=useConstructor(()=>new XmlViewState());
	xmlViewState.componentLibrary=componentLibrary;

	function handleMouseDown(ev) {
		let nodeId=xmlViewState.getIdByEl(ev.target);
		onNodeClick(nodeId);
	}

	function handleMouseMove(ev) {
		let hoverId=xmlViewState.getIdByEl(ev.target);
		if (hoverId!=xmlViewState.hoverId) {
			xmlViewState.hoverId=hoverId;
			onHoverChange(hoverId);
		}
	}

	function handleDragOver(ev) {
		handleMouseMove(ev);
		ev.preventDefault();
	}

	function handleDragEnter(ev) {
		xmlViewState.dragRefCount++;
		onDragChange(!!xmlViewState.dragRefCount);
	}

	function handleDragLeave(ev) {
		xmlViewState.dragRefCount--;
		onDragChange(!!xmlViewState.dragRefCount);
	}

	function handleDrop(ev) {
		xmlViewState.dragRefCount=0;
		onDragChange(!!xmlViewState.dragRefCount);
	}

	function handleFocus() {
		onFocusChange(true);
	}

	function handleBlur() {
		onFocusChange(false);
	}

	function handleKeyDown(ev) {
		onKeyDown(ev);
	}

	return (
		<div class={classStringAdd(cls,"!cursor-default !select-none")}
				style="outline-style: none"
				tabIndex={0}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
			<XmlNodeView node={value[0]} xmlViewState={xmlViewState} classes={classes}/>
		</div>
	);
}
