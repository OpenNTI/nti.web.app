var Ext = require('extjs');
var MixinsOrderedContents = require('./OrderedContents');
var DndActions = require('../app/dnd/Actions');


module.exports = exports = Ext.define('NextThought.mixins.MovingRoot', {
	isMovingRoot: true,

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents'
	},

	getMoveLink: function () {
		return this.getLink('move');
	},

	getIdForMove: function (record) {
		return record.getId ? record.getId() : record;
	},

	/**
	 * Append a record from one parent to another
	 * @param  {Object|String} record		  the record to move
	 * @param  {Object|String} originalParent the current parent of the record
	 * @param  {Object|String} newParent	  the desired parent of the record
	 * @return {Promise}
	 */
	doAppendRecordFrom: function (record, originalParent, newParent) {
		var index = newParent.getItemsCount ? newParent.getItemsCount() : Infinity;

		return this.doMoveRecordFrom(record, index, -1, newParent, originalParent);
	},

	/**
	 * Move a record from one parent to another at an index
	 *
	 * @param  {Object|String} record  the record to move
	 * @param  {Number} index		   the index to move to
	 * @param  {Number} oldIndex	   the old index
	 * @param  {Object|String} newParent	  the desired parent
	 * @param  {Object|String} originalParent the current parent
	 * @return {Promise}
	 */
	doMoveRecordFrom: function (record, index, oldIndex, newParent, originalParent) {
		var link = this.getMoveLink(),
			data, move;

		data = {
			ObjectNTIID: this.getIdForMove(record),
			ParentNTIID: this.getIdForMove(newParent),
			OldParentNTIID: this.getIdForMove(originalParent)
		};

		index = index || 0;

		if (index < Infinity) {
			data.Index = index;
		}

		if (!link) {
			move = Promise.reject('No move link');
		} else if (!newParent) {
			move = Promise.reject('No new parent to move to');
		} else if (!originalParent) {
			move = Promise.reject('No old parent to move from');
		} else if (data.ParentNTIID === data.OldParentNTIID && index === oldIndex) {
			move = Promise.resolve();
		} else {
			move = Service.post(link, data)
				.then(this.__onMoveOperation.bind(this, record, newParent, originalParent));
		}

		return move;
	},

	/**
	 * Currently move operations are responding with the object we get the move link from.
	 * So just sync with the response to get the new items.
	 *
	 * @param  {String} response the response from the server
	 */
	__onMoveOperation: function (record, newParent, originalParent, response) {
		var updatedNewParent, updatedOriginalParent, updatedRecord,
			dndActions = NextThought.app.dnd.Actions.create();

		if (!originalParent.isModel) {
			originalParent = this.findOrderedContentsItem(originalParent);
		}

		this.syncWithResponse(response);

		this.fireEvent('record-moved', record.isModel ? record.getId() : record);

		updatedNewParent = newParent && this.findOrderedContentsItem(newParent.getId());
		updatedOriginalParent = originalParent && this.findOrderedContentsItem(originalParent.getId());

		if (dndActions) {
			dndActions.removeAllPlaceholders();
		}

		if (updatedOriginalParent) {
			originalParent.syncWith(updatedOriginalParent);
		}

		if (updatedNewParent && updatedOriginalParent !== updatedNewParent) {
			newParent.syncWith(updatedNewParent);
		}
	}
});
