var Ext = require('extjs');
var ParentselectionIndex = require('../../parentselection/Index');
var OverviewgroupInlineEditor = require('./InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ParentSelection', {
    extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
    alias: 'widget.overview-editing-overviewgroup-parentselection',
    label: 'Lesson:',

    parseItemData: function(item) {
		return {
			cls: 'lesson-overview-item',
			ntiid: item.getId(),
			label: item.getTitle()
		};
	}
});
