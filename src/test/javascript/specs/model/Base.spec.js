describe("Base Model Tests", function() {
    describe ('Relative Time Tests', function(){
        it('test day code executes', function(){
            var b = Ext.create('NextThought.model.Base', {
                'CreatedTime': new Date()
            });
            expect(b.getRelativeTimeString()).toBeTruthy();
        });

        it('timeDifference 1s', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000;

            expect(b.timeDifference(now, then)).toEqual('1 second ago');
        });

        it('timeDifference 1m', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60;

            expect(b.timeDifference(now, then)).toEqual('1 minute ago');
        });

        it('timeDifference 1h', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60*60;

            expect(b.timeDifference(now, then)).toEqual('1 hour ago');
        });
        it('timeDifference 1d', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 1000*60*60*24;

            expect(b.timeDifference(now, then)).toEqual('1 day ago');
        });
        it('timeDifference 2s', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000;

            expect(b.timeDifference(now, then)).toEqual('2 seconds ago');
        });

        it('timeDifference 2m', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60;

            expect(b.timeDifference(now, then)).toEqual('2 minutes ago');
        });

        it('timeDifference 2h', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60*60;

            expect(b.timeDifference(now, then)).toEqual('2 hours ago');
        });
        it('timeDifference 2d', function(){
            var b = Ext.create('NextThought.model.Base', {}),
                now = Ext.Date.now(),
                then = now - 2000*60*60*24;

            expect(b.timeDifference(now, then)).toEqual('2 days ago');
        });
    });
});
