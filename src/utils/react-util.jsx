import {useRef, useState, useLayoutEffect, useCallback, cloneElement, useEffect, createElement} from "react";
import {isStringy} from "./js-util.js";

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

export function useForceUpdate() {
	let [_,setDummyState]=useState();
	let forceUpdate=useCallback(()=>setDummyState({}));

	return forceUpdate;
}

export function InterjectRender({interjectComponent, interjectProps, ...props}) {
	if (!interjectComponent)
		return;

	let el;
	if (isStringy(interjectComponent))
		el=createElement(interjectComponent.toString(),props,props.children);

	else if (typeof interjectComponent=="function") {
		//console.log("interjecting function...");
		el=interjectComponent(props);
	}

	else
		throw new Error("expected component to be string or function");

	interjectProps(el.props);
	el=cloneElement(el,el.props);

	// todo: need to call the old ref or something...
	if (el.props.ref)
		el.ref=el.props.ref;
	//console.log(el);

	return el;
}

export function ContentEditable({class: className, style, initialValue, onChange, onBlur, element}) {
	let initialValueRef=useRef(initialValue);
	let ref=useRef();

	function handleInput(ev) {
		//console.log("change ",ev.target.innerHTML);

		if (!onChange)
			return;

		onChange(ev.target.innerHTML);
	}

	useEffect(()=>{
		ref.current.focus();
		document.execCommand("selectAll");
		let selection=document.getSelection();
		selection.collapseToEnd();
	},[]);

	let Element=element;
	if (!Element)
		element="div";

	return (
		<Element
				onBlur={onBlur}
				onInput={handleInput}
				class={className}
				style={style}
				contenteditable={true}
				dangerouslySetInnerHTML={{__html: initialValueRef.current}}
				ref={ref}/>
	);
}