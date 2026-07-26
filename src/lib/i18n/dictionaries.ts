export type Locale = "uz" | "ru" | "en" | "zh" | "kk";

export const LOCALES: Array<{ id: Locale; label: string; short: string }> = [
  { id: "uz", label: "O‘zbekcha", short: "UZ" },
  { id: "ru", label: "Русский", short: "RU" },
  { id: "en", label: "English", short: "EN" },
  { id: "zh", label: "中文", short: "中文" },
  { id: "kk", label: "Қазақша", short: "KK" },
];

export const LOCALE_STORAGE_KEY = "dextrans_locale";

export type Dictionary = {
  nav: {
    home: string;
    guests: string;
    cargo: string;
    warehouses: string;
    operators: string;
    admin: string;
    menu: string;
    close: string;
    openMenu: string;
    closeMenu: string;
    theme: string;
    backToSite: string;
    mainMenu: string;
    mobileMenu: string;
  };
  home: {
    tagline: string;
    heroText: string;
    ctaCargo: string;
    ctaWarehouses: string;
    delivered: string;
    happyClients: string;
    support: string;
    quickMenu: string;
    chinaWarehouses: string;
    addressesCount: string;
    tashkentWarehouses: string;
    managedByAdmin: string;
    channelProfile: string;
    cargoTitle: string;
    cargoSubtitle: string;
    itemsCount: string;
    noItems: string;
    warehousesTitle: string;
    warehousesSubtitle: string;
    operatorsTitle: string;
    operatorsSubtitle: string;
    noOperators: string;
  };
  channels: {
    logistikaTitle: string;
    logistikaDesc: string;
    fotoTitle: string;
    fotoDesc: string;
    textilTitle: string;
    textilDesc: string;
    carTitle: string;
    carDesc: string;
    adminTitle: string;
    adminDesc: string;
    openChannel: string;
    category: string;
  };
  values: {
    safetyTitle: string;
    safetyText: string;
    fastTitle: string;
    fastText: string;
    warehouseTitle: string;
    warehouseText: string;
    helpTitle: string;
    helpText: string;
  };
  categories: {
    NEW: string;
    IN_TRANSIT: string;
    ARRIVED: string;
  };
  statuses: {
    CHINA_WAREHOUSE: string;
    DEPARTED: string;
    AT_BORDER: string;
    ARRIVED_TASHKENT: string;
  };
  regions: {
    CHINA: string;
    TASHKENT: string;
  };
  item: {
    pdfDoc: string;
    date: string;
    price: string;
    eta: string;
    warehouse: string;
    operator: string;
    chinaAddress: string;
    notes: string;
    openPdf: string;
    location: string;
    telegram: string;
  };
  guest: {
    title: string;
    subtitle: string;
    items: [string, string, string, string];
    highlights: [string, string, string, string];
    more: string;
    back: string;
    services: string;
    gallery: string;
    gallerySub: string;
    video: string;
    videoSub: string;
    imageFallback: string;
  };
  warehouse: {
    chinaTitle: string;
    tashkentTitle: string;
    chinaHint: string;
    tashkentHint: string;
    hubTitle: string;
    hubSubtitle: string;
    emptyChina: string;
    emptyTashkent: string;
    openMap: string;
    back: string;
  };
  footer: {
    about: string;
    menu: string;
    contact: string;
    rights: string;
  };
  lang: string;
};

