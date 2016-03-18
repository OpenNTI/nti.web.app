var Ext = require('extjs');
var SettingsCourseOptions = require('./CourseOptions');


module.exports = exports = Ext.define('NextThought.app.library.courses.components.settings.CourseWindow', {
    extend: 'Ext.container.Container',
    alias: 'widget.library-course-settings',
    cls: 'course-settings-window',
    layout: 'auto',
    constrainTo: Ext.getBody(),
    offsets: [-55, -53],
    width: 350,

    //floating: true,

	getTargetEl: function() {
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

    initComponent: function() {
		this.callParent(arguments);

		var options = this.add({
			xtype: 'library-course-options',
			course: this.course
		});

		this.mon(options, 'close', 'destroy', this);
	},

    beforeRender: function() {
		this.callParent(arguments);
		var instance = this.course.get('CourseInstance'),
			ui = instance && instance.asUIData();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: (ui && ui.title) || 'Course'
		});
	},

    afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onClick', this);
	},

    onClick: function(e) {
		if (e.getTarget('.close')) {
			this.destroy();
		}
	}
});
