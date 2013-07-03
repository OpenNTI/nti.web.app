/*
 * Transcript.spec.js
 * @author Bryan Hoke
 */
Ext.require('NextThought.webvtt.Transcript');
Ext.require('NextThought.webvtt.Cue');
describe('WebVTT Parser', function() {
    const NUMSAMPLES = 4;
    const SAMPLEDIR = 'resources/webvtt/sample';
    const ASYNC = true;
    var tests = [];
         
    function SampleTest(testNo) {
        this.testNo = testNo;
        this.content = '';
        this.isVTT = true;
        this.testCues = [];
        this.expectedCues = [];
        this.httpRequest = null;
        this.vttFile = SAMPLEDIR+testNo+'.vtt';
        this.jsonFile = SAMPLEDIR+testNo+'.txt';
        this.vttComplete = false;
        this.jsonComplete = false;
        this.file = this.vttFile;
        this.transcript = null;
         
        this.transferComplete = function() {
            console.warn('Transfer complete for '+tests[testNo].file+' file');
            tests[testNo].content = tests[testNo].httpRequest.responseText;
            if (tests[testNo].isVTT) {
                tests[testNo].getVTTSample(tests[testNo].content);
            } else {
                tests[testNo].getJSONSample(tests[testNo].content);
            }
        };
         
        // Get the vtt sample content and start getting JSON content
        this.getVTTSample = function(vttContent) {
            this.transcript = new NextThought.webvtt.Transcript({input: vttContent});
            this.testCues = this.transcript.parseWebVTT();
            this.vttComplete = true;
            // Start the process of getting JSON sample
            this.file = this.jsonFile;
            this.isVTT = false;
            this.httpRequest.open('GET', this.jsonFile, ASYNC);
            this.httpRequest.send(null);
        };
         
        // Get the json sample and start the tests
        this.getJSONSample = function(jsonContent) {
            this.expectedCues = JSON.parse(jsonContent);
            this.jsonComplete = true;
        };

        this.transferFailed = function() {
            console.error('Transfer failed for '+this.file);
        };

        this.transferCancelled = function() {
            console.error('Transfer cancelled for '+this.file);
        };
         
        // Sets up HTTP request
        this.initRequest = function() {
            if (window.XMLHttpRequest) {
                this.httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                this.httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
            }
            this.httpRequest.overrideMimeType('text/plain; charset=UTF-8');
            this.httpRequest.addEventListener('load', this.transferComplete, false);
            this.httpRequest.addEventListener('error', this.transferFailed, false);
            this.httpRequest.addEventListener('abort', this.transferCancelled, false);
         };
         
         // Does the tests
         this.doTests = function(testNo) {
            this.initRequest();
            this.vttComplete = this.jsonComplete = false;
            // Start the process of getting the VTT sample
            runs(function() {
                tests[testNo].httpRequest.open('GET', tests[testNo].vttFile, ASYNC);
                tests[testNo].httpRequest.send(null);
            });
         
            waitsFor(function() {
                return (tests[testNo].vttComplete && tests[testNo].jsonComplete);
            }, 'the sample collection to be complete', 500);
         
            runs(function() {
                expect(tests[testNo].testCues.length).toEqual(tests[testNo].expectedCues.length);

                for (var c = 0; c < tests[testNo].expectedCues.length; c++) {
                    expect(tests[testNo].testCues[c].getIdentifier()).toEqual(tests[testNo].expectedCues[c]['identifier']);
                    expect(tests[testNo].testCues[c].getText()).toEqual(tests[testNo].expectedCues[c]['text']);
                    expect(tests[testNo].testCues[c].getStartTime()).toEqual(tests[testNo].expectedCues[c]['startTime']);
                    expect(tests[testNo].testCues[c].getEndTime()).toEqual(tests[testNo].expectedCues[c]['endTime']);
                }
            });
        };
    }

    /* NOTE
    In order for these to work on Chrome on OS X, you must navigate to the directory that has the Chrome.app file (typically Applications) and, in the terminal, run the following command: open Google\ Chrome.app/ --args --disable-web-security
    */
    it('parses sample0 correctly', function() {
        tests[0] = new SampleTest(0);
        tests[0].doTests(0);
    });
         
    it('parses sample1 correctly', function() {
        tests[1] = new SampleTest(1);
        tests[1].doTests(1);
    });
         
    it('parses sample2 correctly', function() {
        tests[2] = new SampleTest(2);
        tests[2].doTests(2);
    });
         
    it('parses sample3 correctly', function() {
        tests[3] = new SampleTest(3);
        tests[3].doTests(3);
    });
});
