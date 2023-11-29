var ws, __url, __ws__url, __ws__client, __workers_active;

var __workers_data;

const _elm = ($e) => {
  return document.createElement($e);
};

function $cnt_cng($e, $n) {
  $e.csr("as_1")
    .csr("as_2")
    .csr("as_3")
    .cs("as_" + $n);
}

function pinner($e) {
  $e = $e.split("@");
  let $er = __workers_data[$e[0]]["data"][$e[1]];
  let _s = $er["s"] == 0 ? 1 : 0;

  ws.send(
    JSON.stringify({
      id: $e[0],
      state: _s,
      type: "order",
      pin: $er["p"],
      order: "set-pin",
      cid: __ws__client,
    })
  );

  // __workers_data[$e[0]]["data"][$e[1]]["s"] = _s;
}

function load_detail() {
  let $e = __workers_active;
  let data = __workers_data[$e].data;
  let $cnt = $(".worker_detail ul");
  $cnt.innerHTML = "";

  data.forEach((_e) => {
    let $li = _elm("li"),
      $sp = _elm("span"),
      $dv1 = _elm("div"),
      $dv2 = _elm("div");

    $li.id = $e + "@" + _e["i"];

    $sp.textContent = _e["n"];

    $li.append($sp);

    $dv1.className = _e["s"] == 1 ? "switch-out active" : "switch-out";
    $dv2.className = "switch-inner";

    $dv1.append($dv2);
    $li.append($dv1);

    $li.addEventListener("click", (event) => {
      let $e = event.target;
      if ($e.tagName !== "LI") $e = $($e).pr();
      if ($e.tagName !== "LI") $e = $($e).pr();
      pinner($e.getAttribute("id"));
    });

    $cnt.append($li);
  });

  setTimeout(() => {
    $(".title").cs("active");
    $cnt_cng($(".container"), 3);
    $(".title h3").textContent = __workers_data[$e].name;
  }, 500);
}

function load_data() {
  let $cnt = $(".worker_list ul");
  $cnt.innerHTML = "";

  for (const key in __workers_data) {
    let $li = _elm("li"),
      $sp = _elm("span"),
      $img = _elm("img");

    $li.id = key;

    $sp.textContent = __workers_data[key]["name"];

    $img.src = "image/right-logo.svg";

    $li.append($sp);
    $li.append($img);

    $li.addEventListener("click", (event) => {
      let $e = event.target;
      $cnt_cng($(".container"), 1);
      if ($e.tagName !== "LI") $e = $($e).pr();
      __workers_active = $e.getAttribute("id");
      load_detail();
    });

    $cnt.append($li);
  }

  setTimeout(() => {
    $cnt_cng($(".container"), 2);
  }, 600);
}

function getDataFromServer() {
  $get("/data")
    .then((result) => {
      __workers_data = JSON.parse(result);
      setTimeout(load_data, 500);
    })
    .catch((err) => alert(err.message));
}

window.onload = () => {
  __url = window.location.host;
  let _type = window.location.protocol == "http:" ? "ws" : "wss";
  __ws__url = _type + "://" + __url + "/";
  ws = new WebSocket(__ws__url);

  console.log("Connecting to : " + __ws__url);

  ws.onopen = () => {
    console.log("Connected to : " + __ws__url);

    __ws__client = sessionStorage.getItem("ws_client");

    if (!__ws__client) {
      ws.send(JSON.stringify({ type: "order", order: "Client-ID" }));
    }

    $(".ws-state").cs("active");
  };

  ws.onerror = (e) => {
    console.log(e);
  };

  ws.onmessage = ($res) => {
    let data = JSON.parse($res.data);
    if (data.type === "set") {
      if (data.order == "new-ID") {
        __ws__client = data["id"];
        sessionStorage.setItem("ws_client", data.id);
      } else if (data.order == "success-w") {
        let _y;
        for (const key in __workers_data[data["wid"]].data) {
          let _er = __workers_data[data["wid"]]["data"][key];
          if (_er["p"] == data["pin"]) {
            let y = __workers_data[data["wid"]]["data"][key]["s"];
            _y = y == 0 ? 1 : 0;
            __workers_data[data["wid"]]["data"][key]["s"] = y == 0 ? 1 : 0;
            break;
          }
        }
        if (data["wid"] == __workers_active) load_detail();
        if (data["cid"] == __ws__client) {
          $get(
            "/pin?id=" + data["wid"] + "&&pin=" + data["pin"] + "&&state=" + _y
          )
            .then((result) => {})
            .catch((err) => alert(err.message));
        }
      }
    } else if (data.type == "error") {
      alert(data.msg);
    }
  };

  ws.onclose = () => {
    $(".ws-state").csr("active");
    sessionStorage.removeItem("ws_client");
    console.log("Connection Closes from : " + __ws__url);
  };

  setTimeout(getDataFromServer, 500);

  $(".back").addEventListener("click", () => {
    __workers_active = "";
    $(".title").csr("active");
    $cnt_cng($(".container"), 2);
    $(".title h3").textContent = "Home BOT";
  });
};
