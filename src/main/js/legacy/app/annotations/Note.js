var Ext = require('extjs');
var AnnotationsHighlight = require('./Highlight');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.annotations.Note', {
	extend: 'NextThought.app.annotations.Highlight',
	alias: 'widget.note',

	isNote: true,


	constructor: function(config) {
		this.callParent(arguments);
		this.hasSpecificRange = this.getRecordField('style') !== 'suppressed';

		var r = this.getRecord();
		this.privateNote = isFeature('notepad')
							&& r.get('sharedWith').length === 0
							&& Ext.isEmpty(r.get('title'));
	},


	onDestroy: function() {
		var children = this.getRecord().children || [];

		if (children.length > 0) {
			this.ownerCmp.fireEvent('bubble-replys-up', children);
		}

		return this.callParent(arguments);
	},


	attachRecord: function(record) {
		this.mon(record, 'convertedToPlaceholder', 'requestRender');
		var r = this.getRecord();
		if (r) {
			this.mun(r, 'convertedToPlaceholder', 'requestRender');
		}
		this.callParent(arguments);
	},


	render: function() {
		var y;
		if (this.hasSpecificRange) {
			y = this.callParent(arguments);
		} else {
			y = this.resolveVerticalLocation();
		}

		if (this.privateNote) {
			this.fireEvent('annouce-private-note', this, y);
			y = -1;
		}


		return y;
	}
});
