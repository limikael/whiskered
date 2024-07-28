import {useRef, useLayoutEffect} from "react";
import {useConstructor} from "../utils/react-util.jsx";

class XmlViewState {
	constructor() {
		this.elById={};
		this.idByEl=new Map();
		this.highlightedEls=[];
	}

	// todo: cleanup map to make it proper
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
		return this.idByEl.get(el);
	}

	updateHighlight(highlight) {
		for (let el of this.highlightedEls) {
			el.style.outlineStyle="none";
			el.style.boxShadow="";
		}

		this.highlightedEls=[];

		for (let nodeId in highlight) {
			let el=this.elById[nodeId];
			this.highlightedEls.push(el);

			for (let highlightClass of highlight[nodeId]) {
				let styles=this.highlightLibrary[highlightClass];
				for (let styleName in styles)
					el.style[styleName]=styles[styleName];
			}
		}
	}
}

function XmlNodeView({node, xmlViewState}) {
	let Component=xmlViewState.componentLibrary[node.tagName];
	let props=node.attributes;

	let children=node.children.map(c=>
		<XmlNodeView 
			node={c} 
			xmlViewState={xmlViewState}/>
	);

	return (
		<Component
				{...props}
				containerRef={el=>xmlViewState.setNodeEl(node.id,el)}>
			{children}
		</Component>
	);
}

export default function XmlView({node, componentLibrary, highlightLibrary, highlight, onNodeClick, onHoverChange}) {
	let xmlViewState=useConstructor(()=>new XmlViewState());
	xmlViewState.componentLibrary=componentLibrary;
	xmlViewState.highlightLibrary=highlightLibrary;
	useLayoutEffect(()=>xmlViewState.updateHighlight(highlight));

	function handleMouseDown(ev) {
		let nodeId=xmlViewState.getIdByEl(ev.target);//idByEl.get(ev.target);
		//console.log("node click: "+nodeId);
		onNodeClick(nodeId);
	}

	function handleMouseMove(ev) {
		let hoverId=xmlViewState.getIdByEl(ev.target);
		if (hoverId!=xmlViewState.hoverId) {
			xmlViewState.hoverId=hoverId;
			onHoverChange(hoverId);
		}
	}

	return (
		<div onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} style="height: 200px">
			<XmlNodeView node={node} xmlViewState={xmlViewState}/>
		</div>
	);
}
