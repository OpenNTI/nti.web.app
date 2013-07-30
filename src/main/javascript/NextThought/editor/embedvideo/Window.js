Ext.define('NextThought.editor.embedvideo.Window',{
	extend: 'NextThought.view.window.Window',
	alias: 'widget.embedvideo-window',

	requires: [
		'NextThought.view.account.Header',
		'NextThought.editor.embedvideo.Main'
	],

	cls: 'embedvideo-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: true,
	resizable: false,
	dialog: true,
	closeAction: 'destroy',

	width: 480,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{
			xtype: 'account-header-view',
			noIcon: true,
			title: 'Embed video',
			detail: 'Just give us the url of the video you want to embed and we\'ll figure out the rest.'
		},
		{xtype: 'embedvideo-main-view'}
	],

	embed: function(){
		var main = this.down('embedvideo-main-view'),
			val = main.getValues();

		if(val){
			if(Ext.isFunction(this.onEmbed)){
				Ext.callback(this.onEmbed, this, [val]);
			}
			this.close();
		}
		else{
			main.setError({field: 'embed', message: 'The embedded video should be a youtube embed url, youtube embed code, or an html5 video url.'});
		}
	}
});
