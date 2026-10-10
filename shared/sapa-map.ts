/**
 * Bản đồ checkpoint Sa Pa — danh sách điểm dừng, nguồn duy nhất cho sơ đồ
 * (components/SapaMap.vue), các trang /sapa-map/<slug> và sitemap.
 *
 * x, y: vị trí trên sơ đồ (khung 1000 x 780). Sơ đồ phóng to vùng trung tâm:
 * điểm gần = toạ độ thật chiếu Mercator lên đúng khung của ảnh nền địa hình
 * (public/images/sapa-map/topo.jpg); điểm xa (far) đặt sát mép theo đúng
 * hướng, chỉ ghi số km. Đường đi nằm ở app/data/sapa-map-geo.json. Sinh bằng
 * script geo2.py (ngoài repo).
 * lat, lon: toạ độ thật (OpenStreetMap) dùng cho link Google Maps.
 * Ảnh có `credit` là ảnh Wikimedia Commons (CC BY / CC BY-SA / CC0): giấy phép
 * yêu cầu ghi tác giả — trang hiển thị dòng ghi công dưới ảnh, đừng gỡ.
 * Nội dung bài (vi/en) nằm ở app/data/sapa-stops.json.
 */
export type SapaStopKind = 'town' | 'peak' | 'village' | 'fly' | 'spring' | 'lake' | 'waterfall' | 'pass' | 'bridge' | 'rail'

export interface SapaStopImage {
  src: string
  vi: string
  en: string
  /** site: nơi lấy ảnh (mặc định Wikimedia Commons); license để trống khi ảnh dùng theo thoả thuận riêng. */
  credit?: { author: string; license: string; source: string; site?: string }
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
  /** true: điểm xa — x, y là vị trí sơ đồ sát mép, đường tới đó không theo tỉ lệ. */
  far?: boolean
  /** Tên để tìm trên Google Maps khi chưa có toạ độ chính xác (dùng thay lat, lon cho link chỉ đường). */
  q?: string
  /** true: vị trí gần đúng (chưa có ghim chính thức trên OpenStreetMap). */
  approx?: boolean
  images: SapaStopImage[]
}

