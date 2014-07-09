(function() {
    //私有方法
    var _toggleClass = function(node, cname, flag) {
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
    };
    var loading = document.querySelector(".loading"), page = 2;
    window.addEventListener("scroll", function(event) {
        var screen = window.innerHeight || document.documentElement.clientHeight, contentHeight = document.body.scrollHeight, scroll = Math.max(window.pageYOffset, document.body.scrollTop);
        var n = (contentHeight - (screen + scroll));
        if (n < 10 && page <= $_list.max) {
            _toggleClass(loading, "show", true);
            ajax.request({
                url : $_list.url + page,
                timeout : 20000,
                success : function(data) {
                    //console.log(data + "..........");
                    var data = JSON.parse(data);
                    if (data.code === 100) {
                        document.querySelector("tbody").innerHTML += data.content;
                        page++;
                    }
                },
                error : function() {

                },
                complete : function() {
                    //_toggleClass(loading, "show", false);
                }
            });
        }
    }, false);
})();
