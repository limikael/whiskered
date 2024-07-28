import {useConstructor} from "../utils/react-util.jsx";
import {parse as parseXml} from "txml/txml";
import {useState} from "react";
import {xmlIdfyNode} from "../whiskered/xml-util.js";
import XmlView from "../whiskered/XmlView.jsx";

let LIBRARY={
	Hello({color, children, containerRef}) {
		return (<div style={`border: 1px solid black; background-color: ${color}; margin: 10px`} ref={containerRef}>
			The hello component...
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Test({color, containerRef}) {
		return (<div style={`border: 1px solid black; background-color: ${color}`} ref={containerRef}>
			The test component
		</div>)
	}
}

export default function() {
	let xml=useConstructor(()=>xmlIdfyNode(parseXml(`
		<Hello color="#ff0000">
			<Test color="#80ff80"/>
			<Test color="#ffff80"/>
			<Test color="#ff80ff"/>
		</Hello>
	`)[0]));

	let [selectedId,setSelectedId]=useState();
	let [hoverId,setHoverId]=useState();

	let highlightLibrary={
		//"hover": {outlineStyle: "solid", outlineColor: "#8080ff", outlineWidth: "thin"},
		"hover": {boxShadow: "inset 0px 5px #ff8040"},
		"selected": {outlineStyle: "solid", outlineColor: "#ffff80", outlineWidth: "medium"}
	};

	let highlight={};
	if (hoverId)
		highlight[hoverId]=["hover"];

	if (selectedId)
		highlight[selectedId]=["selected"];

	return (
		<XmlView 
				componentLibrary={LIBRARY}
				highlightLibrary={highlightLibrary}
				highlight={highlight}
				node={xml}
				selectedId={selectedId}
				onNodeClick={id=>setSelectedId(id)}
				onHoverChange={id=>{setHoverId(id); console.log("hover: "+id)}}/>
	);
}