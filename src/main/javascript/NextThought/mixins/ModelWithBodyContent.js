Ext.define('NextThought.mixins.ModelWithBodyContent',{

	getBodyText: function() {

		var o = this.get('body'), text = [];

		Ext.each(o,function(c){
			if(typeof(c) === 'string'){
				text.push(c.replace(/<.*?>/g, ' ').replace(/\s+/,' '));
			} else {
				text.push('[image]');
			}
		});

		return Ext.String.trim( text.join('') );
	},


	NOTE_BODY_DIVIDER_TPL: Ext.DomHelper.createTemplate({ id: '{0}', cls: 'body-divider', html: '{1}' }).compile(),

	WHITEBOARD_THUMBNAIL_TPL: Ext.DomHelper.createTemplate({
		id: '{0}',
		cls: 'body-divider',
		cn: [{
			tag: 'a',
			cls: 'whiteboard-magnifier'
		},{
			tag: 'img',
			src: Ext.BLANK_IMAGE_URL,
			style: {
				backgroundImage: 'url({1});'
			},
			onclick: '{2}',
			cls: 'whiteboard-thumbnail',
			alt: 'Whiteboard Thumbnail',
			border: 0
		}]
	}).compile(),

	compileBodyContent: function(result,scope,clickHandlerMaker){

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
				text.push(o.replace(/\s*(style|class)=".+?"\s*/ig,' ').replace(/<span.*?>&nbsp;<\/span>/ig,'&nbsp;'));
				render(i-1);
			}
			else {
				id = guidGenerator();
				Canvas.getThumbnail(o, function(thumbnail){
					text.push(
							me.WHITEBOARD_THUMBNAIL_TPL.apply([
								id,
								thumbnail,
								clickHandlerMaker.call(scope,id)])
					);
					render(i-1);
				});
			}
		}
		render(body.length-1);
	},

	hasTerm: function(term){
		var found = false,
			c = this.children||[],
			i = c.length - 1,
			b = (this.get('body')||[]).join('\n');

		if(b.indexOf(term) >= 0){
			return true;
		}

		for(;i>=0 && !found; i--){
			if(c[i].hasTerm){
				found = c[i].hasTerm(term);
			}
		}

		return found;
	}
});
