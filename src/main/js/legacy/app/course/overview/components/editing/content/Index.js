const Ext = require('@nti/extjs');

require('../../Lesson');

require('./lessonoverview/Index');

function getOutlineFromNode(outlineNode) {
	let parent = outlineNode;

	while (parent) {
		if (parent.hasSharedEntries) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.Index',
	{
		extend: 'NextThought.app.course.overview.components.Lesson',
		alias: 'widget.overview-editing-content',
		cls: '',
		isLessonView: false,

		initComponent: function () {
			this.callParent(arguments);

			this.loadLesson = this.renderLesson(this.outlineNode, this.record);
		},

		onceLoaded: function () {
			return this.loadLesson || Promise.resolve();
		},

		renderLesson: function (outlineNode, contents) {
			var course = this.bundle,
				overviewsrc =
					(outlineNode && outlineNode.getLink('overview-content')) ||
					null;

			if (!outlineNode || !course || !contents) {
				//show empty state?
				console.warn('Unable to edit overview content');
				return;
			}

			this.buildingOverview = true;
			this.maybeMask();

			return this.getInfo(outlineNode, course, overviewsrc)
				.then(([assignments, enrollment, [locInfo]]) => {
					this.currentOverview = this.add({
						xtype: 'overview-editing-lessonoverview',
						record: outlineNode,
						locInfo,
						assignments,
						enrollment,
						bundle: course,
						contents,
						outline: getOutlineFromNode(outlineNode),
						navigate: this.navigate,
					});

					return this.currentOverview.onceLoaded();
				})
				.catch(reason => {
					console.error(reason);
				})
				.then(this.maybeUnmask.bind(this));
		},
	}
);
