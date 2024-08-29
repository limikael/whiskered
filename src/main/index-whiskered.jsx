import {useConstructor} from "../utils/react-util.jsx";
import {useState} from "react";
import WhiskerEd from "../whiskered/WhiskerEd.jsx";
import {useWhiskerEdState} from "../whiskered/WhiskerEdState.js"
import {txmlParse} from "../utils/txml-stringify.js";
import DocTree from "../doctree/DocTree.jsx";
import {Head} from "isoq";
import {classStringRemove, classStringAdd} from "../utils/js-util.js";

let LIBRARY={
	div: {containerType: "children"},
	span: {containerType: "richtext"},
	Hello({color, children}) {
		return (<div class="we-border we-p-5 we-m-5" style={`background-color: ${color};`}>
			The hello component...
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Test({color, children}) {
		return (<div class="we-border we-p-5" style={`background-color: ${color}`}>
			The test component
			<div style="padding: 5px">
				{children}
			</div>
		</div>)
	},

	Inline() {
		return (<div class="we-border we-p-5 we-inline-block" style={`background-color: #88f`}>
			Inline
		</div>)
	},

	Flex({children}) {
		return (<div class="we-border" style={`background-color: #ffc0c0;`}>
			<div style="padding: 5px; display: flex">
				{children}
			</div>
		</div>)
	},

	Text({children}) {
		return (
			<div class="we-border we-p-5">
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
		<div class="we-border we-m-5 we-p-5 we-bg-grey"
				draggable={true}
				onDragStart={handleDragStart}>
			{name}
		</div>
	);
}

function ComponentLibrary({componentLibrary}) {
	return (<>
		<div class="we-overflow-y-auto we-h-full we-p-5">
			<div class="we-font-bold we-text-xl we-mb-2">Library</div>
			<input type="text" class="we-border we-p-2 we-mb-2 we-w-full" value="dummy input"/>
			{Object.keys(componentLibrary).map(name=>
				<ComponentLibraryItem name={name} item={componentLibrary[name]}/>
			)}
		</div>
	</>);
}

function DocTreeItem({value, level, expandable, expanded, highlight, focus, onToggleExpand, onSelect}) {
	let label;
	if (typeof value=="string")
		label="#text";

	else if (value)
		label=value.tagName;

	let outerClass="we-border-b we-py-[2px] hover:we-bg-lightgrey";
	let outerStyle={
		paddingLeft: (16+(level*16))+"px",
	};

	let innerClass="p-2 ";
	let innerStyle={};
	switch (highlight) {
		case "dropInside":
			innerClass+=" we-outline we-outline-2 -we-outline-offset-2";
			break;

		case "dropAbove":
			innerStyle.boxShadow="0px -4px 0 0px #000";
			break;

		case "dropBelow":
			innerStyle.boxShadow="0px 4px 0 0px #000";
			break;

		case "selected":
			outerClass=classStringRemove(outerClass,"hover:we-bg-lightgrey");
			if (focus)
				outerClass+=" we-bg-grey";

			else
				outerClass+=" we-bg-grey/50";
			break;

		case "hover":
			outerClass=classStringAdd(outerClass,"we-outline we-outline-1 we-outline-dashed -we-outline-offset-4 hover:we-outline-none");
			break;
	}

	if (value===undefined) 
		return (
			<div style={outerStyle}>
				<div style={innerStyle} class="we-h-1"/>
			</div>
		);

	return (
		<div class={outerClass} style={outerStyle}
				onMouseDown={onSelect}>
			<div style={innerStyle} class={innerClass}>
				{expandable && expanded &&
					<span class="we-inline-block we-w-[24px] material-symbols-outlined"
							style="vertical-align: middle"
							onClick={ev=>{ev.stopPropagation(); onToggleExpand()}}
							onMouseDown={ev=>ev.stopPropagation()}>
						arrow_drop_down
					</span>
				}
				{expandable && !expanded &&
					<span class="we-inline-block we-w-[24px] material-symbols-outlined"
							style="vertical-align: middle"
							onClick={ev=>{ev.stopPropagation(); onToggleExpand()}}
							onMouseDown={ev=>ev.stopPropagation()}>
						arrow_right
					</span>
				}
				{!expandable &&
					<span class="we-inline-block we-w-[24px]"/>
				}
				{label}
			</div>
		</div>
	)
}

export default function() {
	//let [value,setValue]=useState([]);
	let [value,setValue]=useState(()=>txmlParse(`
		<div>
			<span>this is a span in a div</span>
		</div>
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

	let [selection,setSelection]=useState();

	return (<>
        <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </Head>
		<div class="we-flex we-absolute we-top-0 we-left-0 we-h-full we-w-full">
			<div class="we-w-60 we-shrink-0 we-h-full">
				<ComponentLibrary componentLibrary={LIBRARY}/>
			</div>
			<div class="we-grow we-relative">
				<WhiskerEd 
						value={value}
						onChange={v=>setValue(v)}
						selection={selection}
						onSelectionChange={s=>setSelection(s)}
						componentLibrary={LIBRARY}
						class="we-absolute we-top-0 we-bottom-0 we-left-0 we-right-0 we-overflow-auto"/>
			</div>
			<div class="we-w-60 we-shrink-0 we-p-5">
				<DocTree 
					value={value}
					onChange={v=>setValue(v)}
					selection={selection}
					onSelectionChange={s=>setSelection(s)}
					class="we-border-t we-h-full"
					itemRenderer={DocTreeItem}
					componentLibrary={LIBRARY}/>
			</div>
		</div>
	</>);
}
