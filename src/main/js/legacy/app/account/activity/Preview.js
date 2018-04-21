const Ext = require('@nti/extjs');

const UserRepository = require('legacy/cache/UserRepository');
const ContentUtils = require('legacy/util/Content');
const DomUtils = require('legacy/util/Dom');
const {getString} = require('legacy/util/Localization');

require('legacy/mixins/LikeFavoriteActions');
require('legacy/mixins/QuestionContent');
require('legacy/mixins/ProfileLinks');

require('legacy/cache/LocationMeta');
require('legacy/editor/Editor');
require('legacy/layout/component/Natural');


module.exports = exports = Ext.define('NextThought.app.account.activity.Preview', {
	extend: 'Ext.container.Container',

	inheritableStatics: {
		WhiteboardSize: 360
	},

	onClassExtended: function (cls, data) {
		//Allow subclasses to override render selectors, but don't drop all of them if they just want to add.
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);


		//allow a toolbar template to be defined
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's templates
		var tpl = this.prototype.renderTpl
			.replace('{toolbar}', data.toolbarTpl || '');

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		questionContent: 'NextThought.mixins.QuestionContent',
		profileLinks: 'NextThought.mixins.ProfileLinks'
	},

	componentLayout: 'natural',
	layout: 'auto',
	childEls: ['body'],

	getTargetEl: function () {
		return this.body;
	},

	cls: 'activity-preview',

	renderSelectors: {
		avatar: '.avatar',
		name: '.name',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		subjectEl: '.subject',
		itemEl: '.item',
		footEl: '.foot',
		commentsEl: '.comments',
		messageBodyEl: '.body',
		replyEl: '.respond .reply-options > .reply',
		replyBoxEl: '.respond > div',
		respondEl: '.respond',
		topEl: '.activity-preview-body',
		timeEl: '.stamp > .time'
	},

	renderTpl: Ext.DomHelper.markup([
		{
			cls: '{type} activity-preview-body',
			cn: [
				'{toolbar}',
				{ cls: 'item', cn: [
					{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
					{ cls: 'controls', cn: [
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject {[values.title? "":"no-subject"]}', html: '{title}' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link {[values.title? "":"no-subject"]}', html: 'By {name}'},
							{tag: 'span', cls: 'time', html: '{relativeTime}'}
						]}
					]},
					{ cls: 'body' }
				]},
				{
					cls: 'foot',
					cn: [
						{ cls: 'comments', 'data-label': ' Comment',
							html: '{CommentCount:plural("Comment")}' }
					]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'replies',
			cn: ['{%this.renderContainer(out,values)%}']
		},
		{
			cls: 'respond', cn: {
				cn: [
					{
						cls: 'reply-options',
						cn: [
							{ cls: 'link reply', html: '{{{NextThought.view.account.activity.Preview.add-comment}}}' }
						]
					}
				]}
		}
	]),

	moreTpl: Ext.DomHelper.createTemplate({tag: 'a', cls: 'more', cn: [
		{},
		{},
		{}
	]}),

	initComponent: function () {
		this.callParent(arguments);
		this.enableBubble(['resize', 'realign', 'editorActivated', 'editorDeactivated']);
	},

	setBody: function (body) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setBody, this, arguments), this);
			return;
		}

		if (this.record.placeholder) {
			return;
		}

		var snip = ContentUtils.getHTMLSnippet(body, 300), me = this;
		this.messageBodyEl.update(snip || body);

		DomUtils.adjustLinks(this.messageBodyEl, window.location.href);

		this.messageBodyEl.select('img').on('load', function () {
			me.fireEvent('realign');
		});
		this.messageBodyEl.select('.whiteboard-container .toolbar').remove();
		this.messageBodyEl.select('.whiteboard-container .overlay').remove();

		//Allow dom to reflect style changes
		Ext.defer(this.setupReplyScrollZone, 1, this);
		Ext.defer(this.maybeShowMoreLink, 1, this);
	},

	maybeShowMoreLink: function () {
		var el = this.messageBodyEl;
		if (!el || el.dom.scrollHeight <= el.getHeight()) {
			return;
		}

		this.moreTpl.insertAfter(el, null, true);
		this.mon(this.el.down('a.more'), 'click', this.navigateToItem, this);
	},

	setupReplyScrollZone: function () {
		if (!this.rendered || this.isDestroyed) {
			return;
		}
		try {
			var rH = this.respondEl.getHeight(),
				tH = this.topEl.getHeight(),
				max = Ext.dom.Element.getViewportHeight() - tH - rH;

			console.log(rH, tH, max, this.body);
			this.body.setStyle({maxHeight: max + 'px'});
		}
		catch (e) {
			console.warn('Failed to read from the dom.', e.stack || e.message || e);
		}
	},

	navigateToItem: function () {
		console.warn('Should be overridden by its children');
	},

	showReplies: function () {
		this.setupReplyScrollZone();
	},

	/**
	 * Maps the records 'reply/comment/post' counts to a single value.
	 *
	 * @param {Ext.data.Model} record -
	 * @return {Number} -
	 */
	getCommentCount: function (record) {
		throw new Error('Do not use the base class directly. Subclass and implement this');
	},

	/**
	 * Place to derive fields that should be put into the template.
	 *
	 * @param {Ext.data.Model} record -
	 * @return {Object} Object
	 */
	getDerivedData: function (record) {
		return {
			relativeTime: record.getRelativeTimeString()
		};
	},

	setRenderedTitle: function (record) {
		if (record.isModel) {
			return record.get('title');
		}
		return record.title;
	},

	/* @private */
	prepareRenderData: function (record) {
		var me = this,
			o = record.getData();
		o.type = o.Class.toLowerCase();
		o.CommentCount = this.getCommentCount(record);
		o.title = this.setRenderedTitle(record);
		Ext.apply(o, this.getDerivedData(record));

		me.ownerCt.addCls(o.type);

		UserRepository.getUser(o.Creator, function (u) {
			o.avatarURL = u.get('avatarURL');
			o.name = Ext.String.ellipsis(u.getName(), 20);
			if (me.rendered) {
				me.avatar.setStyle({backgroundImage: 'url(' + o.avatarURL + ')'});
				me.name.update(me.name.getHTML() + o.name);
			}

			// This allows navigating to the profile of the creator.
			// Our mixin 'ProfileLinks' expects it.
			me.user = u;
		});

		return Ext.apply(this.renderData || {}, o);
	},

	getRefItems: function () {
		var ret = this.callParent(arguments) || [];
		if (this.editor) {
			ret.push(this.editor);
		}
		return ret;
	},

	beforeRender: function () {
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.callParent(arguments);
		this.renderData = this.prepareRenderData(this.record);
	},

	saveCallback: function (editor, cmp, replyRecord) {
		editor.deactivate();
		editor.setValue('');
		editor.reset();
		cmp.add({record: replyRecord});
	},

	afterRender: function () {
		this.callParent(arguments);

		var DISPLAY = Ext.dom.Element.DISPLAY,
			box = this.replyBoxEl,
			me = this;

		this.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: this.respondEl, 'saveCallback': this.saveCallback});

		box.setVisibilityMode(DISPLAY);

		this.respondEl.setVisibilityMode(DISPLAY);

		if (Service.canShare()) {
			this.mon(this.replyEl, 'click', this.showEditor, this);
		}
		else {
			this.replyEl.remove();
			//FIXME figure out what needs to happen to just remove respondEl
			this.respondEl.hide(); //Note we just hide this one, since it looks referenced in a lot of places
		}


		//These next two functions seem named backwards...
		function hide () {
			//Ext.bind(box.hide, box, [false]);
			// Now that the editor is active, adjust the reply scroll zone.
			me.setupReplyScrollZone();
			me.replyBoxEl.hide();
			me.constrainPopout();
			me.fireEvent('editorActivated');
		}

		function show () {
			//Ext.bind(box.show, box, [false]);
			me.replyBoxEl.show();
			me.constrainPopout();
			me.fireEvent('editorDeactivated');
		}

		this.mon(this.editor, {
			scope: this,
			'activated-editor': hide,
			'deactivated-editor': show,
			'no-body-content': function (editor, bodyEl) {
				editor.markError(bodyEl, getString('NextThought.view.account.activity.Preview.no-body-content'));
				return false;
			},
			'grew': 'constrainPopout'
		});

		this.mon(this.editor, 'deactivated-editor', this.setupReplyScrollZone, this, {delay: 1});

		this.on({
			'beforedeactivate': 'handleBeforeDeactivate',
			'editor-opened': 'maybeAllowEditor',
			'editor-closed': 'closedEditor'
		});
		this.mon(this.messageBodyEl, 'click', this.navigateToItem, this);
		this.mon(this.subjectEl, 'click', this.navigateToItem, this);
		this.mon(this.commentsEl, 'click', this.showReplies, this);
		this.enableProfileClicks(this.name, this.avatar);
	},

	maybeAllowEditor: function () {
		//if this has an active editor
		if ((this.editor && this.editor.isActive()) || this.editorOpened) {
			return false;
		}

		this.editorOpened = true;
		return undefined;
	},

	closedEditor: function () {
		delete this.editorOpened;
	},

	constrainPopout: function () {
		var pop = this.up('.activity-popout');

		pop.doConstrain();
	},

	handleBeforeDeactivate: function () {
		if ((this.editor && this.editor.isActive())) {
			return false;
		}
		return Ext.Array.every(this.items.items, function (item) {
			return item.fireEvent('beforedeactivate');
		});
	},

	showEditor: function () {
		if (this.editorOpened) { return; }
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
		this.fireEvent('realign');
	},

	getPointerStyle: function (x, y) {
		return y >= this.footEl.getY() ? 'grey' : '';
	}
});
