const Ext = require('extjs');

require('./CourseOptions');


module.exports = exports = Ext.define('NextThought.app.library.courses.components.settings.CourseWindow', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-course-settings',
	cls: 'course-settings-window',
	layout: 'auto',

	defaultOffsets: {
		x: -55,
		y: -53
	},

	width: 350,

	//floating: true,

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'label', html: 'settings'},
			{cls: 'name', html: '{name}'},
			{cls: 'close'}
		]},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'footer', cn: [
			{cls: 'done button close', html: 'Done'}
		]}
	]),


	initComponent: function () {
		this.callParent(arguments);

		var options = this.add({
			xtype: 'library-course-options',
			course: this.course
		});

		this.mon(options, 'close', 'destroy', this);
	},


	beforeRender: function () {
		this.callParent(arguments);
		var instance = this.course.get('CourseInstance'),
			ui = instance && instance.asUIData();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: (ui && ui.title) || 'Course'
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onClick', this);


		this.constrainToScreen = this.constrainToScreen.bind(this);

		this.constrainToScreen();

		Ext.EventManager.onWindowResize(this.constrainToScreen);

		this.on('destroy', () => {
			Ext.EventManager.removeResizeListener(this.constrainToScreen);
		});
	},


	onClick: function (e) {
		if (e.getTarget('.close')) {
			this.destroy();
		}
	},


	constrainToScreen () {
		let viewportWidth = Ext.Element.getViewportWidth();
		let node = this.renderTo;
		let nodeRect = node && node.getBoundingClientRect();
		let myNode = this.el && this.el.dom;
		let myRect = myNode && myNode.getBoundingClientRect();
		let leftEdge = nodeRect.left + this.defaultOffsets.x;
		let rightEdge = nodeRect.left + this.defaultOffsets.x + myRect.width;
		let left;

		if (!nodeRect || !myRect) { return; }

		//If the left edge is off screen position it at the left edge of the screen
		if (leftEdge < 0) {
			left = -nodeRect.left;
		//If the right edge is off screen position it at the right edge of the screen
		} else if (rightEdge > viewportWidth) {
			left = (this.defaultOffsets.x - (rightEdge - viewportWidth));
		//Otherwise position it where we want to
		} else {
			left = this.defaultOffsets.x;
		}

		myNode.style.left = left + 'px';
		myNode.style.top = this.defaultOffsets.y + 'px';
	}
});
