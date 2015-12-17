Ext.define('NextThought.app.course.overview.components.editing.controls.Publish', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-publish',

	cls: 'button publish',

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

		this.initPublishMenu();
		this.setPublishState();
	},


	initPublishMenu: function() {
		var me = this, html = this.scrollingEl || Ext.query('.x-viewport')[0];

		this.publishMenu = NextThought.app.course.overview.components.editing.publishing.Menu.create({
			record: this.record,
			contents: this.contents,
			renderTo: this.menuContainerEl,
			setPublished: this.setPublishState.bind(this),
			setWillPublishOn: this.setPublishState.bind(this),
			setNotPublished: this.setPublishState.bind(this)
		});

		
		this.onWindowResizeBuffer = Ext.Function.createBuffered(this.alignPublishingMenu, 10, this);
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
		var label = this.labelEl,
			el = this.el;

		el.removeCls('publish');
		el.addCls('published');
		if (label) {
			label.update('Published');
		}
	},


	setWillPublishOn: function() {
		var label = this.labelEl,
			rec = this.contents,
			value = rec && rec.get('publishBeginning'),
			date = new Date(value),
			el = this.el;

		if (value) {
			date = Ext.Date.format(date, 'F d');
			el.removeCls('publish');
			el.addCls('published');
			if (label) {
				label.update('Publish on ' + date);
			}
		}
	},


	setNotPublished: function() {
		var label = this.labelEl,
			el = this.el;

		el.removeCls('published');
		el.addCls('publish');
		if (label) {
			label.update('Publish');
		}
	},


	alignPublishingMenu: function(){
		var box = this.el && this.el.dom.getBoundingClientRect() || {},
			me = this,
			menu = this.publishMenu,
			top = box.bottom + 15,
			right = box.right + 25,
			viewportHeight = Ext.Element.getViewportHeight(),
			maxHeight = viewportHeight - top - 10;

		menu.onceRendered
			.then(function() {
				if (menu.el) {
					menu.el.setStyle('top', top + 'px');
					menu.el.setStyle('right', right + 'px');
					menu.el.setStyle('left', 'auto');
					menu.el.setStyle('maxHeight', maxHeight + 'px');	
				}
			});
	},


	togglePublishMenu: function() {
		var el = this.el;

		if (el.hasCls('closed')) {
			this.alignPublishingMenu();
		}

		el.toggleCls('closed');
	}
});