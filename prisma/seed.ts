import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  const username = process.env.ADMIN_USERNAME || (isProduction ? "" : "admin");
  const password = process.env.ADMIN_PASSWORD || (isProduction ? "" : "admin123");

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required in production."
    );
  }

  if (isProduction && password === "admin123") {
    throw new Error(
      "Refusing to seed production with the default development password. Set a strong ADMIN_PASSWORD."
    );
  }

  await prisma.cargoItem.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
    },
  });

  const notePassport =
    "送货时必须提供客户的货号和护照号，望各位请予以配合";

  await Promise.all([
    prisma.warehouse.create({
      data: {
        name: "Benjiang",
        region: "CHINA",
        country: "China",
        province: "Xinjiang",
        city: "Urumqi (乌鲁木齐)",
        district: "Tianshan (天山区)",
        address: "乌鲁木齐市天山区延安路662号边疆宾馆 海关监管库888库房7区",
        receiver: "艾力",
        phone: "18999992364",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("乌鲁木齐市天山区延安路662号边疆宾馆"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Xiyu",
        region: "CHINA",
        country: "China",
        province: "Xinjiang",
        city: "Urumqi (乌鲁木齐)",
        district: "Dawan North Road",
        address:
          "乌鲁木齐市大湾北路876号西域物流园A区186库房（从三号门进来之后过大安检右手边整个U型区域都是的）",
        receiver: "阿布",
        phone: "13319877230",
        phone2: "18999994041",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("乌鲁木齐市大湾北路876号西域物流园"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Pekin",
        region: "CHINA",
        country: "China",
        province: "Beijing",
        city: "Beijing (北京)",
        district: "Chaoyang (朝阳区)",
        address: "北京市朝阳区豆各庄双桥路于家围甲20号 京通陆捷物流院内756库",
        receiver: "包先生",
        phone: "13910424756",
        phone2: "13601311028",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("北京市朝阳区豆各庄双桥路于家围甲20号"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Handan (邯郸)",
        region: "CHINA",
        country: "China",
        province: "Hebei",
        city: "Handan (邯郸)",
        district: "Yongnian (永年区)",
        address: "河北省邯郸市永年区金色家园对面西发北环停车场院内",
        receiver: "阿龙",
        phone: "13091137111",
        phone2: "13091137101",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("河北省邯郸市永年区金色家园对面西发北环停车场"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Huzhou (湖州)",
        region: "CHINA",
        country: "China",
        province: "Zhejiang",
        city: "Huzhou (湖州市)",
        district: "Zhili Town (织里镇)",
        address: "湖州市织里镇珍贝路800-1号 贝盛产业园1号库",
        receiver: "阿布",
        phone: "13058922223",
        phone2: "13058922225",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("湖州市织里镇珍贝路800-1号 贝盛产业园"),
        latitude: 30.8632,
        longitude: 120.2448,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Guangzhou",
        region: "CHINA",
        country: "China",
        province: "Guangdong",
        city: "Guangzhou (广州)",
        district: "Baiyun (白云区)",
        address: "广州市白云区广花二路301号999库房",
        receiver: "瓦尼",
        phone: "16602033677",
        phone2: "15360635418",
        notes:
          "Additional phones: 16602033877, 19926090887, 17722728080\n送货时必须提供客户的货号和装箱单，望各位予以配合，谢谢！",
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("广州市白云区广花二路301号"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Keqiao",
        region: "CHINA",
        country: "China",
        province: "Zhejiang",
        city: "Shaoxing (绍兴)",
        district: "Keqiao",
        address: "绍兴市钱掏公路东方快运内（钱清木材市场对面）",
        receiver: "木拉地力",
        phone: "18658584000",
        phone2: "13157582000",
        notes: `Additional phone: 18658584001\n${notePassport}`,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("绍兴市钱清木材市场对面东方快运"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Yiwu",
        region: "CHINA",
        country: "China",
        province: "Zhejiang",
        city: "Yiwu (义乌)",
        district: "Suxi",
        address: "义乌市苏溪苏福路255号A栋 1区（A栋后面9号门卸货）（德施普 Despu）",
        receiver: "阿布",
        phone: "13185111313",
        phone2: "13185111717",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("义乌市苏溪苏福路255号A栋"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Ulugchat (乌恰县)",
        region: "CHINA",
        country: "China",
        province: "Xinjiang",
        city: "Ulugqat (乌恰县)",
        district: "Irkeshtam Port",
        address:
          "新疆克州乌恰县伊尔克什坦口岸跨越路108号院 新疆米兰物流有限公司",
        receiver: "努尔拉",
        phone: "18658911000",
        phone2: "19109080887",
        notes: `乌恰县 → 塔什干\n${notePassport}`,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("新疆克州乌恰县伊尔克什坦口岸跨越路108号院"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Foshan",
        region: "CHINA",
        country: "China",
        province: "Guangdong",
        city: "Foshan (佛山)",
        district: "Nanhai Lishui (南海区里水镇)",
        address: "佛山市南海区里水镇胜利工业区29号7707库房（东秀路）",
        receiver: "贝合提牙",
        phone: "13302897177",
        phone2: "13302897277",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("佛山市南海区里水镇胜利工业区29号"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Xian",
        region: "CHINA",
        country: "China",
        province: "Shaanxi",
        city: "Xi'an (西安)",
        district: "North 3rd Ring",
        address: "西安市北三环西段38号一统物流园B区17-18号",
        receiver: "阿布",
        phone: "18792567565",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("西安市北三环西段38号一统物流园"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Shenzhen",
        region: "CHINA",
        country: "China",
        province: "Guangdong",
        city: "Shenzhen (深圳)",
        district: "Bao'an Fuhai (宝安区福海街道)",
        address:
          "广东省深圳市宝安区福海街道悦盛一路28号H栋1楼（进大门右手边第一家）",
        receiver: "ABU",
        phone: "17727949121",
        notes:
          "货物或者货运单上务必写上客户的货号（唛头号）发件人手机号和货物总个数PCS❗️",
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("深圳市宝安区福海街道悦盛一路28号H栋"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Hebei Baigou",
        region: "CHINA",
        country: "China",
        province: "Hebei",
        city: "Baigou (白沟)",
        district: "Dagaocun",
        address: "河北省白沟镇大高村西南864米 鑫和板材隔壁756A库房",
        receiver: "戴先生",
        phone: "13601328677",
        phone2: "13911689756",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("河北省白沟镇大高村 鑫和板材"),
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Nantong",
        region: "CHINA",
        country: "China",
        province: "Jiangsu",
        city: "Nantong (南通)",
        district: "Tongzhou Chuanjiang (通州区川姜镇)",
        address: "南通市通州区川姜镇金浩公路 中海油加油站南隔壁（塞尔达物流）",
        receiver: "赛尔达",
        phone: "13862857778",
        notes: notePassport,
        locationUrl:
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent("南通市通州区川姜镇金浩公路 中海油加油站"),
      },
    }),
  ]);

  await prisma.operator.createMany({
    data: [
      {
        name: "Siddik Ali",
        phone: "+998 97 140 53 55",
        telegram: "@siddik12",
        isActive: true,
      },
      {
        name: "Siddik Ali",
        phone: "+998 90 394 53 55",
        telegram: "@Dex5554",
        isActive: true,
      },
    ],
  });

  console.log("Client data yuklandi: admin + 14 ta Xitoy ombori + 2 ta operator.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
