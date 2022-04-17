/* eslint-disable no-use-before-define */
const config = {
  name: 'Virtual Select',
  repo: 'sa-si-dev/virtual-select',
};

// eslint-disable-next-line max-len
const flagClasses = ['gu', 'mn', 'va', 'tibet', 'fo', 'th', 'tr', 'tl', 'kz', 'zm', 'uz', 'dk', 'scotland', 'gi', 'gy', 'bj', 'fr', 'mo', 'ir', 'io', 'tm', 'ch', 'mt', 'nl', 'gp', 'im', 'tv', 'mu', 'pe', 'vi', 'hn', 'ss', 'ae', 'td', 'pw', 'nu', 'bt', 'ms', 'cv', 'es', 'mh', 'la', 'vn', 'py', 'br', 'ye', 'ie', 'gh', 'cg', 'cu', 'hu', 'sg', 'at', 'lk', 'vu', 'bo', 'jo', 'er', 'za', 'rs', 'nr', 'ls', 'jm', 'tz', 'ki', 'sj', 'cz', 'pg', 'lv', 'do', 'lu', 'no', 'kw', 'mx', 'yt', 'ly', 'cy', 'ph', 'my', 'sm', 'et', 'ru', 'tj', 'ai', 'pl', 'kp', 'uy', 'gb', 'gs', 'kurdistan', 'rw', 'ec', 'mm', 'pa', 'wales', 'kg', 've', 'tk', 'ca', 'is', 'ke', 'ro', 'gq', 'pt', 'tf', 'ad', 'sk', 'pm', 'om', 'an', 'ws', 'sh', 'mp', 'gt', 'cf', 'zanzibar', 'mw', 'catalonia', 'ug', 'je', 'km', 'in', 'bf', 'mc', 'sy', 'sn', 'kr', 'eu', 'bn', 'st', 'england', 'lc', 'dm', 'be', 'ni', 'ua', 'mz', 'pf', 'tn', 'ee', 'xk', 'sx', 'sd', 'gd', 'ci', 'sz', 'cl', 'fi', 'ga', 'jp', 'de', 'np', 're', 'bg', 'sc', 'ng', 'qa', 'mk', 'aw', 'kn', 'al', 'bw', 'um', 'ky', 'tt', 'so', 'lt', 'by', 'bb', 'us', 'md', 'ag', 'hm', 'as', 'eg', 'sv', 'sl', 'fk', 'am', 'ck', 'tw', 'kh', 'to', 'se', 'cd', 'pn', 'gr', 'id', 'vc', 'somaliland', 'bi', 'pk', 'pr', 'bd', 'co', 'fm', 'bm', 'ar', 'bv', 'sb', 'mq', 'eh', 'bh', 'it', 'hr', 'sa', 'mv', 'mg', 'dz', 'gg', 'gm', 'af', 'li', 'sr', 'vg', 'cr', 'tc', 'ao', 'ma', 'mr', 'gn', 'ne', 'nf', 'wf', 'hk', 'gf', 'ps', 'ic', 'cw', 'ml', 'ax', 'gl', 'dj', 'cn', 'ht', 'lr', 'tg', 'ba', 'ge', 'bz', 'au', 'iq', 'cm', 'gw', 'az', 'na', 'fj', 'zw', 'bs', 'il', 'nz', 'me', 'si', 'nc', 'lb'];

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

function docsifyPlugin(hook) {
  hook.beforeEach(docsifyPluginBeforeEach);
  hook.doneEach(docsifyPluginDoneEach);
}

function docsifyPluginBeforeEach(content) {
  return replacePlaceholders(content);
}

function docsifyPluginDoneEach() {
  replacePlaceholdersForElement('.sidebar-nav');
  replacePlaceholdersForElement('.docsify-pagination-container');
}

function replacePlaceholdersForElement(selector) {
  const ele = document.querySelector(selector);

  if (!ele) {
    return;
  }

  ele.innerHTML = replacePlaceholders(ele.innerHTML);
}

function replacePlaceholders(content) {
  let result = content;

  Object.keys(config).forEach((placeholder) => {
    const value = config[placeholder];

    if (value) {
      const regexp = new RegExp(`{{${placeholder}}}`, 'g');
      result = result.replace(regexp, value);
    }
  });

  return result;
}

function getOptions(count = 100000, includeDesc = false) {
  const optionsData = [];

  for (let i = 1; i <= count; i += 1) {
    const optionData = { value: i, label: `Option ${i}` };

    if (includeDesc) {
      optionData.description = `Description ${i}`;
    }

    optionsData.push(optionData);
  }

  return optionsData;
}

function getGroupOptions() {
  const optGroupData = [];

  for (let i = 1; i <= 3; i += 1) {
    const groupLabel = `Option group ${i}`;
    const options = [];

    for (let j = 1; j <= 3; j += 1) {
      const value = `${i}-${j}`;
      const label = `Option ${value}`;

      options.push({ value, label });
    }

    optGroupData.push({ label: groupLabel, options });
  }

  return optGroupData;
}