const uz: Dictionary = {
  nav: {
    home: "Bosh sahifa",
    guests: "Mehmonlar",
    cargo: "Cargo",
    warehouses: "Omborlar",
    operators: "Operatorlar",
    admin: "Admin",
    menu: "Menyu",
    close: "Yopish",
    openMenu: "Menyuni ochish",
    closeMenu: "Menyuni yopish",
    theme: "Mavzu",
    backToSite: "Saytga qaytish",
    mainMenu: "Asosiy menyu",
    mobileMenu: "Mobil menyu",
  },
  home: {
    tagline: "Sifat • Tezkorlik • Ishonch",
    heroText:
      "Xitoy omborlari, yuk kuzatuvi va rasmiy Telegram kanallar — bitta professional platformada.",
    ctaCargo: "Cargo yuklar",
    ctaWarehouses: "Omborlar",
    delivered: "Yuk yetkazib berildi",
    happyClients: "Mamnun mijozlar",
    support: "Qo‘llab-quvvatlash",
    quickMenu: "Tezkor menyu",
    chinaWarehouses: "Xitoy omborlari",
    addressesCount: "{n} ta manzil",
    tashkentWarehouses: "Toshkent omborlari",
    managedByAdmin: "Admin orqali boshqariladi",
    channelProfile: "Kanal profil",
    cargoTitle: "Cargo bo‘limi",
    cargoSubtitle: "Yangi, yo‘ldagi va Toshkentga kelgan tovarlarni kuzating.",
    itemsCount: "{n} ta tovar",
    noItems: "Hozircha tovar yo‘q.",
    warehousesTitle: "Omborlar",
    warehousesSubtitle:
      "Xitoy yoki Toshkent omborlarini tanlang — xaritalar alohida sahifada ochiladi.",
    operatorsTitle: "Operatorlar",
    operatorsSubtitle: "Bog‘lanish uchun telefon raqami va Telegram manzili.",
    noOperators: "Hozircha operator yo‘q.",
  },
  channels: {
    logistikaTitle: "Logistika transport bo‘yicha",
    logistikaDesc: "Yuklar, yo‘nalishlar va tezkor logistika yangiliklari",
    fotoTitle: "Foto video uchun aksessuarlar",
    fotoDesc: "Kamera, studio va multimedia mahsulotlari",
    textilTitle: "Textil print uchun aksessuarlar",
    textilDesc: "Tekstil, print va brend aksessuarlari",
    carTitle: "DEX CAR",
    carDesc: "Avtomobil yo‘nalishi va maxsus takliflar",
    adminTitle: "ADMIN",
    adminDesc: "Boshqaruv paneli va xavfsiz kirish",
    openChannel: "Kanalga o‘tish",
    category: "Kategoriya",
  },
  values: {
    safetyTitle: "Xavfsizlik kafolati",
    safetyText: "Yuklar himoyalangan",
    fastTitle: "Tez yetkazish",
    fastText: "Optimallashtirilgan marshrut",
    warehouseTitle: "Ombor nazorati",
    warehouseText: "Xitoy va Toshkent",
    helpTitle: "24/7 yordam",
    helpText: "Operator bilan aloqa",
  },
  categories: {
    NEW: "Yangi tovarlar",
    IN_TRANSIT: "Yo‘ldagi tovarlar",
    ARRIVED: "Kelgan tovarlar",
  },
  statuses: {
    CHINA_WAREHOUSE: "Xitoy omborida",
    DEPARTED: "Yo‘lga chiqdi",
    AT_BORDER: "Chegarada",
    ARRIVED_TASHKENT: "Toshkentga yetib keldi",
  },
  regions: {
    CHINA: "Xitoy",
    TASHKENT: "Toshkent",
  },
  item: {
    pdfDoc: "PDF hujjat",
    date: "Sana:",
    price: "Narx:",
    eta: "Taxminiy yetib kelish:",
    warehouse: "Ombor:",
    operator: "Operator:",
    chinaAddress: "Xitoy manzili:",
    notes: "Izoh:",
    openPdf: "PDF ni ochish",
    location: "Lokatsiya",
    telegram: "Telegram",
  },
  guest: {
    title: "Mehmonlar uchun xizmatlar",
    subtitle: "Chet eldan kelgan mehmonlarga O‘zbekistonda to‘liq yordam",
    items: [
      "Chet eldan kelgan mehmonlarni aeroportda kutib olish, mehmonxonaga joylash",
      "Tarjimonlik xizmati (bozorlarga borish, jihozlarni o‘rnatish, bitimlar tuzishga yordam)",
      "Ko‘rgazmada (vistavkada) qatnashish",
      "O‘zbekistonning ko‘zga ko‘rinadigan joylariga olib borish va ko‘rsatish",
    ],
    highlights: [
      "Aeroport kutib olish",
      "Tarjimonlik",
      "Ko‘rgazmalar",
      "Ekskursiyalar",
    ],
    more: "Batafsil ko‘rish",
    back: "Orqaga",
    services: "Xizmatlar",
    gallery: "Galereya",
    gallerySub: "Xizmatlardan lavhalar",
    video: "Video",
    videoSub: "Mehmon xizmatlari haqida",
    imageFallback: "Rasm",
  },
  warehouse: {
    chinaTitle: "Xitoy omborlari",
    tashkentTitle: "Toshkent omborlari",
    chinaHint: "{n} ta manzil · xarita bilan",
    tashkentHint: "{n} ta manzil · xarita bilan",
    hubTitle: "Omborlar",
    hubSubtitle: "Hududni tanlang",
    emptyChina: "Xitoy omborlari hali qo‘shilmagan.",
    emptyTashkent: "Toshkent omborlari hali qo‘shilmagan.",
    openMap: "Xaritada ochish",
    back: "Orqaga",
  },
  footer: {
    about:
      "Dextrans Group Cargo — Xitoy omborlari, yuk kuzatuvi va tezkor logistika. Integrating the Asian Frontier.",
    menu: "Menyu",
    contact: "Aloqa",
    rights: "Barcha huquqlar himoyalangan.",
  },
  lang: "Til",
};

