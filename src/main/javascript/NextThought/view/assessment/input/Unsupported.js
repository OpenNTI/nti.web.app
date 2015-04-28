Ext.define('NextThought.view.assessment.input.Unsupported', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-unsupported',

	renderTpl: Ext.DomHelper.markup({html: '{{{NextThought.view.assessment.input.Unsupported.msg}}}'}),

	reset: Ext.emptyFn,

	afterRender: function() {
		Ext.Component.prototype.afterRender.call(this);
	}
});
