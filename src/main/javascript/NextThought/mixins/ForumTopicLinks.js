Ext.define('NextThought.mixins.ForumTopicLinks', {

	constructor: function () {

		function onAfterRender() {
			var me = this;
			if (me.el) {
				me.mon(me.el, 'click', me.forumClickHandler, me);
			}
		}

		this.on('afterrender', onAfterRender, this, {single: true});
	},


	forumClickHandler: function () {
		if (this.fireEvent('before-show-topic', this.record)) {
			this.fireEvent('show-topic', this.record);
		}
	},

	navigateToTopicForEdit: function (e) {
		function openInEditMode(ready, cmp) {
			function onAfterRender() {
				var me = this;
				Ext.defer(me.fireEvent, 500, me, ['edit-topic', me, me.record]);
			}

			if (cmp) {
				if (!cmp.rendered) {
					cmp.on('ready', onAfterRender, cmp, {single: true});
					return;
				}
				cmp.fireEvent('edit-topic', cmp, cmp.record);
			}
		}

		this.fireEvent('show-topic-with-action', this.record, null, openInEditMode, this);
	},


	forumClickHandlerGoToComment: function () {
		if (this.fireEvent('before-show-topic', this.record)) {
			this.fireEvent('show-topic', this.record, this.record);
		}
	},


	forumClickHandlerGoToComments: function () {
		if (this.fireEvent('before-show-topic', this.record)) {
			this.fireEvent('show-topic', this.record, true);
		}
	}
});
