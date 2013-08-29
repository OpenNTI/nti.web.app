Ext.define('NextThought.mixins.ModelWithBodyContent', {

	textDescriptionForPartType: {
		'application/vnd.nextthought.canvas':        '[image]',
		'application/vnd.nextthought.embeddedvideo': '[video]'
	},

	rendererForPart: {
		'application/vnd.nextthought.canvas':        'whiteboardRenderer',
		'application/vnd.nextthought.embeddedvideo': 'embeddedVideoRenderer'
	},

	componentRendererForPart: {
		'application/vnd.nextthought.embeddedvideo': 'renderVideoComponent'
	},

	getBodyText: function (hasNoPlaceholderForImage) {

		var o = this.get('body'), text = [];

		Ext.each(o, function (c) {
			if (typeof c === 'string') {
				text.push(c.replace(/<.*?>/g, ' ').replace(/\s+/g, ' '));
			} else {
				if (!hasNoPlaceholderForImage) {
					text.push(this.textDescriptionForPartType[(c.data || c).MimeType] || '[unknown]');
				}
			}
		}, this);

		return Ext.String.trim(text.join(''));
	},


	NOTE_BODY_DIVIDER_TPL: Ext.DomHelper.createTemplate({ id: '{0}', cls: 'body-divider', html: '{1}' }).compile(),

	WHITEBOARD_THUMBNAIL_TPL: Ext.DomHelper.createTemplate({
															   id:  '{0}',
															   cls: 'body-divider',
															   cn:  [
																   {
																	   onclick: '{2}',
																	   cls:     'whiteboard-container',
																	   cn:      [
																		   {
																			   cls: 'whiteboard-wrapper',
																			   cn:  [
																				   {
																					   cls: 'overlay'
																				   },
																				   {
																					   tag:    'img',
																					   src:    '{1}',
																					   cls:    'whiteboard-thumbnail',
																					   alt:    'Whiteboard Thumbnail',
																					   border: 0,
																					   width:  '{3}'
																				   }
																			   ]
																		   },
																		   {
																			   cls: 'toolbar',
																			   cn:  [
																				   { cls: 'reply', html: 'Reply with image' },
																				   { cls: 'checkbox include', html: 'Include image' }
																			   ]
																		   }
																	   ]
																   }
															   ]
														   }).compile(),

	whiteboardRenderer: function (o, clickHandlerMaker, size, callback, scope) {
		var id = guidGenerator(),
				me = this,
				Canvas = NextThought.view.whiteboard.Canvas;
		Canvas.getThumbnail(o, function (thumbnail) {
			var t = me.WHITEBOARD_THUMBNAIL_TPL.apply([
														  id,
														  thumbnail,
														  clickHandlerMaker(id, o) || '',
														  size || ''
													  ]);
			Ext.callback(callback, scope, [t]);
		});
	},

	embeddedVideoRenderer: function (o, clickHandlerMaker, size, callback, scope) {
		var width = (size || 360), height = width / (4.0 / 3.0),
				cfg = {
					cls:             'data-component-placeholder',
					'data-mimetype': o.MimeType,
					'data-type':     o.type,
					'data-url':      o.embedURL,
					'data-height':   height,
					'data-width':    width
				};
		Ext.callback(callback, scope, [Ext.DomHelper.markup(cfg)]);
	},


	renderVideoComponent: function (node, owner) {
		//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		function parseYoutubeIdOut(url) {
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/,
					match = url.match(regExp);
			if (match && match[2].length === 11) {
				return match[2];
			}
			return null;
		}

		function parseKalturaInformation(url) {
			var kalturaRegex = /kaltura:\/\/([^\/]+)\/([^\/]+)\/{0,1}/i,
					match = url.match(kalturaRegex);

			return match ? match[1] + ':' + match[2] : null;
		}

		var p, width = node.getAttribute('data-width'),
				url = node.getAttribute('data-url'),
				type = node.getAttribute('data-type'),
				item = NextThought.model.PlaylistItem.create({mediaId: guidGenerator()}), source,
				youtubeId = parseYoutubeIdOut(url),
				kalturaSource = parseKalturaInformation(url);

		if (type === 'kaltura' && kalturaSource) {
			source = {
				service: 'kaltura',
				source:  kalturaSource
			}
		}
		else {
			source = {
				service: youtubeId ? 'youtube' : 'html5',
				source: [youtubeId || url]
			};
		}


		item.set('sources', [source]);
		p = Ext.widget({
						   xtype:       'content-video',
						   playlist:    [item],
						   renderTo:    node,
						   playerWidth: width,
						   floatParent: owner
					   });

		return p;
	},


	compileBodyContent: function (result, scope, clickHandlerMaker, size) {

		var me = this,
				body = (me.get('body') || []).slice().reverse(),
				text = [];

		clickHandlerMaker = clickHandlerMaker || function () {return '';};

		function render(i) {
			var o = body[i], fn;

			if (i < 0) {
				Ext.callback(result, scope, [text.join(''), function (node, cmp) {
					var cmpPlaceholders = node.query('.data-component-placeholder'), added = [], cmpAdded;
					Ext.each(cmpPlaceholders, function (ph) {
						var mime = ph.getAttribute('data-mimetype'),
								fn = me.componentRendererForPart[mime || ''];
						if (Ext.isFunction(me[fn])) {
							cmpAdded = me[fn](ph, cmp);
							if (cmpAdded) {
								added.push(cmpAdded);
							}
						}
					});
					return added;
				}]);
			}
			else if (typeof o === 'string') {
				text.push(o.replace(/\s*(style|class)=".*?"\s*/ig, ' ').replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;'));
				render(i - 1);
			}
			else {
				fn = me[me.rendererForPart[o.MimeType] || ''];
				if (Ext.isFunction(fn)) {
					fn.call(me, o, Ext.bind(clickHandlerMaker, scope), Ext.isObject(size) ? size[o.MimeType]
							: size, function (t) {
						text.push(t);
						render(i - 1);
					}, me);
				}
				else {
					console.error('Not rendering part we don\'t understand', o);
					render(i - 1);
				}
			}
		}

		render(body.length - 1);
	},

	hasTerm: function (term) {
		var found = false,
				c = this.children || [],
				i = c.length - 1,
				b = (this.get('body') || []).join('\n');

		if ((new RegExp(RegExp.escape(term), 'i')).test(b)) {
			return true;
		}

		for (i; i >= 0 && !found; i--) {
			if (c[i].hasTerm) {
				found = c[i].hasTerm(term);
			}
		}

		return found;
	}
});
