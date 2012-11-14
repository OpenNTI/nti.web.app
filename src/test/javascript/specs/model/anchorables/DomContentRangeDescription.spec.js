//Subclass and override constructor for testing so we can easily create one of these
Ext.define('NextThought.model.anchorables.TestDomContentRangeDescription', {
	extend: 'NextThought.model.anchorables.DomContentRangeDescription',
	constructor: function(o){
	},

});


describe("DomContentRangeDescription Tests", function() {
    describe ('tests', function(){

		function createDCRD(){
			return Ext.create('NextThought.model.anchorables.TestDomContentRangeDescription', {});
		}

		it('is not empty', function(){
			var d = createDCRD();
			expect(d.isEmpty).toEqual(false);
		});

    });
});
