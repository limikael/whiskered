import {isStringy} from "../utils/js-util.js";

export function nodePred(id) {
	return (node=>{
		//console.log(node);

		if (isStringy(node)) {
			//console.log("testing: "+node+" against: "+id);
			return (node.toString()==id);
		}

		return (node.attributes["whiskered:id"]==id);
	});
}

export function nodeInit(node) {
	if (!isStringy(node) && !node.attributes["whiskered:id"])
		node.attributes["whiskered:id"]=crypto.randomUUID();
}

export function nodeId(node) {
	if (!node)
		return;

	if (isStringy(node))
		return node.toString();

	return node.attributes["whiskered:id"];
}

export function nodeClean(node) {
	if (!isStringy(node))
		delete node.attributes["whiskered:id"];
}