const Ext = require('@nti/extjs');

require('legacy/mixins/ModelWithBodyContent');


module.exports = exports = Ext.define('NextThought.app.assessment.results.parts.ModeledContent', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-modeledcontent-result',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmodeledcontentpart'
	},

	mixins: {
		ModelWithBodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	cls: 'modeled-content-results result-part',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{tag: 'span', cls: 'current', html: ''},
			{tag: 'span', html: ' of '},
			{tag: 'span', cls: 'total', html: '{total}'},
			{cls: 'prev-arrow'},
			{cls: 'next-arrow'}
		]},
		{cls: 'content'}
	]),

	renderSelectors: {
		prevArrow: '.prev-arrow',
		nextArrow: '.next-arrow',
		contentEl: '.content',
		currentEl: '.current'
	},


	beforeRender: function () {
		this.callParent(arguments);

		let total = this.resultPart.Results && this.resultPart.Results.length;

		this.renderData = Ext.apply(this.renderData || {}, {
			total: total ? total : 1
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.prevArrow, 'click', this.showPrev.bind(this));
		this.mon(this.nextArrow, 'click', this.showNext.bind(this));

		this.showResult(0);
	},


	showResult: function (index) {
		index = index || 0;
		this.currentIndex = index;

		var parts = this.resultPart.Results,
			part = parts[index],
			text = part && this.getBodyText(true, part, true);

		if (text) {
			this.contentEl.removeCls('error');
			this.contentEl.dom.innerHTML = text;
		} else {
			this.contentEl.addCls('error');
			this.contentEl.dom.innerHTML = 'No response.';
		}

		this.currentEl.update(index + 1);

		if (index <= 0) {
			this.prevArrow.addCls('disabled');
		} else {
			this.prevArrow.removeCls('disabled');
		}

		if (index + 1 >= parts.length) {
			this.nextArrow.addCls('disabled');
		} else {
			this.nextArrow.removeCls('disabled');
		}

		this.resize();
	},


	showPrev: function (e) {
		if (!e.getTarget('.disabled')) {
			this.showResult(this.currentIndex - 1);
		}
	},


	showNext: function (e) {
		if (!e.getTarget('.disabled')) {
			this.showResult(this.currentIndex + 1);
		}
	}
});
