const Ext = require('@nti/extjs');

require('./TimeContentPointer');

const TranscriptContentPointer =
module.exports = exports = Ext.define('NextThought.model.anchorables.TranscriptContentPointer', {
	extend: 'NextThought.model.anchorables.TimeContentPointer',


	config: {
		pointer: {},
		cueid: ''
	},


	statics: {
		createFromObject: function (o) {
			//This should be rewritten to create an array at the top of the file instead
			//Tof using the "Magic" ExtJS class namespace object...
			//eslint-disable-next-line no-undef
			var cp = NextThought.model.anchorables[o.pointer.Class];

			return TranscriptContentPointer.create({
				pointer: cp.createFromObject(o.pointer),
				cueid: o.cueid,
				role: o.role,
				seconds: parseInt(o.seconds, 10)
			});
		}
	},


	constructor: function (o) {
		this.callParent(arguments);
		this.Class = 'TranscriptContentPointer';
	}
});
