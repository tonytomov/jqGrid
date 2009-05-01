/*
org: 'http://www.JSON.org',
    copyright: '(c)2005 JSON.org',
    license: 'http://www.crockford.com/JSON/license.html',
    
    Some modifications and additions from Tony Tomov
    Added parse function to prevent JSON Hijacking
    Read below
*/
var JSON = {
    stringify: function stringify(arg) {
        var c, i, l, s = '', v;
        switch (typeof arg) {
        case 'object':
            if (arg) {
                if (arg.constructor == Array) {
                    for (i = 0; i < arg.length; ++i) {
                        v = stringify(arg[i]);
                        if (s) {
                            s += ',';
                        }
                        s += v;
                    }
                    return '[' + s + ']';
                } else if (typeof arg.toString != 'undefined') {
                    for (i in arg) {
                        v = stringify(arg[i]);
                        if (typeof v != 'function') {
                            if (s) {
                                s += ',';
                            }
                            s += stringify(i) + ':' + v;
                        }
                    }
                    return '{' + s + '}';
                }
            }
            return 'null';
        case 'number':
            return isFinite(arg) ? String(arg) : 'null';
        case 'string':
            l = arg.length;
            s = '"';
            for (i = 0; i < l; i += 1) {
                c = arg.charAt(i);
                if (c >= ' ') {
                    if (c == '\\' || c == '"') {
                        s += '\\';
                    }
                    s += c;
                } else {
                    switch (c) {
                        case '\b':
                            s += '\\b';
                            break;
                        case '\f':
                            s += '\\f';
                            break;
                        case '\n':
                            s += '\\n';
                            break;
                        case '\r':
                            s += '\\r';
                            break;
                        case '\t':
                            s += '\\t';
                            break;
                        default:
                            c = c.charCodeAt();
                            s += '\\u00' + Math.floor(c / 16).toString(16) +
                                (c % 16).toString(16);
                    }
                }
            }
            return s + '"';
        case 'boolean':
            return String(arg);
        case 'function' :
			// Added for use of jqGrid T. Tomov
         	return arg.toString();
        default:
            return 'null';
        }
    },
	// Read this if you want to protect your json return string
	// http://safari.oreilly.com/9780596514839/recipe-1107
	//
	// 1.The while(1); construct, located at the beginning of JSON text,
	// 2.Comments at the beginning and end of the text.
	// JSON data providers are encouraged to use one or both of these methods
	// to prevent data execution. Such JSON response may then look like this:
	// while(1);/*{[
    //    {"name":"safe value 1"},
    //    {"name":"safe value 2"},
    //    ...
	// ]}*/
	parse : function(jsonString) {
		// filter out while statement 
		var js = jsonString;
		if (js.substr(0,9) == "while(1);") { js = js.substr(9); }
		if (js.substr(0,2) == "/*") { js = js.substr(2,js.length-4); }
		return eval('('+js+')');
	}
}
