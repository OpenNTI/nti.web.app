/*globals getHistoryStoreForMimeType*/

describe("UserDataPanel",function(){
	var noteStore;

	beforeEach(function() {
		noteStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'firstName', type: 'string'},
				{name: 'lastName',  type: 'string'},
				{name: 'age',       type: 'int'},
				{name: 'eyeColor',  type: 'string'}
			],
			storeId: 'noteHighlightStore'
		});
	})

	it('Should call getHistoryStoreForMimeType', function() {
		var testID = 'noteHighlightStore';
		expect(NextThought.view.UserDataPanel.getHistoryStoreForMimeType('note')).toEqual(noteStore);

	});

});
