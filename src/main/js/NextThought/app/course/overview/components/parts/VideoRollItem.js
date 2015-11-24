Ext.define('NextThought.app.course.overview.components.parts.VideoRollItem', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-videoroll-item',

	cls: 'video-row',

	renderTpl: Ext.DomHelper.markup([{
			cls: 'label',
			html: '{label}',
			'data-qtip': '{label:htmlEncode}'
		}, {
			tag: 'tpl',
			'if': 'viewed',
			cn: [{
				cls: 'viewed',
				html: 'viewed'
			}]
		}
	]),

	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.record && this.record.getData());

		this.renderData = Ext.applyIf(this.renderData, {
			label: this.record && this.record.get('title')
		});
	}
});
