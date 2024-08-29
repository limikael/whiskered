export function elPointDist(el, p) {
	let r=el.getBoundingClientRect();

	if (p.x>=r.left && p.x<=r.right &&
			p.y>=r.top && p.y<=r.bottom)
		return 0;

	if (p.x<r.left && p.y<r.top)
		return pDist(p,{x:r.left,y:r.top});

	if (p.x>r.right && p.y<r.top)
		return pDist(p,{x:r.right,y:r.top});

	if (p.x<r.left && p.y>r.bottom)
		return pDist(p,{x:r.left,y:r.bottom});

	if (p.x>r.right && p.y>r.bottom)
		return pDist(p,{x:r.right,y:r.bottom});

	if (p.y<r.top)
		return pLineDist(p,{x:r.left,y:r.top},{x:0,y:-1});

	if (p.y>r.bottom)
		return pLineDist(p,{x:r.left,y:r.bottom},{x:0,y:1});

	if (p.x<r.left)
		return pLineDist(p,{x:r.left,y:r.top},{x:-1,y:0});

	if (p.x>r.right)
		return pLineDist(p,{x:r.right,y:r.top},{x:1,y:0});

	throw new Error("the rect is strange!!!");
}

export function elLocalCoords(el, c) {
	let rect=el.getBoundingClientRect();

	return {
		x: c.x-rect.x,
		y: c.y-rect.y
	}
}

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

	//console.log(vEdgeSize);

	return (
		p.x<rect.left+hEdgeSize ||
		p.x>rect.right-hEdgeSize ||
		p.y<rect.top+vEdgeSize ||
		p.y>rect.bottom-vEdgeSize
	);
}

export function elOnLowerHalf(el, p) {
	let mid=elMidpoint(el);
	let v=pSub(p,mid);
	let dot=pDot({x:0, y:1},v);
	return (dot>0);
}

export function pDist(a, b) {
	let x=a.x-b.x;
	let y=a.y-b.y;
	return Math.sqrt(x*x+y*y);
}

export function pLineDist(p, lp, ln) {
	return pDot(ln,pSub(p,lp))
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