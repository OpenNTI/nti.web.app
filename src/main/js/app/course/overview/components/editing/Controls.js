export default Ext.define('NextThought.app.course.overview.components.editing.Controls', {
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
		this.setPublishState();
	},


	initPublishMenu: function(el) {
		var menuContainer = el && el.down('.menu-container'), me = this,
			html = Ext.query('.x-viewport')[0];

		if (!menuContainer) { return; }

		this.publishMenu = NextThought.app.course.overview.components.editing.publishing.Menu.create({
			record: this.record,
			contents: this.contents,
			renderTo: menuContainer,
			setPublished: this.setPublishState.bind(this),
			setWillPublishOn: this.setPublishState.bind(this),
			setNotPublished: this.setPublishState.bind(this)
		});

		
		this.onWindowResizeBuffer = Ext.Function.createBuffered(this.onWindowResize, 10, this);
   		Ext.EventManager.onWindowResize(this.onWindowResizeBuffer, this);
   		window.addEventListener('scroll', this.onWindowResizeBuffer.bind(this));

		this.on('destroy', this.publishMenu.destroy.bind(this.publishMenu));
   		this.on('destroy', function(){
   			Ext.EventManager.removeResizeListener(me.onWindowResizeBuffer, me);
   			window.removeEventListener(me.onWindowResizeBuffer, me);
   		});
	},


	/**
	 * Set the initial publication state of the lesson control.
	 * Since publishing affects both the outline node and the lesson overview,
	 * we will take into account both to make sure they follow the intended business logic.
	 * 
	 */
	setPublishState: function(){
		var node = this.record,
			isNodePublished = node && node.isPublished && node.isPublished(),
			lesson = this.contents,
			isLessonPublished = lesson && lesson.isPublished && lesson.isPublished();


		if (isNodePublished && isLessonPublished) {
			this.setPublished();
		}
		else if (!isNodePublished && !isLessonPublished) {
			this.setNotPublished();
		}
		else if (isNodePublished && !isLessonPublished) {
			if (isLessonPublished === false) {
				this.setWillPublishOn();
			}
		}
		else {
			console.warn('Not expected. The node should be published if its lesson is published. ', node, lesson);
		}
	},


	setPublished: function() {
		var label = this.publishEl && this.publishEl.down('.label');

		if (this.publishEl) {
			this.publishEl.removeCls('publish');
			this.publishEl.addCls('published');
			if (label) {
				label.update('Published');
			}
		}
	},


	setWillPublishOn: function() {
		var label = this.publishEl && this.publishEl.down('.label'),
			rec = this.contents,
			value = rec && rec.get('publishBeginning'),
			date = new Date(value);

		if (this.publishEl && value) {
			date = this.getDayAndMonth(date);
			this.publishEl.removeCls('publish');
			this.publishEl.addCls('published');
			if (label) {
				label.update('Publish on ' + date);
			}
		}
	},

	getDayAndMonth: function(date){
		var parts, m;

		if (!date) { return ''; }

		// Format i.e. December 12
		date = Ext.Date.format(date, 'F d');
		parts = date.split(' ');
		m = parts[0].substring(0,3);
		return m + ' ' + parts[1];
	},


	setNotPublished: function() {
		var label = this.publishEl && this.publishEl.down('.label');

		if (this.publishEl) {
			this.publishEl.removeCls('published');
			this.publishEl.addCls('publish');
			if (label) {
				label.update('Publish');
			}
		}
	},


	onWindowResize: function(){
		var menuContainer = this.publishEl;
		if (menuContainer) {
			this.alignPublishingMenu(menuContainer);
		}
	},


	alignPublishingMenu: function(menuContainer){
		var box = menuContainer && menuContainer.dom.getBoundingClientRect() || {},
			me = this,
			menu = this.publishMenu,
			top = box.bottom + 15,
			right = box.right + 25,
			viewportHeight = Ext.Element.getViewportHeight(),
			maxHeight = viewportHeight - top - 10;

		if (menu.el) {
			menu.el.setStyle('top', top + 'px');
			menu.el.setStyle('right', right + 'px');
			menu.el.setStyle('left', 'auto');
			menu.el.setStyle('maxHeight', maxHeight + 'px');	
		}
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
