export function OutlineScrollHack({children}) {
	let outerStyle={
		postion: "absolute",
		width: "100%",
		height: "100%",
		margin: "-4px",
		overflowY: "scroll"
	}

	let innerStyle={
		margin: "4px",
		backgroundColor: "#c0c0c0"
	}

	return (
		<div style={outerStyle}>
			<div style={innerStyle}>
				{children}
			</div>
		</div>
	)
}

export default function() {
	return (<>
		<style>{`
		`}</style>
		<div class="we-absolute we-w-full we-h-full we-bg-black">
			<div class="we-absolute we-left-0 we-top-0 we-bottom-0 we-w-10 we-bg-blue"/>
			<div class="we-absolute we-left-10 we-top-32 we-bottom-32 we-right-10">
				<OutlineScrollHack>
					<div class="hover:we-outline hover:we-outline-red hover:we-outline-4 we-bg-white z-50 inner">
						hover
					</div>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultrices laoreet commodo. Nam volutpat suscipit auctor. Donec congue urna vitae ligula porta ultrices. Nulla quis consectetur elit, venenatis iaculis tortor. Duis vulputate scelerisque elit, dictum ullamcorper diam facilisis quis. Praesent commodo pellentesque condimentum. Phasellus aliquam arcu id orci dictum tincidunt. Proin ut ligula quis tellus viverra sagittis non nec dolor. Donec quis lobortis diam. Proin varius sem id lacus facilisis, in vestibulum dolor egestas. Aliquam iaculis pulvinar neque, ac posuere velit vestibulum ut. Integer ipsum felis, dictum commodo dictum ac, dapibus lobortis lorem. Duis tincidunt tortor sit amet nunc euismod imperdiet. Praesent nibh tortor, rutrum non pharetra in, pulvinar non massa. Fusce sit amet lacinia lorem.
					</p>
					<div class="hover:we-outline hover:we-outline-red hover:we-outline-4 we-bg-white z-50 inner">
						hover
					</div>
					<p>
						Nunc eleifend neque quis euismod laoreet. Phasellus risus diam, blandit et magna id, fermentum maximus arcu. Aliquam congue luctus massa. Quisque bibendum diam sed nibh accumsan porta. Morbi a nulla iaculis, viverra neque non, tempus dui. Quisque eget varius magna, ut maximus urna. Vestibulum in orci in turpis laoreet tincidunt. Nunc mattis ante eu eros imperdiet, id mollis magna ornare. Integer vel tempus sapien. Sed scelerisque tincidunt massa vestibulum interdum. Pellentesque venenatis metus ac molestie aliquam.
					</p>
					<p>
						Nunc eleifend neque quis euismod laoreet. Phasellus risus diam, blandit et magna id, fermentum maximus arcu. Aliquam congue luctus massa. Quisque bibendum diam sed nibh accumsan porta. Morbi a nulla iaculis, viverra neque non, tempus dui. Quisque eget varius magna, ut maximus urna. Vestibulum in orci in turpis laoreet tincidunt. Nunc mattis ante eu eros imperdiet, id mollis magna ornare. Integer vel tempus sapien. Sed scelerisque tincidunt massa vestibulum interdum. Pellentesque venenatis metus ac molestie aliquam.
					</p>
				</OutlineScrollHack>
			</div>
		</div>
	</>);
}