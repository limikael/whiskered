export function elMidpoint(el) {
	let rect=el.getBoundingClientRect();
	return {
		x: (rect.right+rect.left)/2,
		y: (rect.bottom+rect.top)/2
	};
}

export function elIsOnEdge(el, p, edgeSize) {
	let rect=el.getBoundingClientRect();
	let hEdgeSize=Math.min(edgeSize,rect.width/4);
	let vEdgeSize=Math.min(edgeSize,rect.height/4);

	//console.log(hEdgeSize);

	return (
		p.x<rect.left+hEdgeSize ||
		p.x>rect.right-hEdgeSize ||
		p.y<rect.top+vEdgeSize ||
		p.y>rect.bottom-vEdgeSize
	);
}

export function pDist(a, b) {
	let x=a.x-b.x;
	let y=a.y-b.y;
	return Math.sqrt(x*x+y*y);
}

export function pSub(a, b) {
	return {
		x: a.x-b.x,
		y: a.y-b.y
	}
}

export function pDot(a, b) {
	return (a.x*b.x+a.y*b.y);
}