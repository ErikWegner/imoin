!function(e){var t={};function n(a){if(t[a])return t[a].exports;var r=t[a]={i:a,l:!1,exports:{}};return e[a].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(a,r,function(t){return e[t]}.bind(null,r));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/html/",n(n.s=1)}([function(e,t){window.dom=function(e,t){var n=document.createElement(e);t&&Object.keys(t).forEach(function(e){n.setAttribute(e,t[e])});for(var a=arguments.length,r=new Array(a>2?a-2:0),d=2;d<a;d++)r[d-2]=arguments[d];return r.forEach(function(e){n.appendChild(e instanceof HTMLElement?e:document.createTextNode(e))}),n}},function(e,t,n){"use strict";n.r(t);n(0);function a(e){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var r={design:1,lastdata:{message:"Waiting for data...",hostgroupinfo:null,updatetime:(new Date).toISOString()}};function d(e){}if(window.messageFromBackgroundPage=function(e){var t=e.command||"",n=e.data||{};"ProcessStatusUpdate"===t&&l(n),"uisettings"===t&&function(e){var t=document.getElementById("uistyles");t&&t.remove();(t=document.createElement("style")).setAttribute("id","uistyles");var n=document.createTextNode("body {font-size:"+e.fontsize+"%}");t.appendChild(n),e.inlineresults&&(n=document.createTextNode(".hostcheckinfo, .service .info { display: inline; }"),t.appendChild(n));document.head.appendChild(t),e.design!=r.design&&(r.design=e.design,l())}(n)},"undefined"!=typeof chrome||"undefined"!=typeof browser){var i=chrome||browser;"undefined"!=typeof browser&&null!==browser.runtime&&(i=browser);var c=i.runtime.connect();c.onMessage.addListener(messageFromBackgroundPage),d=function(e){c.postMessage(e)}}else"object"===("undefined"==typeof self?"undefined":a(self))&&self.addEventListener;var s=document.createTextNode(""),o={};function l(e){e&&(r.lastdata=e);var t=r.lastdata,n=t.message;s=function(e){var t,n=document.createElement("div"),a=document.createElement("div"),r=document.createElement("div"),d=e.hosts;for(var i in d){(t=d[i]).name;var c,s=t.appearsInShortlist,l=[],p=[];for(var h in t.acknowledged=!0===t.has_been_acknowledged?"A":"",t.services){var f=t.services[h];f.host=t,f.acknowledged=!0===f.has_been_acknowledged?"A":"",c=m(f),l.push(c.cloneNode(!0)),f.appearsInShortlist&&p.push(c.cloneNode(!0))}t.servicesdata=p,c=u(t),s&&n.appendChild(c.cloneNode(!0)),a.appendChild(c),t.servicesdata=l,r.appendChild(u(t))}var b=function(e){var t=document.createElement("div");if(e.instances){var n=document.createElement("div");t.appendChild(n),Object.keys(e.instances).forEach(function(t){var a,r,d=e.instances[t],i=document.createElement("div");i.setAttribute("class","instance"),i.appendChild(a=document.createElement("span")),a.setAttribute("class","instancename"),a.appendChild(document.createTextNode(d.instancelabel)),i.appendChild(a=document.createElement("span")),a.setAttribute("class","instanceupdatetime"),a.appendChild(document.createTextNode(d.updatetime)),i.appendChild(a=document.createElement("span")),a.setAttribute("class","actions"),a.setAttribute("data-instanceindex",t),a.appendChild(r=document.createElement("span")),r.setAttribute("class","refresh"),r.appendChild(document.createTextNode("↺")),n.appendChild(i)})}return t}(e);o={filter0:n,filter1:a,filter2:r,instances:b};var v,A,E,y,N,x,k,T,S=document.createElement("div");S.setAttribute("class","header"),S.setAttribute("style","text-align:center"),S.appendChild(v=document.createElement("p")),v.appendChild(A=document.createElement("span")),A.setAttribute("class","refresh"),A.appendChild(document.createTextNode("↺ Refresh")),v.appendChild(document.createTextNode(" ")),v.appendChild(A=document.createElement("span")),A.setAttribute("class","options"),A.appendChild(T=document.createElement("img")),T.setAttribute("style","width: auto; height: 14px;"),T.setAttribute("src","./gear.svg"),T.setAttribute("title","Options"),null!==e.hostgroupinfo&&""!==e.hostgroupinfo&&v.appendChild(document.createTextNode(" "+e.hostgroupinfo));S.appendChild(E=document.createElement("div")),E.appendChild(y=document.createElement("table")),y.setAttribute("class","main"),y.setAttribute("cellspacing","0"),y.setAttribute("style","vertical-align:top; display: inline-block; margin-right: 1em"),y.appendChild(N=document.createElement("tr")),N.appendChild(x=document.createElement("th")),x.appendChild(document.createTextNode("Service status")),x.setAttribute("colspan","2"),y.appendChild(N=document.createElement("tr")),N.className="OK",C(N,"Ok"),C(N,e.filteredServiceok+"/"+e.totalservices,"num"),y.appendChild(N=document.createElement("tr")),N.className="WARN",C(N,"Warn"),C(N,e.filteredServicewarnings+"/"+e.totalservices,"num"),y.appendChild(N=document.createElement("tr")),N.className="CRIT",C(N,"Crit"),C(N,e.filteredServiceerrors+"/"+e.totalservices,"num"),E.appendChild(y=document.createElement("table")),y.setAttribute("class","main"),y.setAttribute("cellspacing","0"),y.setAttribute("style","display: inline-block"),y.appendChild(N=document.createElement("tr")),N.appendChild(x=document.createElement("th")),x.appendChild(document.createTextNode("Host status")),x.setAttribute("colspan","2"),y.appendChild(N=document.createElement("tr")),N.className="UP",C(N,"Up"),C(N,e.filteredHostup+"/"+e.totalhosts,"num"),y.appendChild(N=document.createElement("tr")),N.className="DOWN",C(N,"Down"),C(N,e.filteredHosterrors+"/"+e.totalhosts,"num"),y.appendChild(N=document.createElement("tr")),N.className="space",N.appendChild(k=document.createElement("td")),k.setAttribute("colspan","2"),y.appendChild(N=document.createElement("tr")),N.className="updatetime",N.appendChild(k=document.createElement("td")),k.setAttribute("colspan","2"),k.appendChild(document.createTextNode(e.updatetime)),S.appendChild(E=document.createElement("div")),g(E,"filter0","r1","Errors/Warnings").setAttribute("checked","checked"),g(E,"filter1","r2","All Hosts"),g(E,"filter2","r3","All Services"),e.instances&&Object.keys(e.instances).length>1&&g(E,"instances","i","Instances");return(E=document.createElement("div")).setAttribute("class","content"),E.id="details",E.appendChild(n),[S,E]}(t),n&&s.unshift(function(e){var t=document.createElement("div");t.setAttribute("style","text-align:center");var n=document.createElement("img");n.setAttribute("src","../icons/logo-66x32.png"),n.setAttribute("alt","Icinga logo"),t.appendChild(n),t.appendChild(document.createElement("br"));var a=document.createElement("p");return a.setAttribute("class","errormessage"),t.appendChild(a),a.appendChild(document.createTextNode(e)),t}(n));for(var a=document.getElementById("app")||document.body;a.childNodes.length>0;)a.removeChild(a.childNodes[a.childNodes.length-1]);if(s.length>0)for(var d in s)a.appendChild(s[d]);else a.appendChild(s);!function(){var e=["r1","r2","r3","i"];for(var t in e){var n=document.getElementById(e[t]);n&&n.addEventListener("click",f)}b(A,"refresh"),b(N,"options"),v()}()}function u(e){if(2==r.design)return function(e){var t=dom("tr",null,dom("td",{colspan:"2"},e.name),dom("td",null,e.checkresult));for(var n in e.servicesdata)t.appendChild(e.servicesdata[n]);return t}(e,e.servicesdata);var t,n,a=document.createElement("div");for(var d in a.setAttribute("class","host"),a.appendChild(t=document.createElement("div")),t.appendChild(n=document.createElement("span")),n.setAttribute("class","hostname"),e.hostlink&&n.setAttribute("data-url",e.hostlink),n.appendChild(document.createTextNode(e.name)),t.appendChild(n=document.createElement("span")),n.setAttribute("class","status "+e.status),n.appendChild(document.createTextNode(e.status)),t.appendChild(n=document.createElement("span")),n.setAttribute("class","actions"),n.setAttribute("data-hostname",e.name),n.setAttribute("data-instanceindex",e.instanceindex),n.appendChild(document.createTextNode(" ")),n.appendChild(p.cloneNode(!0)),t.appendChild(n=document.createElement("span")),n.setAttribute("class","hostcheckinfo"),n.appendChild(document.createTextNode(e.checkresult)),a.appendChild(t=document.createElement("div")),t.setAttribute("class","services"),e.servicesdata)t.appendChild(e.servicesdata[d]);return a}function m(e){if(2==r.design)return function(e){return dom("tr",null,dom("td",null,e.host.name),dom("td",null,e.name),dom("td",null,e.checkresult))}(e);var t,n=document.createElement("div");n.setAttribute("class","service"),(t=document.createElement("span")).setAttribute("class","servicename"),e.servicelink&&t.setAttribute("data-url",e.servicelink),t.appendChild(document.createTextNode(e.name)),n.appendChild(t),(t=document.createElement("span")).setAttribute("class","status "+e.status),t.appendChild(document.createTextNode(e.status)),n.appendChild(t),(t=document.createElement("span")).setAttribute("class","actions"),t.setAttribute("data-hostname",e.host.name),t.setAttribute("data-instanceindex",e.host.instanceindex),t.setAttribute("data-servicename",e.name),t.appendChild(document.createTextNode(" ")),t.appendChild(p.cloneNode(!0)),n.appendChild(t);var a=document.createElement("div");return a.setAttribute("class","info"),a.appendChild(document.createTextNode(e.checkresult)),n.appendChild(a),n}var p=document.createElement("span");p.setAttribute("title","Recheck"),p.setAttribute("class","recheck"),p.setAttribute("data-command","recheck");var h=document.createElement("span");function f(e){if(null!=e&&null!=e.target){var t=e.target.getAttribute("value"),n=document.getElementById("details");n&&t in o&&(n.replaceChild(o[t],n.childNodes[0]),v())}}function b(e,t){var n=document.getElementsByClassName(t);Array.prototype.forEach.call(n,function(t){t.addEventListener("click",e)})}function v(){var e,t,n;b(y,"hostname"),b(y,"servicename"),b(E,"recheck"),b(E,"ack"),e=A,t=".instance .refresh",n=document.querySelectorAll(t),Array.prototype.forEach.call(n,function(t){t.addEventListener("click",e)})}function g(e,t,n,a){var r=document.createElement("input");e.appendChild(r),r.setAttribute("type","radio"),r.setAttribute("class","cb"),r.setAttribute("value",t),r.setAttribute("name","filter"),r.setAttribute("id",n);var d=document.createElement("label");return e.appendChild(d),d.setAttribute("for",n),d.appendChild(document.createTextNode(a)),r}function C(e,t,n){var a=document.createElement("td");return a.appendChild(document.createTextNode(t)),null!==n&&""!==n&&(a.className=n),e.appendChild(a),e}function A(e){var t=e.target,n={command:"triggerRefresh"};if(t){var a=t.parentElement;if(a){var r=a.getAttribute("data-instanceindex");null!=r&&(n.instanceindex=r)}}d(n)}function E(e){var t=e.target;if(null!==t){var n=t.getAttribute("data-command"),a=t.parentElement;if(null!==a)d({command:"triggerCmdExec",hostname:a.getAttribute("data-hostname"),servicename:a.getAttribute("data-servicename")||"",remoteCommand:n,instanceindex:a.getAttribute("data-instanceindex")})}}function y(e){var t=e.target.getAttribute("data-url");t&&d({command:"triggerOpenPage",url:t})}function N(){d({command:"triggerShowOptions"})}h.setAttribute("title","Acknowledge"),h.setAttribute("class","ack"),h.setAttribute("data-command","ack"),l()}]);