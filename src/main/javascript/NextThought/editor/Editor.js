Ext.define('NextThought.editor.AbstractEditor', {
	extend: 'Ext.Component',

	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.form.fields.TagField',
		'NextThought.view.form.fields.UserListField',
		'NextThought.view.form.fields.UserTokenField',
		'NextThought.util.Sharing',
		'NextThought.editor.embedvideo.Window'
	],

	mixins: {
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

	enableShareControls: false,
	enablePublishControls: false,
	enableTextControls: true,
	enableTags: false,
	enableTitle: false,
	enableWhiteboards: true,
	enableVideo: false,

	saveButtonLabel: 'Save',
	cancelButtonLabel: 'Cancel',
	placeholderText: 'Type a message...',

	ui: 'editor',
	cls: 'editor',

	headerTplOrder: '{toolbar}{title}',

	titleTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'enableTitle', cn: {
			cls: 'title',
			cn: [
				{tag: 'input', tabIndex: -1, type: 'text', placeholder: 'Title...'}
			]
		}}
	]),

	renderSelectors: {
		saveButtonEl: '.action.save'
	},

	toolbarTpl: Ext.DomHelper.markup([
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


	renderTpl: Ext.DomHelper.markup([
		'{header}',
		{
			cls: 'main',
			cn: [
				'{extra}',
				{
					cls: 'content show-placeholder',
					'data-placeholder': '{placeholderText}',
					contentEditable: true,
					unselectable: 'off',
					tabIndex: -1,
					cn: [
						{ //inner div for IE
							//default value (allow the cursor in to this placeholder div, but don't take any space)
							html: '&#8203;'
						}
					]
				}
			]
		}
		, {
			cls: 'footer',
			cn: [
				{
					cls: 'left',
					cn: [
						{
							cls: 'action text-controls', 'data-qtip': 'Formatting Options', cn: {
							cls: 'popctr', cn: {
								cls: 'popover', cn: [
									{cls: 'control bold', tabIndex: -1, 'data-qtip': 'Bold'},
									{cls: 'control italic', tabIndex: -1, 'data-qtip': 'Italic'},
									{cls: 'control underline', tabIndex: -1, 'data-qtip': 'Underline'}
								]
							}
						}
						},
						{
							cls: 'action object-controls', 'data-qtip': 'Insert Object', cn: {
							cls: 'popctr', cn: {
								cls: 'popover', cn: [
									{ cls: 'control whiteboard', 'data-qtip': 'Create a whiteboard' },
									{ tag: 'tpl', 'if': 'enableVideo', cn: { cls: 'control video', 'data-qtip': 'Embed a video' } }
								]
							}
						}
						}
					]
				},
				{
					cls: 'right',
					cn: [
						{cls: 'action save', html: 'Save'},
						{cls: 'action cancel', html: 'Cancel'}
					]
				}
			]
		}
	]),


	supportedTypingAttributes: ['bold', 'underline', 'italic'],

	//default value (allow the cursor into the placeholder div, but don't take any space)
	defaultValue: '&#8203;',


	wbThumbnailTpm: Ext.DomHelper.createTemplate({
		contentEditable: false,
		cls: 'whiteboard-divider',
		unselectable: 'on',
		cn: [
			{
				cls: 'whiteboard-wrapper',
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
		'application/vnd.nextthought.embeddedvideo': 'addVideo'
	},


	tabTpl: Ext.DomHelper.createTemplate({html: '\t'}).compile(),


	/**
	 * Scrolls to the top of the page if a text input field is not focused
	 */
	onFocusChange: function (e) {
		var tokenInput;
		if (this.sharedListEl) {
			tokenInput = this.sharedListEl.down('.user-token-field')
				.el.down('.tokens')
				.el.down('.inputArea')
				.el.down('.token-input-wrap')
				.el.down('input');
		}

		var scrollWindowBack = true;
		if (this.contentEl && this.contentEl === e.relatedTarget) {
			scrollWindowBack = false;
		}
		if (this.titleEl && this.titleEl === e.relatedTarget) {
			scrollWindowBack = false;
		}
		if (tokenInput && tokenInput === e.relatedTarget) {
			scrollWindowBack = false;
		}
		if (scrollWindowBack) {
			window.scrollTo(0, 0);
		}
	},


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
		this.callParent(arguments);

		this.enableVideo = this.enableVideo && $AppConfig.service.canCanvasURL(); //Need to get our own capability for this

		this.renderData = Ext.apply(this.renderData || {}, {
			cancelLabel: this.cancelButtonLabel,
			saveLabel: this.saveButtonLabel,
			enableShareControls: Boolean(this.enableShareControls),
			enablePublishControls: Boolean(this.enablePublishControls),
			enableTextControls: Boolean(this.enableTextControls),
			enableTags: Boolean(this.enableTags),
			enableTitle: Boolean(this.enableTitle),
			enableWhiteboards: Boolean(this.enableWhiteboards),
			enableVideo: Boolean(this.enableVideo),
			placeholderText: this.placeholderText
		});
	},


	afterRender: function () {
		var aux, objectsControl;
		this.callParent(arguments);
		this.mixins.placeholderFix.constructor.call(this);
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

	},


	clearError: function (el) {
		if (!el) {
			el = this.el.down('.content');
		}
		if (!el) {
			return;
		}
		el.removeCls('error-top').set({'data-error-tip': undefined});
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
	},


	onSave: function (e) {
		e.stopEvent();
		var v = this.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			if (!this.fireEvent('no-body-content', this, this.contentEl)) {
				return;
			}
		}

		if (this.titleEl && Ext.isEmpty(v.title)) {
			if (!this.fireEvent('no-title-content', this, this.titleEl)) {
				return;
			}
		}

		this.fireEvent('save', this, this.record, v, this.saveCallback || Ext.emptyFn);
	},


	setupEditor: function () {
		var me = this,
			el = me.el,
			scrollParentEl = null,//me.el.parent(), // -- JSG: This was for V1, in V2 the note window doesn't scroll while its open.
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
			me.mon(me.publishEl, 'click', function togglePublish(e) {
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
				if (!e.getTarget('.content') && !e.getTarget('.action')) {
					el.down('.content').focus();
					me.collapseToEnd();
				}
			}
		});

		me.contentEl = el.down('.content');
		me.contentEl.selectable();

		me.mon(me.contentEl, {
			scope: me,
			keydown: me.onKeyDown,
			keyup: me.onKeyup,
			paste: me.handlePaste,
			click: me.handleClick,
			contextmenu: me.handleContext,
			mouseup: me.onMouseUp
		});

		if (Ext.is.iPad) {
			me.mon(me.contentEl, {
				'blur': function (e) {
					me.onFocusChange(e);
				}
			});
			me.mon(me.contentEl, {
				'click': function (e) {
					me.contentEl.focus();
					me.moveCursorToEnd(me.contentEl);
				}
			});
		}

		me.on('destroy', function () {
			Ext.Object.each(me.trackedParts, function (k, v) {
				if (v && v.destroy) {
					v.destroy();
				}
			});
			if (Ext.is.iPad) {
				window.scrollTo(0, 0);
				document.body.scrollTop = 0;
			}
		});

		me.typingAttributes = [];
	},

	moveCursorToEnd: function (el) {
		//this is only for input/textarea elements
		el = Ext.getDom(el);
		if (typeof el.selectionStart === "number") {
			console.log("1");
			el.selectionStart = el.selectionEnd = el.value.length;
		}
		else if (el.createTextRange !== undefined) {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
		else if (document.createRange) {
			var range, selection;
			range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}
		console.log("4");
	},


	setupSharedListEl: function (me, tabTracker, scrollParentEl) {
		var me = this, userTokenField, tokens, inputArea, tokenInputWrap, tokenInput;
		me.sharedListEl = me.el.down('.recipients');
		if (me.sharedListEl) {
			if ($AppConfig.service.canShare()) {
				me.sharedList = Ext.widget('user-sharing-list', {
					renderTo: me.sharedListEl,
					scrollParentEl: scrollParentEl,
					tabIndex: tabTracker && tabTracker.next(),
					ownerCls: this.xtype,
					value: me.sharingValue
				});
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

			if (Ext.is.iPad) {
				userTokenField = me.sharedListEl.down('.user-token-field');
				tokens = userTokenField.el.down('.tokens');
				inputArea = tokens.el.down('.inputArea');
				tokenInputWrap = inputArea.down('.token-input-wrap');
				tokenInput = tokenInputWrap.el.down('input');
				me.mon(tokenInput, {
					'blur': function (e) {
						me.onFocusChange(e);
					}
				});
			}
		}
	},


	setupTitleEl: function (me, tabTracker) {
		me.titleEl = me.el.down('.title input');
		if (me.titleEl) {
			me.titleEl.set({tabIndex: tabTracker.next()});
			me.renderPlaceholder(me.titleEl);
			me.mon(me.titleEl, {
				'click': function (e) {
					e.stopPropagation();
				},
				'mousedown': function (e) {
					e.stopPropagation();
				},
				'keydown': function (e) {
					var t = e.getTarget();
					Ext.callback((t || {}).setAttribute, t, ['value', t.value]);
					e.stopPropagation();
				}
			});
			if (Ext.is.iPad) {
				me.mon(me.titleEl, {
					'blur': function (e) {
						me.onFocusChange(e);
					}
				});
				me.mon(me.titleEl, {
					'focus': function () {
						var dom = me.titleEl.el.dom;
						var length = dom.value.length;
						dom.setSelectionRange(length, length);
					}
				});
			}
		}
	},


	activate: function () {
		this.maybeEnableSave();
		this.el.addCls('active');
		this.fireEvent('activated-editor', this);
	},


	isActive: function () {
		return this.el.hasCls('active');
	},


	disable: function () {
		this.deactivate();
		this.el.addCls(['active', 'disabled']);
		this.el.down('.content').set({'contenteditable': undefined});
		if (Ext.is.iPad) {
			console.log("disable - scroll to top");
			window.scrollTo(0, document.activeElement.top);
		}
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
		if (Ext.is.iPad) {
			console.log("deactivate, scroll doc to top");
			window.scrollTo(0, document.activeElement.top);
		}
	},


	handleContext: function (e) {
		e.stopPropagation();
		return true;
	},


	/**
	 *  @see http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/
	 */
	handlePaste: function (e, elem) {
		console.debug('Called');

		elem = e.getTarget('.content', Number.MAX_VALUE);
		if (!elem) {
			console.log('Could not paste, the target was not found:', e.getTarget());
			e.stopEvent();
			return false;
		}
		var be = e.browserEvent,
			cd = be ? be.clipboardData : null,
			sel = window.getSelection(),
			savedRange = RangeUtils.saveRange(sel.getRangeAt(0)),
			offScreenBuffer = document.createElement('div');

		document.body.appendChild(offScreenBuffer);
		offScreenBuffer.style.position = 'absolute';
		offScreenBuffer.style.left = '-1000px';
		offScreenBuffer.style.top = '-1000px';
		offScreenBuffer.contentEditable = true;
		offScreenBuffer.focus();

		// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
		if (cd && cd.getData) {
			e.stopEvent();
			if (/text\/html/.test(cd.types)) {
				offScreenBuffer.innerHTML = cd.getData('text/html');
			}
			else if (/text\/plain/.test(cd.types)) {
				offScreenBuffer.innerHTML = cd.getData('text/plain');
			}
			else {
				offScreenBuffer.innerHTML = '';
			}
			this.waitForPasteData(offScreenBuffer, savedRange, elem);
			return false;
		}

		// Everything else allow browser to paste content into it, then cleanup
		offScreenBuffer.innerHTML = '';
		this.waitForPasteData(offScreenBuffer, savedRange, elem);
		return true;
	},


	waitForPasteData: function (offScreenBuffer, savedRange, elem, callCount) {
		var me = this;
		callCount = callCount || 0;
		if (offScreenBuffer.childNodes && offScreenBuffer.childNodes.length > 0) {
			setTimeout(function () {
				me.processPaste(offScreenBuffer, savedRange, elem);
			}, 20);
		}
		else if (callCount < 100) {
			setTimeout(function () {
				me.waitForPasteData(offScreenBuffer, savedRange, elem, callCount + 1);
			}, 20);
		}
		else {
			console.log('timed out waiting for paste');
			document.body.removeChild(offScreenBuffer);
		}
	},


	processPaste: function (offScreenBuffer, savedRange, elem) {
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
				.replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;')
				.replace(/<meta.*?>/ig, '');

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
		document.body.removeChild(offScreenBuffer);
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
		else if (e.getKey() === e.LEFT || e.getKey() === e.RIGHT){
			//keeps the slides from transitioninng in the presentation view
			e.stopPropagation();
		}

		this.hideStylePopover();
		this.hideObjectsPopover();
		return true;
	},


	onKeyup: function (e) {
		this.clearError(this.contentEl);

		this.maybeResizeContentBox();
		this.detectTypingAttributes(e);
		this.checkTrackedParts();
		this.maybeEnableSave();
	},


	onMouseUp: function (e) {
		this.detectTypingAttributes(e);
	},


	maybeResizeContentBox: function () {
		var p = this.previousEditorHeight || 0,
			h = this.el.getHeight();

		this.previousEditorHeight = h;

		if (h !== p) {
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
			b[Ext.Array.contains(me.typingAttributes, bn) ? 'addCls' : 'removeCls']('selected');
		});
	},


	setTypingAttributes: function (attrs, alreadyFocused) {
		this.typingAttributes = attrs.slice();
		if (!alreadyFocused) {
			this.el.down('.content').focus();
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
			if (document.queryCommandSupported(action)
				&& document.queryCommandState(action) !== Ext.Array.contains(me.getTypingAttributes(), action)) {
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
			tip = state ? el.getAttribute('data-tiptext') : undefined;


		if (el && !e.getTarget('.control')) {
			el[action]('selected');
			el.set({'data-qtip': tip});
//			Ext.QuickTipManager.getQuickTip().hide();
			this.el.down('.content').focus();
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
			t = e.getTarget('.object-part') || e.getTarget('.whiteboard-wrapper');

		//make sure the content el gets focus when you click it, specifically trying to
		//fix an issue with clicking from the sharing field taking two clicks to get focus.
		//this.focus(true);

		if (t) {
			guid = t.getAttribute('id');
			if (!guid || guid.indexOf('ext-') === 0) {
				guid = Ext.fly(t).down('img').getAttribute('id');
			}

			p = this.trackedParts[guid];
			if (p) {
				if (!p.isDestroyed && p.show) {
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
		data = data || (function () {
		}()); //force the falsy value of data to always be undefinded.

		var me = this, wbWin, content;

		if (typeof guid !== 'string') {
			guid = guidGenerator();
		}
		if (this.trackedParts[guid]) {
			return;
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


	insertPartAtSelection: function (html) {
		var sel,
			range,
			beforeRange,
			afterRange,
			beforeContent,
			afterContent,
			el,
			frag,
			node,
			lastNode,
			content = this.el.down('.content', true);

		if (window.getSelection) {
			// IE9 and non-IE
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);

				beforeRange = document.createRange();
				beforeRange.setStart(content, 0);
				beforeRange.setEnd(range.startContainer, range.startOffset);
				beforeContent = beforeRange.cloneContents();
				beforeRange.detach();

				afterRange = document.createRange();
				afterRange.setStart(range.endContainer, range.endOffset);
				afterRange.setEnd(content, content.childNodes.length);
				afterContent = afterRange.cloneContents();
				afterRange.detach();

				range.detach();

				el = document.createElement("div");
				el.innerHTML = html;

				frag = document.createDocumentFragment();
				frag.appendChild(beforeContent);
				do {
					node = el.firstChild;
					if (node) {
						lastNode = frag.appendChild(node);
					}
				} while (node);

				frag.appendChild(afterContent);

				content.innerHTML = '';
				content.appendChild(frag);

				// Preserve the selection
				if (lastNode) {
					range = document.createRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
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
		var me = this,
			el = Ext.get(guid),
			mime = (obj || obj.data).MimeType,
			placeholder,
			htmlCfg,
			handled = false,
			isSelectionInContent,
			focusNode,
			thumbTpl,
			onInsertedFn;

		//We need empty divs to allow to insert text before or after an object.
		placeholder = Ext.DomHelper.createTemplate({html: me.defaultValue});

		if (!el) {

			Ext.each(content.query('> div'), function (n) {
				if (n.firstChild === n.lastChild && n.firstChild && n.firstChild.nodeValue === '\u200B') {
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

		function callback(node) {
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
		}

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

		function convert(regex, fn) {
			if (new RegExp(regex, 'i').test(part) && me[fn]) {
				p = me[fn](part);
			}
			return !p; //Stop iterating (return false) if we found something
		}

		Ext.Object.each(me.partConverters, convert);
		return p;
	},


	getBody: function (parts) {
		var r = [],
			objectPartRegex = /class=".*object-part.*"/i,
			i, p, part, me = this;


		function stripTrailingBreak(text) {
			return text.replace(/<br\/?>$/, '');
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

		r = Ext.Array.filter(r, function (i) {
			var tmp;

			if (!Ext.isString(i)) {
				return true;
			}

			if (Ext.isEmpty(i)) {
				return false;
			}
			//if we are just whitespace and html whitespace
			tmp = i.replace(/<br\/?>/g, '');
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
		this.el.down('[contenteditable=true]').focus();
		if (collapse) {
			this.collapseToEnd();
		}
	},


	maybeEnableSave: function () {
		function isNoteBodyEmpty() {
			var d = Ext.getDom(me.el.down('.content')),
				html = d && d.innerHTML, v, parts = d.querySelectorAll('.object-part');

			html = v = html.replace(/\u200B/g, '').replace(/<div>/g, '').replace(/<\/div>/g, '').replace(/&nbsp;/g, ' ');
			html = html.replace(/<br\/?>/g, '');
			return {
				clearPlaceholder: !Ext.isEmpty(parts) || !Ext.isEmpty(v),
				enableSave: !Ext.isEmpty(Ext.Object.getKeys(parts)) || !Ext.isEmpty(html.trim())
			};
		}

		var me = this, body,
			r = isNoteBodyEmpty(),
			cls = 'disabled';

		if (r.enableSave && this.saveButtonEl.hasCls(cls)) {
			this.saveButtonEl.removeCls(cls);
		}

		if (!r.enableSave && !this.saveButtonEl.hasCls(cls)) {
			this.saveButtonEl.addCls(cls);
			body = me.getBodyValue();

			if (body.length <= 1 && Ext.isEmpty(body[0])) {
				me.setValue('', true);
			}

		}

		this.contentEl[r.clearPlaceholder ? 'removeCls' : 'addCls']('show-placeholder');
	},


	editBody: function (body) {
		var me = this,
			c = Ext.getDom(this.el.down('.content'));

		if (body && body.length > 0) {
			c.innerHTML = '';
		}
		Ext.each(body, function (part) {
			var d = document.createElement('div'),
				mime, fnName;
			if (typeof part === 'string') {
				d.innerHTML += part.replace(/\u200B/g, '');
				c.appendChild(d);
			}
			else {
				//Ok its some part.  Look it up in our registry
				mime = (part.data || part).MimeType;
				fnName = mime ? me.partRenderer[mime] || '' : undefined;
				if (fnName && Ext.isFunction(me[fnName])) {
					me[fnName](part, undefined, true);
				}
				else {
					//TODO Shoot a part we don't understand.  We need to be graceful
					//to this, but all we can do here is drop it.  Problem with that is
					//when we save we gather the parts out of content and dropping it here
					//means dropping for good.  How should we prevent this.  One idea
					//is we keep an array of parts we don't understand.  Render them as a ?
					//or something and then on save we can index into the array and make sure
					//we don't drop misunderstood parts.  What do you think J?
					console.warn('Found a part we don\'t understand.  Inserting placeholder', part);
					me.injectUnknownPart(part);
				}
			}
		});

		this.maybeEnableSave();
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
			sel = this.el.select('.content > *');

		sel.each(function (div) {
			var html, tmp, dom;
			try {
				//don't let manipulations here effect the dom
				dom = Ext.getDom(div).cloneNode(true);
				div = Ext.fly(dom, '__editer-flyweight');
				html = div.getHTML() || '';

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
					tmp = document.createElement("div");
					tmp.appendChild(dom);
					html = tmp.innerHTML || '';
				}
				html = html.replace(/\u200B/g, '');
				out.push(html);
			}
			catch (er) {
				console.warn('Oops, ' + er.message);
			}
		});

		return out;
	},


	getValue: function () {
		return {
			body: this.getBody(this.getBodyValue()),
			sharingInfo: this.sharedList ? this.sharedList.getValue() : null,
			publish: this.sharedList ? this.sharedList.getPublished() : this.getPublished(),
			title: this.titleEl ? this.titleEl.getValue() : undefined,
			tags: this.tags ? this.tags.getValue() : undefined
		};
	},


	setTitle: function (title) {
		var t = this.titleEl;
		if (t) {
			t.set({value: title});
		}
	},


	setTags: function (tags) {
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
			console.log('focus(putCursorAtEnd');
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
			this.titleEl.dom.value = "";
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
	}//,


	/*updatePrefs: function (v) {
	 if(this.sharedList){
	 this.sharedList.setValue(
	 SharingUtils.sharedWithToSharedInfo(
	 SharingUtils.resolveValue()));
	 }
	 }*/




}, function () {

	Ext.define('NextThought.editor.Editor', {
		extend: 'NextThought.editor.AbstractEditor',
		alias: 'widget.nti-editor'
	});

});