export const SAPA_STOPS: SapaStop[] = [
  {
    "slug": "sun-plaza",
    "kind": "town",
    "x": 345,
    "y": 222,
    "side": "tl",
    "lat": 22.33456,
    "lon": 103.84048,
    "images": [
      {
        "src": "/images/sapa-map/sun-plaza-p1.jpg",
        "vi": "Toà Sun Plaza vàng xanh kiểu châu Âu nhìn từ trên cao giữa trung tâm thị xã Sa Pa.",
        "en": "The yellow-and-green European-style Sun Plaza seen from above in the centre of Sa Pa.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/tat-tan-tat-ve-sun-plaza-sa-pa-chon-than-tien-khong-the-bo-lo-7717",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p2.jpg",
        "vi": "Nhà thờ Đá Sa Pa và sân lát đá phía trước dưới trời xanh.",
        "en": "Sa Pa Stone Church and its paved forecourt under a blue sky.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/nha-tho-da-sa-pa-huyen-thoai-kien-truc-giua-long-pho-suong-mo-7628",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p3.jpg",
        "vi": "Du khách chụp ảnh trước mặt tiền ga tàu Sun Plaza với tháp đồng hồ.",
        "en": "Visitors posing in front of the Sun Plaza station entrance with its clock tower.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/tat-tan-tat-ve-sun-plaza-sa-pa-chon-than-tien-khong-the-bo-lo-7717",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p4.jpg",
        "vi": "Du khách ngồi cùng các em nhỏ mặc trang phục dân tộc trên bậc đá trước Nhà thờ Đá.",
        "en": "A visitor sitting with children in ethnic dress on the stone steps before the Stone Church.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/nha-tho-da-sa-pa-huyen-thoai-kien-truc-giua-long-pho-suong-mo-7628",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p5.jpg",
        "vi": "Sun Plaza và trung tâm Sa Pa lung linh ánh đèn giữa sương mù lúc chạng vạng.",
        "en": "Sun Plaza and central Sa Pa glowing with lights in the evening mist.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/tat-tan-tat-ve-sun-plaza-sa-pa-chon-than-tien-khong-the-bo-lo-7717",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p6.jpg",
        "vi": "Cô gái ngồi trên bậc thềm đá trước cửa Nhà thờ Đá.",
        "en": "A young woman sitting on the stone steps at the door of the Stone Church.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/nha-tho-da-sa-pa-huyen-thoai-kien-truc-giua-long-pho-suong-mo-7628",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-p7.jpg",
        "vi": "Nhà thờ Đá lên đèn vàng khi trời chập tối.",
        "en": "The Stone Church lit up in warm light at dusk.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/nha-tho-da-sa-pa-huyen-thoai-kien-truc-giua-long-pho-suong-mo-7628",
          "site": "sunparadiseland.com"
        }
      }
    ],
    "n": 1
  },
  {
    "slug": "ham-rong",
    "kind": "town",
    "x": 441,
    "y": 237,
    "side": "right",
    "lat": 22.33363,
    "lon": 103.8468,
    "images": [
      {
        "src": "/images/sapa-map/ham-rong-p1.jpg",
        "vi": "Thung lũng hoa và vườn đá tai mèo trên núi Hàm Rồng ngày nắng.",
        "en": "The flower valley and limestone rock garden on Ham Rong mountain on a sunny day.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p2.jpg",
        "vi": "Phố núi Sa Pa nhìn từ trên cao, mây phủ dưới thung lũng.",
        "en": "Sa Pa town seen from above, with cloud filling the valley below.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p3.jpg",
        "vi": "Hoa đào nở trước hai mỏm đá của đỉnh Hàm Rồng.",
        "en": "Peach blossom in front of the twin rocky peaks of Ham Rong.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p4.jpg",
        "vi": "Vườn hoa với chòi gỗ, cẩm tú cầu và hoa đỏ dọc đường lên núi.",
        "en": "A flower garden with a wooden pavilion, hydrangeas and red flowers on the way up the mountain.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p5.jpg",
        "vi": "Chữ \"Sa Pa\" bằng cây xanh trong vườn hoa Hàm Rồng.",
        "en": "The \"Sa Pa\" lettering in clipped shrubs in the Ham Rong flower garden.",
        "credit": {
          "author": "Mia.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/nui-ham-rong-sapa-ngon-nui-hinh-dau-rong-noi-tieng-cua-thanh-pho-mo-suong-468",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p6.jpg",
        "vi": "Sun Plaza và nhà thờ Đá chìm trong biển mây, nhìn từ trên cao.",
        "en": "Sun Plaza and the Stone Church half hidden in cloud, seen from above.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p7.jpg",
        "vi": "Vườn đá Thạch Lâm với những khối đá dựng giữa thảm cỏ và hoa.",
        "en": "The Thach Lam stone garden, with upright rocks among grass and flowers.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-p8.jpg",
        "vi": "Thị xã Sa Pa lên đèn dưới lớp mây lúc hoàng hôn.",
        "en": "Sa Pa town lit up beneath a layer of cloud at dusk.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1777604177/posts/content/h37cbbseardfir4kygnb.jpg",
        "vi": "Vườn hoa trên núi Hàm Rồng nhìn từ trên cao",
        "en": "The flower gardens on Ham Rong Mountain seen from above"
      }
    ],
    "n": 2
  },
  {
    "slug": "moana",
    "kind": "town",
    "x": 433,
    "y": 341,
    "side": "bottom",
    "lat": 22.32736,
    "lon": 103.84628,
    "approx": true,
    "images": [
      {
        "src": "/images/sapa-map/moana-p1.jpg",
        "vi": "Tượng cô gái Moana khổng lồ giữa vườn cây, phía sau là dãy Hoàng Liên Sơn.",
        "en": "The giant Moana girl statue in the garden, with the Hoang Lien Son range behind.",
        "credit": {
          "author": "FPT Shop",
          "license": "",
          "source": "https://fptshop.com.vn/tin-tuc/danh-gia/moana-sapa-182939",
          "site": "fptshop.com.vn"
        }
      },
      {
        "src": "/images/sapa-map/moana-p2.jpg",
        "vi": "Hồ vô cực với chiếc đàn piano trắng giữa mặt nước lúc mặt trời lặn.",
        "en": "The infinity pool with the white piano standing in the water at sunset.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/kham-pha-thien-duong-song-ao-dep-nhu-bali-tai-moana-sa-pa-13131",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p3.jpg",
        "vi": "Cổng trời Bali soi bóng xuống hồ, mây và núi phía sau.",
        "en": "The Bali-style gate reflected in the pool, with clouds and mountains beyond.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/kham-pha-thien-duong-song-ao-dep-nhu-bali-tai-moana-sa-pa-13131",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p4.jpg",
        "vi": "Cô gái váy trắng ngồi đàn piano trắng giữa hồ vô cực.",
        "en": "A young woman in white playing the white piano in the infinity pool.",
        "credit": {
          "author": "Vigotrip",
          "license": "",
          "source": "https://vigotrip.com/bai-viet/nhung-goc-chup-anh-cuc-chat-tai-moana-sapa-tieu-bali-giua-nui-doi-mo-suong-newsId936",
          "site": "vigotrip.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p5.jpg",
        "vi": "Du khách váy đỏ giữa hai tượng đầu người đối mặt bên hồ nước.",
        "en": "A visitor in a red dress between the two facing head sculptures by the water.",
        "credit": {
          "author": "Vigotrip",
          "license": "",
          "source": "https://vigotrip.com/bai-viet/nhung-goc-chup-anh-cuc-chat-tai-moana-sapa-tieu-bali-giua-nui-doi-mo-suong-newsId936",
          "site": "vigotrip.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p6.jpg",
        "vi": "Cô gái váy trắng tạo dáng bên tượng Moana giữa mây mù.",
        "en": "A woman in white posing by the Moana statue in the mist.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/kham-pha-thien-duong-song-ao-dep-nhu-bali-tai-moana-sa-pa-13131",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p7.jpg",
        "vi": "Du khách ngồi trong bàn tay khổng lồ, nhìn ra núi và ruộng bậc thang.",
        "en": "A visitor sitting in the giant hand, looking out over mountains and terraces.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/kham-pha-thien-duong-song-ao-dep-nhu-bali-tai-moana-sa-pa-13131",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/moana-p8.jpg",
        "vi": "Góc cây cô đơn với cô gái đứng ngắm biển mây lúc bình minh.",
        "en": "The lonely-tree corner, with a woman gazing at the sea of clouds at sunrise.",
        "credit": {
          "author": "Vigotrip",
          "license": "",
          "source": "https://vigotrip.com/bai-viet/nhung-goc-chup-anh-cuc-chat-tai-moana-sapa-tieu-bali-giua-nui-doi-mo-suong-newsId936",
          "site": "vigotrip.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785815231/posts/content/wfarlhfqatts4mlrb5yc.avif",
        "vi": "Tượng cô gái Moana, tiểu cảnh trùng tên với khu check-in",
        "en": "The Moana girl statue, the set that shares the park's name"
      }
    ],
    "n": 3
  },
  {
    "slug": "fansipan",
    "kind": "peak",
    "x": 62,
    "y": 283,
    "side": "right",
    "far": true,
    "lat": 22.30308,
    "lon": 103.77544,
    "images": [
      {
        "src": "/images/sapa-map/fansipan-p1.jpg",
        "vi": "Bình minh trên biển mây, cột cờ và công trình trên đỉnh Fansipan.",
        "en": "Sunrise over a sea of clouds, with the flagpole and buildings on the Fansipan summit.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/trai-nghiem-dinh-fansipan-cap-treo-quan-the-tam-linh-va-canh-nui-tay-bac-18094",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p2.jpg",
        "vi": "Đỉnh Fansipan với cột cờ Tổ quốc và du khách đông vui dưới trời xanh.",
        "en": "The Fansipan summit with the national flagpole and crowds of visitors under a blue sky.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/dinh-fansipan-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p3.jpg",
        "vi": "Đại tượng Phật A Di Đà giữa biển mây lúc hoàng hôn trên Fansipan.",
        "en": "The great Amitabha Buddha statue above a sea of clouds at sunset on Fansipan.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/tren-dinh-fansipan-co-gi-top-trai-nghiem-thu-vi-khong-the-bo-lo-25867",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p4.jpg",
        "vi": "Quần thể chùa và bảo tháp trên núi Fansipan nhìn từ trên cao, phía sau là biển mây.",
        "en": "The pagoda and stupa complex on Fansipan seen from above, with a sea of clouds behind.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/explore-sun-world-fansipan-legend-amidst-sa-pas-sea-of-clouds-13137",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p5.jpg",
        "vi": "Cabin cáp treo Fansipan lướt trên dãy Hoàng Liên Sơn.",
        "en": "A Fansipan cable car cabin gliding over the Hoang Lien Son range.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/trai-nghiem-dinh-fansipan-cap-treo-quan-the-tam-linh-va-canh-nui-tay-bac-18094",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p6.jpg",
        "vi": "Chóp mốc đỉnh Fansipan phủ băng tuyết giữa biển mây.",
        "en": "The pyramid summit marker of Fansipan coated in frost above a sea of clouds.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/dinh-fansipan-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p7.jpg",
        "vi": "Hoa đỗ quyên đỏ nở bên quần thể chùa trên núi Fansipan.",
        "en": "Red rhododendrons in bloom beside the temple complex on Fansipan.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/dinh-fansipan-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-p8.jpg",
        "vi": "Cổng tam quan trên Fansipan phủ tuyết trắng, du khách đi dạo.",
        "en": "The temple gate on Fansipan covered in snow, with visitors walking around.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/dinh-fansipan-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785816035/posts/content/xhmnlgos6gcn0kdm5pix.jpg",
        "vi": "Sân đỉnh Fansipan với cột cờ trong một ngày trời xanh",
        "en": "The Fansipan summit platform and flagpole on a blue-sky day"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785926313/posts/content/rnyd4r01xhftvzxzc2k5.jpg",
        "vi": "Cabin cáp treo Fansipan phía trên biển mây",
        "en": "A Fansipan cable-car cabin above a sea of cloud"
      }
    ],
    "n": 4
  },
  {
    "slug": "cat-cat",
    "kind": "village",
    "x": 256,
    "y": 321,
    "side": "right",
    "lat": 22.32853,
    "lon": 103.83468,
    "images": [
      {
        "src": "/images/sapa-map/cat-cat-p1.jpg",
        "vi": "Đập tràn đá trên suối Cát Cát, phía sau là guồng nước, cầu tre và nhà mái lá của bản.",
        "en": "The stone weir on the Cat Cat stream, with water wheels, bamboo walkways and thatched houses behind.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/cat-cat-village-explore-a-fairy-tale-village-in-the-heart-of-sa-pa-12303",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p2.jpg",
        "vi": "Toàn cảnh bản Cát Cát nhìn từ trên cao với suối, cầu và những nếp nhà ven sườn núi.",
        "en": "Overview of Cat Cat village from above: the stream, bridges and houses along the hillside.",
        "credit": {
          "author": "Vietnam Discovery",
          "license": "",
          "source": "https://vietnamdiscovery.com/sapa/attractions/cat-cat-village/",
          "site": "vietnamdiscovery.com"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p3.jpg",
        "vi": "Thác Tiên Sa (thác Cát Cát) đổ trắng xóa sau thảm hoa tím ven đường.",
        "en": "Tien Sa (Cat Cat) waterfall pouring down behind a bank of purple flowers.",
        "credit": {
          "author": "Mia.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/ban-cat-cat-ve-dep-cua-nhung-nep-nha-ban-lang-sapa-an-trong-suong-som-381",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p4.jpg",
        "vi": "Guồng nước tre khổng lồ bên bờ suối và cây cầu gỗ dẫn qua bản.",
        "en": "A giant bamboo water wheel beside the stream and the wooden bridge across the village.",
        "credit": {
          "author": "Vietnam Discovery",
          "license": "",
          "source": "https://vietnamdiscovery.com/sapa/attractions/cat-cat-village/",
          "site": "vietnamdiscovery.com"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p5.jpg",
        "vi": "Dãy nhà gỗ mái ván của người H'Mông bên lối đi rực hoa cạnh suối.",
        "en": "Hmong wooden houses with shingle roofs along a flower-lined path by the stream.",
        "credit": {
          "author": "Sun Paradise Land (ảnh sưu tầm)",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/cat-cat-village-explore-a-fairy-tale-village-in-the-heart-of-sa-pa-12303",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p6.jpg",
        "vi": "Hai cô gái mặc trang phục H'Mông tạo dáng trên cầu tre giữa suối.",
        "en": "Two girls in Hmong dress posing on a bamboo bridge over the stream.",
        "credit": {
          "author": "Mia.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/ban-cat-cat-ve-dep-cua-nhung-nep-nha-ban-lang-sapa-an-trong-suong-som-381",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p7.jpg",
        "vi": "Du khách đứng bên lan can gỗ ngắm thác Cát Cát.",
        "en": "A visitor at the wooden railing looking at Cat Cat waterfall.",
        "credit": {
          "author": "Vietnam Discovery",
          "license": "",
          "source": "https://vietnamdiscovery.com/sapa/attractions/cat-cat-village/",
          "site": "vietnamdiscovery.com"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-p8.jpg",
        "vi": "Con đường lát đá giữa hai dãy sạp bán thổ cẩm, phía xa là núi.",
        "en": "The stone-paved lane between brocade and souvenir stalls, with mountains in the distance.",
        "credit": {
          "author": "Mia.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/ban-cat-cat-ve-dep-cua-nhung-nep-nha-ban-lang-sapa-an-trong-suong-som-381",
          "site": "mia.vn"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785814838/posts/content/rvwnxb8dszpqrykt4shy.jpg",
        "vi": "Trung tâm bản Cát Cát bên suối với guồng nước và nhà gỗ",
        "en": "The heart of Cat Cat village by the stream, with water wheels and timber houses"
      }
    ],
    "n": 5
  },
  {
    "slug": "takeoff",
    "kind": "fly",
    "x": 692,
    "y": 367,
    "side": "top",
    "lat": 22.3219262,
    "lon": 103.8766636,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790841055/posts/content/zm1tifc17uanfxjryvmq.jpg",
        "vi": "Cánh dù vừa cất cánh từ bản Hang Đá, phía dưới là bản làng và ruộng bậc thang thung lũng Mường Hoa",
        "en": "A wing just launched from Hang Da village, with the villages and terraces of Muong Hoa Valley below"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827807/posts/content/t2cifc1bdwo2p9rm9egg.jpg",
        "vi": "Khu chờ có mái che \"Eat, Sleep, Fly, Repeat\" ngay sau bãi cất cánh",
        "en": "The covered \"Eat, Sleep, Fly, Repeat\" waiting area right behind the launch"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827813/posts/content/zliv9roxaa4udrvemp61.jpg",
        "vi": "Khách check-in tại quầy vàng \"Take off zone\"",
        "en": "Guests checking in at the yellow \"Take off zone\" counter"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790746929/posts/content/cveojl2zeyqf4fvcywc3.jpg",
        "vi": "Phi công mặc đai cho khách, mỗi khoá đều tự tay kiểm tra lại",
        "en": "The pilot fits the passenger harness and checks every buckle himself"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827796/posts/content/dky1vghynds1cu5maom6.jpg",
        "vi": "Ảnh nhóm bên mốc \"Dù lượn Sapa 1500m\" trước khi bay",
        "en": "A group photo at the \"Du luon Sapa 1500m\" marker before flying"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1791284255/posts/content/fgqguv43r7fo0ywav6z6.jpg",
        "vi": "Chuẩn bị cất cánh trên bãi, dù trải phía sau, khách đứng xem từ khu chờ",
        "en": "Ready to launch on the grass, wing laid out behind, guests watching from the shelter"
      }
    ],
    "n": 6
  },
  {
    "slug": "lao-chai",
    "kind": "fly",
    "x": 684,
    "y": 492,
    "side": "top",
    "lat": 22.3097778,
    "lon": 103.8757778,
    "images": [
      {
        "src": "/images/sapa-map/lao-chai-p1.jpg",
        "vi": "Bản Lao Chải với những ngôi nhà nhỏ nằm giữa ruộng bậc thang xanh, phía sau là núi rừng thung lũng Mường Hoa.",
        "en": "Lao Chai village: small houses among green rice terraces, with the forested mountains of the Muong Hoa valley behind.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/blog/lao-chai-village/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p2.jpg",
        "vi": "Toàn cảnh thung lũng Lao Chải – Tả Van với ruộng bậc thang vàng xanh trải dọc hai bên sườn núi.",
        "en": "Panorama of the Lao Chai – Ta Van valley, with green and golden rice terraces lining the slopes.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/en/wonderpedia/news/lao-chai-village-explore-a-charming-remote-village/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p3.jpg",
        "vi": "Ruộng lúa xanh bao quanh các nếp nhà của bản Lao Chải dưới bầu trời nhiều mây.",
        "en": "Green rice fields surrounding the houses of Lao Chai under a cloudy sky.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/blog/lao-chai-village/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p5.jpg",
        "vi": "Ruộng bậc thang Lao Chải nhìn từ mái nhà ván gỗ, xa xa là suối Mường Hoa và mây vờn núi.",
        "en": "Lao Chai terraces seen past a wooden-shingle roof, with the Muong Hoa stream and clouds over the mountains beyond.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/en/wonderpedia/news/lao-chai-village-explore-a-charming-remote-village/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p6.jpg",
        "vi": "Du khách đi bộ cùng phụ nữ người Mông đeo gùi trên con đường đất vào bản Lao Chải.",
        "en": "Trekkers walking with Hmong women carrying baskets along a dirt path into Lao Chai.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/blog/lao-chai-village/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p7.jpg",
        "vi": "Phụ nữ người Mông dệt vải bên khung cửi trong ngôi nhà gỗ ở Lao Chải.",
        "en": "A Hmong woman weaving cloth on a wooden loom inside a house in Lao Chai.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/blog/lao-chai-village/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/lao-chai-p8.jpg",
        "vi": "Homestay mái lá bên dòng suối nhỏ và cây cầu gỗ ở bản Lao Chải.",
        "en": "A thatched-roof homestay beside a small stream and wooden footbridge in Lao Chai.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/blog/lao-chai-village/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827818/posts/content/ilxtzofaexhgzumphhfa.jpg",
        "vi": "Cánh dù về bãi hạ cánh giữa ruộng lúa chín, trẻ con trong bản ra xem",
        "en": "A wing coming in over the ripe rice at the landing field, with village children out to watch"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785819305/posts/content/qlncynirymkkbid7uhzs.jpg",
        "vi": "Khách đi bộ trên bờ ruộng bậc thang giữa Lao Chải và Tả Van",
        "en": "Walkers on the terrace paths between Lao Chai and Ta Van"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827790/posts/content/dwhft7pg5rthimv0mn5h.jpg",
        "vi": "Văn phòng Sapa Paragliding ở bản Lao Chải, nhìn từ đầu cầu",
        "en": "The Sapa Paragliding office in Lao Chai village, seen from the bridge"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827824/posts/content/ijesjykhnias1iboafmc.jpg",
        "vi": "Vừa chạm đất: ảnh kỷ niệm cùng phi công trên bãi hạ cánh",
        "en": "Just landed: a photo with the pilots on the landing field"
      }
    ],
    "n": 7
  },
  {
    "slug": "ta-van",
    "kind": "village",
    "x": 806,
    "y": 565,
    "side": "right",
    "lat": 22.30266,
    "lon": 103.88858,
    "images": [
      {
        "src": "/images/sapa-map/ta-van-p1.jpg",
        "vi": "Bản Tả Van mùa hè với ruộng lúa xanh mướt bên suối Mường Hoa, các nếp nhà nằm trên sườn đồi.",
        "en": "Ta Van in summer: lush green paddies beside the Muong Hoa stream, with houses on the hillside above.",
        "credit": {
          "author": "VnExpress (ảnh: Anh Thư)",
          "license": "",
          "source": "https://vnexpress.net/cam-nang-du-lich-ban-ta-van-5108616.html",
          "site": "vnexpress.net"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p2.jpg",
        "vi": "Ruộng lúa xanh và con đường nhỏ dẫn lên các homestay trên sườn đồi Tả Van.",
        "en": "Green rice terraces and a small road leading up to homestays on the Ta Van hillside.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-van-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p3.jpg",
        "vi": "Cây cầu treo bắc qua suối Mường Hoa dẫn vào bản Tả Van.",
        "en": "The suspension bridge over the Muong Hoa stream leading into Ta Van village.",
        "credit": {
          "author": "VnExpress (ảnh: Linh Hương)",
          "license": "",
          "source": "https://vnexpress.net/cam-nang-du-lich-ban-ta-van-5108616.html",
          "site": "vnexpress.net"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p4.jpg",
        "vi": "Cầu Mây bắc qua dòng suối đá giữa rừng xanh gần Tả Van.",
        "en": "The Cau May rattan bridge spanning a rocky stream in the forest near Ta Van.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/cau-may-ta-van-sapa-chiec-cau-may-don-so-noi-tieng-the-gioi-chi-qua-mot-buc-anh-475",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p5.jpg",
        "vi": "Mùa lúa chín, ruộng bậc thang vàng óng trải dọc thung lũng Mường Hoa ở Tả Van.",
        "en": "Harvest season: golden rice terraces along the Muong Hoa valley at Ta Van.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-van-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p6.jpg",
        "vi": "Thung lũng Mường Hoa mùa lúa chín nhìn từ trên cao về phía bản Tả Van, mây phủ đỉnh núi.",
        "en": "The Muong Hoa valley in harvest season seen from above near Ta Van, with clouds over the peaks.",
        "credit": {
          "author": "VnExpress (ảnh: Tuấn Đào)",
          "license": "",
          "source": "https://vnexpress.net/cam-nang-du-lich-ban-ta-van-5108616.html",
          "site": "vnexpress.net"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p7.jpg",
        "vi": "Suối Mường Hoa chảy qua lòng đá dưới trời xanh, hai bên là ruộng lúa.",
        "en": "The Muong Hoa stream running over boulders under a blue sky, rice fields on both banks.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-van-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-p8.jpg",
        "vi": "Khu vườn hoa và lối đi lát đá của một homestay ở Tả Van.",
        "en": "The flower garden and stone path of a homestay in Ta Van.",
        "credit": {
          "author": "VnExpress (ảnh: Deja Vu Sapa)",
          "license": "",
          "source": "https://vnexpress.net/cam-nang-du-lich-ban-ta-van-5108616.html",
          "site": "vnexpress.net"
        }
      }
    ],
    "n": 8
  },
  {
    "slug": "ban-ho",
    "kind": "spring",
    "x": 968,
    "y": 588,
    "side": "bl",
    "far": true,
    "lat": 22.26369,
    "lon": 103.96805,
    "approx": true,
    "images": [
      {
        "src": "/images/sapa-map/ban-ho-s1.jpg",
        "vi": "Bể tắm nước khoáng nóng ngoài trời giữa rừng ở Bản Hồ",
        "en": "An open-air hot spring pool in the forest at Ban Ho",
        "credit": {
          "author": "Sapa Review",
          "license": "",
          "source": "https://www.facebook.com/groups/sapareviewtattantatno1/posts/1459423998076250/",
          "site": "Facebook"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-s2.jpg",
        "vi": "Tắm lá thuốc trong bồn gỗ, nhìn ra ruộng bậc thang",
        "en": "A herbal bath in a wooden tub overlooking the rice terraces",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/ban-ho-co-gi-choi-trai-nghiem-van-hoa-va-thien-nhien-doc-dao-13153",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-s3.jpg",
        "vi": "Con đường uốn lượn giữa ruộng bậc thang trên đường xuống Bản Hồ",
        "en": "The winding road through the terraces on the way down to Ban Ho",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/ban-ho-co-gi-choi-trai-nghiem-van-hoa-va-thien-nhien-doc-dao-13153",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-s4.jpg",
        "vi": "Bản làng nằm giữa ruộng bậc thang mùa lúa chín",
        "en": "A village among the terraces in the golden-rice season",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/ban-ho-co-gi-choi-trai-nghiem-van-hoa-va-thien-nhien-doc-dao-13153",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-s5.jpg",
        "vi": "Phiên chợ vùng cao, bà con bày rau và đồ thổ cẩm",
        "en": "A highland market, with vegetables and handwoven goods laid out",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/ban-ho-co-gi-choi-trai-nghiem-van-hoa-va-thien-nhien-doc-dao-13153",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-s6.jpg",
        "vi": "Khu nghỉ dưỡng với những căn nhà nhỏ trên đồi nhìn xuống thung lũng",
        "en": "A resort of small cottages on a hill above the valley",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/ban-ho-co-gi-choi-trai-nghiem-van-hoa-va-thien-nhien-doc-dao-13153",
          "site": "sunparadiseland.com"
        }
      }
    ],
    "n": 9
  },
  {
    "slug": "seo-my-ty",
    "kind": "lake",
    "x": 781,
    "y": 748,
    "side": "tl",
    "far": true,
    "lat": 22.25059,
    "lon": 103.89161,
    "images": [
      {
        "src": "/images/sapa-map/seo-my-ty-p1.jpg",
        "vi": "Hồ Séo Mý Tỷ phẳng lặng in bóng dãy núi xanh và bản làng ven hồ.",
        "en": "Still Seo My Ty lake mirroring the green mountains and the village on its shore.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/journey-of-discovery-of-seo-my-ty-lake-amidst-the-vast-mountains-of-the-northwest-13129",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p2.jpg",
        "vi": "Mặt hồ Séo Mý Tỷ xanh biếc với các lồng nuôi cá giữa vòng núi.",
        "en": "The blue water of Seo My Ty lake with fish-farming cages, ringed by mountains.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/journey-of-discovery-of-seo-my-ty-lake-amidst-the-vast-mountains-of-the-northwest-13129",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p3.jpg",
        "vi": "Hồ Séo Mý Tỷ uốn lượn giữa thung lũng nhìn từ trên cao.",
        "en": "Seo My Ty lake winding through the valley, seen from above.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ho-seo-my-ty-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p4.jpg",
        "vi": "Một góc hồ Séo Mý Tỷ với bờ đá, cây rừng và nhà gỗ nhỏ bên mép nước.",
        "en": "A corner of Seo My Ty lake with rocky banks, forest trees and a small wooden hut at the water's edge.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/journey-of-discovery-of-seo-my-ty-lake-amidst-the-vast-mountains-of-the-northwest-13129",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p5.jpg",
        "vi": "Ruộng bậc thang và bãi cỏ ven hồ Séo Mý Tỷ.",
        "en": "Rice terraces and grassy banks along Seo My Ty lake.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ho-seo-my-ty-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p6.jpg",
        "vi": "Những chiếc lều cắm trại trên bãi cỏ bên hồ Séo Mý Tỷ.",
        "en": "Camping tents on the grassy shore of Seo My Ty lake.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/journey-of-discovery-of-seo-my-ty-lake-amidst-the-vast-mountains-of-the-northwest-13129",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p7.jpg",
        "vi": "Du khách đứng ngắm mặt hồ Séo Mý Tỷ lấp lánh.",
        "en": "A visitor looking out over the sparkling water of Seo My Ty lake.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ho-seo-my-ty-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-p8.jpg",
        "vi": "Du khách dạo bước giữa đàn ngựa thả trên bãi cỏ ven hồ Séo Mý Tỷ trong sương mờ.",
        "en": "Visitors strolling among grazing horses on the lakeside grass at Seo My Ty in the mist.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/en/tin-tuc/journey-of-discovery-of-seo-my-ty-lake-amidst-the-vast-mountains-of-the-northwest-13129",
          "site": "sunparadiseland.com"
        }
      }
    ],
    "n": 10
  },
  {
    "slug": "ta-phin",
    "kind": "village",
    "x": 552,
    "y": 21,
    "side": "right",
    "far": true,
    "lat": 22.39529,
    "lon": 103.84303,
    "images": [
      {
        "src": "/images/sapa-map/ta-phin-p1.jpg",
        "vi": "Ruộng bậc thang Tả Phìn lúa vàng xanh trên sườn núi dưới bầu trời trong.",
        "en": "Ta Phin rice terraces in green and gold on the mountainside under a clear sky.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p2.jpg",
        "vi": "Thung lũng Tả Phìn với bản làng, ruộng bậc thang và dãy núi phía sau.",
        "en": "The Ta Phin valley with its village, terraced fields and the mountain range behind.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p3.jpg",
        "vi": "Phụ nữ Dao đỏ đội khăn đỏ hướng dẫn du khách thêu thổ cẩm ở Tả Phìn.",
        "en": "A Red Dao woman in her red headscarf teaching a visitor to embroider in Ta Phin.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p4.jpg",
        "vi": "Tu viện cổ Tả Phìn chỉ còn lại những bức tường đá đổ nát giữa cây cối.",
        "en": "The old Ta Phin monastery, now only crumbling stone walls among the trees.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p5.jpg",
        "vi": "Bên trong động Tả Phìn với những khối nhũ đá được chiếu sáng.",
        "en": "Inside Ta Phin cave, with illuminated stalactites and stalagmites.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/ban-ta-phin-ban-lang-hoang-so-moc-mac-giua-nui-rung-tay-bac-411",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p6.jpg",
        "vi": "Du khách ngâm mình trong bồn gỗ tắm lá thuốc của người Dao đỏ.",
        "en": "A visitor soaking in a wooden tub for the Red Dao herbal leaf bath.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p7.jpg",
        "vi": "Phụ nữ Dao đỏ hái lá trong rừng ở Tả Phìn.",
        "en": "A Red Dao woman picking leaves in the forest at Ta Phin.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/ban-ta-phin-ban-lang-hoang-so-moc-mac-giua-nui-rung-tay-bac-411",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-p8.jpg",
        "vi": "Túi và vải thổ cẩm nhiều màu sắc bày bán ở Tả Phìn.",
        "en": "Colourful embroidered bags and textiles for sale in Ta Phin.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/ban-ta-phin-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      }
    ],
    "n": 11
  },
  {
    "slug": "thac-bac",
    "kind": "waterfall",
    "x": 155,
    "y": 106,
    "side": "right",
    "far": true,
    "lat": 22.36324,
    "lon": 103.77683,
    "images": [
      {
        "src": "/images/sapa-map/thac-bac-p1.jpg",
        "vi": "Dòng thác Bạc trắng xóa đổ qua nhiều tầng đá giữa rừng xanh, cây cầu sắt bắc ngang phía dưới.",
        "en": "Silver Waterfall pouring white over several rock tiers amid green forest, with the iron footbridge below.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/thac-bac-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p2.jpg",
        "vi": "Cây cầu vòm bắc ngang dòng thác Bạc, phía sau là các tầng thác trên cao.",
        "en": "The arched footbridge spanning Silver Waterfall, with the upper tiers of the falls behind.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/lao-cai/sapa/silver-waterfall-sapa/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p3.jpg",
        "vi": "Thác Bạc nhìn từ chân thác, nước tung bọt trắng chảy qua cây cầu nhỏ giữa vách núi.",
        "en": "Silver Waterfall seen from its foot, white water rushing down past the small bridge between the cliffs.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/thac-bac-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p4.jpg",
        "vi": "Các tầng thác Bạc và cây cầu giữa rừng cây rậm rạp.",
        "en": "The tiers of Silver Waterfall and its bridge set in dense forest.",
        "credit": {
          "author": "Sun Paradise Land",
          "license": "",
          "source": "https://sunparadiseland.com/SunParadiseLandSaPa/tin-tuc/cam-nang-kham-pha-thac-bac-sa-pa-chi-tiet-nhat-13145",
          "site": "sunparadiseland.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p5.jpg",
        "vi": "Nước đổ mạnh ở tầng dưới thác Bạc, phía trên là cây cầu có du khách đứng ngắm.",
        "en": "Powerful flow on the lower tier of Silver Waterfall, with visitors on the bridge above.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/thac-bac-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p6.jpg",
        "vi": "Lối đi lát bậc có lan can xanh men theo dòng thác Bạc.",
        "en": "The stepped path with green railings running alongside Silver Waterfall.",
        "credit": {
          "author": "Local Vietnam",
          "license": "",
          "source": "https://localvietnam.com/lao-cai/sapa/silver-waterfall-sapa/",
          "site": "localvietnam.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p7.jpg",
        "vi": "Thác Tình Yêu đổ thẳng xuống vách đá phủ rêu xanh, bên cạnh là dòng chữ \"Thác Tình Yêu\".",
        "en": "Love Waterfall dropping straight down a moss-covered rock face, next to the \"Thác Tình Yêu\" sign.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/thac-tinh-yeu-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-p8.jpg",
        "vi": "Du khách bước qua hồ nước dưới chân thác Tình Yêu, có cầu vồng nhỏ trong làn nước.",
        "en": "A visitor stepping across the pool at the foot of Love Waterfall, a small rainbow in the spray.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/thac-tinh-yeu-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      }
    ],
    "n": 12
  },
  {
    "slug": "o-quy-ho",
    "kind": "pass",
    "x": 119,
    "y": 66,
    "side": "right",
    "far": true,
    "lat": 22.35297,
    "lon": 103.76481,
    "images": [
      {
        "src": "/images/sapa-map/o-quy-ho-p1.jpg",
        "vi": "Nắng chiều xuyên mây chiếu xuống thung lũng, con đèo Ô Quy Hồ uốn lượn dưới chân núi.",
        "en": "Late-day sunbeams breaking through clouds over the valley, with Ô Quy Hồ pass winding below.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/deo-o-quy-ho-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p2.jpg",
        "vi": "Đèo Ô Quy Hồ ngày trời xanh, con đường quanh co giữa các dãy núi Hoàng Liên Sơn.",
        "en": "Ô Quy Hồ pass on a clear blue day, the road snaking between the Hoàng Liên Sơn ridges.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/deo-o-quy-ho-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p3.jpg",
        "vi": "Đường đèo Ô Quy Hồ chạy men sườn núi, mây trắng phủ trên đỉnh.",
        "en": "The Ô Quy Hồ road contouring along the mountainside under white clouds on the peaks.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/deo-o-quy-ho-12853",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p4.jpg",
        "vi": "Mây bồng bềnh trên các sườn núi xanh, con đèo vắt ngang thung lũng.",
        "en": "Clouds drifting over green slopes, with the pass road cutting across the valley.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/deo-o-quy-ho-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p5.jpg",
        "vi": "Khúc cua tay áo trên đèo Ô Quy Hồ, một chiếc ô tô đang vào cua.",
        "en": "A hairpin bend on Ô Quy Hồ pass with a car taking the curve.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/deo-o-quy-ho-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p6.jpg",
        "vi": "Du khách ngồi cạnh cây cô đơn trên đèo, nhìn biển mây trôi giữa các thung lũng.",
        "en": "A visitor sitting by the lone tree on the pass, looking over a sea of clouds in the valleys.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/deo-o-quy-ho-12853",
          "site": "mia.vn"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p7.jpg",
        "vi": "Hoàng hôn bên cây cô đơn ở đèo Ô Quy Hồ, mặt trời lặn sau những lớp núi.",
        "en": "Sunset at the lone tree on Ô Quy Hồ pass, the sun dropping behind layered mountains.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/deo-o-quy-ho-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-p8.jpg",
        "vi": "Cổng Trời Ô Quy Hồ màu trắng nổi bật trên nền núi đá và trời xanh.",
        "en": "The white Heaven's Gate (Cổng Trời) at Ô Quy Hồ against rocky peaks and blue sky.",
        "credit": {
          "author": "MIA.vn",
          "license": "",
          "source": "https://mia.vn/cam-nang-du-lich/deo-o-quy-ho-12853",
          "site": "mia.vn"
        }
      }
    ],
    "n": 13
  },
  {
    "slug": "rong-may",
    "kind": "bridge",
    "x": 76,
    "y": 18,
    "side": "right",
    "far": true,
    "lat": 22.3727,
    "lon": 103.75729,
    "images": [
      {
        "src": "/images/sapa-map/rong-may-p1.jpg",
        "vi": "Tháp thang máy và cầu kính Rồng Mây trên đỉnh đèo, phía sau là biển mây dưới nắng.",
        "en": "The Rồng Mây lift tower and glass bridge on the pass, with a sunlit sea of clouds behind.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p2.jpg",
        "vi": "Du khách ngồi xích đu vực thẳm treo giữa trời, bên dưới là mây và thung lũng.",
        "en": "A visitor on the cliff swing hanging in the sky above clouds and the valley.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p3.jpg",
        "vi": "Tháp thang máy lồng kính dựng sát vách núi nhìn từ trên cao, con đèo uốn lượn phía dưới.",
        "en": "Aerial view of the glass lift tower standing against the cliff, with the pass road winding below.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p4.jpg",
        "vi": "Hoàng hôn rực cam phía sau cầu kính Rồng Mây vươn ra khỏi vách núi.",
        "en": "A blazing orange sunset behind the Rồng Mây glass walkway jutting out from the cliff.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p5.jpg",
        "vi": "Ống thang máy lồng kính chạy dọc vách núi lên đỉnh cầu kính.",
        "en": "The glass-encased lift shaft running up the cliff face to the glass bridge.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p6.jpg",
        "vi": "Du khách đứng trên sàn kính trong suốt, nhìn ra núi rừng đèo Ô Quy Hồ.",
        "en": "A visitor standing on the transparent glass floor overlooking the Ô Quy Hồ mountains.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p7.jpg",
        "vi": "Du khách ngồi trên mặt sàn kính, bên dưới là vực sâu và rừng cây.",
        "en": "A visitor sitting on the glass deck, with the drop and forest visible below.",
        "credit": {
          "author": "Báo Pháp Luật Việt Nam",
          "license": "",
          "source": "https://baophapluat.vn/thu-vao-tam-mat-muon-trung-nuoc-non-o-cau-kinh-rong-may-post338320.html",
          "site": "baophapluat.vn"
        }
      },
      {
        "src": "/images/sapa-map/rong-may-p8.jpg",
        "vi": "Đường trượt cầu vồng nhiều màu dẫn về tháp cầu kính giữa núi và mây.",
        "en": "The colourful rainbow slide leading toward the glass bridge tower among mountains and clouds.",
        "credit": {
          "author": "VinWonders",
          "license": "",
          "source": "https://vinwonders.com/vi/wonderpedia/news/cau-kinh-sa-pa-lao-cai/",
          "site": "vinwonders.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785905971/posts/covers/ehtgnil9hwuzwwmduvpe.jpg",
        "vi": "Tháp thang máy và cầu kính Rồng Mây nhìn ra dãy Hoàng Liên Sơn",
        "en": "The Rong May lift tower and glass bridge facing the Hoang Lien Son range"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785905859/posts/covers/ke1bu9aj7a5zsrn5kl0c.jpg",
        "vi": "Cầu kính Rồng Mây vươn ra khỏi vách núi, nhìn từ trên cao",
        "en": "The Rong May glass bridge reaching out from the cliff, from above"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785926405/posts/content/xwykwsjhgooo5367wgvv.webp",
        "vi": "Du khách đi trên cầu kính Rồng Mây",
        "en": "Visitors walking on the Rong May glass bridge"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785925109/posts/content/mzdlwkpzpxlzvjjjovrj.jpg",
        "vi": "Xích đu trên mép vực ở khu Rồng Mây, phía dưới là đèo Ô Quy Hồ",
        "en": "The cliff-edge swing at Rong May, with O Quy Ho Pass below"
      }
    ],
    "n": 14
  },
  {
    "slug": "bestview",
    "kind": "town",
    "x": 606,
    "y": 354,
    "side": "bottom",
    "lat": 22.3232,
    "lon": 103.8676,
    "approx": true,
    "q": "Best View Sapa",
    "images": [
      {
        "src": "/images/sapa-map/bestview-p1.jpg",
        "vi": "Du khách trên sàn gỗ Best View ngắm biển mây, cạnh mỏm đá cắm cờ đỏ sao vàng.",
        "en": "Guests on the Best View wooden deck above a sea of clouds, beside the rock with the Vietnamese flag.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p2.jpg",
        "vi": "Bình minh lên sau lá cờ trên mỏm đá, biển mây vàng phủ kín thung lũng.",
        "en": "Sunrise behind the flag on the rock, with golden cloud filling the valley.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p3.jpg",
        "vi": "Cô gái chụp ảnh trên sàn gỗ, phía sau là mây trắng và trời xanh.",
        "en": "A young woman posing on the wooden deck against white cloud and blue sky.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p4.jpg",
        "vi": "Sân ô dù nhìn xuống ruộng bậc thang xanh và thung lũng Mường Hoa.",
        "en": "The umbrella terrace looking down on green rice terraces and the Muong Hoa valley.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p5.jpg",
        "vi": "Khu Best View trên sườn đồi lúc hoàng hôn, mây cuộn dưới thung.",
        "en": "The Best View site on the hillside at sunset, with cloud rolling below.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p6.jpg",
        "vi": "Hai du khách giơ tay chào trên sân ngắm cảnh, mây trôi trên ruộng bậc thang.",
        "en": "Two visitors raising their arms on the viewing deck as cloud drifts over the rice terraces.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p7.jpg",
        "vi": "Góc check-in gương soi và cây hồng trên sàn gỗ dưới trời xanh.",
        "en": "The mirror and persimmon-tree photo corner on the wooden deck under a blue sky.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "/images/sapa-map/bestview-p8.jpg",
        "vi": "Mặt trời mọc trên biển mây, nhìn từ sàn gỗ có biển tên Best View.",
        "en": "The sun rising over a sea of clouds, seen from the deck with the Best View sign.",
        "credit": {
          "author": "Best View Sapa (qua VeCapTreoSapa)",
          "license": "",
          "source": "https://vecaptreosapa.com/best-view-sapa/",
          "site": "vecaptreosapa.com"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785490067/posts/content/avokbvemtyrypjy1xorh.jpg",
        "vi": "Mây buổi sáng tan dần trên thung lũng Mường Hoa, chụp từ sườn núi khu Hang Đá, cách Best View khoảng 1 km",
        "en": "Morning cloud lifting off Muong Hoa Valley, taken from the Hang Da hillside about 1 km from Best View"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790841060/posts/content/cnfuekgwmrxlcojl2ols.jpg",
        "vi": "Bay dù lượn phía trên thung lũng trong một sáng nhiều mây, bãi cất cánh cách Best View khoảng 1 km",
        "en": "Paragliding above the valley on a cloudy morning; the take-off is about 1 km from Best View"
      }
    ],
    "n": 15
  },
  {
    "slug": "tau-leo-nui",
    "kind": "rail",
    "x": 213,
    "y": 222,
    "side": "bottom",
    "lat": 22.334825,
    "lon": 103.830903,
    "images": [
      {
        "src": "/images/sapa-map/tau-leo-nui-t1.jpg",
        "vi": "Toa tàu đỏ vàng chạy trên đường ray men theo sườn đồi Sa Pa",
        "en": "The red-and-yellow train on the track along the Sapa hillside",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-2.jpg",
        "vi": "Ga đi: ga Sa Pa ở tầng 1 toà Sun Plaza (toà nhà vàng có tháp đồng hồ, biển \"Sapa Station\")",
        "en": "Departure: Sa Pa station on the ground floor of Sun Plaza (the yellow building with the clock tower)",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sa_Pa_Station.jpg"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t2.jpg",
        "vi": "Sân ga mái vòm kính, toa tàu đỏ đỗ chờ khách",
        "en": "The arched glass station hall with the red train waiting",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t3.jpg",
        "vi": "Khách ngồi trong toa, hai bên là cửa kính nhìn ra đồi chè và thung lũng",
        "en": "Passengers inside the car, with windows onto the tea hills and valley on both sides",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t4.jpg",
        "vi": "Đứng bên ô cửa kính lớn chụp ảnh thung lũng Mường Hoa",
        "en": "Taking photos of Muong Hoa Valley through the big windows",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t5.jpg",
        "vi": "Tàu chạy qua đồi hoa dã quỳ, phía sau là thung lũng và dãy núi",
        "en": "The train passing wild sunflowers, with the valley and mountains behind",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t6.jpg",
        "vi": "Tàu trên cầu cạn lúc hoàng hôn",
        "en": "The train on a viaduct at sunset",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t7.jpg",
        "vi": "Tàu vào ga mái vòm kính giữa vườn hoa",
        "en": "The train arriving at the glass-domed station among flower gardens",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-t8.jpg",
        "vi": "Toa tàu đỗ ở sân ga, khách lên xuống theo lối có lan can",
        "en": "The train at the platform, with railed walkways for boarding",
        "credit": {
          "author": "Tixgo",
          "license": "",
          "source": "https://tixgo.vn/blog/sa-pa/tau-hoa-muong-hoa",
          "site": "tixgo.vn"
        }
      },
      {
        "src": "/images/sapa-map/tau-leo-nui-5.jpg",
        "vi": "Ga đến: khu nhà ga Mường Hoa – ga cáp treo lên Fansipan, nơi tàu dừng cuối tuyến",
        "en": "Arrival: the Muong Hoa station complex at the Fansipan cable car, where the line ends",
        "credit": {
          "author": "Khoitran1957",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/w/index.php?curid=47675329"
        }
      }
    ],
    "n": 16
  }
]

export const SAPA_STOP_SLUGS = SAPA_STOPS.map((s) => s.slug)

export function sapaStopBySlug(slug: string): SapaStop | undefined {
  return SAPA_STOPS.find((s) => s.slug === slug)
}
