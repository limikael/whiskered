function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function escapeXmlAttr(unsafe) {
    return unsafe.replace(/[<>&'"\n\r\t]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            case "\n": return "&#xA;";
            case "\r": return "&#xD;";
            case "\t": return "&#x9;";
        }
    });
}

function initOptions(options) {
	if (!options.indent)
		options.indent=0;

	if (options.pretty===undefined)
		options.pretty=true;
}

function txmlStringifyNode(doc, options) {
	initOptions(options);

	let rep=(s,n)=>Array(n).fill(s).join("");

	if (typeof doc=="string") {
		if (!options.pretty)
			return doc;

		if (!doc.trim())
			return "";

		return rep("\t",options.indent)+escapeXml(doc)+"\n";
	}

	let attr="";
	for (let k in doc.attributes) {
		attr+=" "+k+'="'+escapeXmlAttr(doc.attributes[k])+'"';
	}

	let s;
	if (doc.children.length) {
		s=(options.pretty?rep("\t",options.indent):"")+
			"<"+doc.tagName+attr+">"+
			txmlStringifyFragment(doc.children,{...options, indent: options.indent+1})+
			(options.pretty?rep("\t",options.indent):"")+
			"</"+doc.tagName+">"+
			(options.pretty?"\n":"");
	}

	else {
		s="<"+doc.tagName+attr+"/>";
		if (options.pretty)
			s=rep("\t",options.indent)+s+"\n";
	}

	return s;
}

function txmlStringifyFragment(fragment, options) {
	initOptions(options);

	let s="";
	for (let node of fragment) {
		s+=txmlStringifyNode(node,options);
	}

	return s;
}

export function txmlStringify(element, options={}) {
	if (Array.isArray(element))
		return txmlStringifyFragment(element, options);

	else
		return txmlStringifyNode(element, options);
}