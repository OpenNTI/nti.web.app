describe("Basic Assumptions", function() {

    it("has ExtJS4 is present", function() {
        expect(Ext).toBeDefined();
        expect(Ext.getVersion()).toBeTruthy();
        expect(Ext.getVersion().major).toEqual(4);
    });


    it("has loaded nextthought code",function(){
        expect(NextThought).toBeDefined();
    });


    it("does not have jQuery loaded", function(){
        expect(typeof jQuery).toBe('undefined');
    });

});