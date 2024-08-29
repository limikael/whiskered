import {useRef} from "react";
import {elPointDist} from "../utils/ui-util.js";

export default function() {
	let elRef=useRef();

	function handleClick(ev) {
		let el=elRef.current;
		let p={x: ev.clientX, y: ev.clientY};

		console.log(elPointDist(el,p));
	}

	return (
		<div class="we-p-40 we-cursor-pointer"
				onClick={handleClick}>
			<div class="we-p-20 we-bg-black we-text-white" ref={elRef}>
				Hello
			</div>
		</div>
	);
}