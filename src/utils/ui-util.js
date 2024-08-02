export function elMidpoint(el) {
	let rect=el.getBoundingClientRect();
	return {
		x: (rect.right+rect.left)/2,
		y: (rect.bottom+rect.top)/2
	};
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