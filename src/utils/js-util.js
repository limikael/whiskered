export function arrayUnique(a) {
	function onlyUnique(value, index, array) {
		return array.indexOf(value) === index;
	}

	return a.filter(onlyUnique);
}

export function arrayMove(array, initialIndex, finalIndex, num=1) {
	if (finalIndex>initialIndex)
		finalIndex--;

	array.splice(finalIndex,0,...array.splice(initialIndex,num));

	return array;
}

export function arrayRemove(array, item) {
	let index=array.indexOf(item);
	if (index>=0)
		array.splice(index,1);

	return array;
}

export function classStringToArray(classString) {
	if (!classString)
		classString="";

	return arrayUnique(classString.split(/ +/).filter(s=>s));
}

export function classStringAdd(classString, add) {
	let current=classStringToArray(classString);
	current.push(...classStringToArray(add));
	current=arrayUnique(current);

	return current.join(" ");
}

export function classStringRemove(classString, remove) {
	let current=classStringToArray(classString);
	return arrayRemove(current,remove).join(" ");
}

export function isStringy(s) {
	return ((typeof s=="string") || (s instanceof String));
}