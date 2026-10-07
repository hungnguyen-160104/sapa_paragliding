/**
 * Bản đồ checkpoint Sa Pa — danh sách điểm dừng, nguồn duy nhất cho sơ đồ
 * (components/SapaMap.vue), các trang /sapa-map/<slug> và sitemap.
 *
 * x, y: vị trí trên sơ đồ (khung 1000 x 780) = toạ độ thật chiếu Mercator lên
 * đúng khung của ảnh nền địa hình (public/images/sapa-map/topo.jpg); riêng
 * cụm thị trấn nới vài chục px cho chấm khỏi chồng nhau. Đường đi nằm ở
 * app/data/sapa-map-geo.json. Sinh bằng script geo.py (ngoài repo).
 * lat, lon: toạ độ thật (OpenStreetMap) dùng cho link Google Maps.
 * Ảnh có `credit` là ảnh Wikimedia Commons (CC BY / CC BY-SA / CC0): giấy phép
 * yêu cầu ghi tác giả — trang hiển thị dòng ghi công dưới ảnh, đừng gỡ.
 * Nội dung bài (vi/en) nằm ở app/data/sapa-stops.json.
 */
export type SapaStopKind = 'town' | 'peak' | 'village' | 'fly' | 'spring' | 'lake' | 'waterfall' | 'pass' | 'bridge'

export interface SapaStopImage {
  src: string
  vi: string
  en: string
  credit?: { author: string; license: string; source: string }
}

export interface SapaStop {
  slug: string
  n: number
  kind: SapaStopKind
  x: number
  y: number
  /** Nhãn nằm phía nào của chấm trên sơ đồ. */
  side: 'left' | 'right' | 'top' | 'bottom' | 'tl' | 'tr' | 'bl' | 'br'
  lat: number
  lon: number
  /** true: vị trí gần đúng (chưa có ghim chính thức trên OpenStreetMap). */
  approx?: boolean
  images: SapaStopImage[]
}

