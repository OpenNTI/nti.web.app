var Ext = require('extjs');
var Globals = require('../util/Globals');
var {guidGenerator} = Globals;
const mime = require('mime-types');

require('../app/video/Video');
require('legacy/model/RelatedWork');

module.exports = exports = Ext.define('NextThought.mixins.ModelWithBodyContent', {
	statics: {
		/**
		 * A naive model body content compiler that only shows styled text, will not include whiteboards etc...
		 * DON'T USE UNLESS YOU ARE 100% SURE
		 *
		 * @param  {Array} parts the body content
		 * @return {String}		  compiled content
		 */
		unsafeSyncCompileBodyContent: function (parts) {
			var i, text = [], part;

			for (i = 0; i < parts.length; i++) {
				part = parts[i];

				if (typeof part === 'string') {
					text.push(part.replace(/\s*(class)=".*?"\s*/ig, ' ')
						.replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;'));
				} else {
					console.warn('Non simple part');
				}
			}

			return text.join('');
		},

		isImageFile: function (type) {
			return (/[\.\/](gif|jpg|jpeg|tiff|png)$/i).test(type);
		}
	},

	textDescriptionForPartType: {
		'application/vnd.nextthought.canvas': '[image]',
		'application/vnd.nextthought.embeddedvideo': '[video]'
	},

	rendererForPart: {
		'application/vnd.nextthought.canvas': 'whiteboardRenderer',
		'application/vnd.nextthought.embeddedvideo': 'embeddedVideoRenderer',
		'application/vnd.nextthought.contentfile': 'attachmentRenderer'
	},

	componentRendererForPart: {
		'application/vnd.nextthought.embeddedvideo': 'renderVideoComponent'
	},

	getBodyText: function (hasNoPlaceholderForImage, bodyOverride) {

		var o = bodyOverride || this.get('body'), text = [];

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
		id: '{0}',
		cls: 'body-divider',
		cn: [
			{
				onclick: '{2}',
				cls: 'whiteboard-container',
				cn: [
					{
						cls: 'whiteboard-wrapper',
						cn: [
							{
								cls: 'overlay'
							},
							{
								tag: 'img',
								src: '{1}',
								cls: 'whiteboard-thumbnail',
								alt: 'Whiteboard Thumbnail',
								border: 0,
								width: '{3}'
							}
						]
					},
					{
						cls: 'toolbar',
						cn: [
							{ cls: 'reply', html: 'Reply with image' },
							{ cls: 'checkbox include', html: 'Include image' }
						]
					}
				]
			}
		]
	}).compile(),

	VIDEO_THUMBNAIL_TPL: Ext.DomHelper.createTemplate({
		id: '{0}',
		cls: 'body-divider',
		cn: [
			{
				onclick: '{2}',
				cls: 'video-placeholder',
				style: {width: '{3}px'},
				cn: [
					{
						tag: 'img',
						src: '{1}',
						cls: 'video-thumbnail',
						alt: 'Video Thumbnail',
						border: 0
					},
					{cls: 'play'}
				]
			}
		]
	}),


	CONTENT_FILE_TPL: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'attachment-part', contentEditable: 'false', 'data-fileName': '{filename}', 'name': '{name}', cn: [
			{ cls: 'icon-wrapper', cn: [
				{ cls: 'icon {type} {iconCls}', style: 'background-image: url(\'{url}\');', cn: [
					{tag: 'label', html: '{iconLabel}'}
				]}
			]},
			{ cls: 'meta', cn: [
				{ cls: 'text', cn: [
					{ tag: 'span', cls: 'title', html: '{filename}'},
					{ tag: 'span right', cls: 'size', html: '{size}'}
				]},
				{ cls: 'controls', cn: [
					{ tag: 'span', cls: 'download', cn: [
						{tag: 'a', href: '{download_url}', html: 'Download', target:'_self'}
					]}
				]}
			]}
		]}
	])),


	whiteboardRenderer: function (o, clickHandlerMaker, size, callback, scope) {
		var id = guidGenerator(),
			me = this,
			Canvas = NextThought.app.whiteboard.Canvas;
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

	__embeddedVideoNoPlaceholder: function (o, clickHandlerMaker, size, callback, scope) {
		var width = (size || 360), height = width / (4.0 / 3.0),
			cfg = {
				cls: 'data-component-placeholder',
				'data-mimetype': o.MimeType,
				'data-type': o.type,
				'data-url': o.embedURL,
				'data-height': height,
				'data-width': width
			};


		Ext.callback(callback, scope, [Ext.DomHelper.markup(cfg)]);
	},

	__embeddedVideoWithPlaceholder: function (o, clickHandlerMaker, size, callback, scope) {
		var id = guidGenerator(),
			me = this,
			Video = NextThought.app.video.Video;

		Video.resolvePosterFromEmbedded(o)
			.then(function (poster) {
				return poster.poster || poster;
			}, function (reason) {
				return Globals.CANVAS_BROKEN_IMAGE.src;
			})
			.then(function (poster) {
				var tpl = me.VIDEO_THUMBNAIL_TPL.apply([
					id,
					poster,
					clickHandlerMaker(id, o, 'video') || '',
					size || ''
				]);

				Ext.callback(callback, scope, [tpl]);
			});
	},

	embeddedVideoRenderer: function (o, clickHandlerMaker, size, callback, scope, config) {
		if (config && config.useVideoPlaceholder) {
			return this.__embeddedVideoWithPlaceholder(o, clickHandlerMaker, size, callback, scope);
		}

		return this.__embeddedVideoNoPlaceholder(o, clickHandlerMaker, size, callback, scope);
	},


	attachmentRenderer: function (o, clickHandlerMaker, size, callback, scope, config) {
		var type = (o && o.contentType || o.FileMimeType) || '',
			p;

		if (!isNaN(parseFloat(o.size))) {
			o.size = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(parseFloat(o.size), 1);
		}

		o = Ext.clone(o);
		o.type = type.split('/').last() || '';
		o = Ext.apply(o, this.getIconDataForAttachment(o));
		p = this.CONTENT_FILE_TPL.apply(o);
		Ext.callback(callback, scope, [p]);
	},


	getIconDataForAttachment: function (data) {
		let type = data.contentType || data.FileMimeType,
			isImage = NextThought.mixins.ModelWithBodyContent.isImageFile(type),
			extension = mime.extension(type),
			iconLabel = extension && !/^(www|bin)$/i.test(extension) ? extension : null,
			obj = {iconCls: ''};

		if (isImage) {
			obj.url = data.url || data.href || data.value;
		}
		else {
			if (NextThought.model.RelatedWork.hasIconForMimeType(type)) {
				obj.url = NextThought.model.RelatedWork.getIconForMimeType(type);
			}
			else {
				obj.url = NextThought.model.RelatedWork.getFallbackIcon();
				obj.iconLabel = iconLabel;
				obj.iconCls = 'fallback';
			}
		}

		return obj;
	},


	renderVideoComponent: function (node, owner, config) {
		var p, width = node.getAttribute('data-width'),
			url = node.getAttribute('data-url'),
			type = node.getAttribute('data-type');

		p = Ext.widget({
			xtype: 'content-video',
			url: url,
			renderTo: node,
			playerWidth: width,
			floatParent: owner
		});

		return p;
	},

	compileBodyContent: function (result, scope, clickHandlerMaker, size, bodyOverride, config) {
		var me = this,
			body = (bodyOverride || me.get('body') || []).slice().reverse(),
			text = [];

		config = config || {};

		clickHandlerMaker = clickHandlerMaker || function () {return '';};

		function render (i) {
			var o = body[i], fn;

			if (i < 0) {
				// TODO: We should change this to allow component to render themselves rather than only treating text/templates
				Ext.callback(result, scope, [text.join(''), function (node, cmp) {
					var cmpPlaceholders = node.query('.data-component-placeholder'), added = [], cmpAdded;
					Ext.each(cmpPlaceholders, function (ph) {
						var mime = ph.getAttribute('data-mimetype'),
							fn = me.componentRendererForPart[mime || ''];
						if (Ext.isFunction(me[fn])) {
							cmpAdded = me[fn](ph, cmp, config);
							if (cmpAdded) {
								added.push(cmpAdded);
							}
						}
					});
					return added;
				}]);
			}
			else if (typeof o === 'string') {
				text.push(o.replace(/\s*(class)=".*?"\s*/ig, ' ')
						.replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;'));
				render(i - 1);
			}
			else {
				fn = me[me.rendererForPart[o.MimeType] || ''];
				if (Ext.isFunction(fn)) {
					fn.call(me, o, Ext.bind(clickHandlerMaker, scope),
							Ext.isObject(size) ? size[o.MimeType] : size,
							function (t) {
								text.push(t);
								render(i - 1);
							}, me, config);
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
	},


	getFormData: function () {
		if (this.hasFiles()) {
			return this.buildFormData();
		}

		return false;
	},


	hasFiles: function () {
		var body = this.get('body') || [],
			hasFiles = false, part;

		for(let i = 0; i < body.length && !hasFiles; i++) {
			part = body[i];
			if (part && part.file) {
				hasFiles = true;
			}
		}

		return hasFiles;
	},


	/**
	 * @private
	 * Builds and retuns a FormData object
	 */
	buildFormData: function () {
		var body = this.get('body') || [],
			formData = new FormData();

		// Loop through the body and append all the file to the formData
		body.forEach(function (part) {
			if (part && part.file) {
				formData.append(part.name, part.file, (part.file || {}).name);

				// NOTE: We need to clean up the File part, since we don't want to be part of the __json__ key
				// Note that we only needed to use it above where we append it to the formData object.
				delete part.file;
			}
		});

		let data = this.asJSON() || {};

		// NOTE: To support submitting a multi-part form,
		// the regular content of a note will be set in a json field.
		formData.append('__json__', JSON.stringify(data));

		return formData;
	}
});
