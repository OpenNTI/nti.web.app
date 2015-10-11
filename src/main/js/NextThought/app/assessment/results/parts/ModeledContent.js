Ext.define('NextThought.app.assessment.results.parts.ModeledContent', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-modeledcontent-result',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmodeledcontentpart'
	},

	mixins: {
		ModelWithBodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	cls: 'modeled-content-results',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'prev-arrow', html: 'prev'},
		{cls: 'next-arrow', html: 'next'},
		{cls: 'content'}
	]),

	renderSelectors: {
		prevArrow: '.prev-arrow',
		nextArrow: '.next-arrow',
		contentEl: '.content'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.prevArrow, 'click', this.showPrev.bind(this));
		this.mon(this.nextArrow, 'click', this.showNext.bind(this));

		this.showResult(0);
	},


	showResult: function(index) {
		this.currentIndex = index;

		var parts = this.resultPart.Results,
			part = parts[index],
			text = part && this.getBodyText(true, part);

		if (text) {
			this.contentEl.removeCls('error');
			this.contentEl.dom.innerHTML = text;
		} else {
			this.contentEl.addCls('error');
			this.contentEl.dom.innerHTML = 'Error showing response.';
		}

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

	},


	showPrev: function(e) {
		if (!e.getTarget('.disabled')) {
			this.showResult(this.currentIndex - 1);
		}
	},


	showNext: function(e) {
		if (!e.getTarget('.disabled')) {
			this.showResult(this.currentIndex + 1);
		}
	}
});
