Ext.define('NextThought.mixins.ModelWithBodyContent',{

	textDescriptionForPartType: {
		'application/vnd.nextthought.canvas': '[image]',
		'application/vnd.nextthought.embeddedvideo': '[video]'
	},

	rendererForPart: {
		'application/vnd.nextthought.canvas': 'whiteboardRenderer',
		'application/vnd.nextthought.embeddedvideo': 'embeddedVideoRenderer'
	},

	getBodyText: function(hasNoPlaceholderForImage) {

		var o = this.get('body'), text = [];

		Ext.each(o,function(c){
			if(typeof c === 'string'){
				text.push(c.replace(/<.*?>/g, ' ').replace(/\s+/g,' '));
			} else {
				if(!hasNoPlaceholderForImage){
					text.push(this.textDescriptionForPartType[(c.data || c).MimeType] || '[unknown]');
				}
			}
		}, this);

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

	whiteboardRenderer: function(o, clickHandlerMaker, size, callback, scope){
		var id = guidGenerator(),
			me = this,
			Canvas = NextThought.view.whiteboard.Canvas;
		Canvas.getThumbnail(o, function(thumbnail){
			var t = me.WHITEBOARD_THUMBNAIL_TPL.apply([
						id,
						thumbnail,
						clickHandlerMaker.call(scope,id,o)||'',
						size||''
					]);
			Ext.callback(callback, scope, [t]);
		});
	},

	embeddedVideoRenderer: function(o, clickHandlerMaker, size, callback, scope){
		var width = (size || 225), height = width / (4.0/3.0), types, fn, cfg;

		function youtubeMarkupForHref(href){
			var adjustedHref,
				opts = {
					frameborder: "0",
					marginwidth: "0",
					marginheight: "0",
					rel: "0",
					seamless: "1",
					transparent: "1",
					allowfullscreen:"1",
					allowtransparency: "1",
					modestbranding: "1",
					height: height,
					width: width
				}, params = [];
			if(href){
				Ext.Object.each(opts, function(k, v){
					params.push(k+'='+v);
				});
				adjustedHref = [href, params.join('&')].join(href.indexOf("?") < 0 ? "?" : "&");

				return Ext.apply({
					tag: 'iframe',
					cls: 'youtube-player',
					href: href,
					src: adjustedHref
				}, opts);
			}
			return null;
		}

		function html5videoForHref(href){
			if(!href){
				return null;
			}
			return {
				tag: 'video',
				href: href,
				controls: '',
				style: {width: width+'px', height: height+'px'},
				name: 'media',
				cn: {
					tag: 'source',
					src: href
				}
			};
		}

		types = {youtube: youtubeMarkupForHref};
		fn = types[o.type] || html5videoForHref;
		cfg = fn(o.embedURL);

		Ext.callback(callback, scope, [Ext.DomHelper.markup(cfg)]);
	},

	compileBodyContent: function(result,scope,clickHandlerMaker,size){

		var me = this,
			body = (me.get('body')||[]).slice().reverse(),
			text = [];

		clickHandlerMaker = clickHandlerMaker || function(){return '';};

		function render(i){
			var o = body[i], fn;

			if(i<0){
				result.call(scope,text.join(''));
			}
			else if(typeof o === 'string'){
				text.push(o.replace(/\s*(style|class)=".*?"\s*/ig,' ').replace(/<span.*?>&nbsp;<\/span>/ig,'&nbsp;'));
				render(i-1);
			}
			else {
				//TODO need to add support for the other potential part types now.  I.E. EmbeddedVideo,
				//and for things we don't support some kind of placeholder?
				fn = me[me.rendererForPart[o.MimeType] || ''];
				if(Ext.isFunction(fn)){
					fn.call(me, o, clickHandlerMaker, size, function(t){
						text.push(t);
						render(i-1);
					}, me);
				}
				else{
					console.error('Not rendering part we don\'t understand', o);
					render(i-1);
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
