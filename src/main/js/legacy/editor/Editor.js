var Ext = require('extjs');
var AnnotationUtils = require('../util/Annotations');
var DomUtils = require('../util/Dom');
var ParseUtils = require('../util/Parsing');
var RangeUtils = require('../util/Ranges');
var SharingUtils = require('../util/Sharing');
var {guidGenerator} = require('legacy/util/Globals');
const Globals = require('legacy/util/Globals');
require('legacy/common/form/fields/FilePicker');
require('legacy/model/RelatedWork');


Ext.define('NextThought.editor.AbstractEditor', {
	extend: 'Ext.Component',
	enableShareControls: false,
	enablePublishControls: false,
	enableTextControls: true,
	enableObjectControls: true,
	enableTags: false,
	enableTitle: false,
	enableWhiteboards: true,
	enableVideo: false,
	enableSaveControls: true,
	saveButtonLabel: 'Save',
	cancelButtonLabel: 'Cancel',
	placeholderText: 'Type a message...',
	ui: 'editor',
	cls: 'editor',
	headerTplOrder: '{toolbar}{title}',

	titleTpl: Ext.DomHelper.markup(
		[
			{tag: 'tpl', 'if': 'enableTitle', cn: {
				cls: 'title title-container',
				cn: [
					{tag: 'input', tabIndex: -1, type: 'text', placeholder: 'Title...'}
				]
			}}
		]),

	renderSelectors: {
		saveButtonEl: '.action.save',
		saveControlsEl: '.save-controls'
	},

	toolbarTpl: Ext.DomHelper.markup(
		[
			{
				cls: 'aux', cn: [
				{tag: 'tpl', 'if': 'enableShareControls', cn: {
					cls: 'recipients'
				}},
				{tag: 'tpl', 'if': 'enablePublishControls', cn: {
					cls: 'action publish on'
				}},
				{tag: 'tpl', 'if': 'enableTags', cn: {
					cls: 'tags'
				}}
				]
			}
		]),

	renderTpl: Ext.DomHelper.markup(
		[
			'{header}',
			{tag: 'form', cls: 'common-form', enctype: '{enctype}', autocomplete: '{autocomplete}', 'novalidate': true, name: '{name}', cn: [
				{
					cls: 'main',
					cn: [
						'{extra}',
						{
							cls: 'content show-placeholder scrollable',
							'data-placeholder': '{placeholderText}',
							contentEditable: true,
							unselectable: 'off',
							tabIndex: -1,
							cn: [
								{ //inner div for IE
									//default value (U+2060 -- allow the cursor in to this placeholder div, but don't take any space)
									html: '\u2060'
								}
							]
						},
						{cls: 'dropzone', cn: [
							{tag: 'input', type: 'file'}
						]}
					]
				}
			]}
			, {
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [
						{ tag: 'tpl', 'if': 'enableTextControls', cn: {
							cls: 'action text-controls', 'data-qtip': 'Formatting Options', cn: {
								cls: 'popctr', cn: {
									cls: 'popover', cn: [
										{cls: 'control bold', tabIndex: -1, 'data-qtip': 'Bold'},
										{cls: 'control italic', tabIndex: -1, 'data-qtip': 'Italic'},
										{cls: 'control underline', tabIndex: -1, 'data-qtip': 'Underline'}
									]
								}
							}
						}},
						{ tag: 'tpl', 'if': 'enableObjectControls', cn: {
							cls: 'action object-controls', 'data-qtip': 'Insert Object', cn: {
								cls: 'popctr', cn: {
									cls: 'popover', cn: [
										{ cls: 'control whiteboard', 'data-qtip': 'Create a whiteboard' },
										{ tag: 'tpl', 'if': 'enableVideo', cn: { cls: 'control video', 'data-qtip': 'Embed a video' } },
										{ tag: 'tpl', 'if': 'enableFileUpload', cn: [
											{cls: 'control upload', 'data-qtip': 'Add an Attachment', cn: [
												{ tag: 'input', type: 'file'}
											]}
										]}
									]
								}
							}
						}}
					]
				},
				{
					cls: 'right save-controls',
					cn: [
						{cls: 'action save', html: 'Save'},
						{cls: 'action cancel', html: 'Cancel'}
					]
				}
			]
			}
		]),

	supportedTypingAttributes: ['bold', 'underline', 'italic'],

	//default value (U+200B -- allow the cursor into the placeholder div, but don't take any space)
	defaultValue: '\u200B',

	REGEX_INITIAL_CHAR: /\u200B|\u2060/ig,

	//used to identify and strip out

	wbThumbnailTpm: Ext.DomHelper.createTemplate(
		{
			contentEditable: false,
			cls: 'whiteboard-divider',
			unselectable: 'on',
			cn: [
				{
					cls: 'whiteboard-wrapper',
					onclick: 'void(0)',
					cn: [
						{
							tag: 'img',
							src: '{0}',
							id: '{1}',
							cls: 'wb-thumbnail object-part',
							alt: 'Whiteboard Thumbnail',
							unselectable: 'on',
							border: 0
						},
						{
							cls: 'fill', unselectable: 'on'
						},
						{
							cls: 'centerer',
							unselectable: 'on',
							cn: [
								{
									unselectable: 'on',
									cls: 'edit',
									html: 'Edit'
								}
							]
						}
					]
				}
			]
		}).compile(),

	// FIXME: copied from above but we probably don't need all this
	videoThumbnailTpm: Ext.DomHelper.createTemplate({
		id: '{1}',
		cls: 'video-thumbnail object-part body-divider',
		alt: 'Embedded Video Thumbnail',
		unselectable: 'on',
		border: 0
	}).compile(),

	unknownPartTemplate: Ext.DomHelper.createTemplate({
		contentEditable: false,
		id: '{1}',
		cls: 'object-part unknown body-divider',
		unselectable: 'on'
	}).compile(),

	// TODO: all this part related stuff should end up in mixins or objects or something.
	// this doesn't seem particularily scalable.
	objectThumbnailTemplates: {
		'application/vnd.nextthought.canvas': 'wbThumbnailTpm',
		'application/vnd.nextthought.embeddedvideo': 'videoThumbnailTpm'
	},

	onThumbnailInsertedMap: {
		'application/vnd.nextthought.canvas': 'onWhiteboardThumbnailInserted',
		'application/vnd.nextthought.embeddedvideo': 'onVideoThumbnailInserted'
	},

	partConverters: {
		'<img.+wb-thumbnail.+?>': 'whiteboardPart',
		'.+?video-thumbnail.+?>': 'videoPart'
	},

	partRenderer: {
		'application/vnd.nextthought.canvas': 'addWhiteboard',
		'application/vnd.nextthought.embeddedvideo': 'addVideo',
		'application/vnd.nextthought.contentfile': 'setAttachmentPreviewFromModel'
	},

	tabTpl: Ext.DomHelper.createTemplate({html: '\t'}).compile(),

	attachmentPreviewTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'space', html: '{placeholder}'},
		{ cls: 'attachment-part preview', contentEditable: 'false', 'data-fileName': '{filename}', 'name': '{name}', cn: [
			{ cls: 'thumbnail', cn: [
				{ cls: 'preview {type}', style: 'background-image: url(\'{url}\');'}
			]},
			{ cls: 'meta', cn: [
				{ cls: 'text', cn: [
					{ tag: 'span', cls: 'title', html: '{filename}'},
					{ tag: 'span right', cls: 'size', html: '{size}'}
				]},
				{ cls: 'controls', cn: [
					{ tag: 'span', cls: 'delete', 'data-action': 'delete', html: 'Delete'}
				]}
			]}
		]},
		{ cls: 'space', html: '{placeholder}'}
	])),

	AttachmentMap: {},
	ObjectURLMap: {},

	onClassExtended: function (cls, data) {
		//Allow subclasses to override render selectors, but don't drop all of them if they just want to add.
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);

		//allow a header template to be defined
		data.headerTpl = data.headerTpl || cls.superclass.headerTpl || false;
		data.titleTpl = data.titleTpl || cls.superclass.titleTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's templates
		var tpl = this.prototype.renderTpl.replace('{header}', data.headerTpl || ''),
			o = data.headerTplOrder || this.prototype.headerTplOrder || '',
			topTpl = o.replace('{title}', data.titleTpl || '')
				.replace('{toolbar}', data.toolbarTpl || '');

		tpl = tpl.replace('{extra}', topTpl || '');


		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},

	beforeRender: function () {
		this.maybeResizeContentBox = Ext.Function.createBuffered(this.maybeResizeContentBox, 400);//typical key press spacing?
		this.callParent(arguments);

		this.enableVideo = this.enableVideo && Service.canEmbedVideo();

		this.renderData = Ext.apply(this.renderData || {}, {
			cancelLabel: this.cancelButtonLabel,
			saveLabel: this.saveButtonLabel,
			enableShareControls: Boolean(this.enableShareControls),
			enablePublishControls: Boolean(this.enablePublishControls),
			enableTextControls: Boolean(this.enableTextControls),
			enableObjectControls: Boolean(this.enableObjectControls),
			enableTags: Boolean(this.enableTags),
			enableTitle: Boolean(this.enableTitle),
			enableWhiteboards: Boolean(this.enableWhiteboards),
			enableVideo: Boolean(this.enableVideo),
			enableFileUpload: Boolean(this.enableFileUpload),
			placeholderText: this.placeholderText,
			enctype: this.enctype || 'multipart/form-data',
			autocomplete: this.autocomplete || 'off',
			name: this.formName || 'form'
		});

		if (this.enableShareControls || this.enablePublishControls) {
			this.addCls('with-controls');
		}
	},

	afterRender: function () {
		var aux;

		this.callParent(arguments);
		this.setupEditor();

		this.mon(this.el.down('.action.cancel'), 'click', this.onCancel, this);
		this.mon(this.saveButtonEl, 'click', function (e) {
			if (e.getTarget('.disabled')) {
				e.stopEvent();
				return;
			}
			this.onSave(e);
		}, this);

		//Hide it, if it's empty.
		aux = this.el.down('.aux');
		if (aux && !aux.dom.hasChildNodes()) {
			aux.remove();
		}

		this.mon(Ext.getBody(), 'click', 'hidePopovers');

		this.maybeEnableSave();

		if (!this.enableSaveControls) {
			this.saveControlsEl.hide();
		}
		if (this.enableFileUpload) {
			this.on('destroy', this.clearAttachmentFilesParts.bind(this));
		}
	},

	showTitle: function () {
		var title = this.el.down('.title-container');

		if (title) {
			title.removeCls('x-hidden');
		}
	},

	hideTitle: function () {
		var title = this.el.down('.title-container');

		if (title) {
			title.addCls('x-hidden');
		}
	},

	clearError: function (el) {
		if (!el) {
			el = this.el.down('.content');
		}
		if (!el) {
			return;
		}
		el.set({'data-error-tip': undefined});
		Ext.defer(el.removeCls, 1, el, ['error-tip']);
	},

	markError: function (el, message) {
		el.addCls('error-tip').set({'data-error-tip': message});
	},

	onCancel: function (e) {
		e.stopEvent();
		this.deactivate();

		if (!this.isDestroyed) {
			this.setValue('');
		}

		if (this.sharedList) {
			this.sharedList.pickerView.hide();
		}
	},

	onSave: function (e) {
		e.stopEvent();
		var v = this.getValue();

		if (DomUtils.isEmpty(v.body)) {
			if (!this.fireEvent('no-body-content', this, this.contentEl)) {
				this.markError(this.contentEl, 'You need to type something');
				return;
			}
		}

		if (this.titleEl && Ext.isEmpty(v.title)) {
			if (!this.fireEvent('no-title-content', this, this.titleEl)) {
				this.markError(this.titleWrapEl, 'You need a title');
				this.titleWrapEl.addCls('error-on-bottom');
				return;
			}
		}

		this.fireEvent('save', this, this.record, v, this.saveCallback || Ext.emptyFn);
	},

	setupEditor: function () {
		var me = this,
			el = me.el,
			scrollParentEl = Ext.getBody(),
			Ce = Ext.CompositeElement,
			tabTracker = new NextThought.util.TabIndexTracker();

		me.trackedParts = {};

		// tab tracking is different depending on whether we're editing a blog or
		// editing an annotation. the field layout changes. maybe it should be the same?
		// funky

		if (el.up('.blog')) {
			me.setupTitleEl(me, tabTracker);
			me.setupSharedListEl(me, tabTracker, scrollParentEl);
		} else {
			me.setupSharedListEl(me, tabTracker, scrollParentEl);
			me.setupTitleEl(me, tabTracker);
		}

		me.tagsEl = el.down('.tags');
		if (me.tagsEl) {
			me.tags = Ext.widget('tags', {renderTo: me.tagsEl, tabIndex: tabTracker.next()});
			me.on('destroy', 'destroy', me.tags);
			me.mon(me.tags, 'blur', function () {
				var e = el.down('.content');
				Ext.defer(e.focus, 10, e);
			});
		}

		me.publishEl = el.down('.action.publish');
		if (me.publishEl) {
			me.mon(me.publishEl, 'click', function togglePublish (e) {
				var action = e.getTarget('.on') ? 'removeCls' : 'addCls';
				me.publishEl[action]('on');
			});
		}

		(new Ce(el.query('.action:not([tabindex]),.content'))).set({tabIndex: tabTracker.next()});

		me.objectControlsEl = el.down('.action.object-controls');
		if (me.objectControlsEl) {
			me.objectControlsEl.set({'data-tiptext': me.objectControlsEl.getAttribute('data-qtip')});
			me.mon(me.objectControlsEl, 'click', me.toggleObjectsPopover, me);
		}

		me.styleControlsEl = el.down('.action.text-controls');
		if (me.styleControlsEl) {
			me.styleControlsEl.set({'data-tiptext': me.styleControlsEl.getAttribute('data-qtip')});
			me.mon(me.styleControlsEl, 'click', me.showStylePopover, me);
		}
		me.mon(new Ce(el.query('.left .action')), {
			scope: me,
			click: me.editorContentAction
		});

		me.mon(new Ce(el.query('.text-controls .control')), {
			scope: me,
			click: me.fontStyleAction
		});

		me.mon(el, {
			scope: me,
			mousedown: me.editorMouseDown,
			click: function (e) {
				var content = el.down('.content'),
					oldScroll = content.getScroll();

				if (!e.getTarget('.content') && !e.getTarget('.action')) {
					content.focus();
					content.scrollTo('top', oldScroll.top);
					me.collapseToEnd();
				}
			}
		});

		me.contentEl = el.down('.content');
		me.contentEl.selectable();

		me.mon(me.el, {
			keydown: function (e) {
				var v;
				if (e.getKey() === e.ESC) {
					e.stopPropagation();
					v = me.getValue();
					if (Ext.isEmpty(v.body) && Ext.isEmpty(v.title)) {
						me.onCancel(e);
					}
				}
			}
		});

		function stop (e) {e.stopPropagation();}
		me.mon(me.contentEl, {
			scope: me,
			keydown: 'onKeyDown',
			keyup: 'onKeyup',
			paste: 'handlePaste',
			click: 'handleClick',
			drop: 'handleDrop',
			contextmenu: 'handleContext',
			mouseup: 'onMouseUp',
			mousedown: stop,
			mousemove: stop
		});

		me.on('destroy', function () {
			Ext.Object.each(me.trackedParts, function (k, v) {
				if (v && v.destroy) {
					v.destroy();
				}
			});
		});

		me.typingAttributes = [];

		if (this.enableFileUpload) {
			this.setupFileUploadField();
		}
	},

	moveCursorToEnd: function (el) {
		//this is only for input/textarea elements
		var range, selection;
		el = Ext.getDom(el);
		if (typeof el.selectionStart === 'number') {
			el.selectionStart = el.selectionEnd = el.value.length;
		}
		else if (el.createTextRange !== undefined) {
			el.focus();
			range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
		else if (document.createRange) {
			range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			try {
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}
	},

	setupSharedListEl: function (cmp, tabTracker, scrollParentEl) {
		var me = this, userTokenField, tokens, inputArea, tokenInputWrap, tokenInput;
		me.sharedListEl = me.el.down('.recipients');
		if (me.sharedListEl) {
			if (Service.canShare()) {
				me.sharedList = Ext.widget('user-sharing-list', {
					renderTo: me.sharedListEl,
					scrollParentEl: scrollParentEl,
					tabIndex: tabTracker && tabTracker.next(),
					ownerCls: this.xtype,
					value: me.sharingValue

				});

				if (!SharingUtils.canSharePublicly()) {
					me.sharedList.setDisabled('disabled');
				}

				this.on('destroy', 'destroy', me.sharedList);
				this.mon(me.sharedList, 'cancel-indicated', function () {
					this.fireEvent('cancel');
				}, me);
				this.mon(me.sharedList, 'sync-height', function () {
					this.maybeResizeContentBox();
				}, me);
			} else {
				(me.sharedListEl.up('.aux') || me.sharedListEl).remove();
			}
		}
	},

	stop: function (e) { e.stopPropagation(); },

	setupTitleEl: function (me, tabTracker) {
		me.titleWrapEl = me.el.down('.title');
		me.titleEl = me.el.down('.title input');
		if (me.titleEl) {
			me.titleEl.set({tabIndex: tabTracker.next()});
			me.mon(me.titleEl, {
				click: 'stop',
				mousedown: 'stop',
				keypress: 'stop',
				keyup: 'stop',
				keydown: function (e) {
					var t = e.getTarget();
					Ext.callback((t || {}).setAttribute, t, ['value', t.value], 1);
					e.stopPropagation();
					me.clearError(me.titleWrapEl);
				}
			});
		}
	},


	setupFileUploadField: function() {
		if (!this.enableFileUpload) { return; }

		let dom = this.el.dom,
			input = dom && dom.querySelector('.control.upload input'),
			dragInput = dom && dom.querySelector('.main'),
			dropzone = dom && dom.querySelector('.dropzone input');

		if (input) {
			input.addEventListener('change', this.onFileInputChange.bind(this));
		}
		if (dragInput) {
			dragInput.addEventListener('dragenter', this.onDragEnter.bind(this));
			dragInput.addEventListener('dragend', this.onDragLeave.bind(this));
		}
		if (dropzone) {
			dropzone.addEventListener('change', this.onFileInputChange.bind(this));
		}
	},


	onFileInputChange: function (e) {
		var input = e.target,
			file = input && input.files && input.files[0],
			parentEl = Ext.fly(input).up('.dropzone');

		if (parentEl) {
			parentEl.removeCls('active');
		}

		e.preventDefault();
		if (file && (!this.accepts || file.type.match(this.accepts))) {
			this.onFileChange(file);
		}
	},


	onFileChange: function (file) {
		var guid = guidGenerator();

		// Add the file to the attachment map
		this.AttachmentMap[guid] = file;

		// TODO: Check and warn about the size
		this.setAttachmentPreviewFromInput(file, guid);
	},


	setAttachmentPreviewFromInput: function (file, name) {
		if (!this.rendered) {
			this.on('afterrender', this.setAttachmentPreviewFromInput.bind(this, file));
			return;
		}

		let content = this.el.down('.content'),
			tpl = this.attachmentPreviewTpl,
			size = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(parseFloat(file.size), 1),
			href = this.getFileIconURLFromFile(file, name),
			type = file.type.split('/').last() || '',
			data = {size: size, url: href, filename: file.name, name: name, type: type, placeholder: this.defaultValue},
			focusNode, isSelectionInContent;

		//Need to see if we have a selection and it is in our content element
		if (document && document.getSelection) {
			focusNode = document.getSelection().focusNode;
			focusNode = focusNode ? Ext.fly(focusNode) : null;
			isSelectionInContent = focusNode && (focusNode.is('.content') || focusNode.parent('.content', true));
		}

		if (focusNode && isSelectionInContent) {
			this.insertPartAtSelection(tpl.apply(data));
		} else {
			tpl.append(content, data);
		}
	},


	isImage: function (type) {
		return (/[\/\.](gif|jpg|jpeg|tiff|png)$/i).test(type);
	},


	getFileIconURLFromFile: function (file, name) {
		let type = file && file.type,
			isImage = this.isImage(type),
			href;

		if (isImage) {
			href = this.createObjectURL(file, name);
		}
		else {
			href = NextThought.model.RelatedWork.getIconForMimeType(type);
		}

		return href;
	},


	getFileIconURLFromValue: function (model) {
		let data = model && model.isModel ? model.getData() : model,
			type = data.contentType || data.FileMimeType,
			isImage = this.isImage(type), href;

		if (isImage) {
			href = data.url;
		} else {
			href = NextThought.model.RelatedWork.getIconForMimeType(type);
		}

		return href;
	},


	setAttachmentPreviewFromModel: function (model) {
		if (!this.rendered) {
			this.on('afterrender', this.setAttachmentPreviewFromModel.bind(this, model));
			return;
		}

		let data = model && model.isModel ? model.getData() : model,
			content = this.el.down('.content'),
			tpl = this.attachmentPreviewTpl,
			size = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(parseFloat(data.size), 1),
			url = this.getFileIconURLFromValue(data),
			type = data.contentType || data.FileMimeType || '';

		data = Ext.clone(data);
		data.url = url;
		data.type = type.split('/').last() || '';
		data.placeholder = this.defaultValue;

		if (size) {
			data.size = size;
		}

		tpl.append(content, data);
	},


	createObjectURL: function (file, name) {
		var url = Globals.getURLObject();

		this.cleanUpObjectURL(name);

		if (!url) { return null; }

		this.ObjectURLMap[name] = url.createObjectURL(file);

		return this.ObjectURLMap[name];
	},


	cleanUpObjectURL: function (name) {
		var url = Globals.getURLObject(),
			objectURL;

		if (name) {
			objectURL = this.ObjectURLMap[name];
			if (objectURL && url) {
				url.revokeObjectURL(objectURL);
				delete this.ObjectURLMap[name];
			}
		}
		else {
			for (let key in this.ObjectURLMap) {
				if (this.ObjectURLMap.hasOwnProperty(key)) {
					objectURL = this.ObjectURLMap[key];
					if (objectURL && url) {
						url.revokeObjectURL(objectURL);
					}
					delete this.ObjectURLMap[key];
				}
			}
		}
	},


	onDragEnter: function (e) {
		let dom = this.el && this.el.dom,
			dragInput = dom && dom.querySelector('.dropzone');

		e.preventDefault();
		e.stopPropagation();

		if (dragInput) {
			Ext.fly(dragInput).addCls('active');
		}
	},


	onDragLeave: function (e) {
		let dom = this.el && this.el.dom,
			dragInput = dom && dom.querySelector('.dropzone');

		e.preventDefault();
		e.stopPropagation();

		if (dragInput) {
			Ext.fly(dragInput).removeCls('active');
		}
	},


	onDrop: function (e) {
		e.preventDefault();
	},


	activate: function () {
		this.maybeEnableSave();
		this.el.addCls('active');
		this.fireEvent('activated-editor', this);
	},

	isActive: function () {
		return this.el && this.el.hasCls('active');
	},

	disable: function () {
		this.deactivate();
		this.el.addCls(['active', 'disabled']);
		this.el.down('.content').set({'contenteditable': undefined});
	},

	enable: function () {
		this.el.removeCls('disabled');
		this.el.down('.content').set({'contenteditable': 'true'});
	},

	deactivate: function () {
		this.el.removeCls('active');
		this.lastRange = null;
		this.cleanTrackedParts();
		this.clearError();
		this.fireEvent('deactivated-editor', this);
	},

	handleContext: function (e) {
		e.stopPropagation();
		return true;
	},

	handlePaste: function (e, elem) {

		elem = e.getTarget('.content', Number.MAX_VALUE);
		if (!elem) {
			console.log('Could not paste, the target was not found:', e.getTarget());
			e.stopEvent();
			return false;
		}
		var be = e.browserEvent,
			cd = be ? be.clipboardData : null,
			sel = window.getSelection(), types,
			savedRange = RangeUtils.saveRange(sel.getRangeAt(0)),
			docFrag = document.createDocumentFragment(),
			offScreenBuffer = document.createElement('div');

		docFrag.appendChild(offScreenBuffer);

		e.stopEvent();

		offScreenBuffer.innerHTML = '[Unsupported Clipboard Data]';

		if (cd && cd.getData) {
			types = Ext.toArray(cd.types).toString();

			if (/text\/html/.test(types)) {
				offScreenBuffer.innerHTML = DomUtils.sanitizeExternalContentForInput(cd.getData('text/html'));
			}
			else if (/text\/plain/.test(types)) {
				offScreenBuffer.innerHTML = cd.getData('text/plain');
			}
		} else if (window.clipboardData) {//IE
			offScreenBuffer.innerHTML = window.clipboardData.getData('Text');
		}

		this.processPaste(offScreenBuffer, savedRange, elem);

		this.maybeEnableSave();

		return false;
	},

	handleDrop: function (e) {
		var browserEvent = e.browserEvent,
			data = browserEvent && browserEvent.dataTransfer,
			files = data && data.files;

		if (files && files.length) {
			e.stopEvent();
		}
	},

	processPaste: function (offScreenBuffer, savedRange, elem) {
		Ext.fly(offScreenBuffer).select('script,meta,iframe').remove();

		var pasteData = offScreenBuffer.innerHTML, range, frag;

		try {
			range = RangeUtils.restoreSavedRange(savedRange);
		} catch (e) {
			console.log('Error recreating rangeDesc during processPaste.', savedRange, pasteData);
			document.body.removeChild(offScreenBuffer);
			return;
		}

		try {
			pasteData = pasteData
				.replace(/\s*(style|class)=".+?"\s*/ig, ' ')
				.replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;');

			frag = range.createContextualFragment(pasteData);
			range.deleteContents();
			range.insertNode(frag);
			range.collapse(false);

			this.lastRange = range;
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
		}
		catch (e2) {
			console.log(pasteData, e2);
		}
		elem.focus();
	},

	editorMouseDown: function (e) {
		var s = window.getSelection();
		if (e.getTarget('.action', undefined, true)) {
			if (s.rangeCount) {
				this.lastRange = s.getRangeAt(0);
			}
		}

		if (!e.getTarget('.content')) {
			if (e.getTarget('.action.object-controls')) {
				this.hideStylePopover();
			}
			if (e.getTarget('.action.text-controls')) {
				this.hideObjectsPopover();
			}
		}
	},

	editorFocus: function () {
		var s = window.getSelection();
		if (this.lastRange) {
			if (s.rangeCount > 0) {
				s.removeAllRanges();
			}
			s.addRange(this.lastRange);
		}
		else if (s.rangeCount > 0) {
			this.lastRange = s.getRangeAt(0);
		}
	},

	moveCaret: function (n, offset) {
		var s = window.getSelection(),
			range = document.createRange();

		if (typeof offset !== 'number') {
			range.selectNodeContents(n);
			range.collapse(false);
		}
		else {
			range.setStart(n, offset);
			range.setEnd(n, offset);
		}

		s.removeAllRanges();
		s.addRange(range);
	},

	detectAndFixDanglingNodes: function () {
		var s = window.getSelection(),
			n = s && s.focusNode,
			c = Ext.getDom(this.contentEl),
			acted = false;
		//detect elements that have fallen out of the nest
		Ext.each(c.childNodes, function (el) {
			if (!/^div$/i.test(el.tagName)) {
				acted = true;
				el = Ext.getDom(el);
				var div = document.createElement('div');
				c.insertBefore(div, el);
				div.appendChild(el);
			}
		});

		if (n && acted) {
			//Maybe a restore caret instead?
			this.moveCaret(n);
		}
	},

	onKeyDown: function (e) {
		try {
			var s = window.getSelection(),
				a = s && s.anchorNode,
				n = s && s.focusNode,
				o = s && s.focusOffset,
				ao = s && s.anchorOffset,
				v = n && n.nodeValue, r,
				modKey = e.altKey || e.ctrlKey,
				badRange = n === a && o === 0 && ao === 0 && n === this.contentEl.dom;

			this.detectAndFixDanglingNodes();
			if (badRange) {
				console.warn('Entire content editable area selected');
				n = AnnotationUtils.getTextNodes(n)[0];
				v = n && n.nodeValue;
			}

			if (e.getKey() === e.SPACE) {
				e.stopPropagation();
			}

			if (e.getKey() === e.TAB && n) {
				if (modKey) {
					//tab next
					this.el.down('.save').focus();
				}
				else if (e.shiftKey) {
					//tab back
					if (this.tags) {//may not be needed
						this.tags.focus();
					}
				}
				else {
					e.stopEvent();

					if (v === null && !Ext.isTextNode(n)) {
						r = s.getRangeAt(0);
						r.deleteContents();
						r.insertNode(document.createTextNode('\t'));
						this.moveCaret(n, o + 1);
						return false;
					}

					if (v) {
						v = v.substr(0, o) + '\t' + v.substr(o);
						n.nodeValue = v;
					}
					else if (!badRange) {
						console.warn('Replacing n from' + n);
						n = this.tabTpl.overwrite(n).firstChild;
						o = 0;
					}

					this.moveCaret(n, o + 1);
					return false;
				}
			}
			else if (e.getKey() === e.DELETE || e.getKey() === e.BACKSPACE) {

				if (Ext.isIE && a === n && a.childNodes[ao] === undefined && a.childNodes[ao - 1]) {
					s.removeAllRanges();
					r = document.createRange();
					r.selectNode(a.childNodes[ao - 1]);
					s.addRange(r);
				}
			}
			else if (e.getKey() === e.LEFT || e.getKey() === e.RIGHT) {
				//keeps the slides from transitioninng in the presentation view
				e.stopPropagation();
			}
		} catch (er) {
			console.error(er.stack || er.message || er);
		}

		this.hideStylePopover();
		this.hideObjectsPopover();
		return true;
	},

	onKeyup: function (e) {
		if (this.contentEl.hasCls('error-tip')) {
			this.clearError(this.contentEl);
		}

		this.maybeResizeContentBox();
		this.detectTypingAttributes(e);
		this.checkTrackedParts();
		this.maybeEnableSave();
	},

	onMouseUp: function (e) {
		e.stopPropagation();
		this.detectTypingAttributes(e);
	},

	maybeResizeContentBox: function () {
		if (!this.rendered || this.isDestroyed || !this.el) {
			return;
		}
		var p = this.previousEditorHeight || 0,
			h = this.el.getHeight();

		this.previousEditorHeight = h;

		// NOTE: we check if the previousEditorHeight is greater than zero to avoid trying
		// to update layout while in the middle of updating initial layout
		if (h !== p && p > 0) {
			this.updateLayout();
			this.fireEvent(h < p ? 'shrank' : 'grew');
			// TODO: In Safari 6, the editor resize but it doesn't paint properly upon
			// updateLayout( which makes the editor look like it's cut off). Thus, we force it to repaint itself.
			// It seems to be a browser-related bug. This can get a little expensive, thus we do it for Safari only.
			if (Ext.isSafari) {
				this.el.repaint();
			}
		}
	},

	syncTypingAttributeButtons: function () {
		var me = this,
			buttonsName = ['bold', 'italic', 'underline'];

		Ext.each(buttonsName, function (bn) {
			var b = me.el.down('.' + bn);
			if (b) {
				b[Ext.Array.contains(me.typingAttributes, bn) ? 'addCls' : 'removeCls']('selected');
			}
		});
	},

	setTypingAttributes: function (attrs, alreadyFocused) {
		var content = this.el.down('.content'),
			oldScroll = content.getScroll();

		this.typingAttributes = attrs.slice();
		if (!alreadyFocused) {
			content.focus();
			content.scrollTo('top', oldScroll.top);
			this.editorFocus();
		}
		this.syncTypingAttributeButtons();
		this.applyTypingAttributesToEditable();
	},

	getTypingAttributes: function () {
		if (!this.typingAttributes) {
			this.typingAttributes = [];
		}
		return this.typingAttributes;
	},

	applyTypingAttributesToEditable: function () {
		var actions = this.supportedTypingAttributes, me = this;
		Ext.each(actions, function (action) {
			if (document.queryCommandSupported(action) &&
				document.queryCommandState(action) !== Ext.Array.contains(me.getTypingAttributes(), action)) {
				document.execCommand(action, false, false);
			}
		});
	},

	editorContentAction: function (e) {
		var t = e.getTarget('.control', undefined, true);
		if (!t) {
			return;
		}

		if (t.is('.whiteboard')) {
			this.addWhiteboard();
		}
		else if (t.is('.video')) {
			this.addVideo();
		}
	},

	fontStyleAction: function (e) {
		var t = e.getTarget('.control', undefined, true), action;
		if (t) {
			action = (t.getAttribute('class') || '').split(' ')[1];
			this.toggleTypingAttribute(action);
		}
	},

	togglePopover: function (el, e) {
		if (e) {
			e.stopPropagation();
		}
		var state = el && el.hasCls('selected'),
			action = state ? 'removeCls' : 'addCls',
			tip = state ? el.getAttribute('data-tiptext') : undefined,
			content = this.el.down('.content'),
			oldScroll;


		if (el && !e.getTarget('.control')) {
			el[action]('selected');
			el.set({'data-qtip': tip});
	  //			Ext.QuickTipManager.getQuickTip().hide();
			oldScroll = content.getScroll();
			content.focus();
			content.scrollTo('top', oldScroll.top);
			this.editorFocus();
		}
	},

	hidePopover: function (el) {
		el.removeCls('selected');
		el.set({'data-qtip': el.getAttribute('data-tiptext')});
	},

	toggleObjectsPopover: function (e) {
		var t = e.getTarget('.action.object-controls', undefined, true);

		this.togglePopover(t, e);
	},

	hideObjectsPopover: function () {
		var t = this.el.down('.action.object-controls', undefined, true);
		if (t) {
			this.hidePopover(t);
		}
	},

	// better named toggle!
	showStylePopover: function (e) {
		var t = e.getTarget('.action.text-controls', undefined, true);

		this.togglePopover(t, e);
	},

	hideStylePopover: function () {
		var t = this.el.down('.action.text-controls', undefined, true);
		if (t) {
			this.hidePopover(t);
		}
	},

	hidePopovers: function () {
		this.hideStylePopover();
		this.hideObjectsPopover();
	},

	toggleTypingAttribute: function (action) {
		var attrs = this.getTypingAttributes().slice();
		if (Ext.Array.contains(attrs, action)) {
			Ext.Array.remove(attrs, action);
		}
		else {
			Ext.Array.push(attrs, action);
		}
		this.setTypingAttributes(attrs);
	},

	detectTypingAttributes: function (e) {
		var actions = this.supportedTypingAttributes, attrs = [];
		Ext.each(actions, function (action) {
			if (document.queryCommandState(action)) {
				attrs.push(action);
			}
		});
		this.setTypingAttributes(attrs, true);
	},

	handleClick: function (e) {
		var guid, p, fnName, mime,
			content = e.getTarget('.content'),
			t = e.getTarget('.object-part') || e.getTarget('.whiteboard-wrapper') || e.getTarget('.attachment-part');

		//make sure the content el gets focus when you click it, if its not already active
		//fixs issue where it would take two clicks to focus content from the usertokenfield
		if (content && content !== document.activeElement) {
			this.focus(true);
		}

		if (t && t.classList.contains('attachment-part')) {
			this.handleAttachmentPartAction(t, e);
			return;
		}

		if (t) {
			guid = t.getAttribute('id');
			if (!guid || guid.indexOf('ext-') === 0) {
				guid = Ext.fly(t).down('img').getAttribute('id');
			}

			p = this.trackedParts[guid];
			if (p) {
				if (!p.isDestroyed && p.show) {
					if (Ext.is.iOS) {
						content.blur();
					}
					p.show();
				}
				return;
			}


			p = this.getPart(Ext.getDom(guid).outerHTML);
			if (!p) {
				return;
			}

			mime = (p.data || p).MimeType;
			fnName = mime ? this.partRenderer[mime] || '' : undefined;
			if (fnName && Ext.isFunction(this[fnName])) {
				this[fnName](p, guid, true, e);
			}
		}
		else {
			this.detectTypingAttributes(e);
		}
	},


	handleAttachmentPartAction: function (parent, event) {
		var e = event.getTarget(),
			action = e && e.getAttribute && e.getAttribute('data-action'),
			name = parent && parent.getAttribute && parent.getAttribute('name'),
			dom = this.el && this.el.dom,
			input = dom && dom.querySelector('.control.upload input');

		event.stopEvent();

		if (action === 'delete' && name) {
			delete this.AttachmentMap[name];
			parent.remove();
			this.cleanUpObjectURL(name);
			if (input) {
				input.value = null;
			}
		}
	},


	checkTrackedParts: function () {
		var me = this;
		Ext.Object.each(this.trackedParts, function (guid) {
			if (!Ext.get(guid)) {
				if ((me.trackedParts[guid] || {}).isWhiteboardWindow) {
					me.removeWhiteboard(guid);
					me.fireEvent('droped-whiteboard', guid);
				}
			}
		});
	},

	removeWhiteboard: function (guid) {
		var w = this.trackedParts[guid],
			el = Ext.get(guid);

		if (el) {
			el.parent('.whiteboard-divider').remove();
		}
		if (w) {
			this.trackedParts[guid] = null;
		}

		// FIXME: is this comment still valid?
		//Note we don't remove the whiteboard from trackedParts here.
		//if the author does an undo and the dom elements get added back
		//we need to retain the model or we are in an inconsistent state
	},

	//This needs to go somewhere else
	createVideoPart: function (url, type) {
		return {
			Class: 'EmbeddedVideo',
			MimeType: 'application/vnd.nextthought.embeddedvideo',
			embedURL: url,
			type: type
		};
	},

	addVideo: function (data, guid, append, e) {
		data = data || (function () {
		}()); //force the falsy value of data to always be undefinded.

		var me = this;

		if (typeof guid !== 'string') {
			guid = guidGenerator();
		}

		if (!data || e) {
			Ext.widget('embedvideo-window', {
				url: (data || {}).embedURL,
				onEmbed: function (data) {
					var part = me.createVideoPart(data.embedURL, data.type);
					me.insertObjectThumbnail(me.el.down('.content'), guid, part, data, append/*, true*/);

				}
			}).show();
		}
		else {
			this.insertObjectThumbnail(me.el.down('.content'), guid, data, append);
		}
	},

	addWhiteboard: function (data, guid, append) {
		data = data || void undefined;//force the falsy value of data to always be undefinded.

		var me = this, wbWin, content;

		if (typeof guid !== 'string') {
			guid = guidGenerator();
		}
		if (this.trackedParts[guid]) {
			return;
		}

		if (Ext.is.iOS) {
			this.el.down('.content').blur();
		}

		//pop open a whiteboard:
		wbWin = Ext.widget('wb-window', { width: 802, value: data, closeAction: 'hide', cancelOnce: false });
		content = me.el.down('.content');
		//remember the whiteboard window:
		wbWin.guid = guid;
		this.trackedParts[guid] = wbWin;

		//Hide note nav-helper - to avoid it from being on top of the WB
		if (Ext.query('.nav-helper')[0]) {
			Ext.fly(Ext.query('.nav-helper')[0]).hide();
		}


		if (data) {
			me.insertObjectThumbnail(content, guid, wbWin.down('whiteboard-editor'), append);
		}

		//hook into the window's save and cancel operations:
		this.mon(wbWin, {
			save: function (win, wb) {
				data = wb.getValue();
				me.insertObjectThumbnail(content, guid, wb, append, true);
				if (Ext.query('.nav-helper')[0]) {
					Ext.fly(Ext.query('.nav-helper')[0]).show();
				}
				wbWin.hide();
			},
			cancel: function () {
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				if (!data) {
					me.cleanTrackedParts(guid);
					wbWin.close();
				}
			}
		});

		if (!data) {
			wbWin.show();
		}
	},

	__insertIntoRange: function (el, range) {
		var content = this.el.dom.querySelector('.content'),
			parent, i, node,
			potentialParents = content.childNodes,
			endContainer = range.endContainer,
			after;

		function insertAfter (n, target) {
			if (target.nextSibling) {
				content.insertBefore(n, target.nextSibling);
			} else {
				content.appendChild(n);
			}
		}

		potentialParents = Array.prototype.slice.call(potentialParents);

		if (potentialParents.length) {
			for (i = 0; i < potentialParents.length; i++) {
				node = potentialParents[i];

				if (node.contains && node.contains(endContainer)) {
					parent = node;
					break;
				}
			}
		} else {
			parent = content;
		}

		if (!parent) {
			console.error('Error: No Parent');

			// Since IE only supports the Node.contains on html Elements, not objects, it's possible
			// to end up with no parent. If so, use the content div.
			parent = content;
		}

		if (parent === content) {
			content.appendChild(el);
		} else {
			range.setEndAfter(parent);

			after = range.extractContents();

			insertAfter(el, parent);

			insertAfter(after, el);
		}
	},

	insertPartAtSelection: function (html) {
		var content = this.el.down('.content', true),
			sel, range, el,
			i, length,
			part;

		if (window.getSelection) {
			// IE9 and non-IE
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);

				range.deleteContents();
				range.collapse(false);

				el = document.createElement('div');
				el.innerHTML = html;

				if (Ext.fly(range.startContainer).hasCls('body-divider') || Ext.fly(range.startContainer).is('.body-divider *')) {
					part = Ext.fly(range.startContainer).up('.body-divider', false, true) || range.startContainer;

					//get the next sibling so insertBefore will be after the body divider
					part = part && part.nextSibling;

					//if there is a part, insert before it
					if (part) {
						content.insertBefore(el, part);
					} else {
					// otherwise just append it to the content
						content.appendChild(el);
					}
				} else {
					this.__insertIntoRange(el, range);
				}


				for (i = 0, length = el.childNodes.length; i < length; i++) {
					//insertBefore removes its from the child list so always insert the first one
					el.parentNode.insertBefore(el.firstChild, el);
				}

				range.selectNode(el.previousSibling);
				range.collapse(false);

				el.parentNode.removeChild(el);
			}
		}
		/*else if(document.selection && document.selection.type != "Control") {
		 // IE < 9
		 document.selection.createRange().pasteHTML(html);
		 }*/
		else {
			return false;
		}
		return true;
	},

	insertObjectThumbnail: function (content, guid, obj, append, scrollIntoView) {
		var me = this, re = me.REGEX_INITIAL_CHAR,
			el = Ext.get(guid),
			mime = (obj || obj.data).MimeType,
			placeholder,
			htmlCfg,
			handled = false,
			isSelectionInContent,
			focusNode,
			thumbTpl,
			onInsertedFn,
			callback;

		//We need empty divs to allow to insert text before or after an object.
		placeholder = Ext.DomHelper.createTemplate({html: me.defaultValue});

		if (!el) {

			Ext.each(content.query('> div'), function (n) {
				var v = n.firstChild === n.lastChild && n.firstChild && n.firstChild.nodeValue;
				if (v && (v.length === 1 && re.test(v))) {
					Ext.removeNode(n);
				}
			});

			//Focus the editor so that we have the selection we when we blured on
			//whatever click triggered this
			this.el.down('.content').focus();
			this.editorFocus();

			thumbTpl = me[me.objectThumbnailTemplates[mime] || ''];

			if (!thumbTpl) {
				thumbTpl = this.unknownPartTemplate;
			}

			htmlCfg = [
				{html: me.defaultValue},
				thumbTpl.apply(['', guid]) ,
				{html: me.defaultValue}
			];

			//Need to see if we have a selection and it is in our content element
			if (document && document.getSelection) {
				focusNode = document.getSelection().focusNode;
				focusNode = focusNode ? Ext.fly(focusNode) : null;
				isSelectionInContent = focusNode && (focusNode.is('.content') || focusNode.parent('.content', true));
			}

			if (!append && isSelectionInContent) {
				//If we support insertHTML use it
				handled = this.insertPartAtSelection(Ext.DomHelper.markup(htmlCfg));

				if (!handled) {
					console.log('Falling back to old style appending of thumbnail');
					Ext.DomHelper.append(content, htmlCfg);
				}
				else {
					console.log('Inserted thumbnail at selection');
				}

			}
			else {
				console.log('Appending thumbnail');
				Ext.DomHelper.append(content, htmlCfg);
			}

			el = content.down('#' + guid);
			if (el) {
				Ext.fly(el).unselectable();
			}
		}

		callback = Ext.Function.createBuffered(function callback (node) {
			me.fireEvent('size-changed');

			//Make sure save is enabled
			me.maybeEnableSave();
			me.hideObjectsPopover();

			//scroll them into view
			if (scrollIntoView && node) {
				Ext.defer(function () {
					node.scrollIntoView(me.el.down('.content'), false, true);
				}, 100);
			}
			me.focus(true);
			Ext.defer(me.maybeResizeContentBox, 1, me);

		},100, me);

		onInsertedFn = me.onThumbnailInsertedMap[mime];
		if (onInsertedFn && Ext.isFunction(me[onInsertedFn])) {
			me[onInsertedFn](obj, guid, placeholder, callback);
		}
		else {
			callback.call(me, Ext.get(guid));
		}
	},

	onWhiteboardThumbnailInserted: function (obj, guid, placeholder, callback) {
		var me = this;
		obj.getThumbnail(function (data) {
			var el = Ext.get(guid).up('.whiteboard-divider'),
				p = placeholder.insertBefore(el),
				wbt;

			el.remove();
			//recreate image with data
			wbt = me.wbThumbnailTpm.insertBefore(p, [data, guid], true);
			wbt.select('img').on('load', function () {
				me.fireEvent('size-changed');
				me.el.repaint();
			});
			wbt.unselectable();
			Ext.fly(p).remove();
			callback(wbt);
		});

	},

	onVideoThumbnailInserted: function (obj, guid, placeholder, callback) {
		var el = Ext.get(guid);
		if (el) {
			el.set({'data-href': obj.embedURL, 'data-type': obj.type});
		}
		callback(el);
	},

	cleanTrackedParts: function (guids) {
		var me = this;

		if (!guids) {
			guids = Ext.Object.getKeys(me.trackedParts);
		}

		if (!Ext.isArray(guids)) {
			guids = [guids];
		}

		Ext.each(guids, function (g) {
			var w = me.trackedParts[g];
			delete me.trackedParts[g];
			if (w && w.destroy) {
				w.destroy();
			}
		});

		this.clearAttachmentFilesParts();
	},


	clearAttachmentFilesParts: function () {
		// Empty the map.
		// this.AttachmentMap = {};
		for (let k in this.AttachmentMap) {
			if (this.AttachmentMap.hasOwnProperty(k)) {
				delete this.AttachmentMap[k];
			}
		}
		this.cleanUpObjectURL();
	},


	whiteboardPart: function (wp) {
		var me = this,
			m = wp.match(/id="(.*?)"/),
			id = m && m[1],
			wb = id && me.trackedParts[id],
			ed = wb && wb.getEditor();
		return ed && ed.getValue();
	},

	videoPart: function (vp) {
		var hrefRegex = /.*?data-href="(.*?)".*?/,
			typeRegex = /.*?data-type="(.*?)".*?/,
			href = hrefRegex && hrefRegex.exec(vp)[1],
			type = typeRegex && typeRegex.exec(vp)[1];


		if (!href || !type) {
			return null;
		}
		return this.createVideoPart(href, type);
	},

	unknownPart: function (up) {
		var me = this,
			m = up.match(/id="(.*?)"/),
			id = m && m[1];
		return id && me.trackedParts[id];
	},

	getPart: function (part) {
		var me = this, p;

		function convert (regex, fn) {
			if (new RegExp(regex, 'i').test(part) && me[fn]) {
				p = me[fn](part);
			}
			return !p; //Stop iterating (return false) if we found something
		}

		Ext.Object.each(me.partConverters, convert);
		return p;
	},

	getBody: function (parts) {
		var r = [], me = this,
			objectPartRegex = /class=".*object-part.*"/i,
			i, p, part;


		function stripTrailingBreak (text) {
			return text.replace(/<br\/?>$/i, '').replace(me.REGEX_INITIAL_CHAR, '');
		}

		parts = parts || [];

		for (i = 0; i < parts.length; i++) {
			p = null;//reset after each iteration.
			part = parts[i];
			//if its a whiteboard do our thing
			if (objectPartRegex.test(part)) {
				p = this.getPart(part);
				if (!p) {
					p = this.unknownPart(part);
				}

				if (p) {
					r.push(p);
				}
			}

			// if it's an attachment, handle it appropriately
			if (part instanceof Object && part.MimeType) {
				p = part;
				r.push(p);
			}

			if (!p) {
				part = stripTrailingBreak(part);
				//if this is the first part or the thing before us
				//is not an array push this part as an array,
				//otherwise push us onto the previos part which should be an array
				if (r.length === 0 || !Ext.isArray(r[r.length - 1])) {
					r.push([part]);
				}
				else {
					r[r.length - 1].push(part);
				}
			}
		}

		//Now make a pass over r joining any multiple text parts by <br>
		for (i = 0; i < r.length; i++) {
			if (Ext.isArray(r[i])) {
				r[i] = r[i].join('<br/>');
			}
		}

		r = r.filter(function (i) {
			var tmp;

			if (!Ext.isString(i)) {
				return true;
			}

			if (Ext.isEmpty(i)) {
				return false;
			}
			//if we are just whitespace and html whitespace
			tmp = i.replace(/<br\/?>/ig, '');
			return !Ext.isEmpty(tmp.trim());
		});

		return r;
	},

	collapseToEnd: function () {
		var s, me = this,
			c = Ext.getDom(me.el.down('.content')), r,
			content = c && c.innerHTML;
		if (content) {
			try {
				s = window.getSelection();
				r = document.createRange();
				r.selectNodeContents(c.lastChild);
				s.removeAllRanges();
				r.collapse(false);
				me.lastRange = r;
				s.addRange(me.lastRange);

			}
			catch (e) {
				console.warn('focus issue: ' + e.message, '\n\n\n', content);
			}
		}
	},

	focus: function (collapse) {
		var content = this.el.down('[contenteditable=true]'),
			oldScroll = content.getScroll();

		content.focus();
		content.scrollTo('top', oldScroll.top);

		if (collapse) {
			this.collapseToEnd();
		}
	},

	maybeEnableSave: function (silent) {
		function isNoteBodyEmpty () {
			var d = Ext.getDom(me.el.down('.content')),
				html = d && d.innerHTML,
				parts = d && d.querySelectorAll('.object-part');

			return {
				clearPlaceholder: parts.length > 0 || !DomUtils.isEmpty(html),
				enableSave: parts.length > 0 || !DomUtils.isEmpty(html)
			};
		}

		var me = this, body,
			r = isNoteBodyEmpty(),
			cls = 'disabled',
			forceSubmissionCheck = false;

		if (r.enableSave && this.saveButtonEl.hasCls(cls)) {
			this.saveButtonEl.removeCls(cls);
		}

		if (!r.enableSave && !this.saveButtonEl.hasCls(cls)) {
			this.saveButtonEl.addCls(cls);
			body = me.getBodyValue();

			// If the body has just been cleared, then we want to force checking submission state.
			// This will make sure that the question is now considered as non answered.
			forceSubmissionCheck = true;

			if (body.length <= 1 && Ext.isEmpty(body[0])) {
				me.setValue('', true);
			}

		}

		this.fireEvent('enable-save', r.enableSave, silent, forceSubmissionCheck);

		this.contentEl[r.clearPlaceholder ? 'removeCls' : 'addCls']('show-placeholder');
	},

	editBody: function (body, silent) {
		var me = this,
			c = Ext.getDom(this.el.down('.content'));

		if (body && body.length > 0) {
			c.innerHTML = '';
		}
		Ext.each(body, function (part) {
			var d = document.createElement('div'),
				mime, fnName;
			if (typeof part === 'string') {
				d.innerHTML += part.replace(me.REGEX_INITIAL_CHAR, '');
				c.appendChild(d);
			}
			else {
				//Ok its some part.	 Look it up in our registry
				mime = (part.data || part).MimeType;
				fnName = mime ? me.partRenderer[mime] || '' : undefined;
				if (fnName && Ext.isFunction(me[fnName])) {
					me[fnName](part, undefined, true);
				}
				else {
					//TODO Shoot a part we don't understand.  We need to be graceful
					//to this, but all we can do here is drop it.  Problem with that is
					//when we save we gather the parts out of content and dropping it here
					//means dropping for good.	How should we prevent this.	 One idea
					//is we keep an array of parts we don't understand.	 Render them as a ?
					//or something and then on save we can index into the array and make sure
					//we don't drop misunderstood parts.  What do you think J?
					console.warn('Found a part we don\'t understand.  Inserting placeholder', part);
					me.injectUnknownPart(part);
				}
			}
		});

		Ext.fly(c).select('a[href]').set({target: '_blank'});
		this.maybeEnableSave(silent);
		return me;
	},

	injectUnknownPart: function (part) {
		var me = this, guid = guidGenerator();

		this.trackedParts[guid] = part;

		//Hide note nav-helper - to avoid it from being on top of the WB
		if (Ext.query('.nav-helper')[0]) {
			Ext.fly(Ext.query('.nav-helper')[0]).hide();
		}

		me.insertObjectThumbnail(me.el.down('.content'), guid, part, true);
	},

	getBodyValue: function () {
		//Sanitize some new line stuff that various browsers produce.
		//See http://stackoverflow.com/a/12832455 and http://jsfiddle.net/sathyamoorthi/BmTNP/5/
		var out = [],
			sel = this.el.select('.content > *'),
			reInitialChar = this.REGEX_INITIAL_CHAR, me = this;

		sel.each(function (div) {
			var html, parsed, tmp, dom;
			try {
				//don't let manipulations here effect the dom
				dom = Ext.getDom(div).cloneNode(true);
				div = Ext.fly(dom, '__editer-flyweight');
				html = div.getHTML() || '';

				if (div.is('.attachment-part')) {
					html = me.getAttachmentPart(div);
					out.push(html);
					return true;
				}

				if (div.is('.object-part')) {
					html = '';
					dom = Ext.getDom(div);
				}
				else {
					div = div.down('.object-part');
					if (div) {
						html = '';
						dom = Ext.getDom(div);
					}
				}

				if (!html && Ext.fly(dom).hasCls('object-part')) {
					tmp = document.createElement('div');
					tmp.appendChild(dom);
					html = tmp.innerHTML || '';
				}
				parsed = html.replace(reInitialChar, '');

				//if the html was only the no width space don't add it to the parts
				if (!(html.length === 1 && parsed.length === 0)) {
					out.push(html);
				}
			}
			catch (er) {
				console.warn('Oops, ' + er.message);
			}
		});

		return out;
	},


	getAttachmentPart: function (el) {
		var name = el && el.getAttribute && el.getAttribute('name'), part;

		if (this.record) {
			let body = this.record.get('body') || [];

			body.forEach(function (p) {
				if (p.name === name) {
					part = p;
					return false;
				}
			});
		}

		if (!part) {
			part = {
				MimeType: 'application/vnd.nextthought.contentfile',
				filename: el && el.getAttribute && el.getAttribute('data-fileName'),
				name: name,
				file: this.AttachmentMap[name]
			};
		}
		return part;
	},


	/**
	 * Returns the value of the editor.
	 * If it has file attached to it, it will return a FormData
	 * Otherwise, it will return the regular json object.
	 *
	 */
	getValue: function () {
		return {
			body: this.getBody(this.getBodyValue()),
			sharingInfo: this.sharedList ? this.sharedList.getValue() : null,
			publish: this.getPublished(),
			title: this.titleEl ? this.titleEl.getValue() : undefined,
			tags: this.tags ? this.tags.getValue() : undefined
		};
	},


	// TO BE overriden but subclasses
	getMimeType: function () {},


	hasFiles: function () {
		return Object.keys(this.AttachmentMap).length > 0;
	},


	setTitle: function (title) {
		var t = this.titleEl;
		if (t) {
			t.set({value: title});
		}
	},

	setTags: function (tags) {
		tags = Ext.Array.filter(tags || [], function (t) {
			return !ParseUtils.isNTIID(t);
		});

		if (this.tags) {
			this.tags.setValue(tags);
		}
	},

	setPublished: function (value) {
		var action = value ? 'addCls' : 'removeCls';
		if (this.publishEl) {
			this.publishEl[action]('on');
		}
	},

	getPublished: function () {
		var el = this.publishEl;
		return el ? el.is('.on') : undefined;
	},

	setSharedWith: function (sharingInfo) {
		if (this.sharedList) {
			this.sharedList.setValue(sharingInfo);
		}
	},

	/** @private */
	setValue: function (text, putCursorAtEnd, focus) {
		this.setHTML(Ext.String.htmlEncode(text));
		if (focus || putCursorAtEnd) {
			this.focus(putCursorAtEnd);
		}
	},

	/** @private */
	setHTML: function (html) {
		//if we are given a blank value, or the value doesn't begin with a div, wrap it.
		if (!html || !/^<div/im.test(html)) {
			//the div wrapper is for IE
			html = '<div>' + (html || this.defaultValue) + '</div>';
		}
		this.el.down('.content').dom.innerHTML = html;
	},

	reset: function () {
		var buttonsName = ['bold', 'italic', 'underline'], me = this, selection;
		this.el.down('.content').innerHTML = '<div>' + this.defaultValue + '</div>';
		this.cleanTrackedParts();
		if (this.sharedList) {
			this.sharedList.reset();
		}
		if (this.titleEl) {
			this.titleEl.dom.value = '';
		}
		if (this.titleWrapEl) {
			this.clearError(this.titleWrapEl);
		}


		try {
			this.styleControlsEl.removeCls('selected');
			// Deselect btns.
			Ext.each(buttonsName, function (bn) {
				var b = me.el.down('.' + bn);
				if (b) {
					b.removeCls('selected');
				}
			});
			delete this.typingAttributes;
			this.lastRange = null;

			if (window.getSelection) {
				selection = window.getSelection();
				selection.removeAllRanges();
			}

			//Make sure the body is also reset
			this.setValue('');
		}
		catch (e) {
			console.log('Removing all ranges from selection failed: ', e.message);
		}
	},

	lock: function () {
		if (Ext.getDom(this.contentEl)) {
			this.contentEl.set({contentEditable: false});
		}
	},

	unlock: function () {
		if (Ext.getDom(this.contentEl)) {
			this.contentEl.set({contentEditable: true});
		}
	}
});

module.exports = exports =	Ext.define('NextThought.editor.Editor', {
	extend: 'NextThought.editor.AbstractEditor',
	alias: 'widget.nti-editor'
});