const ru: Dictionary = {
  nav: {
    home: "Главная",
    guests: "Гости",
    cargo: "Карго",
    warehouses: "Склады",
    operators: "Операторы",
    admin: "Админ",
    menu: "Меню",
    close: "Закрыть",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    theme: "Тема",
    backToSite: "На сайт",
    mainMenu: "Главное меню",
    mobileMenu: "Мобильное меню",
  },
  home: {
    tagline: "Качество • Скорость • Доверие",
    heroText:
      "Склады в Китае, отслеживание грузов и официальные Telegram-каналы — на одной платформе.",
    ctaCargo: "Грузы",
    ctaWarehouses: "Склады",
    delivered: "Грузов доставлено",
    happyClients: "Довольных клиентов",
    support: "Поддержка",
    quickMenu: "Быстрое меню",
    chinaWarehouses: "Склады в Китае",
    addressesCount: "{n} адресов",
    tashkentWarehouses: "Склады в Ташкенте",
    managedByAdmin: "Управляется через админку",
    channelProfile: "Профиль канала",
    cargoTitle: "Раздел карго",
    cargoSubtitle: "Отслеживайте новые, в пути и прибывшие в Ташкент товары.",
    itemsCount: "{n} товаров",
    noItems: "Пока нет товаров.",
    warehousesTitle: "Склады",
    warehousesSubtitle:
      "Выберите склады Китая или Ташкента — карты откроются на отдельной странице.",
    operatorsTitle: "Операторы",
    operatorsSubtitle: "Телефон и Telegram для связи.",
    noOperators: "Пока нет операторов.",
  },
  channels: {
    logistikaTitle: "Логистика и транспорт",
    logistikaDesc: "Грузы, маршруты и новости логистики",
    fotoTitle: "Аксессуары для фото и видео",
    fotoDesc: "Камера, студия и multimedia",
    textilTitle: "Аксессуары для textile print",
    textilDesc: "Текстиль, печать и брендовые аксессуары",
    carTitle: "DEX CAR",
    carDesc: "Автонаправление и спецпредложения",
    adminTitle: "ADMIN",
    adminDesc: "Панель управления и безопасный вход",
    openChannel: "Перейти в канал",
    category: "Категория",
  },
  values: {
    safetyTitle: "Гарантия безопасности",
    safetyText: "Грузы под защитой",
    fastTitle: "Быстрая доставка",
    fastText: "Оптимизированные маршруты",
    warehouseTitle: "Контроль складов",
    warehouseText: "Китай и Ташкент",
    helpTitle: "Поддержка 24/7",
    helpText: "Связь с оператором",
  },
  categories: {
    NEW: "Новые товары",
    IN_TRANSIT: "В пути",
    ARRIVED: "Прибывшие",
  },
  statuses: {
    CHINA_WAREHOUSE: "На складе в Китае",
    DEPARTED: "Отправлен",
    AT_BORDER: "На границе",
    ARRIVED_TASHKENT: "Прибыл в Ташкент",
  },
  regions: {
    CHINA: "Китай",
    TASHKENT: "Ташкент",
  },
  item: {
    pdfDoc: "PDF документ",
    date: "Дата:",
    price: "Цена:",
    eta: "Ожидаемое прибытие:",
    warehouse: "Склад:",
    operator: "Оператор:",
    chinaAddress: "Адрес в Китае:",
    notes: "Примечание:",
    openPdf: "Открыть PDF",
    location: "Локация",
    telegram: "Telegram",
  },
  guest: {
    title: "Услуги для иностранных гостей",
    subtitle: "Полное сопровождение гостей из-за рубежа в Узбекистане",
    items: [
      "Встреча гостей из-за рубежа в аэропорту и размещение в гостинице",
      "Услуги переводчика (посещение рынков, установка оборудования, помощь в заключении договоров)",
      "Участие в выставке",
      "Транспортное обслуживание и организация экскурсий по Узбекистану",
    ],
    highlights: ["Встреча в аэропорту", "Переводчик", "Выставки", "Экскурсии"],
    more: "Подробнее",
    back: "Назад",
    services: "Услуги",
    gallery: "Галерея",
    gallerySub: "Кадры из наших услуг",
    video: "Видео",
    videoSub: "О гостевых услугах",
    imageFallback: "Фото",
  },
  warehouse: {
    chinaTitle: "Склады Китая",
    tashkentTitle: "Склады Ташкента",
    chinaHint: "{n} адресов · с картой",
    tashkentHint: "{n} адресов · с картой",
    hubTitle: "Склады",
    hubSubtitle: "Выберите регион",
    emptyChina: "Склады Китая пока не добавлены.",
    emptyTashkent: "Склады Ташкента пока не добавлены.",
    openMap: "Открыть на карте",
    back: "Назад",
  },
  footer: {
    about:
      "Dextrans Group Cargo — склады в Китае, отслеживание грузов и быстрая логистика. Integrating the Asian Frontier.",
    menu: "Меню",
    contact: "Контакты",
    rights: "Все права защищены.",
  },
  lang: "Язык",
};

