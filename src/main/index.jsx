import {useConstructor} from "../utils/react-util.jsx";
import {useState} from "react";
import {xmlFragmentIdfy} from "../utils/xml-util.js";
import WhiskerEd from "../whiskered/WhiskerEd.jsx";
import {useWhiskerEdState} from "../whiskered/WhiskerEdState.js"

let LIBRARY={
	Hello({color, children}) {
		return (<div class="border p-5 m-5" style={`background-color: ${color};`}>
			The hello component...
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Test({color}) {
		return (<div class="border p-5 m-5" style={`background-color: ${color}`}>
			The test component
		</div>)
	}
}

function ComponentLibrary({componentLibrary}) {
	function ComponentLibraryItem({name, item}) {
		return (
			<div class="border m-5 p-5 bg-grey" draggable={true}>
				{name}
			</div>
		);
	}

	return (<>
		<div class="font-bold text-xl mb-2">Library</div>
		<input type="text" class="border p-2 mb-2" value="dummy input"/>
		{Object.keys(componentLibrary).map(name=>
			<ComponentLibraryItem name={name} item={componentLibrary[name]}/>
		)}
	</>);
}

export default function() {
	let whiskerEdState=useWhiskerEdState({
		componentLibrary: LIBRARY,
		xml: `
			<Hello color="#e0d0c0">
				<Test color="#ffc0c0"/>
				<Test color="#c0c0ff"/>
				<Test color="#c0ffc0"/>
			</Hello>`,
	});

	return (
		<div class="flex">
			<div class="w-60 shrink-0 p-5">
				<ComponentLibrary componentLibrary={LIBRARY}/>
			</div>
			<WhiskerEd 
					class="grow"
					whiskerEdState={whiskerEdState}/>
		</div>
	);
}

/*
			<WhiskerEd
					class="grow"
					componentLibrary={LIBRARY}
					value={xml}
					selection={selectedId}
					onChange={value=>setXml(value)}
					onSelectionChange={id=>setSelectedId(id)}/>
*/