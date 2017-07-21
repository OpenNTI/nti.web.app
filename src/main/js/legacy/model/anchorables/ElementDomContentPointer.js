const Ext = require('extjs');

require('./DomContentPointer');

const lazy = require('legacy/util/lazy-require')
	.get('Anchors', () => require('legacy/util/Anchors'));

const ElementDomContentPointer =
module.exports = exports = Ext.define('NextThought.model.anchorables.ElementDomContentPointer', {
	extend: 'NextThought.model.anchorables.DomContentPointer',

	config: {
		elementTagName: '',
		elementId: ''
	},

	statics: {
		createFromObject: function (o) {
			return ElementDomContentPointer.create({
				role: o.role,
				elementTagName: o.elementTagName,
				elementId: o.elementId
			});
		}
	},

	constructor: function (o) {
		//If we are given a dom element as input, pull the necessary parts and
		//create a config we can use to create this.
		if (o.node) {
			o = {elementTagName: o.node.tagName, elementId: o.node.getAttribute('data-ntiid') || o.node.getAttribute('id'), role: o.role};
		}

		//do a little cleaning up, uppercase tagName if we plan on matching tag name later
		if (o.elementTagName) {o.elementTagName = o.elementTagName.toUpperCase();}

		this.validateTagName(o.elementTagName);
		this.validateId(o.elementId);
		this.callParent([o]);
		this.Class = 'ElementDomContentPointer';
	},


	validateId: function (id) {
		if (!id) {
			Ext.Error.raise('Must supply an Id');
		}
	},


	validateTagName: function (n) {
		if (!n) {
			Ext.Error.raise('Must supply a tag name');
		}
	},


	locateRangePointInAncestor: function (ancestorNode, startResult) {
		return lazy.Anchors.locateElementDomContentPointer(this, ancestorNode, startResult);
	}
});