const en: Dictionary = {
  nav: {
    home: "Home",
    guests: "Guests",
    cargo: "Cargo",
    warehouses: "Warehouses",
    operators: "Operators",
    admin: "Admin",
    menu: "Menu",
    close: "Close",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    theme: "Theme",
    backToSite: "Back to site",
    mainMenu: "Main menu",
    mobileMenu: "Mobile menu",
  },
  home: {
    tagline: "Quality • Speed • Trust",
    heroText:
      "China warehouses, cargo tracking and official Telegram channels — on one professional platform.",
    ctaCargo: "Cargo shipments",
    ctaWarehouses: "Warehouses",
    delivered: "Shipments delivered",
    happyClients: "Happy clients",
    support: "Support",
    quickMenu: "Quick menu",
    chinaWarehouses: "China warehouses",
    addressesCount: "{n} locations",
    tashkentWarehouses: "Tashkent warehouses",
    managedByAdmin: "Managed via admin",
    channelProfile: "Channel profile",
    cargoTitle: "Cargo section",
    cargoSubtitle: "Track new, in-transit and arrived goods in Tashkent.",
    itemsCount: "{n} items",
    noItems: "No items yet.",
    warehousesTitle: "Warehouses",
    warehousesSubtitle:
      "Choose China or Tashkent warehouses — maps open on a separate page.",
    operatorsTitle: "Operators",
    operatorsSubtitle: "Phone and Telegram for contact.",
    noOperators: "No operators yet.",
  },
  channels: {
    logistikaTitle: "Logistics & transport",
    logistikaDesc: "Cargo, routes and logistics updates",
    fotoTitle: "Photo & video accessories",
    fotoDesc: "Camera, studio and multimedia products",
    textilTitle: "Textile print accessories",
    textilDesc: "Textile, print and brand accessories",
    carTitle: "DEX CAR",
    carDesc: "Automotive direction and special offers",
    adminTitle: "ADMIN",
    adminDesc: "Control panel and secure login",
    openChannel: "Open channel",
    category: "Category",
  },
  values: {
    safetyTitle: "Safety guarantee",
    safetyText: "Cargo protected",
    fastTitle: "Fast delivery",
    fastText: "Optimized routes",
    warehouseTitle: "Warehouse control",
    warehouseText: "China and Tashkent",
    helpTitle: "24/7 support",
    helpText: "Talk to an operator",
  },
  categories: {
    NEW: "New goods",
    IN_TRANSIT: "In transit",
    ARRIVED: "Arrived",
  },
  statuses: {
    CHINA_WAREHOUSE: "At China warehouse",
    DEPARTED: "Departed",
    AT_BORDER: "At the border",
    ARRIVED_TASHKENT: "Arrived in Tashkent",
  },
  regions: {
    CHINA: "China",
    TASHKENT: "Tashkent",
  },
  item: {
    pdfDoc: "PDF document",
    date: "Date:",
    price: "Price:",
    eta: "Estimated arrival:",
    warehouse: "Warehouse:",
    operator: "Operator:",
    chinaAddress: "China address:",
    notes: "Notes:",
    openPdf: "Open PDF",
    location: "Location",
    telegram: "Telegram",
  },
  guest: {
    title: "Guest services in Uzbekistan",
    subtitle: "Full support for international visitors",
    items: [
      "Meeting international guests at the airport and hotel check-in",
      "Translation services (market visits, equipment installation, assistance with contract negotiations)",
      "Participation in exhibitions",
      "Transportation and excursions throughout Uzbekistan",
    ],
    highlights: ["Airport pickup", "Translation", "Exhibitions", "Excursions"],
    more: "Learn more",
    back: "Back",
    services: "Services",
    gallery: "Gallery",
    gallerySub: "Scenes from our services",
    video: "Video",
    videoSub: "About guest services",
    imageFallback: "Image",
  },
  warehouse: {
    chinaTitle: "China warehouses",
    tashkentTitle: "Tashkent warehouses",
    chinaHint: "{n} locations · with map",
    tashkentHint: "{n} locations · with map",
    hubTitle: "Warehouses",
    hubSubtitle: "Choose a region",
    emptyChina: "No China warehouses yet.",
    emptyTashkent: "No Tashkent warehouses yet.",
    openMap: "Open on map",
    back: "Back",
  },
  footer: {
    about:
      "Dextrans Group Cargo — China warehouses, cargo tracking and fast logistics. Integrating the Asian Frontier.",
    menu: "Menu",
    contact: "Contact",
    rights: "All rights reserved.",
  },
  lang: "Language",
};

