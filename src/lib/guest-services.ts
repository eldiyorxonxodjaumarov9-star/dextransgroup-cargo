export type GuestServiceLang = "uz" | "ru" | "en" | "zh";

export const GUEST_SERVICE_LANGUAGES: Array<{
  id: GuestServiceLang;
  label: string;
}> = [
  { id: "uz", label: "O‘zbekcha" },
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
  { id: "zh", label: "中文" },
];

export const GUEST_SERVICE_COPY: Record<
  GuestServiceLang,
  { title: string; subtitle: string; items: string[] }
> = {
  uz: {
    title: "Mehmonlar uchun xizmatlar",
    subtitle: "Chet eldan kelgan mehmonlarga O‘zbekistonda to‘liq yordam",
    items: [
      "Chet eldan kelgan mehmonlarni aeroportda kutib olish, mehmonxonaga joylash",
      "Tarjimonlik xizmati (bozorlarga borish, jihozlarni o‘rnatish, bitimlar tuzishga yordam)",
      "Ko‘rgazmada (vistavkada) qatnashish",
      "O‘zbekistonning ko‘zga ko‘rinadigan joylariga olib borish va ko‘rsatish",
    ],
  },
  ru: {
    title: "Услуги для иностранных гостей",
    subtitle: "Полное сопровождение гостей из-за рубежа в Узбекистане",
    items: [
      "Встреча гостей из-за рубежа в аэропорту и размещение в гостинице",
      "Услуги переводчика (посещение рынков, установка оборудования, помощь в заключении договоров)",
      "Участие в выставке",
      "Транспортное обслуживание и организация экскурсий по Узбекистану",
    ],
  },
  en: {
    title: "Guest services in Uzbekistan",
    subtitle: "Full support for international visitors",
    items: [
      "Meeting international guests at the airport and hotel check-in",
      "Translation services (market visits, equipment installation, assistance with contract negotiations)",
      "Participation in exhibitions",
      "Transportation and excursions throughout Uzbekistan",
    ],
  },
  zh: {
    title: "乌兹别克斯坦宾客服务",
    subtitle: "为国际客人提供全程接待与陪同",
    items: [
      "在机场迎接国际客人并安排酒店入住",
      "翻译服务（市场考察、设备安装、协助合同谈判）",
      "参加展览会",
      "乌兹别克斯坦境内的交通和游览服务",
    ],
  },
};

/** Repo bilan keladigan default media (admin yuklamasa ham ko‘rinadi) */
export const DEFAULT_GUEST_IMAGES = [
  {
    id: "default-airport",
    kind: "IMAGE" as const,
    title: "Aeroport kutib olish",
    src: "/guest-services/airport.jpg",
  },
  {
    id: "default-translator",
    kind: "IMAGE" as const,
    title: "Tarjimonlik xizmati",
    src: "/guest-services/translator.jpg",
  },
  {
    id: "default-exhibition",
    kind: "IMAGE" as const,
    title: "Ko‘rgazma",
    src: "/guest-services/exhibition.jpg",
  },
  {
    id: "default-tour",
    kind: "IMAGE" as const,
    title: "Ekskursiya",
    src: "/guest-services/tour.jpg",
  },
];

export const DEFAULT_GUEST_BANNER = "/guest-services/airport.jpg";
