import {classStringAdd} from "../utils/js-util.js";
import {InterjectRender} from "../utils/react-util.jsx";
import {useEventUpdate} from "../utils/react-util.jsx";
import {xmlFragmentRemoveNode, xmlNodeParse, xmlAppendChild, xmlFindNode} from "../utils/xml-util.js";

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

		if (classes[node.id])
			props.class=classStringAdd(props.class,classes[node.id]);
	}

	return (
		<InterjectRender
				interjectComponent={Component}
				interjectProps={interjectProps}
				{...props}>
			<WhiskerEdFragment
					fragment={node.children}
					whiskerEdState={whiskerEdState}
					classes={classes}/>					
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

	if (whiskerEdState.getDragState()) {
		let fragment=whiskerEdState.value;
		if (whiskerEdState.hoverId) {
			let node=xmlFindNode(whiskerEdState.getValueNode(),whiskerEdState.hoverId);
			fragment=node.children;
		}

		if (fragment.length>0) {
			if (whiskerEdState.insertIndex>=fragment.length) {
				let id=fragment[fragment.length-1].id;
				addClass(id,"ed-drag-bottom");
			}

			else {
				let id=fragment[whiskerEdState.insertIndex].id;
				addClass(id,"ed-drag-top");
			}
		}

		else {
			addClass(whiskerEdState.hoverId,"ed-drag");
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
		ev.preventDefault();

		let dropData=ev.dataTransfer.getData("whiskered");
		let child=xmlNodeParse(dropData);
		let valueNode=whiskerEdState.getValueNode();
		let parentNode=valueNode;
		if (whiskerEdState.hoverId)
			parentNode=xmlFindNode(valueNode,whiskerEdState.hoverId);

		parentNode.children.splice(whiskerEdState.insertIndex,0,child);
		whiskerEdState.setValueNode(valueNode);

		whiskerEdState.clearDragState();
	}

	if (whiskerEdState.focusState)
		cls=classStringAdd(cls,"ed-focus");

	if (whiskerEdState.getDragState() &&
			!whiskerEdState.hoverId &&
			!whiskerEdState.value.length)
		cls=classStringAdd(cls,"ed-drag");

	else
		cls=classStringAdd(cls,"outline-none");

	//console.log("render");

	return (
		<div class={classStringAdd(cls,"!cursor-default !select-none")}
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
			<WhiskerEdFragment 
				classes={createWhiskerEdClasses(whiskerEdState)}
				whiskerEdState={whiskerEdState}
				fragment={whiskerEdState.value}/>
		</div>
	);
}
