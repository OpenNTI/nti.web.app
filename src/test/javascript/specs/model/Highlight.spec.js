describe("Highlight Model Tests", function() {
    describe ('Highlight Colors', function(){
        it('Should Return Blue By Default', function(){
            var h = Ext.create('NextThought.model.Highlight', {
                'NTIID': 'foo'
            });
            expect(h.get('fillColor')).toEqual('blue');
        });
        it('Should Return Right Color', function() {
        	var a = Ext.create('NextThought.model.Highlight', {
        		'fillColor': 'green'
        	});
        	expect(a.get('fillColor')).toEqual('green');
        });
    });
});