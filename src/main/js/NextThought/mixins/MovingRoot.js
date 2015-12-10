Ext.define('NextThought.mixins.MovingRoot', {
	isMovingRoot: true,


	getMoveLink: function() {
		return this.getLink('move');
	},


	doMoveRecordFrom: function(record, originalParent, newParent) {
		var link = this.getMoveLink(),
			move;

		if (!link) {
			move = Promise.reject('No move link');
		} else if (!newParent) {
			move = Promise.reject('No new parent to move to');
		} else if (!originalParent) {
			move = Promise.reject('No old parent to move from');
		} else {
			move = Service.post(link, {
				ObjectNTIID: record.getId(),
				ParentNTIID: newParent.getId(),
				OldParentNTIID: originalParent.getId()
			}).then(this.onMoveOperation.bind(this));
		}

		return move;
	},


	onMoveOperation: function(response) {
		this.syncWithResponse(response);
	}
});
