var debug = (function() {
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
    }, time = 0;
    //主对象
    function Order() {
        o = this;
        o.form = document.querySelector("form");
        o.error = document.querySelector(".order-error");
        o.code = document.querySelector("a.code");
        o.time = 60;
        o.handler = {
            check : function(event) {
                var res = true, form = event.target, reg_moblie = /^\d{8,11}$/, error = 0;
                //电话号码
                res = reg_moblie.test(form.elements[0].value);
                if (!res) {
                    o.error.innerText = "请输入正确的手机号";
                    //o.error.style.visibility = "visible";
                    event.preventDefault();
                } //else
                //o.error.style.visibility = "hidden";
            },
            get : function(event) {
                event.preventDefault();
                var a = event.target, url = a.href + o.form.elements[0].value, clicked = a.getAttribute("clicked");
                if (clicked)
                    return;
                a.setAttribute("clicked", "true");
                a.setAttribute("word", this.innerText);
                ajax.request({
                    url : url,
                    timeout : 20000,
                    context : o,
                    success : function() {
                        var _this = this, t = this.time;
                        _this.count = window.setInterval(function() {
                            if (t === 0) {
                                window.clearInterval(_this.count);
                                _this.code.removeAttribute("clicked");
                                _this.code.innerText = a.getAttribute("word");
                                return;
                            }
                            _this.code.innerText = (t--) + "秒";
                        }, 1000);
                    },
                    error : function() {
                        this.code.removeAttribute("clicked");
                        this.code.innerText = this.code.getAttribute("word");
                    }
                });
                //console.log("click");
            }
        };
    }

    //扩展对象的方法
    Order.prototype.init = function() {
        try {
            //表单验证
            o.form.addEventListener("submit", o.handler.check, false);
            //获取验证码
            o.code.addEventListener("click", o.handler.get, false);
        } catch(e) {
            console.log(e);

        } finally {
            return o;
        }
    };
    //返回主对象
    return new Order().init();
})();
