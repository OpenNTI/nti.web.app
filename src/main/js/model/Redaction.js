var Ext = require('extjs');
var ModelBase = require('./Base');
var MixinsModelWithBodyContent = require('../mixins/ModelWithBodyContent');
var AnchorablesDomContentRangeDescription = require('./anchorables/DomContentRangeDescription');
var ConvertersContentRangeDescription = require('./converters/ContentRangeDescription');
var ModelHighlight = require('./Highlight');


module.exports = exports = Ext.define('NextThought.model.Redaction', {
    extend: 'NextThought.model.Base',

    mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

    statics: {

		DEFAULT_TEXT: '<big>***</big>',

		createFromHighlight: function(hl, block) {
			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: [],
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange'),
				replacementContent: this.DEFAULT_TEXT,
        //				style: block? 'block':'inline',
				redactionExplanation: block ? 'Why was this redacted?' : null
			});
		}
	},

    fields: [
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'replacementContent', type: 'string'},
		{ name: 'redactionExplanation', type: 'string'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'style', type: 'string'},
		{ name: 'tags', type: 'Auto'}
	]
});
