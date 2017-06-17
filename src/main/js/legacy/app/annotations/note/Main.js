const Ext = require('extjs');
const {wait} = require('nti-commons');

const UserRepository = require('legacy/cache/UserRepository');
const ImageZoomView = require('legacy/common/ux/ImageZoomView');
const SlideDeck = require('legacy/common/ux/SlideDeck');
const ContentUtils = require('legacy/util/Content');
const Globals = require('legacy/util/Globals');

const WBUtils = require('../../whiteboard/Utils');

require('legacy/common/ux/SlideDeck');
require('legacy/common/components/cards/OverlayedPanel');
require('legacy/common/components/cards/Card');
require('legacy/mixins/Searchable');

require('../../mediaviewer/content/OverlayedPanel');
require('../../mediaviewer/content/deck/OverlayedPanel');
require('../../mediaviewer/content/SlideVideo');
require('../../mediaviewer/content/Slidedeck');
require('./Panel');


module.exports = exports = Ext.define('NextThought.app.annotations.note.Main', {
	extend: 'NextThought.app.annotations.note.Panel',
	alias: 'widget.note-main-view',

	mixins: {
		Searchable: 'NextThought.mixins.Searchable'
	},

	root: true,
	enableTitle: true,
	highlightTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'highlight', html: '{0}'}),

	purchasableTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'bookcover', style: {backgroundImage: 'url({img})'}},
		{cls: 'meta', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'byline', html: '{number}'},
			{cls: 'button target', html: '{target}'}
		]}
	])),

	noAccessTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'no-access', html: 'You do not have access to this content.'}
	])),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'note main-view',
			cn: [
				{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
				{
					cls: 'meta',
					cn: [
						{ cls: 'controls', cn: [
							{ cls: 'favorite' },
							{ cls: 'like' }
						] },
						{ cls: 'title'},
						{ cls: 'name-wrap', cn: [
							{ tag: 'span', cls: 'name' },
							{ tag: 'span', cls: 'time'},
							{ tag: 'span', cls: 'shared-to' }
						]}
					]
				},
				{ cls: 'clear' },
				{
					cls: 'context', cn: [
					{tag: 'canvas'},
					{tag: 'span', cls: 'text'}
					]
				},
				{ cls: 'body' },
				{
					cls: 'respond',
					cn: [
						{
							cls: 'reply-options',
							cn: [
								{ cls: 'link reply', html: '{{{NextThought.view.annotations.note.Main.reply}}}' },
								{ cls: 'link share', html: '{{{NextThought.view.annotations.note.Main.share}}}' },
								{ cls: 'link more', 'data-qtip': '{{{NextThought.view.annotations.note.Main.options}}}', html: '&nbsp;'}
							]
						}
					]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'note-replies',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),

	renderSelectors: {
		avatar: '.avatar-wrapper',
		contextContainer: '.context'
	},

	afterRender: function () {
		var me = this;
		me.callParent(arguments);

		try {
			this.on('editorDeactivated', function () {
				me.editorEl.down('.title').hide();
				var bRecord = me.bufferedRecord;
				if (bRecord) {
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});
		}
		catch (e) {
			console.error(Globals.getError(e));
		}

		this.initSearch();
	},


	getRangePositionAdjustments: function (key) {
		const scrollTop = Ext.getBody().getScrollTop();

		return {top: -1 * (this.el.getY() - scrollTop), left: -1 * this.el.getX()};
	},


	createEditor: function () {
		this.callParent();
		this.editor.el.down('.title')
			.setVisibilityMode(Ext.Element.DISPLAY)
			.addCls('small')
			.hide();
	},

	fillInReplies: function () {
		var r = this.record, me = this;
		this.removeAll(true);

		return wait()
				.then(function () {
					if (me.isDestroyed) {
						return Promise.reject();
					}

					me.record.notifyObserversOfFieldChange('AdjustedReferenceCount');
					return me.loadReplies(r)
							.then(function () {
								me.record.notifyObserversOfFieldChange('AdjustedReferenceCount');
								return Promise.resolve();
							});
				});
	},

	disable: function () {
		//don't call the parent, its destructive. This panel is meant to be reused.
		this.replyOptions.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
	},

	fixUpCopiedContext: function (n) {
		var node = Ext.get(n), cardTpl, slideDeckTpl, slideVideoTpl,
			maxWidth = 574;//shortcut, probably should figure out how wide the context is...but that returns 0
		// when queried at this point.

		node.select('.injected-related-items,.related,.anchor-magic').remove();

		//WE want to remove redaction text in the node body of the note viewer.
		Ext.each(node.query('.redaction '), function (redaction) {
			if (!Ext.fly(redaction).hasCls('redacted')) {
				Ext.fly(redaction).addCls('redacted');
			}
		});

		node.select('.redactionAction .controls').remove();

		Ext.each(node.query('span[itemprop~=nti-data-markupenabled]'), function (i) {
			var e = Ext.get(i);
			//only strip off the style for width that are too wide.
			if (parseInt(i.style.width, 10) >= maxWidth) {
				e.setStyle({width: undefined});
			}
		});

		Ext.each(node.query('iframe'), function (i) {
			var e = Ext.get(i),
				w, h, r;
			if (e.parent('div.externalvideo')) {
				w = parseInt(e.getAttribute('width'), 10);
				h = parseInt(e.getAttribute('height'), 10);
				r = h !== 0 ? w / h : 0;
				if (w >= maxWidth && r !== 0) {
					e.set({width: maxWidth, height: maxWidth / r});
				}
			}
			else {
				e.remove();
			}
		});

		node.select('[itemprop~=nti-data-markupenabled] a').on('click', this.contextAnnotationActions, this);
		this.on('markupenabled-action', this.commentOnAnnototableImage);

		Ext.each(node.query('.application-highlight'), function (h) {
			if (this.record.isModifiable()) {
				Ext.fly(h).addCls('highlight-mouse-over');
			}
		}, this);

		cardTpl = Ext.DomHelper.createTemplate({cls: 'content-card', html: NextThought.common.components.cards.Card.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=nticard]'), function (c) {
			var d = NextThought.common.components.cards.OverlayedPanel.getData(c);
			cardTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		slideDeckTpl = Ext.DomHelper.createTemplate({cls: 'content-launcher', html: NextThought.app.mediaviewer.content.Slidedeck.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidedeck]'), function (c) {
			var d = NextThought.app.mediaviewer.content.deck.OverlayedPanel.getData(c);
			slideDeckTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		slideVideoTpl = Ext.DomHelper.createTemplate({cls: 'content-launcher', html: NextThought.app.mediaviewer.content.SlideVideo.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidevideo][itemprop$=card]'), function (c) {
			var d = NextThought.app.mediaviewer.content.OverlayedPanel.getData(c);
			slideVideoTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		if (node.query('object[type$=slide]').length) {
			this.context.up('.context').addCls('slide');
		}

		node.query('object.overlayed').forEach(function (ob) {
			ob.removeAttribute('data');
			ob.removeAttribute('style');
		});

		return node.dom;
	},

	addAdditionalRecordListeners: function (record) {
		record.addObserverForField(this, 'sharedWith', 'fillInShareFromFieldChange');
	},

	removeAdditionalRecordListeners: function (record) {
		record.removeObserverForField(this, 'sharedWith', 'fillInShareFromFieldChange');
	},

	fillInShareFromFieldChange: function (field, value) {
		var me = this;

		UserRepository.getUser(value)
			.then(function (users) {
				me.fillInShare(users);
			});
	},

	setRecord: function (r) {
		//If we have an editor active for god sake don't blast it away
		if (this.editorActive()) {
			console.log('Need to buffer set record', r);
			this.bufferedRecord = r;
			return;
		}

		var me = this;

		if (me.readerContext) {
			me.contextLoad = me.readerContext.load()
								.then(function (context) {
									me.setContext(context);
								});
		}

		me.callParent(arguments);

		if (me.record) {
			me.mun(me.record, 'destroy', me.wasDeleted, me);
		}
		if (!me.rendered) {
			return;
		}

		me.replyOptions.show();
	},

	onRemove: function (cmp) {
		var c = this.items.getCount();
		console.log('removed child, it was deleting: ', cmp.deleting);
		if (cmp.deleting && c === 0 && (!this.record || this.record.placeholder)) {
			this.record.destroy();
			this.destroy();

			if (this.doClose) {
				this.doClose();
			}
		}
	},

	onDelete: function () {
		var c = this.items.getCount();

		this.callParent(arguments);
		if (c === 0 && this.doClose) {
			this.doClose();
		}
	},

	onEdit: function () {
		this.text.hide();
		this.editMode = true;
		this.editor.editBody(this.record.get('body'));
		this.editor.setTitle(this.record.get('title'));
		this.activateReplyEditor();
		this.editorEl.down('.title').show();
	},

	hideImageCommentLink: function () {
		var aLink = this.context ? this.context.down('a[href=#mark]') : null;
		if (aLink) {
			aLink.hide();
		}
	},

	setPurchasableContext: function (ntiid) {
		var me = this, el,
			course = CourseWareUtils.courseForNtiid(ntiid),
			content = ContentUtils.purchasableForContentNTIID(ntiid);

		//empty the current context;
		me.contextContainer.update('');
		me.contextContainer.addCls('purchasable');

		if (course) {
			el = me.purchasableTpl.append(this.contextContainer, {
				img: course.get('thumb'),
				title: course.get('Title'),
				number: course.get('ProviderUniqueID'),
				target: 'Enroll Now'
			}, true);
		} else if (content) {
			el = me.purchasableTpl.append(me.contextContainer, {
				img: content.get('Icon'),
				title: content.get('Title'),
				number: content.get('Name'),
				target: 'Purchase'
			}, true);
		} else {
			el = me.noAccessTpl.append(me.contextContainer, null, true);
		}

		me.mon(el, 'click', function (e) {
			if (e.getTarget('.target')) {
				me.fireEvent('unauthorized-navigation', me, ntiid);
			}
		});
	},

	contextAnnotationActions: function (e, dom) {
		e.stopEvent();
		var action = (dom.getAttribute('href') || '').replace('#', ''),
			d = Ext.fly(dom).up('[itemprop~=nti-data-markupenabled]').down('img'),
			img = d && d.is('img') ? d.dom : null,
			me = this;

		function openSlideDeck () {
			me.up('note-window').close();
			SlideDeck.openFromDom(dom, me.reader);
		}


		if (/^mark$/i.test(action)) {
			this.commentOnAnnototableImage(img/*, action*/);
		}
		else if (/^zoom$/i.test(action)) {
			ImageZoomView.zoomImage(dom, this.reader, this);
		}
		else if (/^slide$/.test(action)) {
			if (this.editorActive()) {

				Ext.Msg.show({
					msg: getString('NextThought.view.annotations.note.Main.editor-warning-msg'),
					scope: me,
					//We need to bitwise OR these two, so stop the lint.
					buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL, //eslint-disable-line no-bitwise
					icon: 'warning-red',
					title: getString('NextThought.view.annotations.note.Main.editor-warning-title'),
					buttonText: {ok: 'caution:' + getString('NextThought.view.annotations.note.Main.ok')},
					fn: function (str) {
						if (str === 'ok') {
							openSlideDeck();
						}
					}
				});
			}
			else {
				openSlideDeck();
			}
		}

		return false;
	},

	getContainerIdForSearch: function () {
		return this.record.get('NTIID');
	},

	onceReadyForSearch: function () {
		var ps = [];

		if (this.contextLoad) {
			ps.push(this.contextLoad);
		}
		if (this.initialRepliesLoad) {
			ps.push(this.initialRepliesLoad);
		}

		// Wait for context and all replies to be loaded before doing search.
		return Promise.all(ps)
					.then(function () {
						return wait();
					});
	},

	getSearchScrollTarget: function () {
		var targetEl = this.el && this.el.up('.window-container') || this.el;
		return targetEl;
	},

	commentOnAnnototableImage: function (dom /*action*/) {
		var me = this;
		if (me.activateReplyEditor()) {
			WBUtils.createFromImage(dom, function (data) {
				Ext.defer(me.editor.addWhiteboard, 400, me.editor, [data]);
			});
		}
	},

	resizeMathJax: function (/*node*/) {
		var e = Ext.select('div.equation .mi').add(Ext.select('div.equation .mn')).add(Ext.select('div.equation .mo'));
		e.setStyle('font-size', '13px');
	},

	allowNavigation: function () {
		var msg = 'You are currently creating a comment. Would you like to leave without saving?',
			hasChildEditor = this.el.down('.note.editor-active');

		if (!this.editor.isActive() && !hasChildEditor) {
			return true;
		}

		if (this.editMode) {
			msg = 'You are currently editing a note. Would you like to leave without saving?';
		} else if (hasChildEditor) {
			msg = 'You are currently editing a comment. Would you like to leave without saving?';
		}

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Attention!',
				msg: msg,
				buttons: {
					primary: {
						text: 'Leave',
						cls: 'caution',
						handler: fulfill
					},
					secondary: {
						text: 'Stay',
						handler: reject
					}
				}
			});
		});
	}
});
