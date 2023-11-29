var $ = (arg, arg2) => {
  try {
    var htm = "";
    if (!arg) return false;
    var func = (htm) => {
      htm.val = (arg) => {
        if (arg) {
          htm.value = arg;
          return htm;
        } else return htm.value;
      };

      htm.text = (arg) => {
        if (arg) htm.innerText = arg;
        else return htm.innerText;
      };

      htm.show = (arg) => {
        htm.style.display = arg;
        return htm;
      };

      htm.html = (arg) => {
        if (arg) htm.innerHTML = arg;
        else return htm.innerHTML;
      };

      htm.attr = (e1, e2) => {
        if (!e1) return false;
        if (e2) {
          htm.setAttribute(e1, e2);
          return htm;
        } else return htm.getAttribute(e1);
      };

      htm.rattr = (e1) => {
        if (!e1) return false;
        htm.removeAttribute(e1);
        return htm;
      };

      htm.cs = ($e1) => {
        htm.classList.add($e1);
        return htm;
      };

      htm.csc = ($e1) => {
        return htm.classList.contains($e1);
      };

      htm.csr = ($e1) => {
        htm.classList.remove($e1);
        return htm;
      };

      htm.cst = ($e1) => {
        htm.classList.toggle($e1);
        return htm;
      };

      htm.qr = (arg) => {
        return $(htm.querySelector(arg));
      };
      htm.qrs = (arg) => {
        return $(htm.querySelectorAll(arg));
      };

      htm.pr = (arg) => {
        return $(htm.parentElement);
      };

      htm.qrs = (arg) => {
        return $(htm.querySelectorAll(arg));
      };
    };

    if (typeof arg == "object") {
      func(arg);
      return arg;
    }

    if (typeof arg == "string") {
      htm = document.querySelector(arg);
      func(htm);
      return htm;
    }
  } catch (e) {
    console.log(e);
  }
};

var $$ = ($el) => {
  return document.querySelectorAll($el);
};
