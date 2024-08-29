import {classStringAdd, isStringy} from "../utils/js-util.js";
import {InterjectRender, useConstructor, useForceUpdate} from "../utils/react-util.jsx";
import {useEventUpdate, ContentEditable} from "../utils/react-util.jsx";
import {txmlStringify} from "../utils/txml-stringify.js";
import WhiskerEdState from "./WhiskerEdState.js";
import WhiskerEdHandlers from "./WhiskerEdHandlers.js";
import {nodeId, nodePred} from "./whiskered-util.js";
import {xmlFind} from "../utils/xml-util.js";

function WhiskerEdStyle() {
//				outline-offset: -2px;

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

			.ed-hover {
				outline: 2px dashed rgba(255,128,64);
				outline-offset: 2px;
			}

			.ed-focus .ed-select {
				outline-color: rgba(255,128,64);
			}
		`}</style>
	);
}

function WhiskerEdFragment({fragment, whiskerEdState, classes, handlers}) {
	return (<>
		{fragment.map(c=>
			<WhiskerEdNode 
				node={c} 
				whiskerEdState={whiskerEdState}
				classes={classes}
				handlers={handlers}/>
		)}
	</>);
}

function WhiskerEdNode({node, whiskerEdState, classes, handlers}) {
	let Component;
	if (!isStringy(node)) {
		if (node.tagName.charAt(0).toLowerCase()==node.tagName.charAt(0)) {
			Component=new String(node.tagName);
			Object.assign(Component,whiskerEdState.componentLibrary[node.tagName]);
		}

		else {
			Component=whiskerEdState.componentLibrary[node.tagName];
		}
	}

	let props=node.attributes;

	function interjectProps(props) {
		let id=nodeId(node);
		props.ref=el=>whiskerEdState.setNodeEl(id,el);
		props.draggable=true;
		props.onDragStart=handlers.handleDragStart;
		props.onDragEnd=handlers.handleDragEnd;

		if (classes[id])
			props.class=classStringAdd(props.class,classes[id]);
	}

	let content;
	if (Component && Component.containerType=="richtext") {
		if (whiskerEdState.selection.selectedId==nodeId(node) &&
				whiskerEdState.editTextMode) {
			content=(<>
				<span>&#8203;</span>
				<ContentEditable
						initialValue={txmlStringify(node.children,{pretty: false})}
						style={{outline: "none", cursor: "text", minHeight: "1em"}}
						element="span"
						onChange={handlers.handleTextChange}
						onBlur={handlers.handleTextBlur}/>
			</>);
		}

		else {
			let html=txmlStringify(node.children,{pretty: false});
			if (!html.trim())
				content=<span style={{opacity: "0.5"}}>&lt;text&gt;</span>

			else
				content=<span dangerouslySetInnerHTML={{__html: html}}/>;
		}
	}

	else if (isStringy(node)) {
		let id=nodeId(node);

		return (
			<span ref={el=>whiskerEdState.setNodeEl(id,el)}
					class={classes[id]}
					draggable={true}
					onDragStart={handlers.handleDragStart}
					onDragEnd={handlers.handleDragEnd}>
				{node}
			</span>
		);
	}

	else {
		content=(
			<WhiskerEdFragment
					fragment={node.children}
					whiskerEdState={whiskerEdState}
					classes={classes}
					handlers={handlers}/>
		);
	}

	if (!Component)
		Component=({children})=><div>Undefined: {node.tagName} {children}</div>

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

	if (whiskerEdState.selection.selectedId && 
			!whiskerEdState.selection.isDrag())
		addClass(whiskerEdState.selection.selectedId,"ed-select");

	if (whiskerEdState.selection.hoverId &&
			!whiskerEdState.selection.isDrag() &&
			whiskerEdState.selection.hoverId!=whiskerEdState.selection.selectedId)
		addClass(whiskerEdState.selection.hoverId,"ed-hover");

	if (whiskerEdState.selection.isValidDrag()) {
		let fragment=whiskerEdState.value;

		//console.log(whiskerEdState.dropParentId);
		if (whiskerEdState.selection.dropParentId) {
			let node=xmlFind(whiskerEdState.value,nodePred(whiskerEdState.selection.dropParentId));
			fragment=node.children;
		}

		//console.log(fragment);

		if (fragment.length>0) {
			let directionDropClasses={
				"up": ["ed-drag-bottom","ed-drag-top"],
				"right": ["ed-drag-left","ed-drag-right"],
				"down": ["ed-drag-top","ed-drag-bottom"],
				"left": ["ed-drag-right","ed-drag-left"],
			}

			let dropClasses=directionDropClasses[whiskerEdState.getDropLayoutDirection()];

			let di=whiskerEdState.selection.dropInsertIndex;
			if (di===undefined)
				di=fragment.length;

			if (di>=fragment.length) {
				let id=nodeId(fragment[fragment.length-1]);
				addClass(id,dropClasses[1]);
			}

			else {
				let id=nodeId(fragment[whiskerEdState.selection.dropInsertIndex]);
				addClass(id,dropClasses[0]);
			}
		}

		else {
			addClass(whiskerEdState.selection.dropParentId,"ed-drag");
		}
	}

	return classes;	
}

export default function WhiskerEd({value, onChange, selection, onSelectionChange, componentLibrary, class: cls}) {
	let whiskerEdState=useConstructor(()=>new WhiskerEdState());
	whiskerEdState.preRender({value, selection, componentLibrary});

	let forceUpdate=useForceUpdate();
	let handlers=new WhiskerEdHandlers({whiskerEdState, forceUpdate, onChange, onSelectionChange});
	let style={
		cursor: "defalt",
		userSelect: "none"
	};

	if (whiskerEdState.focus)
		cls=classStringAdd(cls,"ed-focus");

	if (whiskerEdState.selection.isValidDrag() &&
			!whiskerEdState.selection.dropParentId &&
			!whiskerEdState.value.length)
		cls=classStringAdd(cls,"ed-drag");

	else
		style.outline="none";

	return (
		<div class={cls}
				style={style}
				tabIndex={0}
				onFocus={handlers.handleFocus}
				onBlur={handlers.handleBlur}
				onMouseDown={handlers.handleMouseDown}
				onKeyDown={handlers.handleKeyDown}
				onDragEnter={handlers.handleDragEnter}
				onDragLeave={handlers.handleDragLeave}
				onMouseMove={handlers.handleMouseMove}
				onMouseOut={handlers.handleMouseOut}
				onDragOver={handlers.handleMouseMove}
				onDrop={handlers.handleDrop}
				onDblClick={handlers.handleDblClick}>
			<WhiskerEdStyle/>
			<WhiskerEdFragment 
				classes={createWhiskerEdClasses(whiskerEdState)}
				whiskerEdState={whiskerEdState}
				fragment={whiskerEdState.value}
				handlers={handlers}/>
		</div>
	);
}
