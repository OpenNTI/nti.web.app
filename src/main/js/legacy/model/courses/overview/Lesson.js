const Ext = require('extjs');
const {wait} = require('nti-commons');

require('legacy/mixins/MovingRoot');
require('../../Base');


module.exports = exports = Ext.define('NextThought.model.courses.overview.Lesson', {
	extend: 'NextThought.model.Base',

	mixins: {
		MovingRoot: 'NextThought.mixins.MovingRoot'
	},

	statics: {
		mimeType: 'application/vnd.nextthought.ntilessonoverview'
	},

	mimeType: 'application/vnd.nextthought.ntilessonoverview',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'Items', type: 'arrayItem'},
		{name: 'publishBeginning', type: 'auto'},
		{name: 'publishEnding', type: 'auto'},
		{name: 'PublicationState', type: 'string'}
	],


	constructor: function () {
		this.callParent(arguments);

		wait()
			.then(this.fillInItems.bind(this));
	},


	getTitle: function () {
		return this.outlineNode ? this.outlineNode.getTitle() : this.get('title');
	},


	isPublished: function () {
		var state = this.get('PublicationState') || '';
		return state.toLowerCase() === 'DefaultPublished'.toLowerCase();
	},


	hasPublishDatePassed: function () {
		var publishBeginning = this.get('publishBeginning'),
			now = new Date();
		if (publishBeginning) {
			return new Date(publishBeginning) < now;
		}

		return false;
	}
});
