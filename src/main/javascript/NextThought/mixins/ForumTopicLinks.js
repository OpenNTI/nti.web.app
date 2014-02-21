Ext.define('NextThought.mixins.ForumTopicLinks', {

	constructor: function() {

		function onAfterRender() {
			var me = this;
			if (me.el) {
				me.mon(me.el, 'click', me.forumClickHandler, me);
			}
		}

		this.on('afterrender', onAfterRender, this, {single: true});
	},


	forumClickHandler: function() {
		this.fireEvent('show-topic', this, this.record);
	},

	navigateToTopicForEdit: function(e) {
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

		this.fireEvent('show-topic', this, this.record, null, openInEditMode, this);
	},


	forumClickHandlerGoToComment: function() {
		this.fireEvent('show-topic', this, this.record, this.record);
	},


	forumClickHandlerGoToComments: function() {
		this.fireEvent('show-topic', this, this.record, true);
	}
});
