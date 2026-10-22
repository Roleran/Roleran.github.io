// 列表有两份：projects.js 是大家看到的；localStorage 只留在这台浏览器。
(function () {
  var STORAGE_KEY = "roleran-site-draft";
  var list = document.getElementById("project-list");
  var form = document.getElementById("project-form");
  var addButton = document.getElementById("add-project");
  var work = document.getElementById("work");
  var draftNote = document.getElementById("draft-note");
  var formError = document.getElementById("form-error");

  if (!list || !form || !addButton) {
    return;
  }

  var items = loadItems();
  if (new URLSearchParams(location.search).get("edit") === "1") {
    form.hidden = false;
    addButton.setAttribute("aria-expanded", "true");
  }
  render();

  addButton.addEventListener("click", function () {
    var open = form.hidden;
    form.hidden = !open;
    addButton.setAttribute("aria-expanded", open ? "true" : "false");
    work.classList.toggle("is-editing", open || localStorage.getItem(STORAGE_KEY) != null);
    if (open) {
      form.elements.title.focus();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = textOf(form.elements.title.value);
    var href = safeHref(form.elements.href.value);
    if (!title || !href) {
      formError.hidden = false;
      return;
    }

    items.push({
      title: title,
      href: href,
      kind: textOf(form.elements.kind.value),
      note: textOf(form.elements.note.value)
    });
    saveDraft();
    form.reset();
    formError.hidden = true;
    render();
  });

  document.getElementById("download-projects").addEventListener("click", function () {
    downloadProjects(items);
  });

  document.getElementById("discard-draft").addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    items = publishedItems();
    render();
  });

  list.addEventListener("click", function (event) {
    var button = event.target.closest(".remove-project");
    if (!button) {
      return;
    }
    var index = Number(button.getAttribute("data-index"));
    items.splice(index, 1);
    saveDraft();
    render();
  });

  function render() {
    list.textContent = "";
    items.forEach(function (item, index) {
      list.appendChild(renderRow(item, index));
    });
    var drafting = localStorage.getItem(STORAGE_KEY) != null;
    work.classList.toggle("is-editing", drafting || !form.hidden);
    draftNote.hidden = !drafting;
  }

  function renderRow(item, index) {
    var row = document.createElement("li");
    var link = document.createElement("a");
    link.href = item.href;
    if (/^https?:/i.test(item.href)) {
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
    titleNode.textContent = item.title;
    body.appendChild(titleNode);
    if (item.note) {
      var noteNode = document.createElement("span");
      noteNode.className = "note";
      noteNode.textContent = item.note;
      body.appendChild(noteNode);
    }
    link.appendChild(indexNode);
    link.appendChild(body);
    if (item.kind) {
      var kindNode = document.createElement("span");
      kindNode.className = "kind";
      kindNode.textContent = item.kind;
      link.appendChild(kindNode);
    }

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-project";
    remove.setAttribute("data-index", String(index));
    remove.textContent = "移除";

    row.appendChild(link);
    row.appendChild(remove);
    return row;
  }

  function loadItems() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved == null) {
      return publishedItems();
    }
    try {
      var parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(validItem) : publishedItems();
    } catch (error) {
      return publishedItems();
    }
  }

  function publishedItems() {
    return (window.SITE_PROJECTS || []).filter(validItem);
  }

  function validItem(item) {
    return item && textOf(item.title) && safeHref(item.href);
  }

  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
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

function downloadProjects(items) {
  var header = [
    "// 首页项目列表。页面加号产生的草稿下载后覆盖本文件，再推送仓库，别人才能看到。",
    "// title  展示标题",
    "// href   目标链接",
    "// kind   分类。可留空",
    "// note   描述。可留空",
    "",
    "window.SITE_PROJECTS = ",
    JSON.stringify(items, null, 2),
    ";",
    ""
  ].join("\n");
  var blob = new Blob([header], { type: "text/javascript" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = "projects.js";
  link.click();
  URL.revokeObjectURL(url);
}
