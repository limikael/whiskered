import {classStringAdd} from "../utils/js-util.js";
import {InterjectRender} from "../utils/react-util.jsx";
import {useEventUpdate} from "../utils/react-util.jsx";
import {xmlFragmentRemoveNode} from "../utils/xml-util.js";

function WhiskerEdStyle() {
	return (
		<style>{`
			.ed-drag {
				outline: 4px solid #ff8040;
				outline-offset: -8px;
			}

			.ed-select {
				outline: 4px solid rgba(255,128,64,.5);
			}

			.ed-focus .ed-select {
				outline-color: rgba(255,128,64);
			}
		`}</style>
	);
}

function WhiskerEdNode({node, whiskerEdState, classes}) {
	let Component=whiskerEdState.componentLibrary[node.tagName];
	let props=node.attributes;

	let children=node.children.map(c=>
		<WhiskerEdNode 
			node={c} 
			whiskerEdState={whiskerEdState}
			classes={classes}/>
	);

	function interjectProps(props) {
		props.ref=el=>whiskerEdState.setNodeEl(node.id,el);

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

function createWhiskerEdClasses(whiskerEdState) {
	let classes={};
	function addClass(id, cls) {
		classes[id]=classStringAdd(classes[id],cls);
	}

	if (whiskerEdState.selectedId && 
			!whiskerEdState.getDragState())
		addClass(whiskerEdState.selectedId,"ed-select");

	if (whiskerEdState.getDragState() &&
				whiskerEdState.hoverId)
		addClass(whiskerEdState.hoverId,"ed-drag");

	return classes;	
}

export default function WhiskerEd({whiskerEdState, class: cls}) {
	useEventUpdate(whiskerEdState,"selectionChange");
	useEventUpdate(whiskerEdState,"focusChange");
	useEventUpdate(whiskerEdState,"dragChange");
	useEventUpdate(whiskerEdState,"hoverChange");
	useEventUpdate(whiskerEdState,"change");

	function handleMouseDown(ev) {
		let id=whiskerEdState.getIdByEl(ev.target);
		whiskerEdState.setSelectedId(id);
	}

	function handleMouseMove(ev) {
		ev.preventDefault();

		let id=whiskerEdState.getIdByEl(ev.target);
		whiskerEdState.setHoverId(id);
	}

	function handleKeyDown(ev) {
		if (ev.code=="Delete" || ev.code=="Backspace") {
			if (!whiskerEdState.selectedId)
				return;

			let v=whiskerEdState.value;
			v=xmlFragmentRemoveNode(v,whiskerEdState.selectedId);
			whiskerEdState.setValue(v);
		}
	}

	function handleDrop(ev) {
		ev.preventDefault();
		whiskerEdState.clearDragState();

		if (!whiskerEdState.hoverId)
			return;

		let v=whiskerEdState.value;

		console.log("drop");
	}

	if (whiskerEdState.focusState)
		cls=classStringAdd(cls,"ed-focus");

	return (
		<div class={classStringAdd(cls,"!cursor-default !select-none")}
				style="outline-style: none"
				tabIndex={0}
				onMouseDown={handleMouseDown}
				onFocus={()=>whiskerEdState.setFocusState(true)}
				onBlur={()=>whiskerEdState.setFocusState(false)}
				onDragEnter={()=>whiskerEdState.changeDragCount(1)}
				onDragLeave={()=>whiskerEdState.changeDragCount(-1)}
				onMouseMove={handleMouseMove}
				onDragOver={handleMouseMove}
				onKeyDown={handleKeyDown}
				onDrop={handleDrop}>
			<WhiskerEdStyle/>
			<WhiskerEdNode 
				classes={createWhiskerEdClasses(whiskerEdState)}
				whiskerEdState={whiskerEdState}
				node={whiskerEdState.value[0]}/>
		</div>
	);
}
