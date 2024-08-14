import ContentEditable from "../utils/ContentEditable.jsx";
import {useState} from "react";

export default function() {
	let [html,setHtml]=useState("hello<b>world</b>");

	return (
		<div class="p-10">
			<div class="mb-5">Editable:</div>
			<ContentEditable class="p-5 border" 
					value={html}
					onChange={v=>setHtml(v)}/>
		</div>
	);
}