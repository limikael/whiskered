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

export function xmlFindNode(node, id) {
	if (id==node.id)
		return node;

	for (let c of node.children) {
		let cand=xmlFindNode(c,id);
		if (cand)
			return cand;
	}
}

export function xmlFindParentNode(node, id) {
	if (id==node.id)
		throw new Error("Finding parent in itself");

	for (let c of node.children) {
		if (c.id==id)
			return node;
	}

	for (let c of node.children) {
		let cand=xmlFindParentNode(c,id);
		if (cand)
			return cand;
	}
}

export function xmlFindNodePath(node, id) {
	if (id==node.id)
		return [node];

	for (let c of node.children) {
		let path=xmlFindNodePath(c,id);
		if (path)
			return [node,...path];
	}
}

export function xmlFindParentNodeId(node, id) {
	let parentNode=xmlFindParentNode(node,id);
	if (!parentNode)
		return;

	return parentNode.id;
}

export function xmlNodeFindChildIndex(node, childId) {
	for (let i=0; i<node.children.length; i++) {
		if (node.children[i].id==childId)
			return i;
	}

	return -1;
}