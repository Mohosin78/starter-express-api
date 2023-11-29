/**
 * =>> author : Md.Mohosin Ali
 * =>> version : 1.8.8
 **/
var _ss_ = 5;
($get = function (_r) {
  var __http = new Promise((_res, _rej) => {
    if (!_r) rej("No data Given by You.");
    var __time = 0;
    var __url = _r.url || _r;
    if (!__url) _rej("URL is requied to send request.");
    var __xhttp = new XMLHttpRequest();
    __xhttp.onreadystatechange = function (e) {
      if (this.readyState == 4) {
        if (this.status == 200 || this.status == 304) {
          var __val = this.responseText;
          _res(__val);
        }
      }
      if (this.status >= 400) {
        this.abort();
        _rej("Url Not Found.");
      }
    };
    __xhttp.open("GET", __url, true);
    __xhttp.send();
    var __timer = setInterval(function () {
      __time++;
      __time == _ss_ ? clearInterval(__timer) : false;
      __time == _ss_ ? _rej("Request Timeout") : false;
    }, 1000);
  });
  return __http;
}),
  ($post = function (_r) {
    if (!_r) return "No data Given by You.";
    if (typeof _r !== "object")
      return `Data requies Object but Given, ${typeof _r}`;
    var __time = 0;
    var __url = _r.url || "";
    var _data = _r.data || "";
    if (!__url) return "URL is requied to send request.";
    if (!_data) return "Data is requied to send request.";
    var __http = new Promise((_res, _rej) => {
      var __xhttp = new XMLHttpRequest();
      __xhttp.onreadystatechange = function (e) {
        if (this.readyState == 4) {
          if (this.status == 200 || this.status == 304) {
            var __val = this.responseText;
            _res(JSON.parse(__val));
          }
        }
        if (this.status >= 400) {
          this.abort();
          _rej("Url Not Found.");
        }
      };
      __xhttp.open("POST", __url, true);
      __xhttp.send(_data);
      var __timer = setInterval(function () {
        __time++;
        __time == _ss_ ? clearInterval(__timer) : false;
        __time == _ss_ ? _rej("Request Timeout") : false;
      }, 1000);
    });
    return __http;
  }),
  ($json = function (arg, e) {
    try {
      if (!arg) return false;
      if (!e) return JSON.parse(arg);
      if (e) return JSON.stringify(arg);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  });
