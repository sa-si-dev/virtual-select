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

function getGroupOptions() {
  let optGroupData = [];

  for (let i = 1; i <= 3; i++) {
    let label = `Option group ${i}`;
    let options = [];
  
    for (let j = 1; j <= 3; j++) {
      let value = `${i}-${j}`;
      let label = `Option ${value}`;
  
      options.push({ value: value, label: label });
    }
  
    optGroupData.push({ label: label, options: options });
  }

  return optGroupData;
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
    ele: '#option-group-select',
    options: getGroupOptions(),
    search: true,
  });

  VirtualSelect.init({
    ele: '#preselect-single-select',
    options: getOptions(),
    selectedValue: 3,
  });

  VirtualSelect.init({
    ele: '#preselect-multiple-select',
    options: getOptions(),
    multiple: true,
    selectedValue: [3, 4],
  });

  VirtualSelect.init({
    ele: '#hide-clear-select',
    options: getOptions(),
    hideClearButton: true,
  });

  VirtualSelect.init({
    ele: '#custom-width-select',
    options: getOptions(),
    dropboxWidth: '130px',
  });

  VirtualSelect.init({
    ele: '#new-option-select',
    options: getOptions(3),
    allowNewOption: true,
  });

  VirtualSelect.init({
    ele: '#mark-results-select',
    options: getOptions(),
    search: true,
    markSearchResults: true,
  });

  VirtualSelect.init({
    ele: '#selected-first-select',
    options: getOptions(30),
    multiple: true,
    showSelectedOptionsFirst: true,
  });

  VirtualSelect.init({
    ele: '#alias-select',
    options: [
      { label: 'Colors', value: 'colors', alias: 'Orange, Red' },
      { label: 'Fruits', value: 'fruits', alias: ['Orange', 'Apple'] },
      { label: 'Months', value: 'months', alias: 'January' },
      { label: 'Others', value: 'others' }
    ],
    search: true,
  });

  VirtualSelect.init({
    ele: '#keep-open-select',
    options: getOptions(),
    search: true,
    keepAlwaysOpen: true,
  });

  VirtualSelect.init({
    ele: '#max-values-select',
    options: getOptions(),
    multiple: true,
    maxValues: 4,
  });
}
