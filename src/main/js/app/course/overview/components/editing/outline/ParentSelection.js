var Ext = require('extjs');
var ParentselectionIndex = require('../parentselection/Index');
var OutlinenodeInlineEditor = require('./outlinenode/InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.ParentSelection', {
    extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
    alias: 'widget.overview-editing-outline-parentselection',
    label: 'Unit: ',

    parseItemData: function(item) {
		return {
			cls: 'outline-item',
			ntiid: item.getId(),
			label: item.getTitle && item.getTitle()
		};
	},

    getEditor: function() {
		return NextThought.app.course.overview.components.editing.outline.outlinenode.InlineEditor;
	}
});
