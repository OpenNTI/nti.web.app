Ext.define('NextThought.app.course.overview.components.parts.VideoRollItem', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-videoroll-item',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'video-row {viewedCls}',
			cn: [
				{ cls: 'label', html: '{label}', 'data-qtip': '{label:htmlEncode}' },
				{tag: 'tpl', 'if': 'viewed', cn: [
					{cls: 'viewed', html: 'viewed'}
				]}
			]
		}
	]),


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.video);

		this.renderData = Ext.applyIf(this.renderData, {
			label: this.video.label || this.video.title
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function() {
		if (this.selectVideo) {
			this.selectVideo(this.video);
		}
	}
});
