describe('Library Store', function(){

    function isBook(v){
        expect(v).toBeTruthy();
        expect(v.isModel).toBeTruthy();
        expect(v.modelName).toBe('NextThought.model.Title');
    }

    function isTopicElement(v){
        expect(v).toBeTruthy();
        expect(v.tagName).toBeTruthy();
        expect(v.tagName).toBe('topic');
    }





    beforeEach(function(){
        Library.clearListeners(); //don't invoke the UI
        Library.getStore().removeAll();
        Library.load();

        waitsFor(
            function(){ return Library.loaded; },
            "Library load never completed",
            4000
        );
    });






    it('should have titles (for tests)', function(){
        expect(Library.getStore().count()).toBeGreaterThan(0);
    });




    it('can find the section', function(){
        var l = Library.findLocation('book2-1-1');
        expect(l).toBeTruthy();
        isBook(l.book);
        isTopicElement(l.location);
    });




    it('can find the title of the section', function(){
        expect(Library.findLocationTitle('book1-1-1')).toBe('section b');
    });



    it('can find the title of the book', function(){
        var t = Library.getTitle('/book2/eclipse-toc.xml');
        isBook(t);
        expect(t.get('title')).toBe('book2');
    });


    it('can determine if an id is a child of another', function(){
        expect(Library.isOrDecendantOf('book1-1', 'book1-1-0')).toBeTruthy();
        expect(Library.isOrDecendantOf('book1-1', 'book2-1-1')).toBeFalsy();
        //good ids but backwards
        expect(Library.isOrDecendantOf('book1-1-1', 'book1-1')).toBeFalsy();
        expect(Library.isOrDecendantOf('book2-1-1', 'book1-1')).toBeFalsy();
        //bad ids
        expect(Library.isOrDecendantOf('book4-1', 'book2-3-0')).toBeFalsy();
    });


    it('can determine navigation', function(){
        var n = Library.getNavigationInfo('book2-1-1');

        expect(n).toBeTruthy();
        isBook(n.book);
        isTopicElement(n.current);
        isTopicElement(n.next);
        isTopicElement(n.previous);

        expect(n.hasNext).toBeTruthy();
        expect(n.hasPrevious).toBeTruthy();

        expect(n.nextHref).toBeTruthy();
        expect(n.previousHref).toBeTruthy();


    });

});