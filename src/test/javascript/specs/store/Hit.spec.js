describe("Hit Store Tests", function() {
    describe ('ID related Tests', function(){
        it('Doesn\'t strip hits with same ntiid', function(){
            var h1 = Ext.create('NextThought.model.Hit', {
                'NTIID': 'foo'
            });
			var h2 = Ext.create('NextThought.model.Hit', {
                'NTIID': 'foo'
            });
            var s = Ext.create('NextThought.store.Hit');
			s.add(h1);
			s.add(h2);

			expect(s.getCount()).toBe(2);
        });
    });
});
