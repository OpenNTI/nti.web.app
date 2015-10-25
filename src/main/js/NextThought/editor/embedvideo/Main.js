export default Ext.define('NextThought.editor.embedvideo.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.embedvideo-main-view',
	requires: [
		'Ext.form.field.TextArea',
		'NextThought.model.resolvers.videoservices.Kaltura',
		'NextThought.model.resolvers.videoservices.Vimeo',
		'NextThought.model.resolvers.videoservices.Youtube',
		'NextThought.model.resolvers.videoservices.HTML'
	],

	cls: 'embedvideo-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'box', autoEl: {tag: 'textarea', name: 'embed', placeholder: 'Video URL...'}, name: 'embed', cls: 'input-box textarea', emptyText: 'Video URL...'}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {cls: 'error-box', tag: 'div',
			cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text: 'Cancel', handler: function(b) {
				b.up('window').close();
			}},
			{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text: 'Embed', handler: function(b) {
				b.up('window').embed();
			}}
		]}
	],


	afterRender: function() {
		this.callParent(arguments);

		var url = this.up('window').getUrl(),
			textEl = this.down('[name=embed]');

		if (url) {
			this.down('[name=embed]').getEl().dom.value = url;
		}

		if (textEl && textEl.el) {
			textEl.el.allowContextMenu();
		}
	},

	getValues: function() {
		var raw = this.down('[name=embed]').getEl().getValue(), matches,
			iframeRegex = /<iframe.*src="(.*?)".*?><\/iframe>/i,
			Videos = NextThought.model.resolvers.videoservices,
			types = [
				Videos.Kaltura,
				Videos.Youtube,
				Videos.Vimeo,
				Videos.HTML
			], i, type = null;

		matches = iframeRegex.exec(raw);

		if (matches && matches[1]) {
			raw = matches[1];
		}

		types.forEach(function(video) {
			if (video.urlIsFor(raw) && !type) {
				type = {
					type: video.TYPE,
					embedURL: video.getEmbedURL(raw),
					VideoId: video.getIdFromURL(raw)
				};
			}
		});

		return type;


		// if (Videos.Kaltura.urlIsFor(raw)) {
		// 	type = {type: 'kaltura', embedURL: raw};
		// } else if (Videos.Youtube.urlIsFor(raw)) {
		// 	type = {type: 'youtube', embedURL: raw};
		// } else if (Videos.Vimeo.urlIsFor(raw)) {
		// 	type = {type: 'vimeo', embedURL: raw};
		// } else if (Videos.HTML.urlIsFor(raw)) {
		// 	type = {type: 'html5', embedURL: raw};
		// }

		// return type;
	},


	setError: function(error) {
		var box = this.down('[name=error]'),
			field = this.down('[name=' + error.field + ']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f) {f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update('Video');
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	}
});