function onSampleServerSearch(searchValue, virtualSelect) {
  const newOptions = searchValue ? getOptions().filter((d) => d.label.toLowerCase().indexOf(searchValue) !== -1) : [];

  setTimeout(() => {
    virtualSelect.setServerOptions(newOptions);
  }, 300);
}

function sampleLabelRenderer(data) {
  let prefix = '';

  /** skipping options those are added newly by allowNewOption feature */
  if (!data.isCurrentNew && !data.isNew) {
    /** project developer has to add their own logic to create image/icon tag */
    const flagIndex = data.value % flagClasses.length;
    prefix = `<i class="flag flag-${flagClasses[flagIndex]}"></i>`;
  } else {
    /** common image/icon could be added for new options */
  }

  return `${prefix}${data.label}`;
}

function initVirtualSelect(options) {
  VirtualSelect.init({
    options: getOptions(),
    zIndex: 99,
    dropboxWrapper: 'body',
    ...options,
  });
}

// eslint-disable-next-line no-unused-vars
function initPageGetStarted() {
  replacePlaceholdersForElement('.cover-main');

  initVirtualSelect({
    ele: '#single-select',
    search: true,
    placeholder: 'Select a single value',
  });

  initVirtualSelect({
    ele: '#multiple-select',
    multiple: true,
    placeholder: 'Select multiple values',
  });
}

// eslint-disable-next-line no-unused-vars
function initPageExamples() {
  initVirtualSelect({
    ele: '#single-select',
  });

  initVirtualSelect({
    ele: '#single-search-select',
    search: true,
  });

  initVirtualSelect({
    ele: '#sample-multi-select',
    multiple: true,
  });

  initVirtualSelect({
    ele: '#multi-select-without-search',
    multiple: true,
    search: false,
  });

  initVirtualSelect({
    ele: '#single-disabled-select',
    disabledOptions: [2, 6, 9],
  });

  initVirtualSelect({
    ele: '#option-group-select',
    options: getGroupOptions(),
    multiple: true,
  });

  initVirtualSelect({
    ele: '#preselect-single-select',
    selectedValue: 3,
  });

  initVirtualSelect({
    ele: '#preselect-multiple-select',
    multiple: true,
    selectedValue: [3, 4],
  });

  initVirtualSelect({
    ele: '#hide-clear-select',
    hideClearButton: true,
  });

  initVirtualSelect({
    ele: '#custom-width-select',
    dropboxWidth: '130px',
  });

  initVirtualSelect({
    ele: '#new-option-select',
    options: getOptions(3),
    allowNewOption: true,
  });

  initVirtualSelect({
    ele: '#mark-results-select',
    search: true,
    markSearchResults: true,
  });

  initVirtualSelect({
    ele: '#selected-first-select',
    options: getOptions(30),
    multiple: true,
    showSelectedOptionsFirst: true,
  });

  initVirtualSelect({
    ele: '#alias-select',
    options: [
      { label: 'Colors', value: 'colors', alias: 'Orange, Red' },
      { label: 'Fruits', value: 'fruits', alias: ['Orange', 'Apple'] },
      { label: 'Months', value: 'months', alias: 'January' },
      { label: 'Others', value: 'others' },
    ],
    search: true,
  });

  initVirtualSelect({
    ele: '#keep-open-select',
    search: true,
    keepAlwaysOpen: true,
  });

  initVirtualSelect({
    ele: '#max-values-select',
    multiple: true,
    maxValues: 4,
  });

  initVirtualSelect({
    ele: '#with-description-select',
    options: getOptions(undefined, true),
    hasOptionDescription: true,
  });

  initVirtualSelect({
    ele: '#single-show-as-popup-select',
    popupDropboxBreakpoint: '3000px',
    placeholder: 'Select a single value',
  });

  initVirtualSelect({
    ele: '#multiple-show-as-popup-select',
    popupDropboxBreakpoint: '3000px',
    placeholder: 'Select multiple values',
    multiple: true,
  });

  initVirtualSelect({
    ele: '#server-search-select',
    multiple: true,
    searchPlaceholderText: 'Type here for options',
    onServerSearch: onSampleServerSearch,
  });

  initVirtualSelect({
    ele: '#options-on-search-select',
    showOptionsOnlyOnSearch: true,
    searchPlaceholderText: 'Type here for options',
  });

  initVirtualSelect({
    ele: '#with-image-select',
    labelRenderer: sampleLabelRenderer,
  });

  initVirtualSelect({
    ele: '#show-value-as-tags-select',
    multiple: true,
    showValueAsTags: true,
  });

  initVirtualSelect({
    ele: '#direction-rtl-select',
    multiple: true,
    textDirection: 'rtl',
  });

  initVirtualSelect({
    ele: '#disable-enable',
  });

  document.querySelector('#disable-enable-switch').addEventListener('change', (e) => {
    const $ele = document.querySelector('#disable-enable');

    if (e.target.checked) {
      $ele.enable();
    } else {
      $ele.disable();
    }
  });

  initVirtualSelect({
    ele: '#validation-select',
    multiple: true,
    required: true,
  });

  document.querySelector('#validation-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (VirtualSelect.validate(e.target)) {
      // eslint-disable-next-line no-alert
      alert('Form submitted');
    }
  });
}
