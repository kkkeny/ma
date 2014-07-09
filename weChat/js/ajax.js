(function(window) {
    var ajax = {};
    function isPlainObject(obj) {
        return obj !== null && obj == obj.window && toString.call(obj) === "[object Object]" && obj.__proto__ == Object.prototype;
    }

    function extend(target, source, deep) {
        for (var key in source) {
            if (deep && isPlainObject(source[key])) {
                if (!isPlainObject(target[key]))
                    target[key] = {};
                extend(target[key], source[key], deep);
            } else if (source[key] !== undefined)
                target[key] = source[key];
        }
    }


    ajax.mixin = function(target) {
        var deep, args = Array.prototype.slice.call(arguments);
        if ( typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function(arg) {
            extend(target, arg, deep);
        });
        return target;
    };
    ajax.parseJSON = function(obj) {
        if (obj != null && typeof obj !== "string")
            return;
        if ("JSON" in window) {
            return JSON.parse(obj);
        } else {
            return new Function("return"+obj)();
        }
    };
    window.ajax = ajax;
})(this);
(function(obj) {
    var empty = function() {
    };
    obj.ajaxSettings = {
        type : "GET",
        beforeSend : empty,
        success : empty,
        error : empty,
        complete : empty,
        global : true,
        xhr : function() {
            return new window.XMLHttpRequest();
        },
        accepts : {
            script : 'text/javascript,application/javascript',
            json : 'application/json',
            xml : 'application/xml,text/xml',
            html : 'text/html',
            text : 'text/plain'
        },
        timeout : 0,
        //processData  whether data should be serailized to string
    };
    obj.mixin(obj, {
        abort : function() {
            return true;
        },
        request : function(options) {
            var settings = ajax.mixin({}, ajax.ajaxSettings, options);

            if (!settings.url)
                settings.url = window.location.toString();
            //serializeData(settings);

            var dataType = settings.dataType, mime = settings.accepts[dataType], baseHeaders = {}, protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol, xhr = settings.xhr(), abortTimeout;

            //如果请求没有参数  返回ajax对象
            if ( typeof options === "undefined")
                return xhr;

            if (mime) {
                baseHeaders['Accpet'] = mime;
                if (mime.indexOf(",") > -1)
                    mime = mime.split(',',2)[0];
                xhr.overrideMimeType && xhr.overrideMimeType(mime);
            }

            var ajaxError = function(error, type, xhr, settings) {
                var context = settings.context;
                settings.error.call(context, xhr, type, error);
                ajaxComplete(type, xhr, settings);
            };
            var ajaxSuccess = function(data, xhr, settings) {
                var context = settings.context;
                settings.success.call(context, data, xhr, settings);
                ajaxComplete("success", xhr, settings);
            };
            var ajaxComplete = function(status, xhr, settings) {
                var context = settings.context;
                settings.complete.call(context, xhr, status);
            };

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    xhr.onreadystatechange = empty;
                    clearTimeout(abortTimeout);
                    var result, error = false;
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        result = xhr.responseText;

                        try {
                            //
                            if (dataType == 'script')
                                (1, eval)(result);
                            else if (dataType == 'xml')
                                result = xhr.responseXML;
                            else if (dataType == 'json')
                                result = ajax.parseJSON(result);
                        } catch(e) {
                            error = e;
                        }

                        if (error)
                            ajaxError(error, 'parsererror', xhr, settings);
                        else
                            ajaxSuccess(result, xhr, settings);
                    } else {
                        ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings);
                    }
                }
            };
            //async
            var async = 'async' in settings ? settings.async : true;
            xhr.open(settings.type, settings.url, async);

            //header
            for (name in settings.headers)
            xhr.setRequestHeader(name, settings.headers[name]);

            //before send process
            if (settings.beforeSend.call(settings.context, xhr, settings) === false) {
                xhr.abort();
                return false;
            }
            //timeout
            if (settings.timeout > 0)
                abortTimeout = setTimeout(function() {
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    ajaxError(null, 'timeout', xhr, settings);
                }, settings.timeout);

            //send
            xhr.send(settings.data ? settings.data : null);
            return xhr;
        }
    });
})(ajax);
