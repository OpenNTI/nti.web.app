Ext.define('NextThought.app.course.assessment.components.admin.email.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.course-email-editor',

	requires: [
		'NextThought.model.Email',
		'NextThought.app.course.assessment.components.admin.email.Actions',
		'NextThought.app.course.assessment.components.admin.email.EmailTokenField'
	],

	enableTitle: true,
	enableCopied: false,
	enableObjectControls: false,
	enableTextControls: false,

	RECEIVER_MAP: {
		'ForCredit': 'Enrolled Students',
		'All': 'All Students',
		'Open': 'Open Students'
	},

	REPLY_DEFAULTS: {
		'ForCredit': 'ForCredit',
		'All': 'ForCredit',
		'Open': 'NoReply'
	},

	toolbarTpl: Ext.DomHelper.markup(
		[
			{
				cls: 'aux', cn: [
				{
					cls: 'row receiver', cn: [
					 	{cls: 'label', html: 'To'},
						{cls: 'field'},
						{cls: 'action', cn: [
							{cls: 'reply-option', cn: [
								{tag: 'label', cls:'toggle', cn: [
									{tag: 'input', type: 'checkbox', cls: 'reply-check'},
									{tag: 'span', html: 'Allow Replies'}
								]},
								{tag: 'span', cls: 'reply-scope link arrow', html: ''}
							]}
						]}
					]
				},
				{tag: 'tpl', 'if': 'enableCopied', cn: [
					{ cls: 'row cc-ed', cn: [
						{cls: 'label', html: 'cc'},
						{cls: 'field'}
					]}
				]}
			]}
		]),

	footerControlsTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{tag: 'label', cls:'toggle', cn: [
			{tag: 'input', type: 'checkbox', cls: 'email-copy'},
			{tag: 'span', html: 'Send me a copy of the email'}
		]}
	)),

	headerTplOrder: '{toolbar}{title}',

	cls: 'email-editor scrollable',

	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html: '{super}' }),

	renderSelectors: {
		titleEl: '.title',
		footerEl: '.footer',
		receiverEl: '.row.receiver .field',
		copiedEl: '.row.cc-ed .field',
		replyOptionEl: '.reply-option',
		replyScopeEl: '.reply-option .reply-scope',
		replyCheckBoxEl: '.reply-option .reply-check'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.isIndividualEmail = !!(this.record && this.record.get('Receiver'));	
	},

	
	afterRender: function() {
		this.callParent(arguments);
		
		Ext.EventManager.onWindowResize(this.syncHeight.bind(this));
		wait(500).then(this.syncHeight.bind(this)); //let the animation finish

		this.EmailActions = NextThought.app.course.assessment.components.admin.email.Actions.create();
		this.replyScopeEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.setReceiverField();
		this.setupCopiedField();
		this.setupTitleField();
		this.setReplyToField();
		this.setupFooterControls();

		this.saveButtonEl.setHTML(' Send Email');
		this.mon(this.replyScopeEl, 'click', this.replyPickerClicked.bind(this));
		this.mon(this.replyCheckBoxEl, 'click', this.replyCheckboxClicked.bind(this));
	},


	setupTitleField: function() {
		if (!this.titleEl) { return; }

		this.titleEl.dom.setAttribute('placeholder', 'Subject');
	},


	setupFooterControls: function(){
		var left = this.footerEl.down('.left'), copyCheckboxEl;
		if (left) {
			this.footerControlsTpl.append(left);
			copyCheckboxEl = this.footerEl.down('.email-copy');
			if (copyCheckboxEl) {
				// On by default for Group emails.
				copyCheckboxEl.dom.checked = !this.isIndividualEmail;
				this.mon(copyCheckboxEl, 'click', this.emailCopyClicked.bind(this));
				if (this.record) {
					this.record.set('EmailCopy', !this.isIndividualEmail);
				}
			}
		}
	},


	emailCopyClicked: function(e){
		var i = e.target;
		if (this.record) {
			this.record.set('EmailCopy', i.checked);	
		}
	},


	setReceiverField: function() {
		var scope,
			to = this.record && this.record.get('Receiver');

		if (this.isIndividualEmail) {
			this.receiverEl.setHTML(to);
		}
		else {
			scope = this.record && this.record.get('scope');
			this.receiverEl.setHTML(this.RECEIVER_MAP[scope]);
			this.receiverEl.addCls('group');
			this.receiverEl.addCls('link');
			this.receiverEl.addCls('arrow');

			this.currentScope = scope;
			// TODO: Create the menu picker
			this.createReceiverScopePicker();
		}
	},

	createReceiverScopePicker: function(){
		var me = this,
			menu = 
				Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'receiver-scope',
						handler: function(item) {
							me.receiverScopeChanged(item, item.up('.menu'));
						}
					},
					width: 220,
					items: [
						{
							text: 'All Students',
							studentFilter: 'All',
							isLabel: true,
							checked: me.currentScope === 'All'
						},
						{
							text: 'Enrolled Students',
							studentFilter: 'ForCredit',
							isLabel: true,
							checked: me.currentScope === 'ForCredit'
						},
						{
							text: 'Open Students',
							studentFilter: 'Open',
							isLabel: true,
							checked: me.currentScope === 'Open'
						}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		this.mon(this.receiverEl, 'click', this.showReceiverScopePicker.bind(this));
		this.receiverScopeMenu = menu;
	},


	showReceiverScopePicker: function(){
		if (!this.receiverScopeMenu) { return; }

		if (!this.receiverScopeMenu.isVisible()) {
			this.receiverScopeMenu.showBy(this.receiverEl, 'tl-bl?');
		}
		else {
			this.receiverScopeMenu.hide();
		}
	},


	receiverScopeChanged: function(item, menu){
		this.receiverEl.setHTML(item && item.text);
		if (this.record) {
			this.record.set('scope', item && item.studentFilter);
			this.currentScope = this.record.get('scope');
			wait().then(this.filterReplyOptions.bind(this));
		}
	},


	setupCopiedField: function() {
		if (!this.copiedEl) {
			return;
		}

		var tabTracker = new NextThought.util.TabIndexTracker(),
			el = this.el, me = this;

		this.copiedCmp = Ext.widget('tags', {renderTo: this.copiedEl, tabIndex: tabTracker.next()});
		this.on('destroy', 'destroy', this.copiedCmp);
		this.mon(this.copiedCmp, 'blur', function() {
			var e = el.down('.content');
			Ext.defer(e.focus, 10, e);
		});

		this.copiedCmp.onceRendered
			.then(function() {
				var e = me.copiedCmp.el.down('input');
				if (e) {
					e.dom.setAttribute('placeholder', "");
				}
			});

		if ($AppConfig.userObject.get('email')) {
			this.copiedCmp.addTag($AppConfig.userObject.get('email'));
		}
	},


	updateScope: function(record){
		var scope = record && record.raw && record.raw.studentFilter;

		if (scope) {
			this.record.set('scope', scope);
		}
	},


	destroy: function() {
		Ext.EventManager.removeResizeListener(this.syncHeight, this);
		return this.callParent(arguments);
	},


	syncHeight: function() {
		var el = this.contentEl,
			container = this.ownerCt && this.ownerCt.el && this.ownerCt.el.dom,
			containerRect = container && container.getBoundingClientRect(),
			otherPartsHeight = 0,
			top, height, min = 300;

		if (!el) {
			return;
		}

		if (!containerRect) {
			el.setHeight(min);
		}

		top = Math.max(containerRect && containerRect.top || 0, 0);

		otherPartsHeight += this.titleEl && this.titleEl.getHeight() || 50;
		// otherPartsHeight += this.tagsEl.getHeight();
		// otherPartsHeight += this.sharedListEl.getHeight();
		otherPartsHeight += this.footerEl && this.footerEl.getHeight() || 0;
		otherPartsHeight += this.receiverEl && this.receiverEl.getHeight() || 0;

		height = Ext.Element.getViewportHeight() - (top + otherPartsHeight + 90 + 10);//top of window + height of other parts + height of header + padding

		el.setHeight(Math.max(min, height));

		wait(700)
			.then(this.updateLayout.bind(this));
	},


	setReplyToField: function(){
		this.noReplyPicker = this.createNoReplyMenu();
		this.filterReplyOptions();
	},


	replyPickerClicked: function(e) {
		var target = Ext.get(e.getTarget());

		if (this.replyScopeEl.hasCls('disabled')) {
			return;
		}

		target = target.up('.reply-option') || target;
		if (!this.noReplyPicker) {
			this.noReplyPicker = this.createNoReplyMenu();
		}

		if (this.noReplyPicker.isVisible()) {
			this.noReplyPicker.hide();
		}
		else {
			this.noReplyPicker.showBy(target, 'tr-br?');
		}
	},


	replyCheckboxClicked: function(e){
		var i = e.target, 
		action = i.checked ? 'removeCls' : 'addCls';
		if (this.record) {
			this.record.set('NoReply', !i.checked);	
		}
		this.replyScopeEl[action]('disabled');
	},


	createNoReplyMenu: function(){
		var me = this, menu;

		if (this.isIndividualEmail) {
			return;
		}

		menu = 
			Ext.widget('menu', {
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menucheckitem',
					plain: true,
					group: 'no-reply',
					handler: function(item) {
						me.handleNoReplyMenuClick(item, item.up('.menu'));
					}
				},
				width: 220,
				items: [{
						text: 'All Students',
						scope: 'All',
						checked: true,
						NoReply: false
					},
					{
						text: 'Open Students',
						scope: 'Open',
						NoReply: false
					},
					{
						text: 'Enrolled Students',
						scope: 'ForCredit',
						NoReply: false
					}
				]
			});
		return menu;
	},


	filterReplyOptions: function(){
		var menu = this.noReplyPicker,
			me = this, selectedItem;

		if (this.currentScope === 'All') {
			menu.items.each(function(item){
				if (item.scope === me.REPLY_DEFAULTS[me.currentScope]) {
					item.setChecked(true);
					selectedItem = item;
				}
			});

			if (selectedItem && selectedItem.text) {
				this.replyScopeEl.setHTML('from ' + selectedItem.text);
			}

			this.replyOptionEl.addCls('picker');
			this.replyScopeEl.show();	
		}
		else {
			this.replyOptionEl.removeCls('picker');
			this.replyScopeEl.hide();
		}

		if (!this.replyScopeEl.dom.checked) {
			this.replyScopeEl.addCls('disabled');
		}
	},


	/**
	 * Handle the reply-picker selection.
	 *
	 * Note: If a user chooses to allow reply, make sure we set both the reply option 
	 * as well as the intended scope (Open, ForCredit...). 
	 * When the no-reply is set to true, it will override everyhing else.
	 * 
	 * @param  {Ext.MenuItem} item [description]
	 * @param  {Ext.Menu} menu [description]
	 */
	handleNoReplyMenuClick: function(item, menu){
		this.record.set('NoReply', item.NoReply);
		this.record.set('replyScope', item.scope);
		if (this.replyScopeEl) {
			this.replyScopeEl.setHTML('from ' + item.text);
		}
	},


	getValue: function() {
		return {
			body: this.getBody(this.getBodyValue()),
			NoReply: this.record && this.record.get('NoReply'),
			title: this.titleEl ? this.titleEl.getValue() : undefined
		}
	},


	onSave: function(e){
		e.stopEvent();
		var me = this,
			v = this.getValue(),
			t, trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l, rec;

		if (DomUtils.isEmpty(v.body)) {
			me.markError(me.editorBodyEl, getString('NextThought.view.profiles.parts.BlogEditor.emptybody'));
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (/^[^a-z0-9]+$/i.test(v.title)) {
			me.markError(me.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.specialtitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			me.markError(me.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.attitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (me.el) {
			me.el.mask('Saving...');
		}

		// NOTE: for now the server expects the email's body to be plainText, treat it as such
		v.body = v.body.join("");

		if (this.record) {
			this.record.set({
				'Body': v.body,
				'Subject': v.title 
			});

			this.EmailActions.sendEmail(this.record)
				.then(function() {
					console.log(arguments);
					me.emailSent = true;
					me.presentSuccessMessage();
					me.fireEvent('after-save');
				})
				.fail(function(e) {
					me.el.unmask();
					alert({
						title: 'Error',
						msg: 'There was an error sending your email. Please try again later.'
					});
					console.error(arguments);
				});
		}
		
	},


	allowNavigation: function(){
		var msg = 'You are currently creating an email. Would you like to leave without sending it?';

		if (this.emailSent) {
			return Promise.resolve();
		}

		return new Promise(function(fulfill, reject) {
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
	},


	presentSuccessMessage: function(){
		alert({
			icon: 'success',
			title: 'Email Sent',
			msg: 'Your message has been sent.'
		});
	},


	onCancel: function(e) {
		e.stopEvent();
		this.emailSent = true;
		this.fireEvent('cancel');
		this.destroy();
	}

});