import {useRef, useState, useLayoutEffect, useCallback, cloneElement} from "react";

export function useConstructor(fn) {
	let value=useRef();
	let called=useRef();

	if (!called.current) {
		called.current=true;
		value.current=fn();
	}

	return value.current;
}

export function useEventListener(o, ev, fn) {
	useLayoutEffect(()=>{
		o.addEventListener(ev,fn);
		return ()=>{
			o.removeEventListener(ev,fn);
		}
	},[o,ev,fn]);
}

export function useEventUpdate(o, ev) {
	let [_,setDummyState]=useState();
	let forceUpdate=useCallback(()=>setDummyState({}));
	useEventListener(o,ev,forceUpdate);
}

export function InterjectRender({interjectComponent, interjectProps, ...props}) {
	let el=interjectComponent(props);
	interjectProps(el.props);
	el=cloneElement(el,el.props);

	return el;
}

export default function ContentEditable({class: className, value, onChange, element}) {
	function handleInput(ev) {
		onChange(ev.target.innerHTML);
	}

	let Element=element;
	if (!Element)
		element="div";

	return (
		<Element
				onInput={handleInput}
				class={className}
				contenteditable={true}
				dangerouslySetInnerHTML={{__html: value}}/>
	);
}