const zh: Dictionary = {
  nav: {
    home: "首页",
    guests: "宾客服务",
    cargo: "货运",
    warehouses: "仓库",
    operators: "操作员",
    admin: "管理",
    menu: "菜单",
    close: "关闭",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    theme: "主题",
    backToSite: "返回网站",
    mainMenu: "主导航",
    mobileMenu: "移动菜单",
  },
  home: {
    tagline: "品质 • 速度 • 信任",
    heroText: "中国仓库、货物跟踪与官方 Telegram 频道 — 统一专业平台。",
    ctaCargo: "货物",
    ctaWarehouses: "仓库",
    delivered: "已交付货物",
    happyClients: "满意客户",
    support: "支持服务",
    quickMenu: "快捷菜单",
    chinaWarehouses: "中国仓库",
    addressesCount: "{n} 个地址",
    tashkentWarehouses: "塔什干仓库",
    managedByAdmin: "通过后台管理",
    channelProfile: "频道头像",
    cargoTitle: "货运专区",
    cargoSubtitle: "跟踪新品、在途及已抵达塔什干的货物。",
    itemsCount: "{n} 件货物",
    noItems: "暂无货物。",
    warehousesTitle: "仓库",
    warehousesSubtitle: "选择中国或塔什干仓库 — 地图在单独页面打开。",
    operatorsTitle: "操作员",
    operatorsSubtitle: "联系电话与 Telegram。",
    noOperators: "暂无操作员。",
  },
  channels: {
    logistikaTitle: "物流运输",
    logistikaDesc: "货物、线路与物流资讯",
    fotoTitle: "摄影摄像配件",
    fotoDesc: "相机、影棚与多媒体产品",
    textilTitle: "纺织印花配件",
    textilDesc: "纺织、印花与品牌配件",
    carTitle: "DEX CAR",
    carDesc: "汽车方向与特别优惠",
    adminTitle: "ADMIN",
    adminDesc: "管理面板与安全登录",
    openChannel: "进入频道",
    category: "分类",
  },
  values: {
    safetyTitle: "安全保障",
    safetyText: "货物受保护",
    fastTitle: "快速送达",
    fastText: "优化路线",
    warehouseTitle: "仓库管控",
    warehouseText: "中国与塔什干",
    helpTitle: "全天候支持",
    helpText: "联系操作员",
  },
  categories: {
    NEW: "新货物",
    IN_TRANSIT: "在途货物",
    ARRIVED: "已抵达",
  },
  statuses: {
    CHINA_WAREHOUSE: "在中国仓库",
    DEPARTED: "已发出",
    AT_BORDER: "在边境",
    ARRIVED_TASHKENT: "已到塔什干",
  },
  regions: {
    CHINA: "中国",
    TASHKENT: "塔什干",
  },
  item: {
    pdfDoc: "PDF 文件",
    date: "日期：",
    price: "价格：",
    eta: "预计到达：",
    warehouse: "仓库：",
    operator: "操作员：",
    chinaAddress: "中国地址：",
    notes: "备注：",
    openPdf: "打开 PDF",
    location: "位置",
    telegram: "Telegram",
  },
  guest: {
    title: "乌兹别克斯坦宾客服务",
    subtitle: "为国际客人提供全程接待与陪同",
    items: [
      "在机场迎接国际客人并安排酒店入住",
      "翻译服务（市场考察、设备安装、协助合同谈判）",
      "参加展览会",
      "乌兹别克斯坦境内的交通和游览服务",
    ],
    highlights: ["机场接机", "翻译", "展会", "游览"],
    more: "了解更多",
    back: "返回",
    services: "服务",
    gallery: "图库",
    gallerySub: "服务实景",
    video: "视频",
    videoSub: "关于宾客服务",
    imageFallback: "图片",
  },
  warehouse: {
    chinaTitle: "中国仓库",
    tashkentTitle: "塔什干仓库",
    chinaHint: "{n} 个地址 · 含地图",
    tashkentHint: "{n} 个地址 · 含地图",
    hubTitle: "仓库",
    hubSubtitle: "选择地区",
    emptyChina: "暂无中国仓库。",
    emptyTashkent: "暂无塔什干仓库。",
    openMap: "在地图打开",
    back: "返回",
  },
  footer: {
    about:
      "Dextrans Group Cargo — 中国仓库、货物跟踪与高效物流。Integrating the Asian Frontier.",
    menu: "菜单",
    contact: "联系",
    rights: "版权所有。",
  },
  lang: "语言",
};

