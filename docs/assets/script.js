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
  // Add an option with a very long text
  const optionData6 = {
    value: 100001,
    label:
      'This is a very long text to be selected in the selection!! ' +
      'This is a very long text to be selected in the selection!!',
  };
  optionsData.push(optionData6);

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

  const descriptionSearchOptions = [
    { label: 'Alpha', value: 'alpha', description: 'Café central' },
    { label: 'Beta', value: 'beta', description: 'Crème brûlée' },
    { label: 'Gamma', value: 'gamma', description: 'Niño azul' },
  ];

  initVirtualSelect({
    ele: '#with-description-search-select',
    options: descriptionSearchOptions,
    search: true,
    hasOptionDescription: true,
    searchNormalize: false,
  });

  initVirtualSelect({
    ele: '#with-description-normalized-search-select',
    options: descriptionSearchOptions,
    search: true,
    hasOptionDescription: true,
    searchNormalize: true,
  });

  const multiLanguageOptions = [
    // Latin (French / Spanish)
    { label: 'Crème brûlée', value: 'creme-brulee', description: 'French dessert' },
    { label: 'Niño', value: 'nino', description: 'Spanish word for child' },
    { label: 'Café au lait', value: 'cafe-au-lait', description: 'Coffee with milk (French)' },
    { label: 'Déjà vu', value: 'deja-vu', description: 'Already seen (French)' },
    { label: 'Naïve', value: 'naive', description: 'Innocent / unsophisticated (French)' },
    { label: 'Façade', value: 'facade', description: 'Front of a building (French)' },
    { label: 'Résumé', value: 'resume', description: 'Curriculum vitae (French)' },
    { label: 'Mañana', value: 'manana', description: 'Tomorrow (Spanish)' },
    { label: 'Año nuevo', value: 'ano-nuevo', description: 'New year (Spanish)' },
    { label: 'Châtelet', value: 'chatelet', description: 'Paris metro station (French)' },
    // German
    { label: 'München', value: 'munchen', description: 'Hauptstadt Bayerns' },
    { label: 'Mädchen', value: 'madchen', description: 'Junges weibliches Kind' },
    { label: 'Größe', value: 'grosse', description: 'Maß für die Ausdehnung' },
    { label: 'Köln', value: 'koln', description: 'Stadt am Rhein' },
    { label: 'Düsseldorf', value: 'dusseldorf', description: 'Landeshauptstadt von NRW' },
    { label: 'Brötchen', value: 'brotchen', description: 'Kleines Brot' },
    { label: 'Schlüssel', value: 'schlussel', description: 'Werkzeug zum Öffnen von Schlössern' },
    { label: 'Müller', value: 'muller', description: 'Häufiger deutscher Familienname' },
    { label: 'Straße', value: 'strasse', description: 'Verkehrsweg in einer Stadt' },
    { label: 'Über', value: 'uber', description: 'Präposition: oberhalb von' },
    // Norwegian
    { label: 'Ålesund', value: 'alesund', description: 'By på vestlandskysten' },
    { label: 'Bjørn', value: 'bjorn', description: 'Stort pattedyr' },
    { label: 'Tromsø', value: 'tromso', description: 'Nordnorsk by' },
    { label: 'Trondheim', value: 'trondheim', description: 'Norges tredje største by' },
    { label: 'Geiranger', value: 'geiranger', description: 'Berømt fjordbygd' },
    { label: 'Sør-Trøndelag', value: 'sor-trondelag', description: 'Tidligere fylke i Norge' },
    { label: 'Hønefoss', value: 'honefoss', description: 'By i Buskerud' },
    { label: 'Ærøskøbing', value: 'aeroskobing', description: 'Lille kjøpstad (dansk-norsk)' },
    // Swedish
    { label: 'Göteborg', value: 'goteborg', description: 'Stad på Sveriges västkust' },
    { label: 'Malmö', value: 'malmo', description: 'Stad i södra Sverige' },
    { label: 'Stockholm', value: 'stockholm', description: 'Sveriges huvudstad' },
    { label: 'Småland', value: 'smaland', description: 'Landskap i södra Sverige' },
    { label: 'Östersund', value: 'ostersund', description: 'Stad i Jämtland' },
    { label: 'Växjö', value: 'vaxjo', description: 'Stad i Småland' },
    { label: 'Köping', value: 'koping', description: 'Stad i Västmanland' },
    { label: 'Söderhamn', value: 'soderhamn', description: 'Kuststad i Hälsingland' },
    // Finnish
    { label: 'Jyväskylä', value: 'jyvaskyla', description: 'Kaupunki Keski-Suomessa' },
    { label: 'Hämeenlinna', value: 'hameenlinna', description: 'Kaupunki Kanta-Hämeessä' },
    { label: 'Helsinki', value: 'helsinki', description: 'Suomen pääkaupunki' },
    { label: 'Tampere', value: 'tampere', description: 'Suomen kolmanneksi suurin kaupunki' },
    { label: 'Hyvää päivää', value: 'hyvaa-paivaa', description: 'Tervehdys (good day)' },
    { label: 'Sää', value: 'saa', description: 'Ilman tila (weather)' },
    { label: 'Pää', value: 'paa', description: 'Ihmisen tai eläimen ruumiinosa (head)' },
    { label: 'Säveltäjä', value: 'saveltaja', description: 'Musiikin tekijä (composer)' },
    // Greek
    { label: 'Ένα', value: 'ena', description: 'Πρώτο στοιχείο' },
    { label: 'Αθήνα', value: 'athina', description: 'Πρωτεύουσα της Ελλάδας' },
    { label: 'Δύο', value: 'dyo', description: 'Δεύτερο στοιχείο' },
    { label: 'Τρία', value: 'tria', description: 'Τρίτο στοιχείο' },
    { label: 'Θεσσαλονίκη', value: 'thessaloniki', description: 'Δεύτερη μεγαλύτερη πόλη της Ελλάδας' },
    { label: 'Ήλιος', value: 'ilios', description: 'Το άστρο της ημέρας' },
    { label: 'Φιλοσοφία', value: 'philosophia', description: 'Αγάπη για τη σοφία' },
    { label: 'Δημοκρατία', value: 'dimokratia', description: 'Πολίτευμα του λαού' },
    { label: 'Καλημέρα', value: 'kalimera', description: 'Πρωινός χαιρετισμός' },
    // Cyrillic
    { label: 'Ёжик', value: 'yozhik', description: 'Колючий зверёк' },
    { label: 'Москва', value: 'moskva', description: 'Столица России' },
    { label: 'Йогурт', value: 'yogurt', description: 'Молочный продукт' },
    { label: 'Привет', value: 'privet', description: 'Дружеское приветствие' },
    { label: 'Россия', value: 'rossiya', description: 'Самая большая страна мира' },
    { label: 'Спасибо', value: 'spasibo', description: 'Выражение благодарности' },
    { label: 'Здравствуйте', value: 'zdravstvuyte', description: 'Формальное приветствие' },
    { label: 'Книга', value: 'kniga', description: 'Печатное издание' },
    { label: 'Санкт-Петербург', value: 'spb', description: 'Северная столица России' },
    // Vietnamese
    { label: 'Việt Nam', value: 'vietnam', description: 'Quốc gia Đông Nam Á' },
    { label: 'Hà Nội', value: 'hanoi', description: 'Thủ đô của Việt Nam' },
    { label: 'Sài Gòn', value: 'saigon', description: 'Thành phố lớn nhất Việt Nam' },
    { label: 'Đà Nẵng', value: 'danang', description: 'Thành phố biển miền Trung' },
    { label: 'Huế', value: 'hue', description: 'Cố đô của Việt Nam' },
    { label: 'Phở', value: 'pho', description: 'Món ăn truyền thống' },
    { label: 'Bánh mì', value: 'banh-mi', description: 'Bánh sandwich Việt Nam' },
    { label: 'Áo dài', value: 'ao-dai', description: 'Trang phục truyền thống' },
    { label: 'Nguyễn', value: 'nguyen', description: 'Họ phổ biến nhất Việt Nam' },
    // Chinese
    { label: '北京', value: 'beijing', description: '中国的首都' },
    { label: '你好', value: 'nihao', description: '问候语' },
    { label: '上海', value: 'shanghai', description: '中国最大的城市' },
    { label: '中国', value: 'zhongguo', description: '亚洲东部国家' },
    { label: '谢谢', value: 'xiexie', description: '感谢的话语' },
    { label: '学生', value: 'xuesheng', description: '在学校学习的人' },
    { label: '老师', value: 'laoshi', description: '教育学生的人' },
    { label: '朋友', value: 'pengyou', description: '亲密的伙伴' },
    { label: '苹果', value: 'pingguo', description: '一种水果' },
    // Japanese
    { label: '東京', value: 'tokyo', description: '日本の首都' },
    { label: 'カタカナ', value: 'katakana', description: '日本の文字' },
    { label: '日本', value: 'nihon', description: 'アジアの島国' },
    { label: 'こんにちは', value: 'konnichiwa', description: '日中の挨拶' },
    { label: 'ありがとう', value: 'arigatou', description: '感謝を表す言葉' },
    { label: 'さようなら', value: 'sayounara', description: '別れの挨拶' },
    { label: 'ひらがな', value: 'hiragana', description: '日本の音節文字' },
    { label: '寿司', value: 'sushi', description: '日本の伝統料理' },
    { label: '富士山', value: 'fujisan', description: '日本一高い山' },
    // Korean
    { label: '서울', value: 'seoul', description: '한국의 수도' },
    { label: '한국어', value: 'hangugeo', description: '한국의 언어' },
    { label: '부산', value: 'busan', description: '한국 제2의 도시' },
    { label: '김치', value: 'kimchi', description: '한국 전통 음식' },
    { label: '안녕하세요', value: 'annyeonghaseyo', description: '공식적인 인사말' },
    { label: '감사합니다', value: 'gamsahamnida', description: '감사를 표현하는 말' },
    { label: '한글', value: 'hangeul', description: '한국의 문자 체계' },
    { label: '사랑', value: 'sarang', description: '깊은 애정의 감정' },
    { label: '가족', value: 'gajok', description: '함께 사는 사람들' },
    // Arabic
    { label: 'مُرَحَّباً', value: 'marhaba', description: 'تحية' },
    { label: 'شُكْراً', value: 'shukran', description: 'تعبير عن الامتنان' },
    { label: 'السَّلام', value: 'salam', description: 'تحية إسلامية تعني السلام' },
    { label: 'مَدِينَة', value: 'madina', description: 'مكان كبير يسكنه الناس' },
    { label: 'كِتَاب', value: 'kitab', description: 'مجموعة من الصفحات للقراءة' },
    { label: 'القَاهِرَة', value: 'cairo', description: 'عاصمة مصر' },
    { label: 'دِمَشْق', value: 'dimashq', description: 'عاصمة سوريا' },
    // Thai
    { label: 'กรุงเทพ', value: 'bangkok', description: 'เมืองหลวงของประเทศไทย' },
    { label: 'สวัสดี', value: 'sawasdee', description: 'คำทักทายภาษาไทย' },
    { label: 'ขอบคุณ', value: 'khopkhun', description: 'คำแสดงความขอบคุณ' },
    { label: 'ประเทศไทย', value: 'thailand', description: 'ประเทศในเอเชียตะวันออกเฉียงใต้' },
    { label: 'เชียงใหม่', value: 'chiangmai', description: 'จังหวัดในภาคเหนือ' },
    { label: 'อาหาร', value: 'ahaan', description: 'สิ่งที่กิน' },
    { label: 'ภูเก็ต', value: 'phuket', description: 'เกาะในภาคใต้ของประเทศไทย' },
  ];

  initVirtualSelect({
    ele: '#multi-language-search-select',
    options: multiLanguageOptions,
    search: true,
    hasOptionDescription: true,
    searchNormalize: true,
  });

  initVirtualSelect({
    ele: '#multi-language-search-no-normalize-select',
    options: multiLanguageOptions,
    search: true,
    hasOptionDescription: true,
    searchNormalize: false,
  });

  initVirtualSelect({
    ele: '#multi-language-tags-search-select',
    options: multiLanguageOptions,
    multiple: true,
    search: true,
    hasOptionDescription: true,
    showValueAsTags: true,
    searchNormalize: true,
  });

  initVirtualSelect({
    ele: '#multi-language-tags-search-no-normalize-select',
    options: multiLanguageOptions,
    multiple: true,
    search: true,
    hasOptionDescription: true,
    showValueAsTags: true,
    searchNormalize: false,
  });

  initVirtualSelect({
    ele: '#multi-language-popup-search-select',
    options: multiLanguageOptions,
    search: true,
    hasOptionDescription: true,
    popupDropboxBreakpoint: '3000px',
    searchNormalize: true,
  });

  initVirtualSelect({
    ele: '#multi-language-popup-search-no-normalize-select',
    options: multiLanguageOptions,
    search: true,
    hasOptionDescription: true,
    popupDropboxBreakpoint: '3000px',
    searchNormalize: false,
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
    selectedLabelRenderer: sampleLabelRenderer,
  });

  initVirtualSelect({
    ele: '#show-value-as-tags-select',
    multiple: true,
    showValueAsTags: true,
  });

  initVirtualSelect({
    ele: '#show-value-as-tags-select-with-html',
    multiple: true,
    search: true,
    showValueAsTags: true,
    options: [
      {
        label: '<i class="icon-fire" aria-hidden="true"></i> Option 1',
        value: 1,
      },
      { label: '<i class="icon-plane" aria-hidden="true"></i> Option 2',
        value: 2 },
      {
        label:
          '<i class="icon-apple" aria-hidden="true"></i> This is a very long text to be selected in the selection!! ' +
          'This is a very long text to be selected in the selection!!',
        value: 3,
      },
      {
        label:
          'This is a very long text to be selected in the selection!! ' +
          'This is a very long text to be selected in the selection!!',
        value: 4,
      },
    ],
    selectedValue: [1, 2],
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

  initVirtualSelect({
    ele: '#custom-styling-select',
    multiple: true,
    additionalClasses: 'custom-wrapper',
    additionalDropboxClasses: 'custom-dropbox',
    additionalDropboxContainerClasses: 'custom-dropbox-container',
    additionalToggleButtonClasses: 'custom-toggle-button',
  });
}

// eslint-disable-next-line no-unused-vars
function initPageEvents() {
  initVirtualSelect({
    ele: '#sample-select-onchange',
    search: true,
    dropboxWrapper: 'self', // needed for onchange unit tests
  });
  window.onchangeCount = 0;
  document.querySelector('#sample-select-onchange').addEventListener('change', function handleOnChangeEvent() {
    window.onchangeCount += 1;
    document.querySelector('#sample-select-changes').textContent =
      `Selected = ${this.value} | No.changes = ${window.onchangeCount}`;
  });

  initVirtualSelect({
    ele: '#sample-select-openclose',
  });
  function handleOpenCloseEvent(event) {
    // You can add custom logic here if needed
    document.querySelector('#select-openclose-res').textContent = `${event.type} event triggered`;
  }
  document.querySelector('#sample-select-openclose').addEventListener('beforeOpen', handleOpenCloseEvent);
  document.querySelector('#sample-select-openclose').addEventListener('afterOpen', handleOpenCloseEvent);
  document.querySelector('#sample-select-openclose').addEventListener('beforeClose', handleOpenCloseEvent);
  document.querySelector('#sample-select-openclose').addEventListener('afterClose', handleOpenCloseEvent);

  initVirtualSelect({
    ele: '#sample-select-reset',
  });
  function handleResetEvent(event) {
    // You can add custom logic here if needed
    document.querySelector('#select-reset-res').textContent = `${event.type} event triggered`;
  }
  document.querySelector('#sample-select-reset').addEventListener('reset', handleResetEvent);
}
