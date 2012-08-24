Ext.define('NextThought.view.assessment.PartContent', {
	extend: 'Ext.Component',
	alias: 'widget.part-content',

	cls: 'part-content',

	renderTpl: Ext.DomHelper.markup(
		[
			{cls:'ordinal', html:'{ordinal}.'},
			{cls:'content', html:'{content}'}
		]
	),

	initComponent: function(){
		this.renderData = Ext.apply(this.renderData || {},{
			content: this.part.get('content'),
			ordinal: String.fromCharCode(65+this.ordinal)
		});
		return this.callParent(arguments);
	}

});