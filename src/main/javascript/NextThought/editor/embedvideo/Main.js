Ext.define('NextThought.editor.embedvideo.Main',{
	extend: 'Ext.container.Container',
	alias: 'widget.embedvideo-main-view',
	requires: [
		'Ext.form.field.TextArea'
	],

	cls: 'embedvideo-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'textarea', name: 'embed', cls: 'input-box textarea', emptyText: 'Video URL...'}
		]},
		{xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
			cn:[
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text:'Cancel', handler: function(b){
				b.up('window').close();
			}},
			{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text: 'Embed', handler: function(b){
				b.up('window').embed();
			}}
		]}
	],


	getValues: function(){
		var raw = this.down('[name=embed]').getValue(),
			stupidURLRegex = /^(http:\/\/|https:\/\/|\/\/).*/i,
			youtubeEmbedURLRegex = /^(http:\/\/|https:\/\/|\/\/)www.youtube.com\/embed\/.+/i,
			youtubeEmbedFrameRegex=/<iframe.*src="(.*?)".*?><\/iframe>/i, match;

		raw = (raw || '').trim();

		//Is it a youtube embed, we can work with that
		match = youtubeEmbedFrameRegex.exec(raw);
		if(match && youtubeEmbedURLRegex.test(match[1])){
			return {type: 'youtube' , embedURL: match[1]};
		}

		//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		function parseYoutubeIdOut(url){
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
				match = url.match(regExp);
			if (match && match[2].length==11){
				return match[2];
			}
			return null;
		}

		//Ok its not.  Is it a url?
		if(stupidURLRegex.test(raw)){
			var id = parseYoutubeIdOut(raw);

			return {type: ( id ? 'youtube' : 'html5'), embedURL: raw};
		}



		return null;
	},

	setError: function(error) {
		var box = this.down('[name=error]'),
			field = this.down('[name='+error.field+']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f){f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update('Video');
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	}
});
