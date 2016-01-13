Ext.define('NextThought.app.course.overview.components.editing.content.video.items.Item', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-video-items-item',

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'video-items-item',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'thumbnail'},
		{cls: 'close'},
		{cls: 'meta', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'providers', cn: [
				{tag: 'tpl', 'for': 'providers', cn: [
					{tag: 'span', html: '{label}'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		thumbnailEl: '.thumbnail',
		closeEl: '.close'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.setDataTransfer(new NextThought.model.app.MoveInfo({
			OriginContainer: null,
			OriginIndex: this.index
		}));

		this.setDataTransfer(this.item);
	},


	beforeRender: function() {
		this.callParent(arguments);

		var sources = this.item.get('sources');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.item.get('title'),
			providers: sources.map(function(source) {
				return {label: source.service};
			})
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var thumbnail = this.thumbnailEl;

		this.item.resolveThumbnail()
			.then(function(poster) {
				thumbnail.setStyle('backgroundImage', 'url(' + poster + ')');
			});

		this.mon(this.closeEl, 'click', this.onClose.bind(this));
	},


	onClose: function() {
		if (this.removeItem) {
			this.removeItem(this.item);
		}
	}
});
