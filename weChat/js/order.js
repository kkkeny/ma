var debug = (function() {
    var touchData = {
        sTime : 0,
        eTime : 0,
        sY : 0,
        eY : 0,
        ul : {
            getCurrentUl : function(event) {
                if (event.target.nodeName != "LI")
                    return;
                var ul = event.target.parentNode, current = parseInt(ul.style.top);
                current = isNaN(current) ? 0 : current;
                return {
                    ele : ul,
                    current : current,
                    getMaxTop : function() {
                        return -((this.ele.children.length - 2) * 110);
                    },
                    minTop : 110
                };
            },
            sTop : 0,
            eTop : 0,
        }
    };
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
    //主对象
    function Order() {
        o = this;
        o.form = document.querySelector("form");
        o.error = document.querySelector(".order-error");
        o.rmb = {
            ele : document.getElementById("rmb"),
            input : document.querySelector("input[name=rmb]")
        };
        o.xrmb = {
            ele : document.getElementById("xrmb"),
            input : document.querySelector("input[name=xrmb]")
        };
        o.time = document.getElementById("order-date");
        o.square = Array.prototype.slice.call(document.querySelectorAll(".square a"));
        o.pay = document.querySelector("section.pay");
        o.getMask = function(flag) {
            var mask = document.querySelector(".mask"), ua = (window.navigator.userAgent).toLowerCase(), reg = /version\/(\d\.\d)/, version;
            if (reg.test(ua))
                version = parseInt(ua.match(reg)[1]);
            if (!flag) {
                var height = document.documentElement.clientHeight + document.body.scrollTop;
                if (ua.indexOf("iphone") != -1 && ua.indexOf("android") == -1 && !isNaN(version) && version <= 5) {
                    height = document.documentElement.scrollHeight + document.body.scrollTop;
                    window.scrollTo(0, 1);
                }
                mask.style.height = height + "px";
            }
            return mask;
        };
        o.cancle = document.querySelector(".mask nav button:first-of-type");
        o.save = document.querySelector(".mask nav button:last-of-type");
        o.list = Array.prototype.slice.call(document.querySelectorAll(".mask nav + section ul"));
        o.textArea = Array.prototype.slice.call(document.querySelectorAll(".order-form textarea"));
        o.handler = {
            move : function(event) {
                if (event.target.nodeName == "LI") {
                    //console.log(event.target.parentNode.style.top);
                    var ul = touchData.ul.getCurrentUl(event), pos = event.targetTouches[0], step = pos.pageY - touchData.sY, current = (touchData.ul.sTop + step), max = ul.getMaxTop();
                    if (current > ul.minTop)
                        current = ul.minTop;
                    else if (current < max)
                        current = max;
                    //console.log(current + "<>" + step);
                    ul.ele.style.top = current + "px";
                }
                event.preventDefault();
                return false;
            },
            start : function(event) {
                var pos = event.targetTouches[0], ul = touchData.ul.getCurrentUl(event);
                if (!ul)
                    return;
                touchData.sTime = new Date().getTime();
                touchData.sY = pos.pageY;
                touchData.ul.sTop = ul.current;
                //console.log("start" + touchData.ul.sTop);
            },
            end : function(event) {
                var ul = touchData.ul.getCurrentUl(event);
                if (!ul)
                    return;
                touchData.ul.eTop = ul.current;
                var end = touchData.ul.eTop - (touchData.ul.eTop % 110);
                ul.ele.style.top = end + "px";
                //console.log("end:" + end);
            },
            movingEnd : function(event) {
                var ul = event.target, top = parseInt(ul.style.top);
                if (isNaN(top))
                    top = 0;
                var index = 1 - (top / 110), i = 0, len = ul.children.length;
                for (i; i < len; i++) {
                    ul.children[i].style.color = "#aaa";
                }
                ul.children[index].style.color = "#f37a3f";
            },
            chooseSquare : function(event) {
                //复位状态
                o.square.forEach(function(item) {
                    _toggleClass(item, "selected", false);
                });
                var a = event.target, index = o.square.indexOf(a);
                //选中
                _toggleClass(a, "selected", true);
                //变更价格,写入表单
                if ($_price) {
                    var price = $_price[index];
                    o.rmb.ele.innerText = o.form.elements[6].value = price.rmb;
                    o.xrmb.ele.innerText = o.form.elements[7].value = price.xrmb;
                    o.form.elements[5].value = price.square;
                }
            },
            openMask : function(event) {
                var flag = event.data.flag;
                _toggleClass(o.getMask(flag), "hidden", flag ? flag : false);
                document.body.addEventListener("touchstart", o.handler.start, false);
                document.body.addEventListener("touchmove", o.handler.move, false);
                document.body.addEventListener("touchend", o.handler.end, false);
            },
            closeMask : function(event) {
                this.openMask(event);
                document.body.removeEventListener("touchstart", o.handler.start, false);
                document.body.removeEventListener("touchmove", o.handler.move, false);
                document.body.removeEventListener("touchend", o.handler.end, false);
            },
            placeHolder : function(event) {
                var ta = event.target, changed = ta.getAttribute("changed"), value = ta.value, text = ta.innerText;
                switch(event.type) {
                    case "focus":
                        if (changed)
                            return;
                        ta.innerText = ta.value = "";
                        _toggleClass(ta, "place-holder", false);
                        break;
                    case "blur":
                        if (value.length == 0) {
                            ta.value = ta.getAttribute("pholder");
                            ta.removeAttribute("changed");
                            _toggleClass(ta, "place-holder", true);
                        } else {
                            ta.setAttribute("changed", "true");
                            return;
                        }
                        break;
                }
            },
            check : function(event) {
                var res = true, form = event.target, reg_moblie = /^\d{8,11}$/, error = 0;
                //电话号码
                res = reg_moblie.test(form.elements[1].value);
                if (!res)
                    error = 0;
                else {
                    res = form.elements[2].getAttribute("changed") || false;
                    if (!res)
                        error = 1;
                }
                if (res) {
                    res = form.elements[4].value.length > 0;
                    if (!res)
                        error = 2;
                }
                if (!res) {
                    var span = o.error.children, len = span.length;
                    for (var i = 0; i < len; i++) {
                        span[i].style.display = "none";
                    }
                    span[error].style.display = "";
                    o.error.style.visibility = "visible";
                    event.preventDefault();
                } else
                    o.error.style.visibility = "hidden";
                //过滤默认备注信息
                var bz = form.elements[3];
                if (!bz.getAttribute("changed"))
                    bz.value = "";
            }
        };
    }

    //扩展对象的方法
    Order.prototype.init = function() {
        try {
            //计算确定按钮位置
            if (document.documentElement.clientHeight > document.body.offsetHeight)
                _toggleClass(o.pay, "small", true);
            //打开弹层
            o.time.addEventListener("click", function(event) {
                event.data = {
                    flag : false
                };
                o.handler.openMask(event);
                return false;
            }, false);
            //取消
            o.cancle.addEventListener("click", function(event) {
                event.data = {
                    flag : true
                };
                o.handler.closeMask(event);
            }, false);
            //保存
            o.save.addEventListener("click", function(event) {
                //改变时间
                var res = "";
                o.list.forEach(function(item, indexs) {
                    var top = parseInt(item.style.top);
                    if (isNaN(top)) {
                        top = parseInt(window.getComputedStyle(item)["top"]);
                        if (isNaN(top))
                            top = 0;
                    }
                    var index = 1 - (top / 110), selectedItem = item.children[index], value = selectedItem.getAttribute("value") || parseInt(selectedItem.innerText);
                    /*
                    if (indexs === 0)
                    value += " ";
                    else if (indexs === 1)
                    value += ":";
                    */
                    //console.log(top + "<>" + index + "<>" + value);
                    res += value;
                });
                _toggleClass(o.time, "place-holder", false);
                o.time.innerText = o.form.elements[4].value = res;
                event.data = {
                    flag : true
                };
                o.handler.closeMask(event);
            }, false);
            //时间选项
            o.list.forEach(function(item) {
                item.addEventListener("webkitTransitionEnd", o.handler.movingEnd, false);
            });
            //面积选项
            o.square.forEach(function(item) {
                item.addEventListener("click", o.handler.chooseSquare, false);
            });
            //多行文本
            o.textArea.forEach(function(item) {
                item.addEventListener("focus", o.handler.placeHolder, false);
            });
            o.textArea.forEach(function(item) {
                item.addEventListener("blur", o.handler.placeHolder, false);
            });
            //表单验证
            o.form.addEventListener("submit", o.handler.check, false);
        } catch(e) {
            console.log(e);

        } finally {
            return o;
        }
    };
    //返回主对象
    return new Order().init();
})();
