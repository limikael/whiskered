import {useState} from "react";
import DocTree from "../doctree/DocTree.jsx";
import {parse as parseXml} from "txml/txml";
import {Head} from "isoq";

function ItemRenderer({value, level, expandable, expanded, highlight, onToggleExpand}) {
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

let COMPONENT_LIBRARY={};
COMPONENT_LIBRARY.Hello=()=>{};
COMPONENT_LIBRARY.Hello.containerType="children";
COMPONENT_LIBRARY.Text=()=>{};
COMPONENT_LIBRARY.Child=()=>{};

export default function() {
	let [value,setValue]=useState(()=>parseXml(`
		<Hello color="#e0d0c0">
			<Undef/>
			<Hello>
				<Child/>
				some text
				<Text/>
				<Child/>
				<Text/>
			</Hello>
			<Hello>
				<Child/>
				<Text/>
				<Child/>
				<Text/>
			</Hello>
		</Hello>
		<Text/>
		<Child/>
		<Hello>
			<Text/>
			<Child/>
		</Hello>
	`));

	return (<>
        <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </Head>
		<div class="absolute top-0 left-0 h-full w-full p-10">
			<div class="border-s px-2 w-80 h-full overflow-y-auto">
				<DocTree 
					class="border-t h-full"
					value={value}
					onChange={v=>setValue(v)}
					itemRenderer={ItemRenderer}
					componentLibrary={COMPONENT_LIBRARY}/>
			</div>
		</div>
	</>);
}
