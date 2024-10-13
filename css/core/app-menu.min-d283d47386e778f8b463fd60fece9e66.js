!function(e,n,a){"use strict";a.app=a.app||{};var s=a("body"),i=a(e),t=a('div[data-menu="menu-wrapper"]').html(),o=a('div[data-menu="menu-wrapper"]').attr("class");a.app.menu={expanded:null,collapsed:null,hidden:null,container:null,horizontalMenu:!1,is_touch_device:function(){var a=" -webkit- -moz- -o- -ms- ".split(" ");return!!("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)||function(n){return e.matchMedia(n).matches}(["(",a.join("touch-enabled),("),"heartz",")"].join(""))},manualScroller:{obj:null,init:function(){a(".main-menu").hasClass("menu-dark");a.app.menu.is_touch_device()?a(".main-menu").addClass("menu-native-scroll"):this.obj=new PerfectScrollbar(".main-menu-content",{suppressScrollX:!0,wheelPropagation:!1})},update:function(){if(this.obj){if(!0===a(".main-menu").data("scroll-to-active")){var e,i,t;if(e=n.querySelector(".main-menu-content li.active"),s.hasClass("menu-collapsed"))a(".main-menu-content li.sidebar-group-active").length&&(e=n.querySelector(".main-menu-content li.sidebar-group-active"));else if(i=n.querySelector(".main-menu-content"),e&&(t=e.getBoundingClientRect().top+i.scrollTop),t>parseInt(2*i.clientHeight/3))var o=t-i.scrollTop-parseInt(i.clientHeight/2);setTimeout((function(){a.app.menu.container.stop().animate({scrollTop:o},300),a(".main-menu").data("scroll-to-active","false")}),300)}this.obj.update()}},enable:function(){a(".main-menu-content").hasClass("ps")||this.init()},disable:function(){this.obj&&this.obj.destroy()},updateHeight:function(){"vertical-menu"!=s.data("menu")&&"vertical-menu-modern"!=s.data("menu")&&"vertical-overlay-menu"!=s.data("menu")||!a(".main-menu").hasClass("menu-fixed")||(a(".main-menu-content").css("height",a(e).height()-a(".header-navbar").height()-a(".main-menu-header").outerHeight()-a(".main-menu-footer").outerHeight()),this.update())}},init:function(e){if(a(".main-menu-content").length>0){this.container=a(".main-menu-content");var n="";if(!0===e&&(n="collapsed"),"vertical-menu-modern"==s.data("menu")){this.change(n)}else this.change(n)}else this.drillDownMenu();"collapsed"===n&&this.collapse()},drillDownMenu:function(e){a(".drilldown-menu").length&&("sm"==e||"xs"==e?"true"==a("#navbar-mobile").attr("aria-expanded")&&a(".drilldown-menu").slidingMenu({backLabel:!0}):a(".drilldown-menu").slidingMenu({backLabel:!0}))},change:function(e){var n=Unison.fetch.now();this.reset();var i,t,o=s.data("menu");if(n)switch(n.name){case"xl":case"lg":"vertical-overlay-menu"===o?this.hide():"collapsed"===e?this.collapse(e):this.expand();break;case"md":"vertical-overlay-menu"===o||"vertical-menu-modern"===o?this.hide():this.collapse();break;case"sm":case"xs":this.hide()}"vertical-menu"!==o&&"vertical-menu-modern"!==o||this.toOverlayMenu(n.name,o),s.is(".horizontal-layout")&&!s.hasClass(".horizontal-menu-demo")&&(this.changeMenu(n.name),a(".menu-toggle").removeClass("is-active")),"horizontal-menu"!=o&&this.drillDownMenu(n.name),"xl"==n.name&&(a('body[data-open="hover"] .dropdown').on("mouseenter",(function(){a(this).hasClass("show")?a(this).removeClass("show"):a(this).addClass("show")})).on("mouseleave",(function(e){a(this).removeClass("show")})),a('body[data-open="hover"] .dropdown a').on("click",(function(e){if("horizontal-menu"==o&&a(this).hasClass("dropdown-toggle"))return!1}))),a(".header-navbar").hasClass("navbar-brand-center")&&a(".header-navbar").attr("data-nav","brand-center"),"sm"==n.name||"xs"==n.name?a(".header-navbar[data-nav=brand-center]").removeClass("navbar-brand-center"):a(".header-navbar[data-nav=brand-center]").addClass("navbar-brand-center"),a("ul.dropdown-menu [data-toggle=dropdown]").on("click",(function(e){a(this).siblings("ul.dropdown-menu").length>0&&e.preventDefault(),e.stopPropagation(),a(this).parent().siblings().removeClass("show"),a(this).parent().toggleClass("show")})),"horizontal-menu"==o&&("xl"==n.name?a(".navbar-fixed").length&&a(".navbar-fixed").sticky():a(".menu-fixed").length&&a(".menu-fixed").unstick()),"vertical-menu"!==o&&"vertical-overlay-menu"!==o||(jQuery.expr[":"].Contains=function(e,n,a){return(e.textContent||e.innerText||"").toUpperCase().indexOf(a[3].toUpperCase())>=0},i=a("#main-menu-navigation"),t=a(".menu-search"),a(t).change((function(){var e=a(this).val();if(e){a(".navigation-header").hide(),a(i).find("li a:not(:Contains("+e+"))").hide().parent().hide();var n=a(i).find("li a:Contains("+e+")");n.parent().hasClass("has-sub")?(n.show().parents("li").show().addClass("open").closest("li").children("a").show().children("li").show(),n.siblings("ul").length>0&&n.siblings("ul").children("li").show().children("a").show()):n.show().parents("li").show().addClass("open").closest("li").children("a").show()}else a(".navigation-header").show(),a(i).find("li a").show().parent().show().removeClass("open");return a.app.menu.manualScroller.update(),!1})).keyup((function(){a(this).change()})))},transit:function(e,n){var i=this;s.addClass("changing-menu"),e.call(i),s.hasClass("vertical-layout")&&(s.hasClass("menu-open")||s.hasClass("menu-expanded")?(a(".menu-toggle").addClass("is-active"),"vertical-menu"===s.data("menu")&&a(".main-menu-header")&&a(".main-menu-header").show()):(a(".menu-toggle").removeClass("is-active"),"vertical-menu"===s.data("menu")&&a(".main-menu-header")&&a(".main-menu-header").hide())),setTimeout((function(){n.call(i),s.removeClass("changing-menu"),i.update()}),500)},open:function(){this.transit((function(){s.removeClass("menu-hide menu-collapsed").addClass("menu-open"),this.hidden=!1,this.expanded=!0,s.hasClass("vertical-overlay-menu")&&(a(".sidenav-overlay").removeClass("d-none").addClass("d-block"),a("body").css("overflow","hidden"))}),(function(){!a(".main-menu").hasClass("menu-native-scroll")&&a(".main-menu").hasClass("menu-fixed")&&(this.manualScroller.enable(),a(".main-menu-content").css("height",a(e).height()-a(".header-navbar").height()-a(".main-menu-header").outerHeight()-a(".main-menu-footer").outerHeight())),s.hasClass("vertical-overlay-menu")||(a(".sidenav-overlay").removeClass("d-block d-none"),a("body").css("overflow","auto"))}))},hide:function(){this.transit((function(){s.removeClass("menu-open menu-expanded").addClass("menu-hide"),this.hidden=!0,this.expanded=!1,s.hasClass("vertical-overlay-menu")&&(a(".sidenav-overlay").removeClass("d-block").addClass("d-none"),a("body").css("overflow","auto"))}),(function(){!a(".main-menu").hasClass("menu-native-scroll")&&a(".main-menu").hasClass("menu-fixed")&&this.manualScroller.enable(),s.hasClass("vertical-overlay-menu")||(a(".sidenav-overlay").removeClass("d-block d-none"),a("body").css("overflow","auto"))}))},expand:function(){!1===this.expanded&&("vertical-menu-modern"==s.data("menu")&&a(".modern-nav-toggle").find(".toggle-icon").removeClass("feather icon-toggle-left").addClass("feather icon-toggle-right"),this.transit((function(){s.removeClass("menu-collapsed").addClass("menu-expanded"),this.collapsed=!1,this.expanded=!0,a(".sidenav-overlay").removeClass("d-block d-none")}),(function(){a(".main-menu").hasClass("menu-native-scroll")||"horizontal-menu"==s.data("menu")?this.manualScroller.disable():a(".main-menu").hasClass("menu-fixed")&&this.manualScroller.enable(),"vertical-menu"!=s.data("menu")&&"vertical-menu-modern"!=s.data("menu")||!a(".main-menu").hasClass("menu-fixed")||a(".main-menu-content").css("height",a(e).height()-a(".header-navbar").height()-a(".main-menu-header").outerHeight()-a(".main-menu-footer").outerHeight())})))},collapse:function(n){!1===this.collapsed&&("vertical-menu-modern"==s.data("menu")&&a(".modern-nav-toggle").find(".toggle-icon").removeClass("feather icon-toggle-right").addClass("feather icon-toggle-left"),this.transit((function(){s.removeClass("menu-expanded").addClass("menu-collapsed"),this.collapsed=!0,this.expanded=!1,a(".content-overlay").removeClass("d-block d-none")}),(function(){"horizontal-menu"==s.data("menu")&&s.hasClass("vertical-overlay-menu")&&a(".main-menu").hasClass("menu-fixed")&&this.manualScroller.enable(),"vertical-menu"!=s.data("menu")&&"vertical-menu-modern"!=s.data("menu")||!a(".main-menu").hasClass("menu-fixed")||(a(".main-menu-content").css("height",a(e).height()-a(".header-navbar").height()),this.manualScroller.enable()),"vertical-menu-modern"==s.data("menu")&&a(".main-menu").hasClass("menu-fixed")&&this.manualScroller.enable()})))},toOverlayMenu:function(e,n){var a=s.data("menu");"vertical-menu-modern"==n?"md"==e||"sm"==e||"xs"==e?s.hasClass(a)&&s.removeClass(a).addClass("vertical-overlay-menu"):s.hasClass("vertical-overlay-menu")&&s.removeClass("vertical-overlay-menu").addClass(a):"sm"==e||"xs"==e?s.hasClass(a)&&s.removeClass(a).addClass("vertical-overlay-menu"):s.hasClass("vertical-overlay-menu")&&s.removeClass("vertical-overlay-menu").addClass(a)},changeMenu:function(e){a('div[data-menu="menu-wrapper"]').html(""),a('div[data-menu="menu-wrapper"]').html(t);var n=a('div[data-menu="menu-wrapper"]'),i=(a('div[data-menu="menu-container"]'),a('ul[data-menu="menu-navigation"]')),l=a('li[data-menu="megamenu"]'),r=a("li[data-mega-col]"),d=a('li[data-menu="dropdown"]'),m=a('li[data-menu="dropdown-submenu"]');"xl"==e?(s.removeClass("vertical-layout vertical-overlay-menu fixed-navbar").addClass(s.data("menu")),a("nav.header-navbar").removeClass("fixed-top"),n.removeClass().addClass(o),this.drillDownMenu(e),a("a.dropdown-item.nav-has-children").on("click",(function(){event.preventDefault(),event.stopPropagation()})),a("a.dropdown-item.nav-has-parent").on("click",(function(){event.preventDefault(),event.stopPropagation()}))):(s.removeClass(s.data("menu")).addClass("vertical-layout vertical-overlay-menu fixed-navbar"),a("nav.header-navbar").addClass("fixed-top"),n.removeClass().addClass("main-menu menu-light menu-fixed menu-shadow"),i.removeClass().addClass("navigation navigation-main"),l.removeClass("dropdown mega-dropdown").addClass("has-sub"),l.children("ul").removeClass(),r.each((function(e,n){a(n).find(".mega-menu-sub").find("li").has("ul").addClass("has-sub");var s=a(n).children().first(),i="";s.is("h6")&&(i=s.html(),s.remove(),a(n).prepend('<a href="#">'+i+"</a>").addClass("has-sub mega-menu-title"))})),l.find("a").removeClass("dropdown-toggle"),l.find("a").removeClass("dropdown-item"),d.removeClass("dropdown").addClass("has-sub"),d.find("a").removeClass("dropdown-toggle nav-link"),d.children("ul").find("a").removeClass("dropdown-item"),d.find("ul").removeClass("dropdown-menu"),m.removeClass().addClass("has-sub"),a.app.nav.init(),a("ul.dropdown-menu [data-toggle=dropdown]").on("click",(function(e){e.preventDefault(),e.stopPropagation(),a(this).parent().siblings().removeClass("open"),a(this).parent().toggleClass("open")})))},toggle:function(){var e=Unison.fetch.now(),n=(this.collapsed,this.expanded),a=this.hidden,i=s.data("menu");switch(e.name){case"xl":!0===n?"vertical-overlay-menu"==i?this.hide():this.collapse():"vertical-overlay-menu"==i?this.open():this.expand();break;case"lg":!0===n?"vertical-overlay-menu"==i||"horizontal-menu"==i?this.hide():this.collapse():"vertical-overlay-menu"==i||"horizontal-menu"==i?this.open():this.expand();break;case"md":!0===n?"vertical-overlay-menu"==i||"vertical-menu-modern"==i||"horizontal-menu"==i?this.hide():this.collapse():"vertical-overlay-menu"==i||"vertical-menu-modern"==i||"horizontal-menu"==i?this.open():this.expand();break;case"sm":case"xs":!0===a?this.open():this.hide()}this.drillDownMenu(e.name)},update:function(){this.manualScroller.update()},reset:function(){this.expanded=!1,this.collapsed=!1,this.hidden=!1,s.removeClass("menu-hide menu-open menu-collapsed menu-expanded")}},a.app.nav={container:a(".navigation-main"),initialized:!1,navItem:a(".navigation-main").find("li").not(".navigation-category"),config:{speed:300},init:function(e){this.initialized=!0,a.extend(this.config,e),this.bind_events()},bind_events:function(){var e=this;a(".navigation-main").on("mouseenter.app.menu","li",(function(){var n=a(this);if(a(".hover",".navigation-main").removeClass("hover"),s.hasClass("menu-collapsed")&&"vertical-menu-modern"!=s.data("menu")){a(".main-menu-content").children("span.menu-title").remove(),a(".main-menu-content").children("a.menu-title").remove(),a(".main-menu-content").children("ul.menu-content").remove();var i,t,o,l=n.find("span.menu-title").clone();if(n.hasClass("has-sub")||(i=n.find("span.menu-title").text(),t=n.children("a").attr("href"),""!==i&&((l=a("<a>")).attr("href",t),l.attr("title",i),l.text(i),l.addClass("menu-title"))),o=n.css("border-top")?n.position().top+parseInt(n.css("border-top"),10):n.position().top,"vertical-compact-menu"!==s.data("menu")&&l.appendTo(".main-menu-content").css({position:"fixed",top:o}),n.hasClass("has-sub")&&n.hasClass("nav-item")){n.children("ul:first");e.adjustSubmenu(n)}}n.addClass("hover")})).on("mouseleave.app.menu","li",(function(){})).on("active.app.menu","li",(function(e){a(this).addClass("active"),e.stopPropagation()})).on("deactive.app.menu","li.active",(function(e){a(this).removeClass("active"),e.stopPropagation()})).on("open.app.menu","li",(function(n){var s=a(this);if(s.addClass("open"),e.expand(s),a(".main-menu").hasClass("menu-collapsible"))return!1;s.siblings(".open").find("li.open").trigger("close.app.menu"),s.siblings(".open").trigger("close.app.menu"),n.stopPropagation()})).on("close.app.menu","li.open",(function(n){var s=a(this);s.removeClass("open"),e.collapse(s),n.stopPropagation()})).on("click.app.menu","li",(function(e){var n=a(this);n.is(".disabled")?e.preventDefault():s.hasClass("menu-collapsed")&&"vertical-menu-modern"!=s.data("menu")?e.preventDefault():n.has("ul")?n.is(".open")?n.trigger("close.app.menu"):n.trigger("open.app.menu"):n.is(".active")||(n.siblings(".active").trigger("deactive.app.menu"),n.trigger("active.app.menu")),e.stopPropagation()})),a(".navbar-header, .main-menu").on("mouseenter",(function(){if("vertical-menu-modern"==s.data("menu")&&(a(".main-menu, .navbar-header").addClass("expanded"),s.hasClass("menu-collapsed"))){var e=a(".main-menu li.menu-collapsed-open");e.children("ul").hide().slideDown(200,(function(){a(this).css("display","")})),e.addClass("open").removeClass("menu-collapsed-open")}})).on("mouseleave",(function(){s.hasClass("menu-collapsed")&&"vertical-menu-modern"==s.data("menu")&&setTimeout((function(){if(0===a(".main-menu:hover").length&&0===a(".navbar-header:hover").length&&(a(".main-menu, .navbar-header").removeClass("expanded"),s.hasClass("menu-collapsed"))){var e=a(".main-menu li.open"),n=e.children("ul");e.addClass("menu-collapsed-open"),n.show().slideUp(200,(function(){a(this).css("display","")})),e.removeClass("open")}}),1)})),a(".main-menu-content").on("mouseleave",(function(){s.hasClass("menu-collapsed")&&(a(".main-menu-content").children("span.menu-title").remove(),a(".main-menu-content").children("a.menu-title").remove(),a(".main-menu-content").children("ul.menu-content").remove()),a(".hover",".navigation-main").removeClass("hover")})),a(".navigation-main li.has-sub > a").on("click",(function(e){e.preventDefault()})),a("ul.menu-content").on("click","li",(function(n){var s=a(this);if(s.is(".disabled"))n.preventDefault();else if(s.has("ul"))if(s.is(".open"))s.removeClass("open"),e.collapse(s);else{if(s.addClass("open"),e.expand(s),a(".main-menu").hasClass("menu-collapsible"))return!1;s.siblings(".open").find("li.open").trigger("close.app.menu"),s.siblings(".open").trigger("close.app.menu"),n.stopPropagation()}else s.is(".active")||(s.siblings(".active").trigger("deactive.app.menu"),s.trigger("active.app.menu"));n.stopPropagation()}))},adjustSubmenu:function(e){var n,s,t,o,l,r=e.children("ul:first"),d=r.clone(!0);a(".main-menu-header").height(),n=e.position().top,t=i.height()-a(".header-navbar").height(),l=0,r.height(),parseInt(e.css("border-top"),10)>0&&(l=parseInt(e.css("border-top"),10)),o=t-n-e.height()-30,a(".main-menu").hasClass("menu-dark"),s=n+e.height()+l,d.addClass("menu-popout").appendTo(".main-menu-content").css({top:s,position:"fixed","max-height":o});new PerfectScrollbar(".main-menu-content > ul.menu-content")},collapse:function(e,n){var s=e.children("ul");e.addClass("changing"),s.show().slideUp(a.app.nav.config.speed,(function(){a(this).css("display",""),a(this).find("> li").removeClass("is-shown"),n&&n(),a.app.nav.container.trigger("collapsed.app.menu"),e.removeClass("changing")}))},expand:function(e,n){var s=e.children("ul"),i=s.children("li").addClass("is-hidden");s.hide().slideDown(a.app.nav.config.speed,(function(){a(this).css("display",""),n&&n(),a.app.nav.container.trigger("expanded.app.menu")})),setTimeout((function(){i.addClass("is-shown"),i.removeClass("is-hidden")}),0)},refresh:function(){a.app.nav.container.find(".open").removeClass("open")}}}(window,document,jQuery);