var Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.assessment.results.parts.FreeResponse', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-freeresponse-result',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedfreeresponsepart'
	},

	cls: 'free-response-results result-part',

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

		let total = this.resultPart.Results && Object.keys(this.resultPart.Results).length;

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

		var responses = Object.keys(this.resultPart.Results),
			response = responses[index];

		if (response) {
			this.contentEl.removeCls('error');
			this.contentEl.dom.innerHTML = response;
		} else {
			this.contentEl.addCls('error');
			this.contentEl.dom.innerHTML = 'This question was not answered.';
		}

		this.currentEl.update(index + 1);

		if (index <= 0) {
			this.prevArrow.addCls('disabled');
		} else {
			this.prevArrow.removeCls('disabled');
		}

		if (index + 1 >= responses.length) {
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
