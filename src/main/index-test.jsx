export default function() {
	console.log(<>
		<div x="
   5&lt;
bla

 hello">
			<div>
			<b>
			&nbsp; world</b></div>
		</div>
	</>);
	return (<>
		<div x="5">
			<div>hello <b>world</b></div>
		</div>
		<div>
			<div>
				hello 
				<b>
					world
				</b>
			</div>
		</div>
	</>)
}