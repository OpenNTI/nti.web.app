Ext.define('NextThought.util.media.HTML5VideoPlayer',{
	extend: 'NextThought.util.media.HTML5Player',

	statics:{
		kind:'video',
		type: 'html5',
		valid: function(){
			return !!document.createElement('video').canPlayType;
		}
	},

	playerTpl: Ext.DomHelper.createTemplate({
		tag: 'video', cls: 'video', name: 'video', id: '{id}',
		controls: '', 'width': '{width}', 'height': '{height}'
	})
});
