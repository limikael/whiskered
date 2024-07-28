export function xmlIdfyNode(node) {
	if (!node.id)
		node.id=crypto.randomUUID();

	for (let i=0; i<node.children.length; i++)
		node.children[i]=xmlIdfyNode(node.children[i]);

	return node;
}