const kk: Dictionary = {
  nav: {
    home: "Басты бет",
    guests: "Қонақтар",
    cargo: "Жүк",
    warehouses: "Қоймалар",
    operators: "Операторлар",
    admin: "Әкімші",
    menu: "Мәзір",
    close: "Жабу",
    openMenu: "Мәзірді ашу",
    closeMenu: "Мәзірді жабу",
    theme: "Тақырып",
    backToSite: "Сайтқа қайту",
    mainMenu: "Негізгі мәзір",
    mobileMenu: "Мобильді мәзір",
  },
  home: {
    tagline: "Сапа • Жылдамдық • Сенім",
    heroText:
      "Қытай қоймалары, жүк қадағалау және ресми Telegram арналар — бір платформада.",
    ctaCargo: "Жүктер",
    ctaWarehouses: "Қоймалар",
    delivered: "Жеткізілген жүк",
    happyClients: "Қанағаттанған клиенттер",
    support: "Қолдау",
    quickMenu: "Жылдам мәзір",
    chinaWarehouses: "Қытай қоймалары",
    addressesCount: "{n} мекенжай",
    tashkentWarehouses: "Ташкент қоймалары",
    managedByAdmin: "Әкімші арқылы басқарылады",
    channelProfile: "Арна профилі",
    cargoTitle: "Жүк бөлімі",
    cargoSubtitle: "Жаңа, жолдағы және Ташкентке жеткен тауарларды қадағалаңыз.",
    itemsCount: "{n} тауар",
    noItems: "Әзірге тауар жоқ.",
    warehousesTitle: "Қоймалар",
    warehousesSubtitle:
      "Қытай немесе Ташкент қоймаларын таңдаңыз — карталар бөлек бетте ашылады.",
    operatorsTitle: "Операторлар",
    operatorsSubtitle: "Байланыс үшін телефон және Telegram.",
    noOperators: "Әзірге оператор жоқ.",
  },
  channels: {
    logistikaTitle: "Логистика және көлік",
    logistikaDesc: "Жүктер, бағыттар және логистика жаңалықтары",
    fotoTitle: "Фото-видео керек-жарақтары",
    fotoDesc: "Камера, студия және мультимедиа",
    textilTitle: "Textile print керек-жарақтары",
    textilDesc: "Тоқыма, баспа және бренд аксессуарлары",
    carTitle: "DEX CAR",
    carDesc: "Авто бағыт және арнайы ұсыныстар",
    adminTitle: "ADMIN",
    adminDesc: "Басқару панелі және қауіпсіз кіру",
    openChannel: "Арнаға өту",
    category: "Санат",
  },
  values: {
    safetyTitle: "Қауіпсіздік кепілі",
    safetyText: "Жүк қорғалған",
    fastTitle: "Жылдам жеткізу",
    fastText: "Оңтайлы маршрут",
    warehouseTitle: "Қойма бақылауы",
    warehouseText: "Қытай және Ташкент",
    helpTitle: "24/7 қолдау",
    helpText: "Оператормен байланыс",
  },
  categories: {
    NEW: "Жаңа тауарлар",
    IN_TRANSIT: "Жолдағы тауарлар",
    ARRIVED: "Келген тауарлар",
  },
  statuses: {
    CHINA_WAREHOUSE: "Қытай қоймасында",
    DEPARTED: "Жолға шықты",
    AT_BORDER: "Шекарада",
    ARRIVED_TASHKENT: "Ташкентке жетті",
  },
  regions: {
    CHINA: "Қытай",
    TASHKENT: "Ташкент",
  },
  item: {
    pdfDoc: "PDF құжат",
    date: "Күні:",
    price: "Бағасы:",
    eta: "Болжалды келу:",
    warehouse: "Қойма:",
    operator: "Оператор:",
    chinaAddress: "Қытай мекенжайы:",
    notes: "Ескертпе:",
    openPdf: "PDF ашу",
    location: "Орналасқан жері",
    telegram: "Telegram",
  },
  guest: {
    title: "Қонақтарға арналған қызметтер",
    subtitle: "Шетелден келген қонақтарға Өзбекстанда толық қолдау",
    items: [
      "Шетелден келген қонақтарды әуежайда күтіп алу және қонақүйге орналастыру",
      "Аударма қызметі (базарға бару, жабдық орнату, келісімшартқа көмек)",
      "Көрмеге қатысу",
      "Өзбекстанның көрікті жерлеріне апару және көрсету",
    ],
    highlights: ["Әуежайда күту", "Аударма", "Көрмелер", "Экскурсиялар"],
    more: "Толығырақ",
    back: "Артқа",
    services: "Қызметтер",
    gallery: "Галерея",
    gallerySub: "Қызметтен кадрлар",
    video: "Бейне",
    videoSub: "Қонақ қызметтері туралы",
    imageFallback: "Сурет",
  },
  warehouse: {
    chinaTitle: "Қытай қоймалары",
    tashkentTitle: "Ташкент қоймалары",
    chinaHint: "{n} мекенжай · картамен",
    tashkentHint: "{n} мекенжай · картамен",
    hubTitle: "Қоймалар",
    hubSubtitle: "Аймақты таңдаңыз",
    emptyChina: "Қытай қоймалары әлі қосылмаған.",
    emptyTashkent: "Ташкент қоймалары әлі қосылмаған.",
    openMap: "Картада ашу",
    back: "Артқа",
  },
  footer: {
    about:
      "Dextrans Group Cargo — Қытай қоймалары, жүк қадағалау және жылдам логистика. Integrating the Asian Frontier.",
    menu: "Мәзір",
    contact: "Байланыс",
    rights: "Барлық құқықтар қорғалған.",
  },
  lang: "Тіл",
};

export const dictionaries: Record<Locale, Dictionary> = {
  uz,
  ru,
  en,
  zh,
  kk,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && value in dictionaries);
}

export function formatMessage(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}
