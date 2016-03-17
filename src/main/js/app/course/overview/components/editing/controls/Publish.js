export default Ext.define('NextThought.app.course.overview.components.editing.controls.Publish', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-publish',

	cls: 'button publish pub',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Publish'},
		{cls: 'menu-container'}
	]),


	renderSelectors: {
		labelEl: '.label',
		menuContainerEl: '.menu-container'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.togglePublishMenu.bind(this));

		this.el.addCls('closed');
		this.initPublishMenu();
		this.setPublishState();
	},


	initPublishMenu: function() {
		if (!this.publishMenu) {
			this.publishMenu = NextThought.app.course.overview.components.editing.publishing.Menu.create({
				record: this.record,
				contents: this.contents,
				renderTo: this.menuContainerEl,
				setPublished: this.setPublishState.bind(this),
				setWillPublishOn: this.setPublishState.bind(this),
				setNotPublished: this.setPublishState.bind(this)
			});

			this.on('destroy', this.publishMenu.destroy.bind(this.publishMenu));
		}
	},


	/**
	 * Set the initial publication state of the lesson control.
	 * Since publishing affects both the outline node and the lesson overview,
	 * we will take into account both to make sure they follow the intended business logic.
	 */
	setPublishState: function() {
		var node = this.record,
			isNodePublished = node && node.isPublished && node.isPublished(),
			lesson = this.contents,
			isLessonPublished = lesson && lesson.isPublished && lesson.isPublished(),
			lessonPublishDate = lesson && lesson.get('publishBeginning'),
			hasPublishDatePassed = lesson && lesson.hasPublishDatePassed && lesson.hasPublishDatePassed();


		if (isNodePublished && ((isLessonPublished && !lessonPublishDate) || hasPublishDatePassed))  {
			this.setPublished();
		}
		else if (!isNodePublished && !isLessonPublished) {
			this.setNotPublished();
		}
		else if (isNodePublished && lessonPublishDate) {
			this.setWillPublishOn();
		}
		else {
			console.warn('Not expected. The node should be published if its lesson is published. ', node, lesson);
		}
	},


	setPublished: function() {
		var label = this.labelEl,
			el = this.el;

		el.removeCls('publish');
		el.addCls('published');
		if (label) {
			label.update('Published');
		}

		this.hideMenu();
	},


	setWillPublishOn: function() {
		var label = this.labelEl,
			rec = this.contents,
			value = rec && rec.get('publishBeginning'),
			date = new Date(value),
			el = this.el, parts, m;

		if (value) {
			// Format i.e. Dec 12
			date = Ext.Date.format(date, 'M j');

			el.removeCls('publish');
			el.addCls('published');

			if (label) {
				label.update('Scheduled for ' + date);
			}
		}

		this.hideMenu();
	},


	setNotPublished: function() {
		var label = this.labelEl,
			el = this.el;

		el.removeCls('published');
		el.addCls('publish');
		if (label) {
			label.update('Publish Lesson');
		}

		this.hideMenu();
	},


	alignPublishingMenu: function() {
		if (!this.rendered) { return; }

		this.publishMenu.alignTo(this.el.dom);
	},


	togglePublishMenu: function() {
		var el = this.el;

		if (el.hasCls('closed')) {
			if (this.beforeShowMenu) {
				this.beforeShowMenu(this, this.publishMenu, 'publish');
			}

			this.showMenu();
			this.alignPublishingMenu();
		}
		else {
			this.hideMenu();
		}
	},


	hideMenu: function() {
		if (this.el.hasCls('closed')) {
			return;
		}
		
		this.el.addCls('closed');
		this.setPublishState();
		this.publishMenu.reset();
		Ext.destroy(this.bodyListeners);
		this.publishMenu.close();
	},


	showMenu: function() {
		this.initPublishMenu();

		this.el.removeCls('closed');

		this.bodyListeners = this.mon(Ext.getBody(), {
			destroyable: true,
			click: this.onBodyClick.bind(this)
		});

		this.publishMenu.open();
	},

	onBodyClick: function(e) {
		if (e.getTarget('.pub')) { return; }
		if (!this.el.hasCls('closed')) {
			this.hideMenu();
		}
	}


});
