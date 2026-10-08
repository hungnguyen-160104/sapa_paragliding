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
    "x": 347,
    "y": 237,
    "side": "top",
    "lat": 22.33456,
    "lon": 103.84048,
    "images": [
      {
        "src": "/images/sapa-map/sun-plaza-1.jpg",
        "vi": "Nhà thờ Đá Sa Pa nhìn từ các bậc đá quảng trường; phía sau là núi Hàm Rồng",
        "en": "Sapa's stone church seen from the steps of the square, with Ham Rong Mountain behind",
        "credit": {
          "author": "Bùi Thụy Đào Nguyên",
          "license": "CC BY-SA 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Nh%C3%A0_th%E1%BB%9D_%C4%91%C3%A1_Sa_Pa.jpg"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-2.jpg",
        "vi": "Sun Plaza với tháp đồng hồ mái vòm xanh; biển \"Sapa Station\" là lối vào ga tàu leo núi Mường Hoa",
        "en": "Sun Plaza and its green-domed clock tower; the \"Sapa Station\" sign marks the Muong Hoa funicular station",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sa_Pa_Station.jpg"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-3.jpg",
        "vi": "Quảng trường (sân quần) hình lòng chảo với các bậc ngồi, phía sau là Sun Plaza",
        "en": "The bowl-shaped town square (sân quần) with its seating steps and Sun Plaza behind",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Quang_Truong_Square.jpg"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-4.jpg",
        "vi": "Mặt trước và tháp chuông nhà thờ Đá, xây bằng đá đẽo",
        "en": "The front and bell tower of the stone church, built of dressed stone",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sapa_Church.jpg"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-5.jpg",
        "vi": "Chiều muộn trước nhà thờ Đá, người dân và du khách tụ lại trên bậc thềm",
        "en": "Late afternoon in front of the stone church, with locals and visitors gathering on the steps",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Church_of_Sa_Pa.jpg"
        }
      },
      {
        "src": "/images/sapa-map/sun-plaza-6.jpg",
        "vi": "Nhà thờ Đá lên đèn buổi tối",
        "en": "The stone church lit up at night",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sa_Pa_Church_at_night.jpg"
        }
      }
    ],
    "n": 1
  },
  {
    "slug": "ham-rong",
    "kind": "town",
    "x": 416,
    "y": 243,
    "side": "right",
    "lat": 22.33363,
    "lon": 103.8468,
    "images": [
      {
        "src": "/images/sapa-map/ham-rong-1.jpg",
        "vi": "Toàn cảnh thị trấn và hồ Sa Pa nhìn từ núi Hàm Rồng",
        "en": "Sapa town and its lake seen from Ham Rong Mountain",
        "credit": {
          "author": "Bùi Thụy Đào Nguyên",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Th%E1%BB%8B_tr%E1%BA%A5n_Sa_Pa.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-2.jpg",
        "vi": "Các mỏm đá trên đỉnh Hàm Rồng sau cành đào nở mùa xuân",
        "en": "The rocky crags of Ham Rong behind peach blossom in spring",
        "credit": {
          "author": "wtpwt",
          "license": "CC BY-SA 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Nui_Ham_Rong_mua_xuan.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-3.jpg",
        "vi": "Vườn hoa trên núi Hàm Rồng trong một ngày sương mù",
        "en": "The flower gardens on Ham Rong Mountain on a misty day",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:V%C6%B0%E1%BB%9Dn_hoa_Sa_Pa_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-4.jpg",
        "vi": "Hàng chữ Hàm Rồng xếp bằng cây giữa vườn hoa và những khối đá vôi",
        "en": "The name Ham Rong spelled out in plants between the flower beds and limestone outcrops",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:H%C3%A0m_r%E1%BB%93ng_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-5.jpg",
        "vi": "Khối đá vôi dựng đứng ở Cổng Trời 2, bên lối đi lát đá",
        "en": "A limestone pinnacle at Heaven's Gate 2 (Cổng Trời 2), beside the stone-paved path",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:C%E1%BB%95ng_tr%E1%BB%9Di_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ham-rong-6.jpg",
        "vi": "Lối đi lát đá luồn dưới vách đá phủ rêu; đường ướt và trơn khi có sương",
        "en": "The stone path passing under a mossy rock wall; wet and slippery in mist",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Ch%C3%A2n_m%C3%A2y_-_panoramio.jpg"
        }
      }
    ],
    "n": 2
  },
  {
    "slug": "moana",
    "kind": "town",
    "x": 405,
    "y": 317,
    "side": "right",
    "lat": 22.32736,
    "lon": 103.84628,
    "approx": true,
    "images": [
      {
        "src": "/images/sapa-map/moana-1.jpg",
        "vi": "Ảnh minh hoạ: dãy Hoàng Liên Sơn và ruộng bậc thang nhìn từ rìa thị trấn Sa Pa, hướng nhìn giống phông nền ở Moana",
        "en": "Illustrative photo: the Hoang Lien Son range and terraces seen from the edge of Sapa town, the same outlook that forms Moana's backdrop",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Ho%C3%A0ng_Li%C3%AAn_S%C6%A1n_mountains_from_Sa_Pa.jpg"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785815231/posts/content/wfarlhfqatts4mlrb5yc.avif",
        "vi": "Tượng cô gái Moana, tiểu cảnh trùng tên với khu check-in",
        "en": "The Moana girl statue, the set that shares the park's name"
      },
      {
        "src": "/images/sapa-map/moana-3.jpg",
        "vi": "Ảnh minh hoạ: nhà trên sườn dốc và ruộng bậc thang nhìn xuống thung lũng Mường Hoa, phía đông nam thị trấn",
        "en": "Illustrative photo: houses on the slope and terraces above Muong Hoa Valley, south-east of town",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Landcape_in_Sa_Pa_02.jpg"
        }
      },
      {
        "src": "/images/sapa-map/moana-4.jpg",
        "vi": "Ảnh minh hoạ: thung lũng dưới chân thị trấn Sa Pa trong một ngày nhiều mây",
        "en": "Illustrative photo: the valley below Sapa town on a cloudy day",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Landcape_in_Sa_Pa_01.jpg"
        }
      }
    ],
    "n": 3
  },
  {
    "slug": "fansipan",
    "kind": "peak",
    "x": 62,
    "y": 299,
    "side": "right",
    "far": true,
    "lat": 22.30308,
    "lon": 103.77544,
    "images": [
      {
        "src": "/images/sapa-map/fansipan-1.jpg",
        "vi": "Cabin cáp treo gần ga trên; qua khoảng trống của mây thấy thị trấn Sa Pa phía dưới",
        "en": "A cable-car cabin near the top station, with Sapa town visible through a gap in the cloud",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Fansipan_Cable_Car.jpg"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-2.jpg",
        "vi": "Kim Sơn Bảo Thắng Tự và bảo tháp nhìn từ trên đỉnh xuống",
        "en": "Kim Son Bao Thang pagoda and its tower seen from the summit",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Kim_Son_Bao_Thang_Pagoda_from_the_summit.jpg"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-3.jpg",
        "vi": "Đại tượng Phật A Di Đà và đường bậc thang lên đỉnh trong mây",
        "en": "The Great Amitabha Buddha and the stairway to the summit in cloud",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Amit%C4%81bha_statue_on_Fansipan_2.jpg"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-4.jpg",
        "vi": "Cột mốc Fansipan 3.143 m trong một ngày mù trắng trời",
        "en": "The Fansipan 3,143 m summit marker on a white-out day",
        "credit": {
          "author": "MinhVN1863",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Fansipan_Summit_Mark_2024.jpg"
        }
      },
      {
        "src": "/images/sapa-map/fansipan-5.jpg",
        "vi": "Khu lán nghỉ 2.800 m trên cung leo bộ, giữa rừng trúc lùn",
        "en": "The 2,800 m camp on the trekking route, among dwarf bamboo",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Fansipan_base_camp.jpg"
        }
      }
    ],
    "n": 4
  },
  {
    "slug": "cat-cat",
    "kind": "village",
    "x": 292,
    "y": 299,
    "side": "bl",
    "lat": 22.32853,
    "lon": 103.83468,
    "images": [
      {
        "src": "/images/sapa-map/cat-cat-1.jpg",
        "vi": "Thác Cát Cát và những nếp nhà gỗ bên suối dưới đáy thung lũng",
        "en": "Cat Cat waterfall and timber houses beside the stream on the valley floor",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Cat_Cat_Waterfalls,_Sa_Pa,_Vietnam,_20240126_1228_3619.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-2.jpg",
        "vi": "Khu trung tâm bản Cát Cát bên suối, với lối đi và hàng quán ven bờ",
        "en": "The centre of Cat Cat village by the stream, with the walkway and stalls along the bank",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Cat_Cat_Waterfalls,_Sa_Pa,_Vietnam,_20240126_1236_3645.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-3.jpg",
        "vi": "Guồng nước bằng tre và lối đi lát ván giữa ruộng rau",
        "en": "Bamboo water wheels and a plank walkway through the vegetable fields",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Water_wheels_in_Cat_Cat_village,_Sa_Pa,_Vietnam,_20240126_1140_3535.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-4.jpg",
        "vi": "Guồng nước và những mái nhà trong bản Cát Cát",
        "en": "Water wheels and village houses in Cat Cat",
        "credit": {
          "author": "Jakub Hałun",
          "license": "CC BY 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Water_wheel_in_Cat_Cat_village,_Sa_Pa,_Vietnam,_20240126_1144_3561.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-5.jpg",
        "vi": "Thác Cát Cát nhìn gần",
        "en": "Cat Cat waterfall up close",
        "credit": {
          "author": "Lori_NY",
          "license": "CC BY-SA 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Catcatfalls2.jpg"
        }
      },
      {
        "src": "/images/sapa-map/cat-cat-6.jpg",
        "vi": "Ruộng bậc thang ở bản Cát Cát vào mùa lúa xanh",
        "en": "Rice terraces in Cat Cat village in the green-rice season",
        "credit": {
          "author": "Dragfyre",
          "license": "CC BY-SA 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terrace_Cat_Cat_village.JPG"
        }
      }
    ],
    "n": 5
  },
  {
    "slug": "takeoff",
    "kind": "fly",
    "x": 692,
    "y": 367,
    "side": "tr",
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
    "side": "bl",
    "lat": 22.3097778,
    "lon": 103.8757778,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827818/posts/content/ilxtzofaexhgzumphhfa.jpg",
        "vi": "Cánh dù về bãi hạ cánh giữa ruộng lúa chín, trẻ con trong bản ra xem",
        "en": "A wing coming in over the ripe rice at the landing field, with village children out to watch"
      },
      {
        "src": "/images/sapa-map/lao-chai-2.jpg",
        "vi": "Ruộng lúa xanh dưới đáy thung lũng ở Lao Chải, nhà trong bản nằm rải phía xa (tháng 8)",
        "en": "Green rice on the valley floor at Lao Chai, with village houses scattered beyond (August)",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Lao_Ch%E1%BA%A3i_01.jpg"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827790/posts/content/dwhft7pg5rthimv0mn5h.jpg",
        "vi": "Văn phòng Sapa Paragliding ở bản Lao Chải, nhìn từ đầu cầu",
        "en": "The Sapa Paragliding office in Lao Chai village, seen from the bridge"
      },
      {
        "src": "/images/sapa-map/lao-chai-4.jpg",
        "vi": "Ruộng bậc thang và nhà gỗ trên sườn đồi ở Lao Chải",
        "en": "Rice terraces and timber houses on the hillside at Lao Chai",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Lao_Ch%E1%BA%A3i_04.jpg"
        }
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790827824/posts/content/ijesjykhnias1iboafmc.jpg",
        "vi": "Vừa chạm đất: ảnh kỷ niệm cùng phi công trên bãi hạ cánh",
        "en": "Just landed: a photo with the pilots on the landing field"
      },
      {
        "src": "/images/sapa-map/lao-chai-6.jpg",
        "vi": "Đường mòn lát đá giữa ruộng bậc thang ở Lao Chải",
        "en": "A stony path between the rice terraces at Lao Chai",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Lao_Ch%E1%BA%A3i_07.jpg"
        }
      }
    ],
    "n": 7
  },
  {
    "slug": "ta-van",
    "kind": "village",
    "x": 806,
    "y": 565,
    "side": "br",
    "lat": 22.30266,
    "lon": 103.88858,
    "images": [
      {
        "src": "/images/sapa-map/ta-van-1.jpg",
        "vi": "Bản Tả Van nằm dưới đáy thung lũng Mường Hoa, nhìn từ ruộng bậc thang phía trên",
        "en": "Ta Van on the floor of Muong Hoa Valley, seen from the rice terraces above",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:M%C6%B0%E1%BB%9Dng_Hoa_Valley_08.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-2.jpg",
        "vi": "Nhà cửa ở Tả Van bên suối Mường Hoa vào mùa lúa xanh",
        "en": "Houses in Ta Van beside the Muong Hoa stream in green-rice season",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_T%E1%BA%A3_Van_02.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-3.jpg",
        "vi": "Cây cầu nhỏ qua suối giữa ruộng bậc thang ở khu Tả Van – Lao Chải",
        "en": "A small footbridge over a stream among the terraces in the Ta Van – Lao Chai area",
        "credit": {
          "author": "Lori_NY",
          "license": "CC BY-SA 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Village_bridge.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-4.jpg",
        "vi": "Một tảng đá khắc ở bãi đá cổ Sa Pa, có rào bảo vệ, phía sau là ruộng bậc thang",
        "en": "An engraved boulder at the Sapa ancient rock field, fenced for protection, with terraces behind",
        "credit": {
          "author": "Orrmaster",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:An_ancient_engraved_rock_of_Sapa.JPG"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-5.jpg",
        "vi": "Cận cảnh các hình khắc trên mặt đá ở bãi đá cổ Sa Pa",
        "en": "Close-up of the carvings on a boulder at the Sapa ancient rock field",
        "credit": {
          "author": "Casablanca1911",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:B%C3%A3i_%C4%91%C3%A1_c%E1%BB%95.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-van-6.jpg",
        "vi": "Ruộng bậc thang ở Tả Van, phía xa là suối Mường Hoa và mây thấp trên sườn núi",
        "en": "Rice terraces in Ta Van with the Muong Hoa stream and low cloud on the hillside beyond",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_T%E1%BA%A3_Van_03.jpg"
        }
      }
    ],
    "n": 8
  },
  {
    "slug": "ban-ho",
    "kind": "spring",
    "x": 958,
    "y": 640,
    "side": "left",
    "far": true,
    "lat": 22.26369,
    "lon": 103.96805,
    "approx": true,
    "images": [
      {
        "src": "/images/sapa-map/ban-ho-1.jpg",
        "vi": "Ảnh minh hoạ: ruộng bậc thang mùa lúa ở vùng Sa Pa (chưa xác định vị trí chính xác, không phải ảnh chụp bản Hồ)",
        "en": "Illustration: rice terraces in the Sapa area (exact location unconfirmed; not a photo of Ban Ho village)",
        "credit": {
          "author": "David McKelvey",
          "license": "CC BY 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sapa_view_3.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-2.jpg",
        "vi": "Ảnh minh hoạ: đường đèo quanh co xuống một thung lũng sông ở vùng Sa Pa (chưa xác định vị trí chính xác)",
        "en": "Illustration: a winding road dropping into a river valley in the Sapa area (exact location unconfirmed)",
        "credit": {
          "author": "David McKelvey",
          "license": "CC BY 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sapa_view_2.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-3.jpg",
        "vi": "Thung lũng Mường Hoa đoạn Tả Van – đường xuống Bản Hồ đi xuôi theo thung lũng này",
        "en": "Muong Hoa Valley at Ta Van – the road to Ban Ho follows this valley downstream",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:M%C6%B0%E1%BB%9Dng_Hoa_Valley_05.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ban-ho-4.jpg",
        "vi": "Ảnh minh hoạ: nhà cửa nằm rải rác giữa rừng và ruộng bậc thang ở vùng Sa Pa (chưa xác định vị trí chính xác)",
        "en": "Illustration: houses scattered among forest and rice terraces in the Sapa area (exact location unconfirmed)",
        "credit": {
          "author": "David McKelvey",
          "license": "CC BY 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sapa_view_1.jpg"
        }
      }
    ],
    "n": 9
  },
  {
    "slug": "seo-my-ty",
    "kind": "lake",
    "x": 802,
    "y": 680,
    "side": "right",
    "far": true,
    "lat": 22.25059,
    "lon": 103.89161,
    "images": [
      {
        "src": "/images/sapa-map/seo-my-ty-1.jpg",
        "vi": "Hồ Séo Mý Tỷ với thôn ven hồ và các sườn núi phủ rừng (ảnh chụp tháng 2/2023)",
        "en": "Seo My Ty Lake with the lakeside hamlet and forested slopes (photo from February 2023)",
        "credit": {
          "author": "NKSTTSSHNVN",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:SeoMyTy.jpg"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-2.jpg",
        "vi": "Tả Van trong thung lũng Mường Hoa – nơi bắt đầu con đường dốc lên hồ",
        "en": "Ta Van in Muong Hoa Valley – where the steep road up to the lake begins",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:M%C6%B0%E1%BB%9Dng_Hoa_Valley_09.jpg"
        }
      },
      {
        "src": "/images/sapa-map/seo-my-ty-3.jpg",
        "vi": "Ảnh minh hoạ: rừng Vườn quốc gia Hoàng Liên trong mây, chụp trên tuyến leo Fansipan (không phải ở hồ)",
        "en": "Illustration: cloud forest in Hoang Lien National Park, taken on the Fansipan trail (not at the lake)",
        "credit": {
          "author": "Viethavvh",
          "license": "Public domain",
          "source": "https://commons.wikimedia.org/wiki/File:Vuon_QG_Hoang_Lien.JPG"
        }
      }
    ],
    "n": 10
  },
  {
    "slug": "ta-phin",
    "kind": "village",
    "x": 494,
    "y": 49,
    "side": "right",
    "far": true,
    "lat": 22.39529,
    "lon": 103.84303,
    "images": [
      {
        "src": "/images/sapa-map/ta-phin-1.jpg",
        "vi": "Bản Tả Phìn giữa ruộng bậc thang, nhìn từ sườn đồi phía trên",
        "en": "Ta Phin village among rice terraces, seen from the slope above",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:T%E1%BA%A3_Ph%C3%ACn.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-2.jpg",
        "vi": "Phế tích tu viện cổ Tả Phìn: tường đá hai tầng, cửa vòm, không còn mái",
        "en": "Ruins of the old Ta Phin monastery: two storeys of stone wall and arches, with no roof left",
        "credit": {
          "author": "Hoangvantoanajc",
          "license": "CC BY-SA 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Tu_vi%E1%BB%87n_T%E1%BA%A3_Ph%C3%ACn.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-3.jpg",
        "vi": "Nhà gỗ và con đường bê tông nhỏ giữa ruộng lúa ở Tả Phìn",
        "en": "Wooden houses and a narrow concrete lane between rice fields in Ta Phin",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Houses_in_T%E1%BA%A3_Ph%C3%ACn.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-4.jpg",
        "vi": "Toàn cảnh thung lũng Tả Phìn với các thửa ruộng bậc thang uốn tròn",
        "en": "Panorama of the Ta Phin valley with its curving rice terraces",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_T%E1%BA%A3_Ph%C3%ACn_01.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-5.jpg",
        "vi": "Ruộng bậc thang và núi ở Tả Phìn vào mùa lúa xanh",
        "en": "Rice terraces and peaks at Ta Phin in green-rice season",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Rice_terraces_in_T%E1%BA%A3_Ph%C3%ACn_03.jpg"
        }
      },
      {
        "src": "/images/sapa-map/ta-phin-6.jpg",
        "vi": "Ngô phơi trên lối đi bê tông bên ruộng lúa ở Tả Phìn",
        "en": "Maize drying on a concrete lane beside the paddies in Ta Phin",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Maize_drying_in_T%E1%BA%A3_Ph%C3%ACn.jpg"
        }
      }
    ],
    "n": 11
  },
  {
    "slug": "thac-bac",
    "kind": "waterfall",
    "x": 150,
    "y": 96,
    "side": "right",
    "far": true,
    "lat": 22.36324,
    "lon": 103.77683,
    "images": [
      {
        "src": "/images/sapa-map/thac-bac-1.jpg",
        "vi": "Thác Bạc và cây cầu sắt bắc ngang lưng chừng thác",
        "en": "Silver Waterfall and the iron footbridge halfway up the falls",
        "credit": {
          "author": "Lori_NY",
          "license": "CC BY-SA 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Thacbac3.jpg"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-2.jpg",
        "vi": "Các tầng của Thác Bạc nhìn từ phía dưới, cầu sắt ở giữa",
        "en": "The tiers of Silver Waterfall seen from below, with the bridge in the middle",
        "credit": {
          "author": "Lori_NY",
          "license": "CC BY-SA 2.0",
          "source": "https://commons.wikimedia.org/wiki/File:Thacbac2.jpg"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-3.jpg",
        "vi": "Thác Bạc trong một ngày mù sương",
        "en": "Silver Waterfall on a misty day",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Th%C3%A1c_b%E1%BA%A1c,_c%E1%BA%A7u_may_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-4.jpg",
        "vi": "Lối bậc thang và chòi nghỉ bên dòng Thác Bạc",
        "en": "Stairway and rest shelter beside Silver Waterfall",
        "credit": {
          "author": "ChieuTimViet",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:Th%C3%A1c_b%E1%BA%A1c_-_panoramio.jpg"
        }
      },
      {
        "src": "/images/sapa-map/thac-bac-5.jpg",
        "vi": "Hàng đá kê bước qua suối Vàng trong Vườn quốc gia Hoàng Liên – dòng suối của Thác Tình Yêu",
        "en": "Stepping stones across the Golden Stream (Suoi Vang) in Hoang Lien National Park – the stream of Love Waterfall",
        "credit": {
          "author": "GrumpyProfessor",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Su%E1%BB%91i_V%C3%A0ng_-_Hoang_Lien_National_Park.jpg"
        }
      }
    ],
    "n": 12
  },
  {
    "slug": "o-quy-ho",
    "kind": "pass",
    "x": 92,
    "y": 58,
    "side": "right",
    "far": true,
    "lat": 22.35297,
    "lon": 103.76481,
    "images": [
      {
        "src": "/images/sapa-map/o-quy-ho-1.jpg",
        "vi": "Đèo Ô Quy Hồ uốn quanh sườn núi Hoàng Liên Sơn, nhìn từ trên cao",
        "en": "O Quy Ho Pass winding around the slopes of the Hoang Lien Son range, seen from above",
        "credit": {
          "author": "Kiếm Anh",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:O_Quy_Ho_pass.jpg"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-2.jpg",
        "vi": "Nắng chiều trên đèo Ô Quy Hồ",
        "en": "Late-afternoon light over O Quy Ho Pass",
        "credit": {
          "author": "Dansapa",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Sunset_on_O_Quy_Ho_pass.jpg"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-3.jpg",
        "vi": "Con đường đèo giữa mây, nhìn từ khu vực đỉnh đèo",
        "en": "The pass road among the clouds, seen from near the top",
        "credit": {
          "author": "Liftold",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:%C4%90%C3%A8o_%C3%94_Quy_H%E1%BB%93_2.JPG"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-4.jpg",
        "vi": "Một khúc cua trên đèo Ô Quy Hồ trong mây mù",
        "en": "A bend on O Quy Ho Pass in the mist",
        "credit": {
          "author": "Liftold",
          "license": "CC BY 3.0",
          "source": "https://commons.wikimedia.org/wiki/File:%C4%90%C3%A8o_%C3%94_Quy_H%E1%BB%93_1.JPG"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-5.jpg",
        "vi": "Trạm kiểm lâm Núi Xẻ (Vườn quốc gia Hoàng Liên) ở khu Trạm Tôn – nơi bắt đầu đường mòn leo Fansipan",
        "en": "Nui Xe Ranger Station (Hoang Lien National Park) at Tram Ton – where the Fansipan trail begins",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Nui_Xe_Ranger_Station.jpg"
        }
      },
      {
        "src": "/images/sapa-map/o-quy-ho-6.jpg",
        "vi": "Đồi chè Ô Quy Hồ mùa hoa anh đào",
        "en": "The O Quy Ho tea hills in cherry-blossom season",
        "credit": {
          "author": "Kiếm Anh",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%93i_ch%C3%A8_%C3%94_Qu%C3%BD_H%E1%BB%93.jpg"
        }
      }
    ],
    "n": 13
  },
  {
    "slug": "rong-may",
    "kind": "bridge",
    "x": 40,
    "y": 26,
    "side": "right",
    "far": true,
    "lat": 22.3727,
    "lon": 103.75729,
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785905971/posts/covers/ehtgnil9hwuzwwmduvpe.jpg",
        "vi": "Tháp thang máy và hành lang trên cao của khu Rồng Mây, phía dưới là đèo Ô Quy Hồ",
        "en": "The lift tower and elevated walkway at Rong May, with O Quy Ho Pass below"
      },
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1785926405/posts/content/xwykwsjhgooo5367wgvv.webp",
        "vi": "Du khách đi trên cầu kính Rồng Mây",
        "en": "Visitors walking on the Rong May glass bridge"
      }
    ],
    "n": 14
  },
  {
    "slug": "bestview",
    "kind": "town",
    "x": 606,
    "y": 354,
    "side": "top",
    "lat": 22.3232,
    "lon": 103.8676,
    "approx": true,
    "q": "Best View Sapa",
    "images": [
      {
        "src": "https://res.cloudinary.com/dxtzvakgd/image/upload/v1790841055/posts/content/zm1tifc17uanfxjryvmq.jpg",
        "vi": "Ảnh minh hoạ: thung lũng Mường Hoa nhìn từ sườn núi khu Hang Đá, cùng hướng nhìn với Best View",
        "en": "Illustrative photo: Muong Hoa Valley from the Hang Da hillside, the same outlook as Best View"
      },
      {
        "src": "/images/sapa-map/moana-4.jpg",
        "vi": "Ảnh minh hoạ: thung lũng phía dưới Sa Pa trong một ngày nhiều mây",
        "en": "Illustrative photo: the valley below Sapa on a cloudy day",
        "credit": {
          "author": "Christophe95",
          "license": "CC BY-SA 4.0",
          "source": "https://commons.wikimedia.org/wiki/File:Landcape_in_Sa_Pa_01.jpg"
        }
      }
    ],
    "n": 15
  }
]

export const SAPA_STOP_SLUGS = SAPA_STOPS.map((s) => s.slug)

export function sapaStopBySlug(slug: string): SapaStop | undefined {
  return SAPA_STOPS.find((s) => s.slug === slug)
}
