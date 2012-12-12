Ext.define('NextThought.view.assessment.input.Unsupported',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-unsupported',

	renderTpl: Ext.DomHelper.markup({html:'This input type is not supported yet.'}),

	reset: Ext.emptyFn,

	afterRender: function(){
		Ext.Component.prototype.afterRender.call(this);
	}
});
