export default class WhiskerEdSelection {
	constructor({selectedId, hoverId, dragId, dropParentId, dropInsertIndex, dragCount}={}) {
		this.selectedId=selectedId;
		this.dragId=dragId;
		this.hoverId=hoverId;
		this.dropParentId=dropParentId;
		this.dropInsertIndex=dropInsertIndex;
		this.dragCount=dragCount;
		if (!this.dragCount)
			this.dragCount=0;
	}

	clone() {
		return new WhiskerEdSelection({
			selectedId: this.selectedId,
			dragId: this.dragId,
			hoverId: this.hoverId,
			dropParentId: this.dropParentId,
			dropInsertIndex: this.dropInsertIndex,
			dragCount: this.dragCount,
		});
	}

	equals(that) {
		return (
			this.selectedId===that.selectedId &&
			this.dragId===that.dragId &&
			this.hoverId===that.hoverId &&
			this.dropParentId===that.dropParentId &&
			this.dropInsertIndex===that.dropInsertIndex &&
			this.dragCount===that.dragCount
		)
	}

	changeDragCount(v) {
		this.dragCount+=v;
		if (this.dragCount<0)
			this.dragCount=0;
	}

	isDrag() {
		return (this.dragCount>0);
	}

	isValidDrag() {
		return (this.isDrag() && this.dropParentId!="illegal")
	}

	clearDrag() {
		this.dragCount=0;
		this.dragId=undefined;
	}
}