Ext.define('NextThought.view.assessment.PartContent', {
	extend: 'Ext.Component',
	alias: 'widget.part-content',

	cls: 'part-content',

	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	renderTpl: Ext.DomHelper.markup(
			[
				{ cls: 'ordinal', html: '{ordinal}.' },
				{ tag: 'tpl', 'if': 'content', cn: {cls: 'content', html: '{content}', style: {verticalAlign: 'initial'}}}
			]
	),

	initComponent: function() {
		var c = this.part.get('content');

		if (c) {
			c = this.buildContent(c, true);
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			content: c,
			ordinal: String.fromCharCode(65 + this.ordinal)
		});
		return this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(this);

		this.el.select('a[href]').set({target: '_blank'});
	}
});
