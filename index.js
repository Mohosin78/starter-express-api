var session = require("express-session"),
  bodyParser = require("body-parser"),
  express = require("express"),
  cors = require("cors"),
  fs = require("fs"),
  app = express();

const __user = [
  { id: "1", name: "admin", pass: "admin123" },
  { id: "2", name: "guest", pass: "guest" },
];

var __clients = {};
var __workers = {};

var __workers_id = {};

try {
  var expressWs = require("express-ws")(app);
} catch (error) {
  console.error("Error initializing WebSocket server:", error.message);
}

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/image", express.static(__dirname + "/image"));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    secret: "iamalive@home",
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(function (req, res, next) {
  let id = req?.session?.client,
    url = req.url.split("?")[0];

  if (req.url == "/.websocket") {
    next();
    return 0;
  }

  if (url == "/data") {
    const body = JSON.parse(JSON.stringify(req.query));
    if (body.worker) {
      if (body.worker == "yes") {
        next();
        return 0;
      }
    }
  }

  if (url == "/login" || url == "/authenticate") {
    if (id) {
      if (id == "am-aoio-0263-ioar" || id == "am-aoio-0263-ioar-g") {
        res.redirect("/");
      } else next();
    } else next();
    return 0;
  }

  if (id) {
    if (id == "am-aoio-0263-ioar" || id == "am-aoio-0263-ioar-g") {
      if (url == "/login") {
        res.redirect("/");
      } else next();
    } else res.redirect("/login");
  } else res.redirect("/login");
});

app.get("/", function (req, res, next) {
  let data = fs.readFileSync(__dirname + "/page/index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(data);
  return res.end();
});

app.get("/login", function (req, res, next) {
  let data = fs.readFileSync(__dirname + "/page/login.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(data);
  return res.end();
});

app.get("/authenticate", function (req, res, next) {
  const body = JSON.parse(JSON.stringify(req.query));

  if (body.user == __user[0].name && body.pass == __user[0].pass) {
    req.session.client = "am-aoio-0263-ioar";

    res.json({
      status: true,
      token: "am-aoio-0263-ioar",
    });
  } else if (body.user == __user[1].name && body.pass == __user[1].pass) {
    req.session.client = "am-aoio-0263-ioar-g";

    res.json({
      status: true,
      token: "am-aoio-0263-ioar-g",
    });
  } else {
    res.json({
      status: false,
      message: "username or password is wrong!",
    });
  }
  return res.end();
});

app.get("/data", function (req, res, next) {
  const data = JSON.parse(JSON.stringify(req.query));
  let file = fs.readFileSync(__dirname + "/worker_data.json", "utf8");

  if (data.id) {
    if (JSON.parse(file)[data.id]) {
      res.send({
        d: JSON.parse(file)[data.id].data,
        l: JSON.parse(file)[data.id].data.length,
      });
      return res.end();
    }
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(file);
  return res.end();
});

app.get("/pin", function (req, res, next) {
  const data = JSON.parse(JSON.stringify(req.query));
  let file = fs.readFileSync(__dirname + "/worker_data.json", "utf8");
  if (data.id) {
    file = JSON.parse(file);
    if (file[data.id]) {
      for (const key in file[data.id]["data"]) {
        let _er = file[data["id"]]["data"][key];
        if (_er["p"] == data["pin"]) {
          file[data["id"]]["data"][key]["s"] = Number(data["state"]);
          break;
        }
      }

      fs.writeFile(
        __dirname + "/worker_data.json",
        JSON.stringify(file),
        "utf8",
        (err) => {
          if (err) {
            res.json({
              status: false,
              message: "Server Error!",
            });
          } else {
            res.json({
              status: true,
            });
          }
        }
      );
    } else {
      res.json({
        status: false,
        message: "wrong worker id!",
      });
    }
  } else {
    res.json({
      status: false,
      message: "wrong worker id!",
    });
  }
});

const $ID = ($obj) => {
  let $id = "am_" + Math.random().toString(36).slice(2, 8);

  if ($obj[$id]) $ID($obj);
  else {
    return $id;
  }
};

app.ws("/", function (ws, req) {
  ws._socket.setNoDelay(true);

  console.log("WebSocket connected");

  ws.on("close", function () {
    if (ws.mchtype == "client") {
      delete __clients[ws.id];
    } else if (ws.mchtype == "worker") {
      delete __workers[ws.id];
      delete __workers_id[__workers_id[ws.id]];
      delete __workers_id[ws.id];
    }
    console.log("WebSocket disconnected : " + ws.id);
  });

  ws.on("message", function (msg) {
    // console.log(msg);
    try {
      let data = JSON.parse(msg);

      if (data.type == "order") {
        if (data.order == "Client-ID") {
          let id = $ID(__clients);
          ws.id = id;
          __clients[id] = ws;
          ws.mchtype = "client";
          ws.send(JSON.stringify({ type: "set", order: "new-ID", id }));
        } else if (data.order == "Worker-ID") {
          let id = $ID(__workers);
          ws.id = id;
          __workers[id] = ws;
          ws.mchtype = "worker";
          __workers_id[id] = data.id;
          __workers_id[data.id] = id;
          ws.send(JSON.stringify({ type: "set", order: "new-ID", id }));
        } else if (data.order == "set-pin") {
          if (data["id"]) {
            if (__workers[__workers_id[data.id]]) {
              __workers[__workers_id[data.id]].send(
                JSON.stringify({
                  type: "set",
                  cid: data["cid"],
                  pin: data["pin"],
                  order: "cng_state",
                  state: data["state"],
                })
              );
            } else {
              ws.send(
                JSON.stringify({ type: "error", msg: "Worker is Sleeping" })
              );
            }
          } else {
            ws.send(JSON.stringify({ type: "error", msg: "need worker id" }));
          }
        }
      } else if (data["type"] == "full-filles") {
        if (data["order"] == "send-success-c") {
          for (const key in __clients) {
            __clients[key].send(
              JSON.stringify({
                type: "set",
                cid: data["cid"],
                pin: data["pin"],
                order: "success-w",
                wid: __workers_id[ws.id],
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("WebSocket message handling error:", error.message);
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});
