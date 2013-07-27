Ext.define('NextThought.mixins.ModelWithBodyContent',{

	getBodyText: function(hasNoPlaceholderForImage) {

		var o = this.get('body'), text = [];

		Ext.each(o,function(c){
			if(typeof(c) === 'string'){
				text.push(c.replace(/<.*?>/g, ' ').replace(/\s+/g,' '));
			} else {
				if(!hasNoPlaceholderForImage){
					text.push('[image]');
				}
			}
		});

		return Ext.String.trim( text.join('') );
	},


	NOTE_BODY_DIVIDER_TPL: Ext.DomHelper.createTemplate({ id: '{0}', cls: 'body-divider', html: '{1}' }).compile(),

	WHITEBOARD_THUMBNAIL_TPL: Ext.DomHelper.createTemplate({
		id: '{0}',
		cls: 'body-divider',
		cn:[{
			onclick: '{2}',
			cls:'whiteboard-container',
			cn: [{
				cls: 'whiteboard-wrapper',
				cn:[{
					cls: 'overlay'
				},{
					tag: 'img',
					src: '{1}',
					cls: 'whiteboard-thumbnail',
					alt: 'Whiteboard Thumbnail',
					border: 0,
					width: '{3}'
				}]
			},{
				cls: 'toolbar',
				cn: [
					{ cls: 'reply', html: 'Reply with image' },
					{ cls: 'checkbox include', html: 'Include image' }
				]
			}]
		}]
	}).compile(),

	compileBodyContent: function(result,scope,clickHandlerMaker,size){

		var me = this,
			Canvas = NextThought.view.whiteboard.Canvas,
			body = (me.get('body')||[]).slice().reverse(),
			text = [];

		clickHandlerMaker = clickHandlerMaker || function(){return '';};

		function render(i){
			var o = body[i], id;

			if(i<0){
				result.call(scope,text.join(''));
			}
			else if(typeof(o) === 'string'){
				text.push(o.replace(/\s*(style|class)=".*?"\s*/ig,' ').replace(/<span.*?>&nbsp;<\/span>/ig,'&nbsp;'));
				render(i-1);
			}
			else {
				//TODO need to add support for the other potential part types now.  I.E. EmbeddedVideo,
				//and for things we don't support some kind of placeholder?
				if(o.MimeType != 'application/vnd.nextthought.canvas'){
					console.error('Not rendering part we don\'t understand', o);
					render(i-1);
				}
				else{
					id = guidGenerator();
					Canvas.getThumbnail(o, function(thumbnail){
						text.push(
							me.WHITEBOARD_THUMBNAIL_TPL.apply([
								id,
								thumbnail,
								clickHandlerMaker.call(scope,id,o)||'',
								size||''
							])
						);
						render(i-1);
					});
				}
			}
		}
		render(body.length-1);
	},

	hasTerm: function(term){
		var found = false,
			c = this.children||[],
			i = c.length - 1,
			b = (this.get('body')||[]).join('\n');

		if( (new RegExp(RegExp.escape(term),'i')).test(b) ){
			return true;
		}

		for(i;i>=0 && !found; i--){
			if(c[i].hasTerm){
				found = c[i].hasTerm(term);
			}
		}

		return found;
	}
});
