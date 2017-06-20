const Ext = require('extjs');

const ContentUtils = require('legacy/util/Content');

require('legacy/mixins/QuestionContent');


module.exports = exports = Ext.define('NextThought.app.assessment.PartContent', {
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

	initComponent: function () {
		this.renderData = Ext.apply(this.renderData || {}, {
			content: this.setupContent(),
			ordinal: String.fromCharCode(65 + this.ordinal)
		});

		this.callParent(arguments);

		this.setupContent();
	},


	setupContent: function () {
		var me = this,
			root = this.reader.getLocation().root,
			c = this.part.get('content') || '';

		c = this.buildContent(
					ContentUtils.fixReferences(c, root));

		function santatize () {
			me.el.select('a[href]').set({target: '_blank'});
			me.el.select('a:empty').remove();
			me.updateLayout();
		}

		if (!this.rendered) {
			me.on('afterrender', santatize);
		} else {
			santatize();
		}

		return c;
	}
});
