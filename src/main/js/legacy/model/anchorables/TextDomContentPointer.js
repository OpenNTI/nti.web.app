const Ext = require('@nti/extjs');

const lazy = require('legacy/util/lazy-require')
	.get('Anchors', () => require('legacy/util/Anchors'));

const ContentPointer = require('./ContentPointer');
const DomContentPointer = require('./DomContentPointer');
const TextContext = require('./TextContext');


const TextDomContentPointer =
module.exports = exports =
Ext.define('NextThought.model.anchorables.TextDomContentPointer', {
	extend: 'NextThought.model.anchorables.DomContentPointer',

	config: {
		ancestor: {},
		contexts: [],
		edgeOffset: 0
	},

	statics: {
		createFromObject: function (o) {
			var cp = ContentPointer;
			return TextDomContentPointer.create({
				role: o.role,
				contexts: TextContext.createFromObjects(o.contexts),
				edgeOffset: o.edgeOffset,
				ancestor: cp.createFromObject(o.ancestor)
			});
		}
	},

	constructor: function (o) {
		this.validateContexts(o.contexts);
		this.validateEdgeOffset(o.edgeOffset);
		this.validateAncestor(o.ancestor);
		this.callParent(arguments);
		this.Class = 'TextDomContentPointer';
	},

	primaryContext: function () {
		if (this.getContexts().length > 0) {
			return this.getContexts()[0];
		}
		return null;
	},

	validateAncestor: function (a) {
		if (!a || !(a instanceof DomContentPointer)) {
			Ext.Error.raise('Ancestor must be supplied');
		}
		else if (a.isElementDomContentPointer && a.getRole() !== 'ancestor') {
			Ext.Error.raise('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
		}
	},

	validateContexts: function (contexts) {
		if (!contexts) {
			Ext.Error.raise('Must supply TextContexts');
		}
		else if (contexts.length < 1) {
			Ext.Error.raise('Must supply at least 1 TextContext');
		}
	},

	validateEdgeOffset: function (/*o*/) {
		/*
		if (!o || o < 0) {
			Ext.Error.raise('Offset must exist and be 0 or more');
		}
		*/
	},

	locateRangePointInAncestor: function (ancestorNode, startResult) {
		return lazy.Anchors.locateRangeEdgeForAnchor(this, ancestorNode, startResult);
	}
});
