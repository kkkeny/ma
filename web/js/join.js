(function() {
    function addEvent(k, l, m, o, n, e)// (obj, eventName, eventHandler, args,
    // scope, capture)
    {
        var p = k || window;
        var n = n || p;
        var o = o || [];
        if (!p || !m) {
            return;
        }
        var f = o.length;
        if (p.addEventListener) {
            p.addEventListener(l, function(a) {
                o[f] = a;
                m.apply(n, o);
            }, Boolean(e));
        } else {
            p.attachEvent("on" + l, function(a) {
                o[f] = a;
                m.apply(n, o);
            });
        }
    }

    function toggleClass(node, cname, flag) {
        var className = node.className;
        if (flag) {
            var reg = new RegExp("\\b" + cname + "\\b");
            if (reg.test(className))
                return;
            else {
                if (className == "")
                    className += cname;
                else
                    className += " " + cname;
            }
        } else {
            var reg = new RegExp("\\b" + cname + "\\b(:?\\s?)");
            className = className.replace(reg, "").replace(/\s$/, "");
        }
        node.className = className;
    }

    function getMask() {
        var mask = document.getElementById("mask"), ua = (window.navigator.userAgent).toLowerCase(), reg = /version\/(\d\.\d)/, version;
        var height = document.documentElement.scrollHeight + document.body.scrollTop;
        mask.style.height = height + "px";
        return mask;
    };
    var jd = document.getElementById("jd"), links = jd.children, len = links.length, mask = document.getElementById("mask"), close = mask.getElementsByTagName("span"), iframe = document.getElementById("iframe");
    for (var i = 0; i < len; i++) {
        addEvent(links[i], "click", function(index, event) {
            var mask = getMask(), content = mask.children[index];
            if (!content)
                return;
            toggleClass(content, "hidden", false);
            toggleClass(mask, "hidden", false);
            toggleClass(iframe, "hidden", false);
        }, [i]);
    }
    len = close.length;
    for ( i = 0; i < len; i++) {
        addEvent(close[i], "click", function(index, event) {
            var content = mask.children[index];
            toggleClass(content, "hidden", true);
            toggleClass(mask, "hidden", true);
            toggleClass(iframe, "hidden", true);
        }, [i]);
    }
})();
