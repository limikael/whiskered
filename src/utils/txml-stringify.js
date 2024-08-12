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

function txmlStringifyNode(doc, indent=0) {
	let rep=(s,n)=>Array(n).fill(s).join("");

	if (typeof doc=="string") {
		if (!doc.trim())
			return "";

		return rep("\t",indent)+escapeXml(doc)+"\n";
	}

	let attr="";
	for (let k in doc.attributes) {
		attr+=" "+k+'="'+escapeXmlAttr(doc.attributes[k])+'"';
	}

	let s="";
	if (doc.children.length)
		s+=rep("\t",indent)+"<"+doc.tagName+attr+">\n"+
			txmlStringifyFragment(doc.children,indent+1)+
			rep("\t",indent)+"</"+doc.tagName+">\n";

	else	
		s=rep("\t",indent)+"<"+doc.tagName+attr+"/>\n";

	return s;
}

function txmlStringifyFragment(fragment, indent=0) {
	let s="";
	for (let node of fragment) {
		s+=txmlStringifyNode(node,indent);
	}

	return s;
}

export function txmlStringify(fragment) {
	return txmlStringifyFragment(fragment);
}