export const SAPA_STOPS: SapaStop[] = [
  {
    "slug": "sun-plaza",
    "kind": "town",
    "x": 406,
    "y": 320,
    "side": "tl",
    "lat": 22.33456,
    "lon": 103.84048,
    "images": [
      {
        "src": "/images/sapa-map/stone-church.jpg",
        "vi": "Nhà thờ đá Sa Pa ngay cạnh quảng trường",
        "en": "Sapa stone church beside the square",
        "credit": {
          "author": "trungydang",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Nha_tho_Da_,_Sapa_vietnam_-_panoramio.jpg"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785816555/posts/content/jfm5vga2uyqec0qreevz.jpg",
        "vi": "Chợ đêm Sapa",
        "en": "Sapa night market"
      }
    ],
    "n": 1
  },
  {
    "slug": "ham-rong",
    "kind": "town",
    "x": 462,
    "y": 306,
    "side": "right",
    "lat": 22.33363,
    "lon": 103.8468,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1777604177/posts/content/h37cbbseardfir4kygnb.jpg",
        "vi": "Một góc núi Hàm Rồng",
        "en": "A corner of Ham Rong Mountain"
      }
    ],
    "n": 2
  },
  {
    "slug": "moana",
    "kind": "town",
    "x": 454,
    "y": 372,
    "side": "right",
    "lat": 22.32736,
    "lon": 103.84628,
    "approx": true,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785815231/posts/content/wfarlhfqatts4mlrb5yc.avif",
        "vi": "Góc check-in tại Moana Sapa",
        "en": "A check-in corner at Moana Sapa"
      },
      {
        "src": "/images/sapa-map/hoang-lien-view.jpg",
        "vi": "Dãy Hoàng Liên Sơn nhìn từ phía nam thị trấn",
        "en": "The Hoang Lien Son range seen from the south of town",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Ho%C3%A0ng_Li%C3%AAn_S%C6%A1n_mountains_from_Sa_Pa.jpg"
        }
      }
    ],
    "n": 3
  },
  {
    "slug": "fansipan",
    "kind": "peak",
    "x": 145,
    "y": 463,
    "side": "right",
    "lat": 22.30308,
    "lon": 103.77544,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785816035/posts/content/xhmnlgos6gcn0kdm5pix.jpg",
        "vi": "Đỉnh Fansipan",
        "en": "Fansipan Peak"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785926313/posts/content/rnyd4r01xhftvzxzc2k5.jpg",
        "vi": "Cáp treo Fansipan trên biển mây",
        "en": "Fansipan Cable Car above a sea of clouds"
      },
      {
        "src": "/images/sapa-map/fansipan-cable-car.jpg",
        "vi": "Cabin cáp treo Fansipan trong mây",
        "en": "A Fansipan cable car cabin in the clouds",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Fansipan_Cable_Car.jpg"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-bell-tower.jpg",
        "vi": "Tháp chuông trên quần thể đỉnh Fansipan",
        "en": "The bell tower in the summit complex",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Bell_Tower_of_Fansipan.jpg"
        }
      }
    ],
    "n": 4
  },
  {
    "slug": "cat-cat",
    "kind": "village",
    "x": 372,
    "y": 359,
    "side": "left",
    "lat": 22.32853,
    "lon": 103.83468,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785814838/posts/content/rvwnxb8dszpqrykt4shy.jpg",
        "vi": "Bản Cát Cát",
        "en": "Cat Cat village"
      },
      {
        "src": "/images/sapa-map/cat-cat-waterfall.jpg",
        "vi": "Thác nước và nhà gỗ ở bản Cát Cát",
        "en": "The waterfall and wooden houses at Cat Cat",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Cat_Cat_Waterfalls,_Sa_Pa,_Vietnam,_20240126_1228_3619.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-village.jpg",
        "vi": "Guồng nước bên suối ở Cát Cát",
        "en": "Water wheels by the stream at Cat Cat",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Cat_Cat_Waterfalls,_Sa_Pa,_Vietnam,_20240126_1236_3645.jpg"
        }
      }
    ],
    "n": 5
  },
  {
    "slug": "takeoff",
    "kind": "fly",
    "x": 566,
    "y": 374,
    "side": "right",
    "lat": 22.3219262,
    "lon": 103.8766636,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827796/posts/content/dky1vghynds1cu5maom6.jpg",
        "vi": "Chụp ảnh nhóm bên mốc \"Dù lượn Sapa 1500m\" trước khi bay",
        "en": "A group photo at the \"Du luon Sapa 1500m\" marker before flying"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1775923256/posts/content/ll4mmvns8fqspxpgiwwp.jpg",
        "vi": "Chạy đà cất cánh dù lượn",
        "en": "The take-off run: run, run, run!"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827807/posts/content/t2cifc1bdwo2p9rm9egg.jpg",
        "vi": "Khu chờ có mái che ngay sau bãi cất cánh",
        "en": "The covered waiting area right behind the launch"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785815370/posts/content/axchtj6pvso9zyk6akq3.jpg",
        "vi": "Bay dù lượn trên thung lũng Mường Hoa",
        "en": "Paragliding over Muong Hoa Valley"
      }
    ],
    "n": 6
  },
  {
    "slug": "lao-chai",
    "kind": "fly",
    "x": 546,
    "y": 439,
    "side": "bl",
    "lat": 22.3097778,
    "lon": 103.8757778,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827790/posts/content/dwhft7pg5rthimv0mn5h.jpg",
        "vi": "Văn phòng Sapa Paragliding ở bản Lao Chải, nhìn từ đầu cầu",
        "en": "The Sapa Paragliding office in Lao Chai village, seen from the bridge"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827818/posts/content/ilxtzofaexhgzumphhfa.jpg",
        "vi": "Cánh dù về bãi, trẻ con trong bản ra đón",
        "en": "A wing coming in to land, with village kids out to watch"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1786328864/posts/content/t35dybu3wcvsv4wcawuq.jpg",
        "vi": "Cung đường Trekking qua bản Lao Chải",
        "en": "Trekking route through Lao Chai Village"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785815509/posts/content/sitqpn68fei7wsyuteqt.jpg",
        "vi": "Hạ cánh tại cánh đồng lúa bản Lao Chải",
        "en": "Landing at Lao Chai village"
      }
    ],
    "n": 7
  },
  {
    "slug": "ta-van",
    "kind": "village",
    "x": 606,
    "y": 465,
    "side": "right",
    "lat": 22.30266,
    "lon": 103.88858,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785819305/posts/content/qlncynirymkkbid7uhzs.jpg",
        "vi": "Trekking bản Lao Chải, Tả Van",
        "en": "Trekking through Lao Chai and Ta Van village"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1786328884/posts/content/gisattbvu3oqpkbf0gk2.jpg",
        "vi": "Du khách trekking",
        "en": "Tourists trekking through Lao Chai Village in Sapa"
      }
    ],
    "n": 8
  },
  {
    "slug": "ban-ho",
    "kind": "spring",
    "x": 931,
    "y": 637,
    "side": "left",
    "lat": 22.26369,
    "lon": 103.96805,
    "approx": true,
    "images": [
      {
        "src": "/images/sapa-map/muong-hoa-terraces.jpg",
        "vi": "Ruộng bậc thang cuối thung lũng Mường Hoa",
        "en": "Rice terraces at the far end of Muong Hoa Valley",
        "credit": {
          "author": "siamak djamei siamak",
          "license": "CC0",
          "source": "https://commons.wikimedia.org/wiki/File:Sa_Pa,_Vietnam_(Unsplash_BTv0K50c_4M).jpg"
        }
      }
    ],
    "n": 9
  },
  {
    "slug": "seo-my-ty",
    "kind": "lake",
    "x": 619,
    "y": 695,
    "side": "right",
    "lat": 22.25059,
    "lon": 103.89161,
    "images": [
      {
        "src": "/images/sapa-map/hoang-lien-range.jpg",
        "vi": "Ảnh minh hoạ: dãy Hoàng Liên Sơn",
        "en": "Illustration: the Hoang Lien Son range",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Ho%C3%A0ng_Li%C3%AAn_S%C6%A1n_mountains_02.jpg"
        }
      }
    ],
    "n": 10
  },
  {
    "slug": "ta-phin",
    "kind": "village",
    "x": 421,
    "y": 56,
    "side": "right",
    "lat": 22.39529,
    "lon": 103.84303,
    "images": [
      {
        "src": "/images/sapa-map/ta-phin-1.jpg",
        "vi": "Bản Tả Phìn giữa ruộng bậc thang",
        "en": "Ta Phin village among the rice terraces",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:T%E1%BA%A3_Ph%C3%ACn.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-2.jpg",
        "vi": "Ruộng bậc thang quanh Tả Phìn",
        "en": "Terraces around Ta Phin",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_T%E1%BA%A3_Ph%C3%ACn_03.jpg"
        }
      }
    ],
    "n": 11
  },
  {
    "slug": "thac-bac",
    "kind": "waterfall",
    "x": 150,
    "y": 198,
    "side": "right",
    "lat": 22.36324,
    "lon": 103.77683,
    "images": [
      {
        "src": "/images/sapa-map/thac-bac-1.jpg",
        "vi": "Thác Bạc đổ xuống ngay cạnh quốc lộ 4D",
        "en": "Silver Waterfall dropping right beside road QL4D",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Th%C3%A1c_b%E1%BA%A1c,_c%E1%BA%A7u_may_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-2.jpg",
        "vi": "Dòng suối đá dưới chân Thác Bạc",
        "en": "The rocky stream below Silver Waterfall",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Th%C3%A1c_b%E1%BA%A1c_-_panoramio.jpg"
        }
      }
    ],
    "n": 12
  },
  {
    "slug": "o-quy-ho",
    "kind": "pass",
    "x": 101,
    "y": 243,
    "side": "br",
    "lat": 22.35297,
    "lon": 103.76481,
    "images": [
      {
        "src": "/images/sapa-map/o-quy-ho-road.jpg",
        "vi": "Đường đèo qua những đồi chè phía Ô Quy Hồ",
        "en": "The pass road through tea hills towards O Quy Ho",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%93i_ch%C3%A8_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/hoang-lien-forest.jpg",
        "vi": "Rừng và núi Hoàng Liên nhìn từ đèo",
        "en": "Hoang Lien forest and peaks seen from the pass",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Ho%C3%A0ng_Li%C3%AAn_S%C6%A1n_mountains_01.jpg"
        }
      }
    ],
    "n": 13
  },
  {
    "slug": "rong-may",
    "kind": "bridge",
    "x": 71,
    "y": 156,
    "side": "tr",
    "lat": 22.3727,
    "lon": 103.75729,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785905971/posts/covers/ehtgnil9hwuzwwmduvpe.jpg",
        "vi": "Khu du lịch Cầu kính Rồng Mây",
        "en": "Rong May Glass Bridge tourist area"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785926405/posts/content/xwykwsjhgooo5367wgvv.webp",
        "vi": "Cầu kính Rồng Mây",
        "en": "Rong May Glass Bridge"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785925109/posts/content/mzdlwkpzpxlzvjjjovrj.jpg",
        "vi": "Xích đu tử thần Rồng Mây",
        "en": "Rong May Death Swing"
      }
    ],
    "n": 14
  }
]

export const SAPA_STOP_SLUGS = SAPA_STOPS.map((s) => s.slug)

export function sapaStopBySlug(slug: string): SapaStop | undefined {
  return SAPA_STOPS.find((s) => s.slug === slug)
}
