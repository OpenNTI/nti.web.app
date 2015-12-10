Ext.define('NextThought.mixins.MovingRoot', {
	isMovingRoot: true,


	getMoveLink: function() {
		return this.getLink('move');
	},

	/**
	 * Move a record from one parent to another
	 * @param  {Object} record         the record to move
	 * @param  {Object} originalParent the current parent of the record
	 * @param  {Object} newParent      the desired parent of the record
	 * @return {Promise}
	 */
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
			}).then(this.__onMoveOperation.bind(this));
		}

		return move;
	},

	/**
	 * Currently move operations are responding with the object we get the move link from.
	 * So just sync with the response to get the new items.
	 *
	 * TODO: Since for now the success of this action is closing a window, and triggering the
	 * backing view to reload its not a huge issue atm. But any existing instances of the parents
	 * the record was moved between would not have their Items updated... So we may need to
	 * get the records for the parents from the response, and sync the existing instances.
	 *
	 * @param  {String} response the response from the server
	 */
	__onMoveOperation: function(response) {
		this.syncWithResponse(response);
	}
});
