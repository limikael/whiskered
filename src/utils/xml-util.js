import {parse as parseXml} from "txml/txml";

export function xmlFragmentParse(text) {
	return xmlFragmentIdfy(parseXml(text));
}

export function xmlNodeParse(text) {
	return xmlNodeIdfy(parseXml(text)[0]);
}

export function xmlNodeIdfy(node) {
	if (!node.id)
		node.id=crypto.randomUUID();

	xmlFragmentIdfy(node.children);

	return node;
}

export function xmlFragmentIdfy(fragment) {
	for (let i=0; i<fragment.length; i++)
		fragment[i]=xmlNodeIdfy(fragment[i]);

	return fragment;
}

export function xmlNodeCreate(tagName, attributes, children) {
	return xmlNodeIdfy({
		tagName: tagName,
		attributes: attributes?attributes:{},
		children: children?children:[]
	});
}

export function xmlNodeRemoveNode(node, id) {
	if (node.id==id)
		throw new Error("Can't remove self!");

	node.children=xmlFragmentRemoveNode(node.children,id);
	return node;
}

export function xmlFragmentRemoveNode(fragment, id) {
	return fragment
		.filter(node=>node.id!=id)
		.map(node=>xmlNodeRemoveNode(node,id));
}

/*export function xmlAppendChild(node, parentId, childNode) {
	if (node.id==parentId) {
		node.children.push(childNode)
		return node;
	}

	for (let c of node.children)
		xmlAppendChild(c,parentId,childNode);

	return node;
}*/

export function xmlFindNode(node, id) {
	if (id==node.id)
		return node;

	for (let c of node.children) {
		let cand=xmlFindNode(c,id);
		if (cand)
			return cand;
	}
}