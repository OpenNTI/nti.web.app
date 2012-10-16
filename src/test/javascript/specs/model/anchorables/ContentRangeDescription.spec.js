describe("ContentRangeDescription Tests", function() {
    describe ('locator tests', function(){

		function createCRD(){
			return Ext.create('NextThought.model.anchorables.ContentRangeDescription', {});
		}

        it('attaching and retrieving', function(){
            var d = createCRD();
            expect(d.locator()).toBeUndefined();

			d.attachLocator('foo');
			expect(d.locator()).toEqual('foo');

			d.attachLocator(null);
			expect(d.locator()).toBeUndefined();
        });

        it('Doesn\'t externalize', function(){
            var d = createCRD();
			d.attachLocator('foo');

			var o = d.asJSON();
			expect(o).toBeTruthy();
			expect(o['_'+'locator']).toBeUndefined();
        });

    });
});
