Ext.define('NextThought.view.account.activity.topic.Popout', {
	extend: 'NextThought.view.account.activity.Popout',
	alias:  [
		'widget.activity-popout-topic',
		'widget.activity-popout-post'
	],

	requires: [
		'NextThought.view.account.activity.topic.Preview'
	],

	statics: {

		popupAfterResolvingTopic: function (record, el, viewRef) {
			var args = Array.prototype.slice.call(arguments),
					request, popup;


			if (!this.beforeShowPopup(record, el)) {
				return;
			}

			args.shift();//remove the passed record from the front of the list
			popup = Ext.bind(this.popupNow, this, args, true);


			function success(rep) {
				var o = ParseUtils.parseItems(rep.responseText)[0];
				if (!(o instanceof NextThought.model.forums.Topic)) {
					console.error('I was not expecting a ', record, '  This should have been a Topic of sorts. :\'{');
					return;
				}
				o.focusRecord = record;
				popup(o);
			}


			request = {
				url:     getURL(record.getParentHref()),
				success: success,
				failure: function () {
					el.addCls('deleted');
					el.clearListeners();
					console.error('There was a problem loading the topic');
				}
			};

			if (record instanceof NextThought.model.forums.Topic) {
				popup(record);
				return;
			}

			//If its not a topic...it must be a post.
			if (!(record instanceof NextThought.model.forums.Post)) {
				Ext.Error.raise('Assertion failure, the record passed was not Post.');
			}


			Ext.Ajax.request(request);
		}

	}
}, function () {
	this.popupNow = this.popup;
	this.popup = this.popupAfterResolvingTopic;
});
