Ext.define('NextThought.view.courseware.info.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-panel',
	cls: 'course-info-panel scrollable',
	ui: 'course',
	layout: 'auto',

	requires: [
		'NextThought.proxy.JSONP',
		'NextThought.view.courseware.info.parts.*'
	],


	setContent: function(content) {
		this.removeAll(true);

		var toAdd = [];

		if (!Ext.isObject(content)) {
			return;
		}

		if (this.up('course-info').infoOnly) {
			toAdd.push({
				xtype: 'course-info-not-started',
				info: content
			});
		}

		toAdd.push({
			xtype: 'course-info-title',
			title: content.get('Title'),
			videoUrl: content.get('Video')
		},{
			xtype: 'course-info-description',
			info: content
		},{
			xtype: 'course-info-instructors',
			info: content
		},{
			xtype: 'course-info-support'
		},{
			xtype: 'box',
			ui: 'course-info',
			cls: 'gutter'
		});


		this.add(toAdd);
	}

});
