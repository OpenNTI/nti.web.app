Ext.define('NextThought.view.courseware.dashboard.tiles.Topic', {
	extend: 'NextThought.view.courseware.dashboard.tiles.BaseCmp',
	alias: 'widget.dashboard-topic',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: '{label}'},
		{cls: 'title', html: '{title}'}
	]),


	getRenderData: function() {
		var sectionAnnouncements = this.course.getMySectionAnnouncements(),
			parentAnnouncements = this.course.getParentAnnouncements(),
			inSection = this.containedIn(sectionAnnouncements),
			inParent = this.containedIn(parentAnnouncements),
			label;

		if (inSection) {
			label = 'Announcement - My Section';
		} else if (inParent) {
			label = 'Announcement - Parent Section';
		} else {
			label = 'Topic';
		}


		return {
			title: this.record.get('headline').get('title'),
			label: label
		};
	},


	containedIn: function(forums) {
		forums = Ext.isArray(forums) ? forums : [forums];

		var id = this.record.get('ContainerId'),
			contained = false;

		forums.forEach(function(forum) {
			contained = contained || forum.getId() === id;
		});

		return contained;
	}
});
