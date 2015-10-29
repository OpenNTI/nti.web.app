Ext.define('NextThought.app.course.assessment.components.admin.email.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.course-email-editor',

	requires: [
		'NextThought.model.Email',
		'NextThought.app.course.assessment.components.admin.email.Actions',
		'NextThought.app.course.assessment.components.admin.email.ScopeTokenField'
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

	toolbarTpl: Ext.DomHelper.markup(
		[
			{
				cls: 'aux', cn: [
				{
					cls: 'row receiver', cn: [
					 	{cls: 'label', html: 'To'},
						{cls: 'field'},
						{cls: 'action no-reply on'}
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

	headerTplOrder: '{toolbar}{title}',

	cls: 'email-editor scrollable',

	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html: '{super}' }),

	renderSelectors: {
		titleEl: '.title',
		footerEl: '.footer',
		receiverEl: '.row.receiver .field',
		copiedEl: '.row.cc-ed .field'
	},

	
	afterRender: function() {
		this.callParent(arguments);
		
		Ext.EventManager.onWindowResize(this.syncHeight.bind(this));
		wait(500).then(this.syncHeight.bind(this)); //let the animation finish

		this.EmailActions = NextThought.app.course.assessment.components.admin.email.Actions.create();

		this.setupReceiverField();
		this.setupCopiedField();
		this.setupTitleField();
		this.saveButtonEl.setHTML(' Send');
	},


	setupTitleField: function() {
		if (!this.titleEl) { return; }

		this.titleEl.dom.setAttribute('placeholder', 'Subject');
	},


	setupReceiverField: function() {
		if (!this.receiverEl) {
			return;
		}

		var tabTracker = new NextThought.util.TabIndexTracker(),
			el = this.el, me = this, t, scope;

		this.receiverCmp = Ext.widget('course-scope-list', {renderTo: this.receiverEl, tabIndex: tabTracker.next()});
		this.on('destroy', 'destroy', this.receiverCmp);
		this.mon(this.receiverCmp, {
			'blur': function() {
				var e = el.down('.content');
				Ext.defer(e.focus, 10, e);
			},
			'selection-changed': this.updateScope.bind(this)
		});

		this.receiverCmp.onceRendered
			.then(function() {
				var e = me.receiverCmp.el.down('input');
				if (e) {
					e.dom.setAttribute('placeholder', "");
				}
			});

		scope = this.record && this.record.get('scope');
		scope = this.RECEIVER_MAP[scope];
		if (this.receiverCmp.setInitialToken) {
			this.receiverCmp.setInitialToken(scope);				
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


	getValue: function() {
		return {
			body: this.getBody(this.getBodyValue()),
			NoReply: false,
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
				'Subject': v.title,
				'NoReply': v.NoReply 
			});

			this.EmailActions.sendEmail(this.record)
				.then(function() {
					console.log(arguments);
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


	presentSuccessMessage: function(){
		alert({
			icon: 'success',
			title: 'Email Sent',
			msg: 'Your message has been sent.'
		});
	},


	onCancel: function(e) {
		e.stopEvent();
		this.fireEvent('cancel');
		this.destroy();
	}

});