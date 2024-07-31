import XmlView from "../whiskered/XmlView.jsx";
import {classStringAdd} from "../utils/js-util.js";
import {useState} from "react";
import {xmlFragmentRemoveNode} from "./xml-util.js";

export default function WhiskerEd({value, componentLibrary, selection, onSelectionChange, class: cls, onChange}) {
	let [hoverId,setHoverId]=useState();
	let [dragState,setDragState]=useState();
	let [focusState,setFocusState]=useState();

	let classes={};
	if (selection && !dragState)
		classes[selection]=classStringAdd(classes[selection],"ed-select");

	if (dragState)
		classes[hoverId]=classStringAdd(classes[hoverId],"ed-drag");

	if (focusState)
		cls=classStringAdd(cls,"ed-focus");

	function handleKeyDown(ev) {
		if (ev.code=="Delete" || ev.code=="Backspace") {
			console.log("deleting...");
			onChange(xmlFragmentRemoveNode(value,selection));
		}
	}

	return (<>
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
		<XmlView
				componentLibrary={componentLibrary}
				value={value}
				class={cls}
				classes={classes}
				onDragChange={drag=>setDragState(drag)}
				onNodeClick={id=>onSelectionChange(id)}
				onFocusChange={value=>setFocusState(value)}
				onHoverChange={id=>setHoverId(id)}
				onKeyDown={handleKeyDown}/>
	</>);
}