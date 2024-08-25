import {useConstructor, useForceUpdate} from "../utils/react-util.jsx";
import DocTreeState from "./DocTreeState.js";
import DocTreeHandlers from "./DocTreeHandlers.js";
import {useRef} from "react";
import {nodeId, nodePred} from "../whiskered/whiskered-util.js";
import {xmlParent, xmlFragment} from "../utils/xml-util.js";

function DocTreeNode({node, docTreeState, level, handlers, index}) {
	let ItemRenderer=docTreeState.itemRenderer;
	let dragRef=useRef();

	let style={
		backgroundColor: "transparent"
	}

	let id=nodeId(node);

	let highlight;
	if (docTreeState.selection.isDrag()) {
		if (id==docTreeState.selection.dropParentId &&
				(!node.children.length || docTreeState.selection.dropInsertIndex===undefined)) {
			highlight="dropInside";
		}

		else if (docTreeState.selection.isDrag()) {
			let parentId;
			let parent=xmlParent(docTreeState.value,nodePred(id));
			let parentFragment=xmlFragment(docTreeState.value,nodePred(id));
			if (parent)
				parentId=nodeId(parent);

			if (parentId==docTreeState.selection.dropParentId) {
				if (index==docTreeState.selection.dropInsertIndex) {
					highlight="dropAbove";
				}

				else if (docTreeState.selection.dropInsertIndex>=parentFragment.length &&
						index==docTreeState.selection.dropInsertIndex-1 &&
						docTreeState.selection.dropParentId) {
					highlight="dropBelow";
				}
			}
		}
	}

	else if (id==docTreeState.selection.selectedId)
		highlight="selected";

	else if (id==docTreeState.selection.hoverId)
		highlight="hover";

	let expandable=false;
	let comp=docTreeState.componentLibrary[node.tagName];
	if (comp && comp.containerType=="children")
		expandable=true;

	let expanded=docTreeState.expanded.includes(id);

	return (<>
		<div draggable={true} 
				style={style} 
				onDragStart={ev=>handlers.handleDragStart(ev, id)}
				onDragEnd={handlers.handleDragEnd}
				>
			<div ref={el=>docTreeState.setNodeEl(id,el)}>
				<ItemRenderer
						value={node}
						level={level}
						highlight={highlight}
						expandable={expandable}
						expanded={expanded}
						onToggleExpand={()=>handlers.handleToggleExpand(id)}
						onSelect={()=>handlers.handleSelect(id)}
						focus={docTreeState.focus}/>
			</div>
			{expanded &&
				<DocTreeFragment 
						handlers={handlers}
						fragment={node.children} 
						docTreeState={docTreeState}
						level={level+1}/>
			}
		</div>
	</>)
}

function DocTreeFragment({fragment, docTreeState, level, handlers}) {
	return (<>
		{fragment.map((n, index)=>
			<DocTreeNode 
					handlers={handlers}
					node={n}
					docTreeState={docTreeState}
					level={level}
					index={index}/>
		)}
	</>)
}

export default function DocTree({value, onChange, selection, onSelectionChange, 
		itemRenderer, class: className, componentLibrary}) {
	let docTreeState=useConstructor(()=>new DocTreeState({itemRenderer}));
	docTreeState.preRender({value,componentLibrary,selection});

	let forceUpdate=useForceUpdate();
	let handlers=new DocTreeHandlers({docTreeState,forceUpdate,onChange,onSelectionChange});

	//console.log("drag: "+docTreeState.isDrag()+" dropInsertIndex: "+docTreeState.dropInsertIndex);
	//				onClick={()=>console.log("click...")}

	// Special case when dropping last outside tree.
	let extra;
	if (docTreeState.selection.isDrag() &&
			!docTreeState.selection.dropParentId &&
			docTreeState.selection.dropInsertIndex>=docTreeState.value.length) {
		let ItemRenderer=docTreeState.itemRenderer;
		extra=<ItemRenderer level={0} highlight="dropAbove"/>
	}

	//console.log("focus: "+docTreeState.focus);

	return (
		<div class={className}
				style="outline: none"
				tabIndex={0}
				onFocus={handlers.handleFocus}
				onBlur={handlers.handleBlur}
				onDragEnter={handlers.handleDragEnter}
				onDragLeave={handlers.handleDragLeave}
				onMouseMove={handlers.handleMouseMove}
				onDragOver={handlers.handleMouseMove}
				onDrop={handlers.handleDrop}
				onMouseDown={handlers.handleMouseDown}
				onKeyDown={handlers.handleKeyDown}
				onMouseOut={handlers.handleMouseOut}>
			<DocTreeFragment 
					handlers={handlers}
					fragment={value} 
					docTreeState={docTreeState} 
					level={0}/>
			{extra}
		</div>
	);
}