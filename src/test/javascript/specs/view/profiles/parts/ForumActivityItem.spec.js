describe("ForumActivityItem link tests",function(){
	var testBody, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});
	describe("profile-forum-activity-item",function(){
		var ActivityItem;

		beforeEach(function(){
			ActivityItem = Ext.create('NextThought.view.profiles.parts.ForumActivityItem',{
				renderTo: testBody,
				beforeRender: noop,
				afterRender: noop,
				initComponent: noop
			});

			spyOn(ActivityItem,'fireEvent');
		});

		it('passing external link',function(){
			var e = {
				stopEvent: noop,
				getTarget: function(){
					return {
						href : 'www.google.com'
					}
				}
			};

			ActivityItem.bodyClickHandler(e);

			expect(ActivityItem.fireEvent).toHaveBeenCalledWith('navigate-to-href',ActivityItem,'www.google.com');
		});

	});

	describe("profile-forum-activity-item-reply",function(){
		var ActivityItemReply;

		beforeEach(function(){
			ActivityItemReply = Ext.create('NextThought.view.profiles.parts.ForumActivityItemReply',{
				renderTo: testBody,
				beforeRender: noop,
				afterRender: noop,
				initComponent: noop
			});

			spyOn(ActivityItemReply,'fireEvent');
		});

		it('passing external link',function(){
			var e = {
				stopEvent: noop,
				getTarget: function(){
					return {
						href : 'www.google.com'
					}
				}
			};

			ActivityItemReply.bodyClickHandler(e);

			expect(ActivityItemReply.fireEvent).toHaveBeenCalledWith('navigate-to-href',ActivityItemReply,'www.google.com');
		});
	})
});