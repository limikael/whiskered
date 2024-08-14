import {classStringAdd} from "../utils/js-util.js";
import {InterjectRender, useConstructor, useForceUpdate} from "../utils/react-util.jsx";
import {useEventUpdate, ContentEditable} from "../utils/react-util.jsx";
import {txmlStringify} from "../utils/txml-stringify.js";
import WhiskerEdState from "./WhiskerEdState.js";
import WhiskerEdHandlers from "./WhiskerEdHandlers.js";
import {nodeId, nodePred} from "./whiskered-util.js";
import {xmlFind} from "../utils/xml-util.js";

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
	let Component=whiskerEdState.componentLibrary[node.tagName];
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
	if (Component.containerType=="richtext") {
		if (whiskerEdState.selectedId==nodeId(node) &&
				whiskerEdState.editTextMode) {
			content=(
				<ContentEditable
						initialValue={txmlStringify(node.children,{pretty: false})}
						class="outline-none cursor-text"
						element="span"
						onChange={handlers.handleTextChange}
						onBlur={handlers.handleTextBlur}/>
			);
		}

		else {
			content=<span dangerouslySetInnerHTML={{__html: txmlStringify(node.children,{pretty: false})}}/>;
		}
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
			!whiskerEdState.isDrag())
		addClass(whiskerEdState.selectedId,"ed-select");

	if (whiskerEdState.isValidDrag()) {
		let fragment=whiskerEdState.value;
		if (whiskerEdState.dropParentId) {
			let node=xmlFind(whiskerEdState.value,nodePred(whiskerEdState.dropParentId));
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

			let dropClasses=directionDropClasses[whiskerEdState.dropLayoutDirection];

			if (whiskerEdState.dropInsertIndex>=fragment.length) {
				let id=nodeId(fragment[fragment.length-1]);
				addClass(id,dropClasses[1]);
			}

			else {
				let id=nodeId(fragment[whiskerEdState.dropInsertIndex]);
				addClass(id,dropClasses[0]);
			}
		}

		else {
			addClass(whiskerEdState.dropParentId,"ed-drag");
		}
	}

	return classes;	
}

export default function WhiskerEd({value, componentLibrary, class: cls}) {
	let whiskerEdState=useConstructor(()=>new WhiskerEdState());
	let forceUpdate=useForceUpdate();
	whiskerEdState.preRender({value, componentLibrary});
	let handlers=new WhiskerEdHandlers({whiskerEdState, forceUpdate});

	if (whiskerEdState.focus)
		cls=classStringAdd(cls,"ed-focus");

	if (whiskerEdState.isValidDrag() &&
			!whiskerEdState.dropParentId &&
			!whiskerEdState.value.length)
		cls=classStringAdd(cls,"ed-drag");

	else
		cls=classStringAdd(cls,"outline-none");

	//console.log("render, text: "+whiskerEdState.editTextMode);
	//onClick={handlers.handleClick}

	return (
		<div class={classStringAdd(cls,"cursor-default !select-none")}
				tabIndex={0}
				onFocus={handlers.handleFocus}
				onBlur={handlers.handleBlur}
				onMouseDown={handlers.handleMouseDown}
				onKeyDown={handlers.handleKeyDown}
				onDragEnter={handlers.handleDragEnter}
				onDragLeave={handlers.handleDragLeave}
				onMouseMove={handlers.handleMouseMove}
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
