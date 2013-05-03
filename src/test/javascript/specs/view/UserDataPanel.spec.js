describe("UserDataPanel",function(){
	var testBody, view, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement("div");

		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it('store.findRecord returns null', function(){
		view = Ext.create("NextThought.view.UserDataPanel",{
			initComponent: noop,
			afterRender: noop,
			mon: noop,
			mimeType: ['favorite'],
			store: false,
			buildStore: noop,
			getStore: function(){
				return {
					isLoading: function(){
						return false;
					},
					findRecord: function(){
						return null;
					}
				}
			}
		});

		NextThought.store.PageItem.prototype.proxy.url = "anything else";
		view.initializeStore();
		spyOn(view,'removeBookmark');
		NextThought.model.events.Bus.fireEvent('favorite-changed',{
			isFavorited: function(){return false;},
			get: function(){return 'id'}
		});

		expect(view.removeBookmark).not.toHaveBeenCalled();
	});

	it('store.findRecord returns something', function(){
		view = Ext.create("NextThought.view.UserDataPanel",{
			initComponent: noop,
			afterRender: noop,
			mon: noop,
			mimeType: ['favorite'],
			buildStore: noop,
			store: false,
			getStore: function(){
				return {
					isLoading: function(){
						return false;
					},
					findRecord: function(){
						return "record";
					}
				}
			}
		});

		NextThought.store.PageItem.prototype.proxy.url = "anything else";
		view.initializeStore();
		spyOn(view,'removeBookmark');
		NextThought.model.events.Bus.fireEvent('favorite-changed',{
			isFavorited: function(){return false;},
			get: function(){return 'id'}
		});

		expect(view.removeBookmark).toHaveBeenCalled();
	});
});