Ext.define('NextThought.view.widgets.MiniStreamEntry', {
	extend: 'Ext.Component',
	alias: 'widget.miniStreamEntry',
	requires: [
		'NextThought.util.AnnotationUtils'
	],
	mixins: {
		avatar: 'NextThought.mixins.Avatar'
	},

	renderTpl: new Ext.XTemplate(
			'<div class="x-mini-stream-entry {cls}">',
				'{[this.applySubtemplate("Avatar",values)]}',
				'<div>',
					'<span class="name">{name}</span> ',
					'<span class="text">{text:ellipsis(50)}</span>',
				'</div>',
			'</div>'
	),

   renderSelectors: {
		box: 'div.x-mini-stream-entry',
		name: '.x-mini-stream-entry span.name',
		text: '.x-mini-stream-entry span.text',
		icon: 'img'
	},

	initComponent: function(){
		this.callParent(arguments);

		var c = this.change.get('Creator'),
			u = NextThought.cache.UserRepository.getUser(c);

		this.initAvatar(u,24);
		this.renderData.cls = this.cls || '';
		this.renderData.name = u.getName();

		this.renderData.text = this.change.get('Item')
				? [this.change.get('ChangeType'),' a ',this.change.get('Item').get('Class')].join('')
				: 'deleted something';
	},


	markRead: function() {
		this.box.removeCls('unread');
	},


	afterRender: function() {
		var me=this,
			item = me.change.get('Item'), e, t;
		me.callParent(arguments);
		me.box.on('click', function(){
			me.fireEvent('clicked', item, me);
		});

		//lets put some popovers on this to show the contents?  Maybe this should be inline so as to see it at a
		//glance w/o having to navigate to it?
		e = this.getEl();
		t = AnnotationUtils.getBodyTextOnly(item);
		if (t) {
			Ext.create('Ext.tip.ToolTip', {
				target: e,
				html: t
			});
		}
	}
});
