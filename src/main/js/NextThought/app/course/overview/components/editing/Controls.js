Ext.define('NextThought.app.course.overview.components.editing.Controls', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls',

	requires: [
		'NextThought.app.prompt.Actions',
		'NextThought.app.windows.Actions',
		'NextThought.app.course.overview.components.editing.publishing.Menu'
	],


	cls: 'outline-editing-controls',


	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'for': 'buttons', cn: [
			{cls: 'button {cls}', 'data-action': '{name}', cn: [
				{tag: 'div', cls: 'label', html: '{label}'},
				{tag: 'tpl', 'if': 'hasMenu', cn: [
					{cls: 'menu-container'}
				]}
			]}
		]}
	]),

	BUTTONS: {
		audit: {
			iconCls: 'audit',
			label: 'Audit',
			disabled: false
		},
		publish: {
			iconCls: 'publish',
			label: 'Publish',
			disabled: false,
			hasMenu: true
		},
		edit: {
			iconCls: 'edit',
			label: 'Edit',
			disabled: false
		},
		add: {
			iconCls: 'add',
			label: 'Add',
			disabled: false
		}
	},


	/**
	 * How to configure the options audit, publish, edit, add add
	 *
	 * {
	 * 	order: [String], //the order of options,
	 * 	[name]: { //Override properties of the button
	 * 		cls: String, //a class to add
	 * 		label: String, //override the label
	 * 	}
	 * }
	 *
	 * @type {Object}
	 */
	optionsConfig: {
		order: ['audit', 'publish', 'edit', 'add']
	},


	initComponent: function() {
		this.callParent(arguments);

		this.PromptActions = NextThought.app.prompt.Actions.create();
		this.WindowActions = NextThought.app.windows.Actions.create();

		//If the record we are given is published, change the publish button
		//TODO: revisit this once we set up the publish controls
		if (this.record && this.record.isPublished && this.record.isPublished()) {
			this.BUTTONS.publish.iconCls = 'unpublish';
			this.BUTTOND.publish.label = 'Unpublish';
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		var config = this.optionsConfig,
			buttons = this.BUTTONS;

		this.renderData = Ext.apply(this.renderData || {}, {
			buttons: config.order.reduce(function(acc, key) {
				var button = buttons[key],
					override = config[key] || {},
					cls = [];

				if (!button) {
					return acc;
				}

				cls.push(button.iconCls);

				if (override && override.cls) {
					cls.push(override.cls);
				}

				if (override && override.label !== undefined) {
					button.label = override.label;
				}

				if (button.disabled || override.disabled) {
					cls.push('disabled');
				}

				if (button.hasMenu && !(override && override.open)) {
					cls.push('closed');
				}

				button.cls = cls.join(' ');
				button.name = key;

				acc.push(button);

				return acc;
			}, [])
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.auditEl = this.el.down('[data-action=audit]');
		this.publishEl = this.el.down('[data-action=publish]');
		this.editEl = this.el.down('[data-action=edit]');
		this.addEl = this.el.down('[data-action=add]');

		this.mon(this.el, 'click', this.handleClick.bind(this));

		this.initPublishMenu(this.publishEl);
	},


	initPublishMenu: function(el) {
		var menuContainer = el && el.down('.menu-container');

		if (!menuContainer) { return; }

		this.publishMenu = NextThought.app.course.overview.components.editing.publishing.Menu.create({
			record: this.record,
			contents: this.contents,
			renderTo: menuContainer,
			setPublished: function() {

			},
			setWillPublishOn: function() {

			},
			setNotPublished: function() {

			}
		});

		wait(10)
			.then(this.alignPublishingMenu.bind(this, menuContainer));

		this.on('destroy', this.publishMenu.destroy.bind(this.publishMenu));
	},


	alignPublishingMenu: function(menuContainer){
		var box = menuContainer.getBox(),
			me = this,
			menu = this.publishMenu,
			top = menuContainer.getBottom() + 15,
			right = menuContainer.getRight() + 70,
			viewportHeight = Ext.Element.getViewportHeight(),
			maxHeight = viewportHeight - top - 10;

		menu.onceRendered
			.then(function() {
				menu.el.setStyle('top', top + 'px');
				menu.el.setStyle('right', right + 'px');
				menu.el.setStyle('left', 'auto');
				menu.el.setStyle('maxHeight', maxHeight + 'px');
			});
	},


	handleClick: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('[data-action=audit]')) {
			this.showAuditLog();
		} else if (e.getTarget('[data-action=publish]')) {
			this.togglePublishMenu();
		} else if (e.getTarget('[data-action=edit]')) {
			this.doEdit();
		} else if (e.getTarget('[data-action=add]')) {
			this.doAdd();
		}
	},


	showAuditLog: function() {
		//TODO: fill this in
	},


	togglePublishMenu: function() {
		if (this.publishEl) {
			if (this.publishEl.hasCls('closed')) {
				this.alignPublishingMenu(this.publishEl);
			}
			this.publishEl.toggleCls('closed');
		}
	},


	doEdit: function() {
		this.PromptActions.prompt('overview-editing', {record: this.record, parent: this.parentRecord, root: this.root});
	},


	doAdd: function() {
		this.PromptActions.prompt('overview-creation', {parent: this.contents || this.record, root: this.root});
	}
});
