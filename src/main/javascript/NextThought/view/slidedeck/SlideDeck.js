Ext.define('NextThought.view.slidedeck.SlideDeck', {
	extend: 'Ext.Component',
	alias:  'widget.content-slidedeck',

	ui:  'content-slidedeck',
	cls: 'content-slidedeck',

	renderTpl: Ext.DomHelper.markup([
										{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
										{ cls: 'meta', cn: [
											{ cls: 'title', html: '{title}' },
											{ cls: 'byline', html: 'By {creator}' },
											{ cls: 'description', html: '{description}' },
											{ cls: 'presentation-button', html: 'View Presentation' }
										]}
									]),


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.data);
		this.target = this.data.href;
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', 'onSlideDeckClicked', this);
	},


	onSlideDeckClicked: function (e) {
		SlideDeck.open(this.contentElement, this.reader);
	}
});
