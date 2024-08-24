import {useConstructor} from "../utils/react-util.jsx";
import {useState} from "react";
import WhiskerEd from "../whiskered/WhiskerEd.jsx";
import {useWhiskerEdState} from "../whiskered/WhiskerEdState.js"
import {parse as parseXml} from "txml/txml";
import DocTree from "../doctree/DocTree.jsx";
import {Head} from "isoq";

let LIBRARY={
	Hello({color, children}) {
		return (<div class="border p-5 m-5" style={`background-color: ${color};`}>
			The hello component...
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Test({color, children}) {
		return (<div class="border p-5" style={`background-color: ${color}`}>
			The test component
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Inline() {
		return (<div class="border p-5 inline-block" style={`background-color: #88f`}>
			Inline
		</div>)
	},

	Flex({children}) {
		return (<div class="border" style={`background-color: #ffc0c0;`}>
			<div style="padding: 5px; display: flex">
				{children}
			</div>
		</div>)
	},

	Text({children}) {
		return (
			<div class="border p-5">
				{children}
			</div>
		)
	}
}

LIBRARY.Hello.containerType="children";
LIBRARY.Flex.containerType="children";
LIBRARY.Flex.layoutDirection="right";
LIBRARY.Text.containerType="richtext";

function ComponentLibraryItem({name, item}) {
	function handleDragStart(ev) {
		ev.dataTransfer.setData("whiskered",`<${name}/>`);
	}

	return (
		<div class="border m-5 p-5 bg-grey"
				draggable={true}
				onDragStart={handleDragStart}>
			{name}
		</div>
	);
}

function ComponentLibrary({componentLibrary}) {
	return (<>
		<div class="font-bold text-xl mb-2">Library</div>
		<input type="text" class="border p-2 mb-2" value="dummy input"/>
		{Object.keys(componentLibrary).map(name=>
			<ComponentLibraryItem name={name} item={componentLibrary[name]}/>
		)}
	</>);
}

function DocTreeItem({value, level, expandable, expanded, highlight, onToggleExpand}) {
	let label;
	if (typeof value=="string")
		label="#text";

	else if (value)
		label=value.tagName;

	let outerStyle={
		paddingLeft: (16+(level*16))+"px",
	};

	let innerClass="p-2 ";
	let innerStyle={};
	switch (highlight) {
		case "dropInside":
			innerClass+=" outline outline-2 -outline-offset-2";
			break;

		case "dropAbove":
			innerStyle.boxShadow="0px -4px 0 0px #000";
			break;

		case "dropBelow":
			innerStyle.boxShadow="0px 4px 0 0px #000";
			break;
	}

	if (value===undefined) 
		return (
			<div style={outerStyle}>
				<div style={innerStyle} class="h-1"/>
			</div>
		);

	return (
		<div class="border-b py-[2px] hover:bg-grey" style={outerStyle}>
			<div style={innerStyle} class={innerClass}>
				{expandable && expanded &&
					<span class="inline-block w-[24px] material-symbols-outlined"
							style="vertical-align: middle"
							onClick={onToggleExpand}>
						arrow_drop_down
					</span>
				}
				{expandable && !expanded &&
					<span class="inline-block w-[24px] material-symbols-outlined"
							style="vertical-align: middle"
							onClick={onToggleExpand}>
						arrow_right
					</span>
				}
				{!expandable &&
					<span class="inline-block w-[24px]"/>
				}
				{label}
			</div>
		</div>
	)
}

export default function() {
	let [value,setValue]=useState(()=>parseXml(`
		<Hello color="#e0d0c0">
			<Test color="#ffc0c0"/>
			<Test color="#c0c0ff"/>
			<Hello color="#ffffc0">
				<Test color="#c0ffc0"/>
			</Hello>
		</Hello>
		<Hello color="#ff0000"/>
		<Test color="#ffc0c0"/>
	`));

	/*let [value,setValue]=useState(()=>parseXml(`
		<Hello color="#e0d0c0">
			This text shouldn't be here but it is kind of long...
			<Text>
				he<b>ll</b>o world
				<Bla/><Hello>test</Hello>
			</Text>
		</Hello>
		<Test>
			Shoudln't be here
			<Hello>
			</Hello>
		</Test>
		<Undef>
			Hello text
			<Text>
				hello world again
			</Text>
		</Undef>
		<Text>
			hello world again
		</Text>
	`));*/

	console.log("render...");

	return (<>
        <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </Head>
		<div class="flex absolute top-0 left-0 h-full w-full">
			<div class="w-60 shrink-0 p-5">
				<ComponentLibrary componentLibrary={LIBRARY}/>
			</div>
			<div class="grow relative">
				<WhiskerEd 
						value={value}
						onChange={v=>setValue(v)}
						componentLibrary={LIBRARY}
						class="absolute top-0 bottom-0 left-0 right-0 overflow-auto"/>
			</div>
			<div class="w-60 shrink-0 p-5">
				<DocTree 
					class="border-t h-full"
					value={value}
					onChange={v=>setValue(v)}
					itemRenderer={DocTreeItem}
					componentLibrary={LIBRARY}/>
			</div>
		</div>
	</>);
}
