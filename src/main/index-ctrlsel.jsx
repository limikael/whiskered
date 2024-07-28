import {useState, useRef, useLayoutEffect, useCallback} from "react";
import {useEventListener} from "../utils/react-util.jsx";
import {useIsoContext} from "isoq";

function Textarea({onChange, onSelectionChange, selection, value, ...props}) {
    let [_,setDummyState]=useState();
    let forceUpdate=useCallback(()=>setDummyState({}));
    let elRef=useRef();
    let selectionRef=useRef();
    selectionRef.current=selection;

    useEventListener(document,"selectionchange",(ev)=>{
        console.log("selection change");
        console.log(elRef.current.selectionStart);
        forceUpdate();
    });

    useLayoutEffect(()=>{
        let el=elRef.current;
        let selection=selectionRef.current;

        if (el.selectionStart!=selection.start ||
                el.selectionEnd!=selection.end) {
            elRef.selectionStart=selection.start;
            elRef.selectionEnd=selection.end;
            console.log("setting sel: ",elRef.selectionStart,elRef.selectionEnd);
        }
    });

    return (
        <textarea
                {...props} 
                value={value}
                onChange={ev=>onChange(ev.target.value)}
                ref={elRef}/>
    );
}

export default function() {
    let [value,setValue]=useState("hello");
    let iso=useIsoContext();

    if (iso.isSsr())
        return;

    function handleSelectionChange(v) {
        //setValue(v);
    }

    function handleChange(v) {
        setValue(v);
    }

    return (<>
        <div>
            Testing text
            <button onClick={()=>setValue("hello")}>"hello"</button>
            <button onClick={()=>setValue("test")}>"test"</button>
            <button onClick={()=>{}}>sel 1</button>
            <button onClick={()=>{}}>sel 2</button>
        </div>
        <Textarea rows="10" 
                onSelectionChange={handleSelectionChange} 
                onChange={handleChange}
                selection={{start: 0, end: 2}}
                value={value}/>
    </>);
}
