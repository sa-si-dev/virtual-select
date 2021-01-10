var config = {
  name: 'Virtual Select',
  repo: 'sa-si-dev/virtual-select',
};

window.$docsify = {
  name: config.name,
  repo: config.repo,
  themeColor: '#512DA8',
  homepage: 'get-started.md',
  topMargin: 50,
  loadSidebar: true,
  coverpage: true,
  auto2top: true,
  executeScript: true,
  copyCode: {
    buttonText: 'Copy',
  },
  plugins: [docsifyPlugin],
};

function docsifyPlugin(hook, vm) {
  hook.beforeEach(docsifyPluginBeforeEach);
}

function docsifyPluginBeforeEach(content) {
  content = replacePlaceholders(content);

  return content;
}

function replacePlaceholdersForElement(selector) {
  var ele = document.querySelector(selector);

  if (!ele) {
    return;
  }

  ele.innerHTML = replacePlaceholders(ele.innerHTML);
}

function replacePlaceholders(content) {
  Object.keys(config).forEach(function(placeholder) {
    var value = config[placeholder];

    if (value) {
      var regexp = new RegExp('{{' + placeholder + '}}', 'g');
      content = content.replace(regexp, value);
    }
  });

  return content;
}

function getOptions(count) {
  if (!count) {
    count = 100000;
  }

  var optionsData = [];

  for (var i = 1; i <= count; i++) {
    optionsData.push({ value: i, label: 'Option ' + i});
  }

  return optionsData;
}

function initPageGetStarted() {
  replacePlaceholdersForElement('.cover-main');

  VirtualSelect.init({
    ele: '#single-select',
    options: getOptions(),
    search: true,
    placeholder: 'Select a single value',
  });

  VirtualSelect.init({
    ele: '#multiple-select',
    options: getOptions(),
    multiple: true,
    placeholder: 'Select multiple values',
  });
}

function initPageExamples() {
  VirtualSelect.init({
    ele: '#single-select',
    options: getOptions(),
  });

  VirtualSelect.init({
    ele: '#single-search-select',
    options: getOptions(),
    search: true,
  });

  VirtualSelect.init({
    ele: '#sample-multi-select',
    options: getOptions(),
    multiple: true,
  });

  VirtualSelect.init({
    ele: '#single-disabled-select',
    options: getOptions(),
    disabledOptions: [2, 6, 9],
  });

  VirtualSelect.init({
    ele: '#hide-clear-select',
    options: getOptions(),
    hideClearButton: true,
  });
}