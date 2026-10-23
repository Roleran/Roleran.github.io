// 只渲染 projects.js 里的 SITE_PROJECTS。增删词条改那个文件。
(function () {
  var list = document.getElementById("project-list");
  var items = window.SITE_PROJECTS || [];

  if (!list) {
    return;
  }

  items.forEach(function (item, index) {
    var href = safeHref(item && item.href);
    var title = textOf(item && item.title);
    if (!href || !title) {
      return;
    }

    var link = document.createElement("a");
    link.href = href;
    if (/^https?:/i.test(href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }

    var indexNode = document.createElement("span");
    indexNode.className = "index";
    indexNode.textContent = String(index + 1).padStart(2, "0");

    var body = document.createElement("span");
    body.className = "body";
    var titleNode = document.createElement("span");
    titleNode.className = "title";
    titleNode.textContent = title;
    body.appendChild(titleNode);

    var note = textOf(item.note);
    if (note) {
      var noteNode = document.createElement("span");
      noteNode.className = "note";
      noteNode.textContent = note;
      body.appendChild(noteNode);
    }

    link.appendChild(indexNode);
    link.appendChild(body);

    var kind = textOf(item.kind);
    if (kind) {
      var kindNode = document.createElement("span");
      kindNode.className = "kind";
      kindNode.textContent = kind;
      link.appendChild(kindNode);
    }

    var row = document.createElement("li");
    row.appendChild(link);
    list.appendChild(row);
  });
})();

function textOf(value) {
  return value == null ? "" : String(value).trim();
}

// 只允许普通链接，避免把脚本地址写进 href。
function safeHref(value) {
  var href = textOf(value);
  if (/^(https?:|mailto:)/i.test(href)) {
    return href;
  }
  if (href.charAt(0) === "/" || href.indexOf("./") === 0 || href.indexOf("../") === 0) {
    return href;
  }
  return "";
}
