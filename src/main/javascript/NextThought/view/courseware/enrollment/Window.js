Ext.define('NextThought.view.courseware.enrollment.Window', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.enrollment-window',

	mixins: {
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.view.courseware.enrollment.DetailView'
	],

	cls: 'purchase-window',
	width: 520,
	height: 690,
	autoShow: true,
	resizable: false,
	draggable: false,
	modal: true,
	dialog: true,

	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'header', cn: [
			{ cls: 'titlebar', cn: [
				{ cls: 'tab visited', html: 'Course Details', 'data-order': 'detail', 'data-no-decoration': true },
				{ tag: 'tpl', 'if': 'enrollProcess', cn: {
					 cls: 'tab', html: 'Confirmation', 'data-order': 2
				}},
				{ tag: 'tpl', 'if': '!enrollProcess', cn: [
					{ cls: 'tab', html: 'Confirmation', 'data-order': 1 },
					{ cls: 'tab', html: 'Complete', 'data-order': 2 }
				]},
				{ cls: 'close' }
			]},
			{ cls: 'info', cn: [
				{ cls: 'bookcover', style: {backgroundImage: 'url({Icon})'} },
				{ cls: 'meta', cn: [
					{cls: 'course', html: '{Name}'},
					{cls: 'title', html: '{Title}'},
					{tag: 'tpl', 'if': 'by', cn: {cls: 'byline', html: 'By {by}'}}
				]}
			] }
		]
		},
		{
			id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
		},
		{
			cls: 'error', cn: [
			{cls: 'label'},
			{cls: 'message'}
		]
		},
		{
			cls: 'footer', cn: [
			{tag: 'label', cls: 'agree', cn: [
				{tag: 'input', type: 'checkbox'},
				{}
			]},
			{tag: 'a', cls: 'button cancel', role: 'button', html: 'Cancel'},
			{tag: 'a', cls: 'button confirm', role: 'button', html: ''}
		]
		}
	]),

	renderSelectors: {
		headerEl: '.header',
		closeEl: '.header .titlebar .close',

		footerEl: '.footer',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm',

		errorEl: '.error',
		errorLabelEl: '.error .label',
		errorMessageEl: '.error .message',

		checkboxLabelEl: '.footer label input + div',
		checkboxEl: '.footer label input',
		checkboxBoxEl: '.footer label'
	},

	componentLayout: 'natural',
	layout: 'auto',
	items: [],


	getDockedItems: function() {
		return [];
	},


	listeners: {
		afterRender: 'center'
	},


	beforeRender: function() {
		this.callParent(arguments);
		var enrolling = this.record.getLink('enroll');
		this.renderData = Ext.applyIf(this.renderData || {}, this.record.getData());
		this.renderData = Ext.apply(this.renderData, {enrollProcess: enrolling});
		this.renderData.by = this.renderData.Author || this.renderData.Provider;
	},


	afterRender: function() {
		var me = this;
		me.callParent(arguments);
		me.mon(me.closeEl, 'click', 'close');
		me.mon(me.cancelEl, 'click', 'close');
		me.mon(me.confirmEl, 'click', 'onConfirm');
		me.getEl().select('.titlebar .tab').each(function(e) {
			me.mon(e, 'click', 'onTabClicked');
		});

		me.renderPlaceholder(me.activationCodeEl);

		me.mon(me.checkboxBoxEl, 'click', 'onCheckboxClicked', me);

		this.add({xtype: 'enrollment-detailview', record: this.record});

		this.errorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorEl.hide();
		this.updateContentHeight();
	},


	updateContentHeight: function() {
		var el = this.getTargetEl(),
			footer = this.footerEl,
			h;

		if (!footer || !el || !footer.getY || !el.getY) {
			return;
		}

		h = footer.getY() - el.getY();
		el.setHeight(h);
		Ext.defer(this.getEl().repaint, 10, this.getEl());
	},


	hideError: function() {
		this.updateContentHeight();
		this.errorEl.hide();
	},


	showError: function(message, label) {
		var el = this.getTargetEl(),
			errorEl = this.errorEl;

		function syncHeight() {
			if (!errorEl || !errorEl.getY || !el || !el.getY) {
				return;
			}
			var h = errorEl.getY() - el.getY();
			el.setHeight(h);
		}

		this.errorLabelEl.update(label || 'Error:');
		this.errorMessageEl.update(message || '');

		errorEl.show();
		Ext.defer(syncHeight, 1);
	},


	onAdd: function(cmp) {
		var ordinal = cmp.ordinal,
			confirmLabel = cmp.confirmLabel || 'Enroll',
			checkLabel = cmp.checkboxLabel;

		this.activeView = cmp;

		if (this.rendered) {
			this.setConfirmState(true);
			this.checkboxEl.dom.checked = false;
			this.checkboxLabelEl.update(checkLabel || '');
			this.checkboxBoxEl[checkLabel ? 'addCls' : 'removeCls']('active');

			this.syncTab(ordinal);
			this.confirmEl.update(confirmLabel);
			this.confirmEl[confirmLabel === 'Drop' ? 'addCls' : 'removeCls']('red');
			this.confirmEl[cmp.omitCancel ? 'addCls' : 'removeCls']('alt');
			this.cancelEl[cmp.omitCancel ? 'hide' : 'show']();
			Ext.defer(this.updateContentHeight, 1, this);
		}
	},


	syncTab: function(ordinal) {
		var el = this.getEl(),
			tabs = el.select('.titlebar .tab'),
			defaultTab = this.started ? 0 : 'detail';

		if (ordinal > 0) {
			this.started = true;
			el.select('.titlebar').addCls('started').removeCls('show-history');
			el.select('.titlebar .tab.active').addCls('visited');
		}

		tabs.removeCls('active');
		el.select('.titlebar .tab[data-order="' + (ordinal || defaultTab) + '"]').addCls('active');

		tabs.each(function(t, c) {
			var i = t.getAttribute('data-order');
			if (i === 'detail') {
				i = 0;
			}

			t[i < ordinal ? 'removeCls' : 'addCls']('locked');

			if (i >= ordinal) {
				t.removeCls('visited');
			}
		});
	},


	onConfirm: function() {
		if (this.confirmEl.hasCls('disabled')) {
			return;
		}

		var checkState = this.checkboxEl.dom.checked;

		this.down('[onConfirm]').onConfirm(this, null, checkState);
	},


	onTabClicked: function(e) {

	},


	setConfirmState: function(enabled) {
		if (this.confirmEl) {
			this.confirmEl[!enabled ? 'addCls' : 'removeCls']('disabled');
		}
	},


	onCheckboxClicked: function(e) {
		var t = e.getTarget(),
			active = this.activeView,
			linkClicked = (active && active.onCheckboxLinkClicked) || Ext.emptyFn;

		if (t.tagName === 'A') {
			e.stopEvent();
			Ext.callback(linkClicked, active, [this]);
			return false;
		}

		Ext.defer(this.updateContentHeight, 1, this);
		(this[active.checkboxAction || 'none'] || Ext.emptyFn).call(this);
		return true;
	},


	updateTabTitleForChild: function(cmp, text) {
		var ordinal = cmp.ordinal,
			t = this.headerEl.down('.titlebar .tab[data-order=' + ordinal + ']');

		if (t) {
			t.update(text);
		}
	},


	agreeToTerms: function() {
		var c = this.checkboxEl.dom.checked,
			a = this.activeView;
		Ext.callback(a && a.setAgreementState, a, [c]);
	}
});
