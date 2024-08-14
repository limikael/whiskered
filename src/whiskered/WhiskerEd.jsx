import {classStringAdd} from "../utils/js-util.js";
import {InterjectRender} from "../utils/react-util.jsx";
import {useEventUpdate} from "../utils/react-util.jsx";
import {txmlStringify} from "../utils/txml-stringify.js";
import {xmlFragmentRemoveNode, xmlNodeParse, xmlAppendChild, xmlFindNode,
		xmlNodeRemoveNode} from "../utils/xml-util.js";

function WhiskerEdStyle() {
	return (
		<style>{`
			.ed-drag {
				outline: 4px solid #ff8040;
				outline-offset: -8px;
			}

			.ed-drag-top {
				box-shadow: 0px -4px 0 0px #ff8040;
			}

			.ed-drag-bottom {
				box-shadow: 0px 4px 0 0px #ff8040;
			}

			.ed-drag-left {
				box-shadow: -4px 0px 0 0px #ff8040;
			}

			.ed-drag-right {
				box-shadow: 4px 0px 0 0px #ff8040;
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

function WhiskerEdFragment({fragment, whiskerEdState, classes}) {
	return (<>
		{fragment.map(c=>
			<WhiskerEdNode 
				node={c} 
				whiskerEdState={whiskerEdState}
				classes={classes}/>
		)}
	</>);
}

function WhiskerEdNode({node, whiskerEdState, classes}) {
	let Component=whiskerEdState.componentLibrary[node.tagName];
	let props=node.attributes;

	function interjectProps(props) {
		props.ref=el=>whiskerEdState.setNodeEl(node.id,el);
		props.draggable=true;
		props.onDragStart=ev=>whiskerEdState.handleDragStart(ev);
		props.onDragEnd=ev=>whiskerEdState.handleDragEnd(ev);

		if (classes[node.id])
			props.class=classStringAdd(props.class,classes[node.id]);
	}

	let content;
	if (Component.containerType=="richtext") {
		content=<span dangerouslySetInnerHTML={{__html: txmlStringify(node.children)}} contenteditable={true}/>;
	}

	else {
		content=(
			<WhiskerEdFragment
					fragment={node.children}
					whiskerEdState={whiskerEdState}
					classes={classes}/>
		);
	}

	return (
		<InterjectRender
				interjectComponent={Component}
				interjectProps={interjectProps}
				{...props}>
			{content}
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

	if (whiskerEdState.isValidDrag()) {
		let fragment=whiskerEdState.value;
		if (whiskerEdState.dropParentId) {
			let node=xmlFindNode(whiskerEdState.getValueNode(),whiskerEdState.dropParentId);
			fragment=node.children;
		}

		if (fragment.length>0) {
			let directionDropClasses={
				"up": ["ed-drag-bottom","ed-drag-top"],
				"right": ["ed-drag-left","ed-drag-right"],
				"down": ["ed-drag-top","ed-drag-bottom"],
				"left": ["ed-drag-right","ed-drag-left"],
			}

			let dropClasses=directionDropClasses[whiskerEdState.dropLayoutDirection];

			if (whiskerEdState.dropInsertIndex>=fragment.length) {
				let id=fragment[fragment.length-1].id;
				addClass(id,dropClasses[1]);
			}

			else {
				let id=fragment[whiskerEdState.dropInsertIndex].id;
				addClass(id,dropClasses[0]);
			}
		}

		else {
			addClass(whiskerEdState.dropParentId,"ed-drag");
		}
	}

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
		if (ev.type=="dragover")
			ev.preventDefault();

		whiskerEdState.updateHover(ev);
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
		//console.log("***** DROP");

		ev.preventDefault();

		let dropData=ev.dataTransfer.getData("whiskered");
		if (!dropData ||
				!whiskerEdState.isValidDrag()) {
			whiskerEdState.clearDragState();
			return;
		}

		let child=xmlNodeParse(dropData);
		let valueNode=whiskerEdState.getValueNode();
		let parentNode=valueNode;
		if (whiskerEdState.dropParentId)
			parentNode=xmlFindNode(valueNode,whiskerEdState.dropParentId);

		parentNode.children.splice(whiskerEdState.dropInsertIndex,0,child);

		if (whiskerEdState.dragId)
			xmlNodeRemoveNode(valueNode,whiskerEdState.dragId);

		whiskerEdState.setValueNode(valueNode);

		whiskerEdState.clearDragState();
	}

	if (whiskerEdState.focusState)
		cls=classStringAdd(cls,"ed-focus");

	if (whiskerEdState.isValidDrag() &&
			!whiskerEdState.dropParentId &&
			!whiskerEdState.value.length)
		cls=classStringAdd(cls,"ed-drag");

	else
		cls=classStringAdd(cls,"outline-none");

	return (
		<div class={classStringAdd(cls,"!cursor-default !select-none")}
				tabIndex={0}
				onMouseDown={handleMouseDown}
				onFocus={()=>whiskerEdState.setFocusState(true)}
				onBlur={()=>whiskerEdState.setFocusState(false)}
				onDragEnter={(ev)=>whiskerEdState.changeDragCount(1,ev)}
				onDragLeave={(ev)=>whiskerEdState.changeDragCount(-1,ev)}
				onMouseMove={handleMouseMove}
				onDragOver={handleMouseMove}
				onKeyDown={handleKeyDown}
				onDrop={handleDrop}>
			<WhiskerEdStyle/>
			<WhiskerEdFragment 
				classes={createWhiskerEdClasses(whiskerEdState)}
				whiskerEdState={whiskerEdState}
				fragment={whiskerEdState.value}/>
		</div>
	);
}
