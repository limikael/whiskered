function Component() {
	return (
		<input value={sdf} onChange={bla()} selection={asdf} onSelectionChange={bla()}/>
	);
}

function Component(value, onChange) {
	return (
		<input value={value} onChange={onChange} selection={asdf} onSelectionChange={bla()}/>
	);
}

function Component(value, onChange) {
	let inputState=useInputState();

	inputState.setValue(value);

	return (
		<input inputState={inputState}/>
	);
}