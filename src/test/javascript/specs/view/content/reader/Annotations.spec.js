describe('Annotation detection tests', function() {

    Ext.define('MockClassForAnnotationsMixin', {
        mixins: {
            a: 'NextThought.view.content.reader.Annotations'
        },
        convertRectToScreen: function(r) {return r;},
        fireEvent: function() {},
        clearSelection: function() {}
    });

    var annotations;

    describe('Regex to compute an input string for the dictionary', function() {

        var newElement;

        function testFunction(inputText, resultingText) {
            newElement.innerHTML = inputText;

            var range, result;

            range = document.createRange();
            range.selectNodeContents(newElement);

            result = annotations.getDefinitionMenuItem(range);
            if (resultingText) {
                expect(result).toBeTruthy();

                result.handler();
                expect(annotations.fireEvent).toHaveBeenCalledWith('define', resultingText, jasmine.any(Object));
            } else {
                expect(result).toBeNull();
            }
        }

        beforeEach(function() {
            annotations = new MockClassForAnnotationsMixin();
            spyOn(annotations, 'fireEvent');

            newElement = document.createElement('div');
            document.body.appendChild(newElement);
        });

        afterEach(function() {
            document.body.removeChild(newElement);
        });

        it('standard single word', function() {
            testFunction('hello', 'hello');
        });

        it('single word punctuation before', function() {
            testFunction('[hello', 'hello');
        });

        it('single word punctuation after', function() {
            testFunction('hello,', 'hello');
        });

        it('single word punctuation before and after', function() {
            testFunction('"hello"', 'hello');
        });

        it('standard two word', function() {
            testFunction('hello world', 'hello world');
        });

        it('two word punctuation before', function() {
            testFunction('[hello world', 'hello world');
        });

        it('two word punctuation after', function() {
            testFunction('hello world,', 'hello world');
        });

        it('two word punctuation before and after', function() {
            testFunction('"hello world"', 'hello world');
        });

        it('two word punctuation between no space', function() {
            testFunction('hello-world', 'hello-world');
        });

        it('two word punctuation between with space', function() {
            testFunction('hello, world', 'hello, world');
        });

        it('two word punctuation before, after and between no space', function() {
            testFunction('"hello-world"', 'hello-world');
        });

        it('two word punctuation before, after, and between with space', function() {
            testFunction('"hello, world"', 'hello, world');
        });

        it('no definition', function() {
            testFunction('hello world again');
        });
    });
});