export function nodePred(id) {
	return (node=>node.attributes["whiskered:id"]==id);
}

export function nodeInit(node) {
	if (!node.attributes["whiskered:id"])
		node.attributes["whiskered:id"]=crypto.randomUUID();
}

export function nodeId(node) {
	if (!node)
		return;

	return node.attributes["whiskered:id"];
}

export function nodeClean(node) {
	delete node.attributes["whiskered:id"];
}