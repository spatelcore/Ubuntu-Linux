// A small in-browser Linux terminal simulator for practice.
// Supports a virtual filesystem and a useful subset of commands,
// including pipes (|) and output redirection (>, >>).

(function () {
  "use strict";

  // ---------- Virtual filesystem ----------
  // Directory = { type:'dir', children:{} }
  // File      = { type:'file', content:'...' }
  function freshFS() {
    return {
      type: "dir", children: {
        home: { type: "dir", children: {
          alice: { type: "dir", children: {
            "notes.txt": { type: "file", content: "buy milk\nfix server\ncall bob\nfix server\n" },
            "todo.md": { type: "file", content: "# TODO\n- deploy app\n- rotate logs\n" },
            ".ssh": { type: "dir", children: {} }
          }}
        }},
        etc: { type: "dir", children: {
          passwd: { type: "file", content:
            "root:x:0:0:root:/root:/bin/bash\nalice:x:1001:1001:Alice:/home/alice:/bin/bash\nbob:x:1002:1002:Bob:/home/bob:/bin/bash\n" },
          hostname: { type: "file", content: "web01\n" }
        }},
        var: { type: "dir", children: {
          log: { type: "dir", children: {
            "syslog": { type: "file", content:
              "Jul 20 14:00:01 web01 systemd[1]: Started daily job.\n" +
              "Jul 20 14:03:11 web01 sshd[2231]: Failed password for root from 10.0.0.5\n" +
              "Jul 20 14:03:15 web01 sshd[2231]: Accepted publickey for alice\n" +
              "Jul 20 14:05:00 web01 cron[900]: (alice) CMD (/backup.sh)\n" +
              "Jul 20 14:09:42 web01 kernel: [ERROR] disk /dev/sdb read error\n" }
          }}
        }}
      }
    };
  }

  var fs = freshFS();
  var cwd = ["home", "alice"];  // path segments
  var user = "alice";

  // ---------- Path helpers ----------
  function resolve(path) {
    var segs = path.startsWith("/") ? [] : cwd.slice();
    path.split("/").forEach(function (p) {
      if (p === "" || p === ".") return;
      if (p === "..") { segs.pop(); return; }
      if (p === "~") { segs = ["home", user]; return; }
      segs.push(p);
    });
    return segs;
  }
  function getNode(segs) {
    var node = fs;
    for (var i = 0; i < segs.length; i++) {
      if (!node.children || !node.children[segs[i]]) return null;
      node = node.children[segs[i]];
    }
    return node;
  }
  function parentOf(segs) { return getNode(segs.slice(0, -1)); }
  function pathStr(segs) { return "/" + segs.join("/"); }
  function prompt() {
    var p = pathStr(cwd).replace("/home/" + user, "~");
    return user + "@web01:" + (p || "/") + "$ ";
  }

  // ---------- Command implementations ----------
  // Each returns a string (stdout). Errors are thrown as {err:'msg'}.
  var CMDS = {
    help: function () {
      return "Available commands:\n" +
        "  pwd  cd  ls  cat  echo  grep  head  tail  wc  sort  uniq\n" +
        "  find  mkdir  touch  rm  cp  mv  chmod  whoami  id  clear  reset\n" +
        "Features: pipes (a | b) and redirection (> file, >> file).\n" +
        "Try:  cat notes.txt | sort | uniq -c";
    },
    pwd: function () { return pathStr(cwd) || "/"; },
    whoami: function () { return user; },
    id: function () { return "uid=1001(" + user + ") gid=1001(" + user + ") groups=1001(" + user + "),27(sudo)"; },
    echo: function (args) { return args.join(" "); },
    clear: function () { return "\x00CLEAR"; },
    reset: function () { fs = freshFS(); cwd = ["home", "alice"]; return "\x00CLEAR"; },

    cd: function (args) {
      var target = args[0] || "~";
      var segs = resolve(target);
      var node = getNode(segs);
      if (!node) throw { err: "cd: " + target + ": No such file or directory" };
      if (node.type !== "dir") throw { err: "cd: " + target + ": Not a directory" };
      cwd = segs; return "";
    },
    ls: function (args) {
      var long = args.indexOf("-l") !== -1 || /(-\w*l)/.test(args.join(" "));
      var all = /(-\w*a)/.test(args.join(" "));
      var pathArg = args.filter(function (a) { return !a.startsWith("-"); })[0];
      var segs = pathArg ? resolve(pathArg) : cwd;
      var node = getNode(segs);
      if (!node) throw { err: "ls: cannot access '" + pathArg + "': No such file or directory" };
      if (node.type === "file") return pathArg;
      var names = Object.keys(node.children).sort();
      if (!all) names = names.filter(function (n) { return !n.startsWith("."); });
      if (!long) return names.join("  ");
      return names.map(function (n) {
        var c = node.children[n];
        var perm = c.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
        var sz = c.type === "file" ? c.content.length : 4096;
        return perm + " 1 " + user + " " + user + " " + String(sz).padStart(5) + " Jul 20 14:00 " + n;
      }).join("\n");
    },
    cat: function (args) {
      var out = [];
      args.filter(function (a) { return !a.startsWith("-"); }).forEach(function (a) {
        var node = getNode(resolve(a));
        if (!node) throw { err: "cat: " + a + ": No such file or directory" };
        if (node.type === "dir") throw { err: "cat: " + a + ": Is a directory" };
        out.push(node.content);
      });
      return out.join("").replace(/\n$/, "");
    },
    mkdir: function (args) {
      var parents = args.indexOf("-p") !== -1;
      args.filter(function (a) { return !a.startsWith("-"); }).forEach(function (a) {
        var segs = resolve(a);
        if (parents) {
          var node = fs;
          segs.forEach(function (s) {
            if (!node.children[s]) node.children[s] = { type: "dir", children: {} };
            node = node.children[s];
          });
        } else {
          var parent = parentOf(segs);
          if (!parent) throw { err: "mkdir: cannot create '" + a + "': No such file or directory" };
          if (parent.children[segs[segs.length - 1]]) throw { err: "mkdir: cannot create '" + a + "': File exists" };
          parent.children[segs[segs.length - 1]] = { type: "dir", children: {} };
        }
      });
      return "";
    },
    touch: function (args) {
      args.filter(function (a) { return !a.startsWith("-"); }).forEach(function (a) {
        var segs = resolve(a); var parent = parentOf(segs);
        if (!parent) throw { err: "touch: cannot touch '" + a + "': No such file or directory" };
        var name = segs[segs.length - 1];
        if (!parent.children[name]) parent.children[name] = { type: "file", content: "" };
      });
      return "";
    },
    rm: function (args) {
      var recursive = /(-\w*r)/.test(args.join(" "));
      args.filter(function (a) { return !a.startsWith("-"); }).forEach(function (a) {
        var segs = resolve(a); var parent = parentOf(segs); var name = segs[segs.length - 1];
        if (!parent || !parent.children[name]) throw { err: "rm: cannot remove '" + a + "': No such file or directory" };
        if (parent.children[name].type === "dir" && !recursive) throw { err: "rm: cannot remove '" + a + "': Is a directory" };
        delete parent.children[name];
      });
      return "";
    },
    cp: function (args) {
      var files = args.filter(function (a) { return !a.startsWith("-"); });
      if (files.length < 2) throw { err: "cp: missing destination" };
      var src = getNode(resolve(files[0]));
      if (!src) throw { err: "cp: cannot stat '" + files[0] + "': No such file or directory" };
      var dstSegs = resolve(files[1]); var parent = parentOf(dstSegs);
      if (!parent) throw { err: "cp: cannot create '" + files[1] + "'" };
      parent.children[dstSegs[dstSegs.length - 1]] = JSON.parse(JSON.stringify(src));
      return "";
    },
    mv: function (args) {
      var files = args.filter(function (a) { return !a.startsWith("-"); });
      if (files.length < 2) throw { err: "mv: missing destination" };
      var srcSegs = resolve(files[0]); var sp = parentOf(srcSegs); var sn = srcSegs[srcSegs.length - 1];
      if (!sp || !sp.children[sn]) throw { err: "mv: cannot stat '" + files[0] + "': No such file or directory" };
      var node = sp.children[sn]; delete sp.children[sn];
      var dstSegs = resolve(files[1]); var dp = parentOf(dstSegs);
      dp.children[dstSegs[dstSegs.length - 1]] = node;
      return "";
    },
    chmod: function (args) { return ""; },   // accepted (no enforcement in sim)
    grep: function (args, stdin) {
      var flags = args.filter(function (a) { return a.startsWith("-"); }).join("");
      var rest = args.filter(function (a) { return !a.startsWith("-"); });
      var pattern = rest.shift();
      if (pattern === undefined) throw { err: "usage: grep [-ivcn] PATTERN [file]" };
      var ci = flags.indexOf("i") !== -1, inv = flags.indexOf("v") !== -1,
          cnt = flags.indexOf("c") !== -1, num = flags.indexOf("n") !== -1;
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      var re;
      try { re = new RegExp(pattern, ci ? "i" : ""); } catch (e) { throw { err: "grep: invalid regex" }; }
      var lines = text.split("\n");
      var out = [];
      lines.forEach(function (l, i) {
        var m = re.test(l);
        if (inv) m = !m;
        if (m) out.push((num ? (i + 1) + ":" : "") + l);
      });
      if (cnt) return String(out.length);
      return out.join("\n");
    },
    head: function (args, stdin) {
      var n = 10; var i = args.indexOf("-n"); if (i !== -1) n = parseInt(args[i + 1], 10);
      var rest = args.filter(function (a) { return !a.startsWith("-") && !/^\d+$/.test(a); });
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      return text.split("\n").slice(0, n).join("\n");
    },
    tail: function (args, stdin) {
      var n = 10; var i = args.indexOf("-n"); if (i !== -1) n = parseInt(args[i + 1], 10);
      var rest = args.filter(function (a) { return !a.startsWith("-") && !/^\d+$/.test(a); });
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      var lines = text.split("\n");
      return lines.slice(Math.max(0, lines.length - n)).join("\n");
    },
    wc: function (args, stdin) {
      var lonly = args.indexOf("-l") !== -1;
      var rest = args.filter(function (a) { return !a.startsWith("-"); });
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      var lines = text === "" ? 0 : text.split("\n").length;
      var words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      var chars = text.length;
      if (lonly) return String(lines);
      return "  " + lines + "  " + words + "  " + chars;
    },
    sort: function (args, stdin) {
      var rev = args.indexOf("-r") !== -1, uniq = args.indexOf("-u") !== -1, num = args.indexOf("-n") !== -1;
      var rest = args.filter(function (a) { return !a.startsWith("-"); });
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      var lines = text.split("\n").filter(function (l, i, arr) { return !(l === "" && i === arr.length - 1); });
      lines.sort(function (a, b) { return num ? (parseFloat(a) - parseFloat(b)) : a.localeCompare(b); });
      if (rev) lines.reverse();
      if (uniq) lines = lines.filter(function (l, i) { return i === 0 || l !== lines[i - 1]; });
      return lines.join("\n");
    },
    uniq: function (args, stdin) {
      var count = args.indexOf("-c") !== -1;
      var rest = args.filter(function (a) { return !a.startsWith("-"); });
      var text = rest.length ? CMDS.cat(rest) : (stdin || "");
      var lines = text.split("\n");
      var out = []; var prev = null; var c = 0;
      lines.forEach(function (l) {
        if (l === prev) { c++; }
        else { if (prev !== null) out.push(count ? "  " + c + " " + prev : prev); prev = l; c = 1; }
      });
      if (prev !== null) out.push(count ? "  " + c + " " + prev : prev);
      return out.join("\n");
    },
    find: function (args) {
      var start = (args[0] && !args[0].startsWith("-")) ? args[0] : ".";
      var nameIdx = args.indexOf("-name");
      var pattern = nameIdx !== -1 ? args[nameIdx + 1].replace(/['"]/g, "") : "*";
      var re = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
      var results = [];
      (function walk(segs) {
        var node = getNode(segs); if (!node) return;
        var display = (start + (segs.length > resolve(start).length ?
          "/" + segs.slice(resolve(start).length).join("/") : "")).replace(/\/{2,}/g, "/");
        var name = segs[segs.length - 1] || start;
        if (re.test(name) || (segs.join("/") === resolve(start).join("/") && pattern === "*")) {
          if (segs.join("/") !== resolve(start).join("/")) results.push(display);
        }
        if (node.type === "dir") {
          Object.keys(node.children).sort().forEach(function (c) { walk(segs.concat(c)); });
        }
      })(resolve(start));
      return results.join("\n");
    }
  };

  // ---------- Parser: handle pipes and redirection ----------
  function runLine(line) {
    line = line.trim();
    if (!line) return "";

    // redirection
    var redir = null, redirFile = null;
    var m = line.match(/\s(>>|>)\s*(\S+)\s*$/);
    if (m) { redir = m[1]; redirFile = m[2]; line = line.slice(0, m.index); }

    var stages = line.split("|").map(function (s) { return s.trim(); });
    var stdin = "";
    var out = "";
    for (var i = 0; i < stages.length; i++) {
      var tokens = stages[i].match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      tokens = tokens.map(function (t) { return t.replace(/^['"]|['"]$/g, ""); });
      var cmd = tokens.shift();
      if (!cmd) continue;
      if (!CMDS[cmd]) throw { err: cmd + ": command not found" };
      out = CMDS[cmd](tokens, stdin);
      stdin = out;
    }

    // write redirection into the FS
    if (redir) {
      var segs = resolve(redirFile); var parent = parentOf(segs); var name = segs[segs.length - 1];
      if (!parent) throw { err: "cannot write: " + redirFile };
      var existing = parent.children[name];
      var content = (out || "") + "\n";
      if (redir === ">>" && existing && existing.type === "file") content = existing.content + content;
      parent.children[name] = { type: "file", content: content };
      return "";
    }
    return out;
  }

  // ---------- UI wiring ----------
  var elOut, elIn;
  var history = []; var hpos = 0;

  function print(text, cls) {
    var div = document.createElement("div");
    if (cls) div.className = cls;
    div.textContent = text;
    elOut.appendChild(div);
    elOut.scrollTop = elOut.scrollHeight;
  }

  function handle(line) {
    print(prompt() + line, "term-echo");
    if (line.trim()) { history.push(line); hpos = history.length; }
    try {
      var out = runLine(line);
      if (out === "\x00CLEAR") { elOut.innerHTML = ""; return; }
      if (out !== "") print(out);
    } catch (e) {
      print(e.err || String(e), "term-err");
    }
  }

  window.initTerminal = function () {
    elOut = document.getElementById("term-output");
    elIn = document.getElementById("term-input");
    if (!elOut || !elIn || elIn.dataset.wired) return;
    elIn.dataset.wired = "1";
    elOut.innerHTML = "";
    print("Ubuntu practice shell — type 'help' to begin.", "term-echo");
    elIn.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = elIn.value; elIn.value = ""; handle(v);
      } else if (e.key === "ArrowUp") {
        if (hpos > 0) { hpos--; elIn.value = history[hpos] || ""; }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (hpos < history.length) { hpos++; elIn.value = history[hpos] || ""; }
        e.preventDefault();
      }
    });
  };

  // expose for the challenge checker
  window.termRun = function (line) { try { return runLine(line); } catch (e) { return "ERR:" + (e.err || e); } };
  window.termState = function () { return { fs: fs, cwd: cwd.slice() }; };
})();
