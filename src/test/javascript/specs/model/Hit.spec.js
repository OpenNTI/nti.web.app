describe("Hit Model Tests", function() {
    describe ('ID related Tests', function(){
        it('Provides NTIID as id but is not the idProperty', function(){
            var h = Ext.create('NextThought.model.Hit', {
                'NTIID': 'foo'
            });
            expect(h.getId()).toEqual('foo');
        });
    });
});
