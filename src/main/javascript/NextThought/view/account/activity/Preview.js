Ext.define('NextThought.view.account.activity.Preview', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.cache.LocationMeta',
		'NextThought.editor.Editor',
		'NextThought.mixins.ProfileLinks',
		'NextThought.layout.component.Natural'
	],


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
						{ cls: 'comments', 'data-label': ' Comments',
							html: '{CommentCount} Comment{[values.CommentCount===1?"":"s"]}' }
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
						{ cls: 'reply', html: 'Add a comment' }
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
		this.enableBubble(['resize', 'realign']);
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
		if (el.dom.scrollHeight <= el.getHeight()) {
			return;
		}

		this.moreTpl.insertAfter(el, null, true);
		this.mon(this.el.down('a.more'), 'click', this.navigateToItem, this);
	},


	setupReplyScrollZone: function () {
		var rH = this.respondEl.getHeight(),
			tH = this.topEl.getHeight(),
			max = Ext.dom.Element.getViewportHeight()
				- tH
				- rH;

		console.log(rH, tH, max, this.body);
		this.body.setStyle({maxHeight: max + 'px'});
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
	 * @param record
	 * @returns Number
	 */
	getCommentCount: function (record) {
		throw 'Do not use the base class directly. Subclass and implement this';
	},


	/**
	 * Place to derive fields that should be put into the template.
	 *
	 * @param record
	 * @returns Object
	 */
	getDerivedData: function (record) {
		return {
			relativeTime: record.getRelativeTimeString()
		};
	},


	setRenderedTitle: function(record){
		if(record.isModel){
			return record.get('title');
		}
		return record.title;
	},


	/** @private */
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
				me.avatar.setStyle({backgroundImage: 'url(' + o.avatarURL + ');'});
				me.name.update(me.name.getHTML() + o.name);
			}

			// This allows navigating to the profile of the creator.
			// Our mixin 'ProfileLinks' expects it.
			this.user = u;
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
			box = this.replyBoxEl;
		this.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: this.respondEl, 'saveCallback': this.saveCallback});

		box.setVisibilityMode(DISPLAY);

		this.respondEl.setVisibilityMode(DISPLAY);

		if ($AppConfig.service.canShare()) {
			this.mon(this.replyEl, 'click', this.showEditor, this);
		}
		else {
			this.replyEl.remove();
			//FIXME figure out what needs to happen to just remove respondEl
			this.respondEl.hide(); //Note we just hide this one, since it looks referenced in a lot of places
		}

		hide = function(){
			//Ext.bind(box.hide, box, [false]);
            // Now that the editor is active, adjust the reply scroll zone.
            this.setupReplyScrollZone();
			this.replyBoxEl.hide();
			this.constrainPopout();
		};

		show = function(){
			//Ext.bind(box.show, box, [false]);
			this.replyBoxEl.show();
			this.constrainPopout();
		};

		this.mon(this.editor, {
			scope: this,
			'activated-editor': hide,
			'deactivated-editor': show,
			'no-body-content': function (editor, bodyEl) {
				editor.markError(bodyEl, 'You need to type something');
				return false;
			},
			'grew': 'constrainPopout'
		});

		this.mon(this.editor, 'deactivated-editor', this.setupReplyScrollZone, this, {delay: 1});

		this.on('beforedeactivate', this.handleBeforeDeactivate, this);
		this.mon(this.messageBodyEl, 'click', this.navigateToItem, this);
		this.mon(this.subjectEl, 'click', this.navigateToItem, this);
		this.mon(this.commentsEl, 'click', this.showReplies, this);
		this.enableProfileClicks(this.name, this.avatar);
	},

	constrainPopout: function(){
		var pop = this.up('.activity-popout');

        pop.doConstrain();
	},


	handleBeforeDeactivate: function () {
		if ((this.editor && this.editor.isActive())) {
			return false;
		}
		return    Ext.Array.every(this.items.items, function (item) {
			return item.fireEvent('beforedeactivate');
		});
	},


	showEditor: function () {
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
        this.fireEvent('realign');
	},


	getPointerStyle: function (x, y) {
		return y >= this.footEl.getY() ? 'grey' : '';
	}

});
