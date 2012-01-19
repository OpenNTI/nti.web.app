Ext.define('NextThought.util.StacktraceUtils',
{
	alternateClassName: 'StacktraceUtils',
	singleton: true,

	// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
	//                  Luke Smith http://lucassmith.name/ (2008)
	//                  Loic Dachary <loic@dachary.org> (2008)
	//                  Johan Euphrosine <proppy@aminche.com> (2008)
	//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
	//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

	/**
	 * Main function giving a function stack trace with a forced or passed in Error
	 *
	 * @cfg {Error} e The error to create a stacktrace from (optional)
	 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
	 * @return {Array} of Strings with functions, lines, files, and arguments where possible
	 */
	printStackTrace: function(options) {
		options = options || {guess: true};
		var ex = options.e || null, guess = !!options.guess,
				p = new this.implementation(), result = p.run(ex);
		return (guess) ? p.guessAnonymousFunctions(result) : result;
	},

	implementation: function(){},

	constructor: function(){

		this.stacktrace = undefined;

		this.implementation.prototype = {
			run: function(ex) {
				ex = ex || this.createException();
				// Do not use the stored mode: different exceptions in Chrome
				// may or may not have arguments or stack
				var a,mode = this.mode(ex);
				if (mode === 'other') {
					a = arguments;
					return this.other(a.callee);
				} else {
					return this[mode](ex);
				}
			},

			createException: function() {
				try {
					this.undef();
					return null;
				} catch (e) {
					return e;
				}
			},


			/**
			 * @return {String} mode of operation for the environment in question.
			 */
			mode: function(e) {
				if (e['arguments'] && e.stack) {
					return 'chrome';
				} else if (e.message && typeof window !== 'undefined' && window.opera) {
					return e.stacktrace ? 'opera10' : 'opera';
				} else if (e.stack) {
					return 'firefox';
				}
				return 'other';
			},


			/**
			 * Given an Error object, return a formatted Array based on Chrome's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array of function calls, files and line numbers
			 */
			chrome: function(e) {
				var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
						replace(/^\s+at\s+/gm, '').
						replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
						replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
				stack.pop();
				return stack;
			},

			/**
			 * Given an Error object, return a formatted Array based on Firefox's stack string.
			 *
			 * @param e - Error object to inspect
			 * @return Array of function calls, files and line numbers
			 */
			firefox: function(e) {
				return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
			},

			/**
			 * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
			 *
			 * @param e - Error object to inspect
			 * @return Array of function calls, files and line numbers
			 */
			opera10: function(e) {
				var stack = e.stacktrace,
					location, fnName,
					lines = stack.split('\n'), ANON = '{anonymous}', lineRE = /.*line (\d+), column (\d+) in ((<anonymous function:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i, i, j, len;
				for (i = 2, j = 0, len = lines.length; i < len - 2; i++) {
					if (lineRE.test(lines[i])) {
						location = RegExp.$6 + ':' + RegExp.$1 + ':' + RegExp.$2;
						fnName = RegExp.$3;
						fnName = fnName.replace(/<anonymous function:?\s?(\S+)?>/g, ANON);
						lines[j++] = fnName + '@' + location;
					}
				}

				lines.splice(j, lines.length - j);
				return lines;
			},

			// Opera 7.x-9.x only!
			opera: function(e) {
				var lines = e.message.split('\n'), ANON = '{anonymous}', lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i, i, j, len;

				for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
					//TODO: RegExp.exec() would probably be cleaner here
					if (lineRE.test(lines[i])) {
						lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
					}
				}

				lines.splice(j, lines.length - j);
				return lines;
			},

			// Safari, IE, and others
			other: function(curr) {
				var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
				while (curr && stack.length < maxStackSize) {
					fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
					args = Array.prototype.slice.call(curr['arguments'] || []);
					stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
					curr = curr.caller;
				}
				return stack;
			},

			/**
			 * Given arguments array as a String, subsituting type names for non-string types.
			 *
			 * @return {Array} of Strings with stringified arguments
			 */
			stringifyArguments: function(args) {
				var slice = Array.prototype.slice,
					arg, i;
				for (i = 0; i < args.length; ++i) {
					arg = args[i];
					if (arg === undefined) {
						args[i] = 'undefined';
					} else if (arg === null) {
						args[i] = 'null';
					} else if (arg.constructor) {
						if (arg.constructor === Array) {
							if (arg.length < 3) {
								args[i] = '[' + this.stringifyArguments(arg) + ']';
							} else {
								args[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
							}
						} else if (arg.constructor === Object) {
							args[i] = '#object';
						} else if (arg.constructor === Function) {
							args[i] = '#function';
						} else if (arg.constructor === String) {
							args[i] = '"' + arg + '"';
						}
					}
				}
				return args.join(',');
			},

			sourceCache: {},

			/**
			 * @return the text from a given URL.
			 */
			ajax: function(url) {
				var req = this.createXMLHTTPObject();
				if (!req) {
					return undefined;
				}
				req.open('GET', url, false);
				req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
				req.send('');
				return req.responseText;
			},

			/**
			 * Try XHR methods in order and store XHR factory.
			 *
			 * @return Function XHR function or equivalent
			 */
			createXMLHTTPObject: function() {
				var i, xmlhttp, XMLHttpFactories = [
					function() {
						return new XMLHttpRequest();
					}, function() {
						return new ActiveXObject('Msxml2.XMLHTTP');
					}, function() {
						return new ActiveXObject('Msxml3.XMLHTTP');
					}, function() {
						return new ActiveXObject('Microsoft.XMLHTTP');
					}
				];
				for (i = 0; i < XMLHttpFactories.length; i++) {
					try {
						xmlhttp = XMLHttpFactories[i]();
						// Use memoization to cache the factory
						this.createXMLHTTPObject = XMLHttpFactories[i];
						return xmlhttp;
					}
					catch (e) {}
				}

				return null;
			},

			/**
			 * Given a URL, check if it is in the same domain (so we can get the source
			 * via Ajax).
			 *
			 * @param url String source url
			 * @return False if we need a cross-domain request
			 */
			isSameDomain: function(url) {
				return url.indexOf(location.hostname) !== -1;
			},

			/**
			 * Get source code from given URL if in the same domain.
			 *
			 * @param url String JS source URL
			 * @return Array Array of source code lines
			 */
			getSource: function(url) {
				if (!this.sourceCache.hasOwnProperty(url)) {
					this.sourceCache[url] = this.ajax(url).split('\n');
				}
				return this.sourceCache[url];
			},

			guessAnonymousFunctions: function(stack) {
				var i, reStack = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.\/]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/,
					frame, m, functionName, file, lineno;

				for (i = 0; i < stack.length; ++i) {
					frame = stack[i];
					m = reStack.exec(frame);
					if (m) {
						file = m[1];
						lineno = m[4];
						if (file && this.isSameDomain(file) && lineno) {
							functionName = this.guessAnonymousFunction(file, lineno);
							stack[i] = frame.replace('{anonymous}', functionName);
						}
					}
				}
				return stack;
			},

			guessAnonymousFunction: function(url, lineNo) {
				var ret;
				try {
					ret = this.findFunctionName(this.getSource(url), lineNo);
				} catch (e) {
					ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
				}
				return ret;
			},

			findFunctionName: function(source, lineNo) {
				// FIXME findFunctionName fails for compressed source
				// (more than one function on the same line)
				// TODO use captured args
				// function {name}({args}) m[1]=name m[2]=args
				var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/,
				// {name} = function ({args}) TODO args capture
				// /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
					reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/,
				// {name} = eval()
					reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
				// Walk backwards in the source lines until we find
				// the line which matches one of the patterns above
					code = "", line, maxLines = 10, m, i;

				for (i = 0; i < maxLines; ++i) {
					// FIXME lineNo is 1-based, source[] is 0-based
					line = source[lineNo - i];
					if (line) {
						code = line + code;
						m = reFunctionExpression.exec(code);
						if (m && m[1]) {
							return m[1];
						}
						m = reFunctionDeclaration.exec(code);
						if (m && m[1]) {
							//return m[1] + "(" + (m[2] || "") + ")";
							return m[1];
						}
						m = reFunctionEvaluation.exec(code);
						if (m && m[1]) {
							return m[1];
						}
					}
				}
				return '(?)';
			}
		};
	}

},
function(){
	window.printStackTrace = Ext.bind(this.printStackTrace,this);
});
