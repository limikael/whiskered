export default class WhiskerEdSelection {
	constructor({selectedId}={}) {
		this.selectedId=selectedId;
	}

	clone() {
		return new WhiskerEdSelection({
			selectedId: this.selectedId
		});
	}
}