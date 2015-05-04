Ext.define('NextThought.app.content.components.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.content-navigation',

	cls: 'content-navigation',

	tabsTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{tag: 'ul', cls: 'tabs', cn: [
			{tag: 'tpl', 'for': 'tabs', cn: [
				{
					tag: 'li',
					'data-index': '{#}',
					'data-route': '{route}',
					'data-title': '{title}',
					'data-text': '{text}',
					cls: 'tab{[values.active ? " active": ""]}',
					html: '{text}'
				}
			]}
		]}
	)),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'back'},
		{cls: 'content-container', cn: [
			{cls: 'branding'},
			{cls: 'icon'},
			{cls: 'content', cn: [
				{cls: 'active-content', html: ''},
				{cls: 'tab-container'},
				{cls: 'active-tab'}
			]}
		]}
	]),


	renderSelectors: {
		backEl: '.back',
		brandingEl: '.content-container .branding',
		iconEl: '.content-container .icon',
		titleEl: '.content .active-content',
		tabContainerEl: '.content .tab-container',
		activeTabEl: '.content .active-tab'
	},


	afterRender: function() {
		this.callParent(arguments);

		//if the body view doesn't have an on back handler disable the button
		if (!this.bodyView.onBack) {
			this.backEl.addCls('disabled');
		} else {
			this.mon(this.backEl, 'click', this.bodyView.onBack.bind(this.bodyView));
		}

		this.mon(this.tabContainerEl, 'click', this.onTabClick.bind(this));

		if (this.bundle) {
			this.bundleChanged(this.bundle);
		}

		if (this.tabs) {
			this.setTabs(this.tabs, true);
		}
	},


	bundleChanged: function(bundle) {
		if (!this.rendered) {
			this.bundle = bundle;
			return;
		}

		if (this.currentBundle === bundle) {
			return;
		}

		this.currentBundle = bundle;

		var cls = 'is-book',
			icon = this.iconEl,
			data = bundle.asUIData();

		icon[data.isCourse ? 'removeCls': 'addCls'](cls);
		icon.setStyle({backgroundImage: 'url(' + (data.thumb || data.icon) + ')'});

		if (data.vendorIcon) {
			this.brandingEl.addCls('custom-vendor');
			this.brandingEl.setStyle({backgroundImage: 'url(' + data.vendorIcon + ')'});
		} else {
			this.brandingEl.removeCls('custom-vendor');
			this.brandingEl.setStyle({backgroundImage: undefined});
		}

		this.titleEl.update(data.title);
	},

	/**
	 * Take an array of tabs to render in the navigation
	 * tab config: {
	 * 		route: String, //the name of the route this tab activates
	 * 		title: String, //the title of the route this tab activates
	 * 		text: String, //the name of the tab,
	 * 		active: Boolean //if this is the active tab
	 * }
	 * @param {Array} tabs a list of tab configs to show
	 */
	setTabs: function(tabs) {
		if (!this.rendered) {
			this.tabs = tabs;
			return;
		}

		var me = this,
			container = me.tabContainerEl,
			tabs, active;

		function alignCurrentTab() {
			active = active.getBoundingClientRect();
			container = container.getBoundingClientRect();

			me.activeTabEl.setStyle({
				width: active.width + 'px',
				left: active.left - container.left + 'px'
			});
		}

		container.dom.innerHTML = '';

		tabs = me.tabsTpl.append(container, {tabs: tabs}, true);
		tabs = tabs && tabs.dom;
		active = tabs && tabs.querySelector('.tab.active');
		container = container && container.dom;

		//if we are animating in, wait until we are finished to the the left will be correct
		if (me.hasCls('showing')) {
			wait(1000)
				.then(alignCurrentTab);
		} else {
			alignCurrentTab()
		}
	},


	onTabClick: function(e) {
		var tab = e.getTarget('.tab');

		if (this.bodyView.onTabChange && tab) {
			this.bodyView.onTabChange(tab.getAttribute('data-title'), tab.getAttribute('data-route'), tab);
		}
	}
});
