describe("Time Util Tests", function() {
    describe ('Relative Time Tests', function(){

        it('timeDifference 1s', function(){
            var now = Ext.Date.now(),
                then = now - 1000;
            expect(TimeUtils.timeDifference(now, then)).toEqual('1 second ago');
        });

        it('timeDifference 1m', function(){
            var now = Ext.Date.now(),
                then = now - 1000*60;

            expect(TimeUtils.timeDifference(now, then)).toEqual('1 minute ago');
        });

        it('timeDifference 1h', function(){
            var now = Ext.Date.now(),
                then = now - 1000*60*60;

            expect(TimeUtils.timeDifference(now, then)).toEqual('1 hour ago');
        });
        it('timeDifference 1d', function(){
            var now = Ext.Date.now(),
                then = now - 1000*60*60*24;

            expect(TimeUtils.timeDifference(now, then)).toEqual('1 day ago');
        });
        it('timeDifference 2s', function(){
            var now = Ext.Date.now(),
                then = now - 2000;

            expect(TimeUtils.timeDifference(now, then)).toEqual('2 seconds ago');
        });

        it('timeDifference 2m', function(){
            var now = Ext.Date.now(),
                then = now - 2000*60;

            expect(TimeUtils.timeDifference(now, then)).toEqual('2 minutes ago');
        });

        it('timeDifference 2h', function(){
            var now = Ext.Date.now(),
                then = now - 2000*60*60;

            expect(TimeUtils.timeDifference(now, then)).toEqual('2 hours ago');
        });
        it('timeDifference 2d', function(){
            var now = Ext.Date.now(),
                then = now - 2000*60*60*24;

            expect(TimeUtils.timeDifference(now, then)).toEqual('2 days ago');
        });
	});
});
