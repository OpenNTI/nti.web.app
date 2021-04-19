const Ext = require('@nti/extjs');
const DndActions = require('internal/legacy/app/dnd/Actions');

require('./OrderedContents');

module.exports = exports = Ext.define('NextThought.mixins.MovingRoot', {
	isMovingRoot: true,

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents',
	},

	getMoveLink: function () {
		return this.getLink('move');
	},

	getIdForMove: function (record) {
		return record.getId ? record.getId() : record;
	},

	/**
	 * Append a record from one parent to another
	 *
	 * @param  {Object|string} record		  the record to move
	 * @param  {Object|string} originalParent the current parent of the record
	 * @param  {Object|string} newParent	  the desired parent of the record
	 * @returns {Promise} fulills with the record that was appended,
	 */
	doAppendRecordFrom: function (record, originalParent, newParent) {
		var index = newParent.getItemsCount
			? newParent.getItemsCount()
			: Infinity;

		return this.doMoveRecordFrom(
			record,
			index,
			-1,
			newParent,
			originalParent
		);
	},

	/**
	 * Move a record from one parent to another at an index
	 *
	 * @param  {Object|string} record  the record to move
	 * @param  {number} index		   the index to move to
	 * @param  {number} oldIndex	   the old index
	 * @param  {Object|string} newParent	  the desired parent
	 * @param  {Object|string} originalParent the current parent
	 * @returns {Promise} fulfills with the record that was moved
	 */
	doMoveRecordFrom: function (
		record,
		index,
		oldIndex,
		newParent,
		originalParent
	) {
		var link = this.getMoveLink(),
			data,
			move;

		data = {
			ObjectNTIID: this.getIdForMove(record),
			ParentNTIID: this.getIdForMove(newParent),
			OldParentNTIID: this.getIdForMove(originalParent),
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
		} else if (
			data.ParentNTIID === data.OldParentNTIID &&
			index === oldIndex
		) {
			move = Promise.resolve(record);
		} else {
			move = Service.post(link, data).then(
				this.__onMoveOperation.bind(
					this,
					record,
					newParent,
					originalParent
				)
			);
		}

		return move;
	},

	/**
	 * Currently move operations are responding with the object we get the move link from.
	 * So just sync with the response to get the new items.
	 *
	 * @param {Object} record the record to move
	 * @param {Object} newParent the record to move it to
	 * @param {Object} originalParent the record its moving from
	 * @param  {string} response the response from the server
	 * @returns {Object} the record that was moved
	 */
	__onMoveOperation: function (record, newParent, originalParent, response) {
		var updatedNewParent,
			updatedOriginalParent,
			updatedRecord,
			dndActions = DndActions.create();

		if (!originalParent.isModel) {
			originalParent = this.findOrderedContentsItem(originalParent);
		}

		this.syncWithResponse(response);

		this.fireEvent(
			'record-moved',
			record.isModel ? record.getId() : record
		);

		updatedNewParent =
			newParent && this.findOrderedContentsItem(newParent.getId());
		updatedOriginalParent =
			originalParent &&
			this.findOrderedContentsItem(originalParent.getId());

		if (dndActions) {
			dndActions.removeAllPlaceholders();
		}

		if (updatedOriginalParent) {
			originalParent.syncWith(updatedOriginalParent);
		}

		if (updatedNewParent && updatedOriginalParent !== updatedNewParent) {
			newParent.syncWith(updatedNewParent);
		}

		updatedRecord = newParent.getItemById(record.getId());

		return updatedRecord;
	},
});
