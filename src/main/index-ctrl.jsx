import {useState} from "react";

export default function() {
	let a="hello";
	let [val,setVal]=useState(1);

	return (<>
		<input defaultValue={a}/>
		Val: {val} <button onClick={()=>setVal(val+1)}>click</button>
	</>);
}