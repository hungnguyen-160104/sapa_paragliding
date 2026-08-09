/**
 * Chữ trong email xác nhận gửi KHÁCH, theo đúng ngôn ngữ khách đặt lịch.
 *
 * Trước đây email này viết cứng tiếng Việt: khách Nga đặt trên bản /ru xong
 * nhận về một email không đọc được chữ nào. Email NỘI BỘ thì ngược lại — luôn
 * tiếng Việt, vì người đọc là nhân viên.
 *
 * Bản tiếng Việt là bản gốc; sửa chữ thì sửa ở đây rồi dịch lại cho đủ 6 thứ.
 */
export const EMAIL_LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi'] as const

export type EmailLocale = (typeof EMAIL_LOCALES)[number]

export interface EmailStrings {
  subject: string
  packageName: string
  genderMale: string
  genderFemale: string
  headerTitle: string
  bookingIdLabel: string
  greeting: string
  intro: string
  secFlight: string
  secPassengers: string
  secPrice: string
  secExtras: string
  secPrepare: string
  secRequests: string
  secNext: string
  secContact: string
  takeoffPoint: string
  landingPoint: string
  landingName: string
  package: string
  flightDate: string
  flightTime: string
  timeFlexible: string
  guestCount: string
  guestUnit: string
  pickupPoint: string
  pickupDefault: string
  meetingPoint: string
  meetingSelfArrive: string
  pickupNote: string
  thName: string
  thDob: string
  thGender: string
  thWeight: string
  thNationality: string
  thId: string
  idMasked: string
  priceFlight: string
  unitGuest: string
  unitTime: string
  groupDiscount: string
  total: string
  payNote: string
  noExtras: string
  optHotelTransfer: string
  optDrone: string
  optCamera360: string
  guideClothingLabel: string
  guideClothingText: string
  guideBringLabel: string
  guideBringText: string
  guideAvoidLabel: string
  guideAvoidText: string
  next1: string
  next2: string
  next3: string
  next4: string
  next5: string
  contactIntro: string
  rightsReserved: string
}

export const EMAIL_STRINGS: Record<EmailLocale, EmailStrings> = {
  vi: {
    subject: 'Xác nhận đặt lịch bay Sapa Paragliding',
    packageName: 'Dù lượn Sapa',
    genderMale: 'Nam',
    genderFemale: 'Nữ',
    headerTitle: 'XÁC NHẬN ĐẶT LỊCH BAY',
    bookingIdLabel: 'Mã đặt chỗ:',
    greeting: 'Chào {name},',
    intro: 'Cảm ơn bạn đã đặt lịch bay dù lượn cùng Sapa Paragliding. Lịch bay của bạn đã được ghi nhận, chi tiết như sau:',
    secFlight: 'Thông tin chuyến bay',
    secPassengers: 'Danh sách khách bay',
    secPrice: 'Chi tiết giá',
    secExtras: 'Dịch vụ bạn đã chọn thêm',
    secPrepare: 'Chuẩn bị trước khi bay',
    secRequests: 'Yêu cầu đặc biệt của bạn',
    secNext: 'Việc tiếp theo',
    secContact: 'Liên hệ',
    takeoffPoint: 'Điểm cất cánh',
    landingPoint: 'Điểm hạ cánh',
    landingName: 'Cầu Lao Chải, xã Tả Van',
    package: 'Gói bay',
    flightDate: 'Ngày bay',
    flightTime: 'Giờ bay',
    timeFlexible: 'Linh hoạt',
    guestCount: 'Số khách',
    guestUnit: 'khách',
    pickupPoint: 'Điểm đón',
    pickupDefault: 'Khách sạn của bạn tại Sa Pa',
    meetingPoint: 'Điểm hẹn',
    meetingSelfArrive: 'khách tự tới điểm cất cánh',
    pickupNote: '⏱️ Xe đón trước giờ bay khoảng 30 phút, tài xế sẽ gọi trước khi tới.',
    thName: 'Họ và tên',
    thDob: 'Ngày sinh',
    thGender: 'Giới tính',
    thWeight: 'Cân nặng',
    thNationality: 'Quốc tịch',
    thId: 'CCCD/Hộ chiếu',
    idMasked: '🔒 Số giấy tờ được ẩn bớt để bảo vệ thông tin cá nhân của bạn.',
    priceFlight: 'Giá gói bay',
    unitGuest: 'khách',
    unitTime: 'lượt',
    groupDiscount: 'Giảm giá nhóm',
    total: 'TỔNG CỘNG',
    payNote: '💳 Thanh toán trực tiếp tại điểm bay trước giờ cất cánh. Không cần đặt cọc.',
    noExtras: 'Bạn chưa chọn thêm dịch vụ nào.',
    optHotelTransfer: '🚐 Đón trả khách sạn',
    optDrone: '🚁 Quay flycam',
    optCamera360: '📷 Camera 360°',
    guideClothingLabel: '👕 Trang phục',
    guideClothingText: 'Quần dài, áo tay dài, giày thể thao. Không váy, không cao gót, không dép lê.',
    guideBringLabel: '🎒 Mang theo',
    guideBringText: 'Giấy tờ tuỳ thân, kính râm, áo khoác mỏng, mũ, khăn choàng, gậy chụp ảnh — đều mang thoải mái. Điện thoại còn trống khoảng 4GB để chép ảnh và video.',
    guideAvoidLabel: '🚫 Không mang',
    guideAvoidText: 'Đồ giá trị cao, vật sắc nhọn, đồ cồng kềnh, đồ nặng.',
    next1: 'Chúng tôi sẽ gọi xác nhận lịch bay và tình hình thời tiết trong thời gian sớm nhất.',
    next2: 'Có mặt trước giờ bay 15 phút để làm thủ tục và nghe hướng dẫn an toàn.',
    next3: 'Bấm vào tên điểm cất cánh phía trên để mở chỉ đường Google Maps.',
    next4: 'Mang theo giấy tờ tuỳ thân và email này.',
    next5: 'Đổi lịch hoặc huỷ bay miễn phí, chỉ cần báo trước vài giờ.',
    contactIntro: 'Cần hỗ trợ, bạn gọi hoặc nhắn cho chúng tôi bất cứ lúc nào:',
    rightsReserved: 'Bảo lưu mọi quyền.'
  },
  en: {
    subject: 'Sapa Paragliding Booking Confirmation',
    packageName: 'Sapa Paragliding',
    genderMale: 'Male',
    genderFemale: 'Female',
    headerTitle: 'FLIGHT BOOKING CONFIRMATION',
    bookingIdLabel: 'Booking code:',
    greeting: 'Hello {name},',
    intro: 'Thank you for booking a tandem paragliding flight with Sapa Paragliding. Your flight has been confirmed, with details as follows:',
    secFlight: 'Flight details',
    secPassengers: 'Passenger list',
    secPrice: 'Price breakdown',
    secExtras: 'Add-on services you selected',
    secPrepare: 'Before your flight',
    secRequests: 'Your special requests',
    secNext: 'What happens next',
    secContact: 'Contact',
    takeoffPoint: 'Take-off site',
    landingPoint: 'Landing site',
    landingName: 'Cầu Lao Chải, Tả Van commune',
    package: 'Flight package',
    flightDate: 'Flight date',
    flightTime: 'Flight time',
    timeFlexible: 'Flexible',
    guestCount: 'Passengers',
    guestUnit: 'passengers',
    pickupPoint: 'Pick-up point',
    pickupDefault: 'Your hotel in Sa Pa',
    meetingPoint: 'Meeting point',
    meetingSelfArrive: 'passenger makes their own way to the take-off site',
    pickupNote: '⏱️ The car picks you up about 30 minutes before your flight time; the driver will call before arriving.',
    thName: 'Full name',
    thDob: 'Date of birth',
    thGender: 'Gender',
    thWeight: 'Weight',
    thNationality: 'Nationality',
    thId: 'ID/Passport',
    idMasked: '🔒 Document numbers are partially hidden to protect your personal information.',
    priceFlight: 'Flight package price',
    unitGuest: 'passenger',
    unitTime: 'service',
    groupDiscount: 'Group discount',
    total: 'TOTAL',
    payNote: '💳 Pay directly at the flight site before take-off. No deposit required.',
    noExtras: 'You have not selected any add-on services.',
    optHotelTransfer: '🚐 Hotel pick-up and drop-off',
    optDrone: '🚁 Drone filming',
    optCamera360: '📷 360° camera',
    guideClothingLabel: '👕 Clothing',
    guideClothingText: 'Long trousers, long-sleeved top, sports shoes. No skirts, no high heels, no flip-flops.',
    guideBringLabel: '🎒 Bring along',
    guideBringText: 'Personal ID, sunglasses, a light jacket, a hat, a scarf, a selfie stick — all are fine to bring. Please keep about 4GB free on your phone for copying photos and videos.',
    guideAvoidLabel: '🚫 Do not bring',
    guideAvoidText: 'High-value items, sharp objects, bulky items, heavy items.',
    next1: 'We will call you shortly to confirm your flight schedule and the weather conditions.',
    next2: 'Please arrive 15 minutes before your flight time for check-in and the safety briefing.',
    next3: 'Tap the name of the take-off site above to open directions in Google Maps.',
    next4: 'Bring your personal ID and this email with you.',
    next5: 'Rescheduling or cancelling is free of charge — just let us know a few hours in advance.',
    contactIntro: 'If you need any help, call or message us at any time:',
    rightsReserved: 'All rights reserved.'
  },
  fr: {
    subject: 'Confirmation de réservation de vol Sapa Paragliding',
    packageName: 'Parapente à Sapa',
    genderMale: 'Homme',
    genderFemale: 'Femme',
    headerTitle: 'CONFIRMATION DE RÉSERVATION DE VOL',
    bookingIdLabel: 'Code de réservation :',
    greeting: 'Bonjour {name},',
    intro: 'Merci d\'avoir réservé votre vol en parapente avec Sapa Paragliding. Votre réservation a bien été enregistrée, en voici les détails :',
    secFlight: 'Informations sur le vol',
    secPassengers: 'Liste des passagers',
    secPrice: 'Détail du prix',
    secExtras: 'Services supplémentaires choisis',
    secPrepare: 'Préparation avant le vol',
    secRequests: 'Vos demandes particulières',
    secNext: 'Prochaines étapes',
    secContact: 'Contact',
    takeoffPoint: 'Point de décollage',
    landingPoint: 'Point d\'atterrissage',
    landingName: 'Cầu Lao Chải, commune de Tả Van',
    package: 'Formule de vol',
    flightDate: 'Date du vol',
    flightTime: 'Heure du vol',
    timeFlexible: 'Flexible',
    guestCount: 'Nombre de passagers',
    guestUnit: 'passagers',
    pickupPoint: 'Lieu de prise en charge',
    pickupDefault: 'Votre hôtel à Sa Pa',
    meetingPoint: 'Point de rendez-vous',
    meetingSelfArrive: 'le passager se rend lui-même au point de décollage',
    pickupNote: '⏱️ La navette passe environ 30 minutes avant l\'heure du vol ; le chauffeur vous appellera avant son arrivée.',
    thName: 'Nom et prénom',
    thDob: 'Date de naissance',
    thGender: 'Sexe',
    thWeight: 'Poids',
    thNationality: 'Nationalité',
    thId: 'CNI/Passeport',
    idMasked: '🔒 Le numéro du document est partiellement masqué afin de protéger vos données personnelles.',
    priceFlight: 'Prix de la formule',
    unitGuest: 'passager',
    unitTime: 'prestation',
    groupDiscount: 'Réduction groupe',
    total: 'TOTAL',
    payNote: '💳 Paiement sur place, au point de vol, avant le décollage. Aucun acompte requis.',
    noExtras: 'Vous n\'avez sélectionné aucun service supplémentaire.',
    optHotelTransfer: '🚐 Transfert aller-retour à l\'hôtel',
    optDrone: '🚁 Prise de vue par drone',
    optCamera360: '📷 Caméra 360°',
    guideClothingLabel: '👕 Tenue',
    guideClothingText: 'Pantalon long, haut à manches longues, chaussures de sport. Ni jupe, ni talons hauts, ni tongs.',
    guideBringLabel: '🎒 À emporter',
    guideBringText: 'Pièce d\'identité, lunettes de soleil, veste légère, bonnet, écharpe, perche à selfie — tout cela est bienvenu. Prévoyez environ 4 Go d\'espace libre sur votre téléphone pour copier les photos et les vidéos.',
    guideAvoidLabel: '🚫 À ne pas emporter',
    guideAvoidText: 'Objets de valeur, objets pointus ou tranchants, bagages encombrants ou lourds.',
    next1: 'Nous vous appellerons dans les meilleurs délais pour confirmer l\'horaire du vol et les conditions météo.',
    next2: 'Présentez-vous 15 minutes avant l\'heure du vol pour les formalités et le briefing de sécurité.',
    next3: 'Cliquez sur le nom du point de décollage ci-dessus pour ouvrir l\'itinéraire dans Google Maps.',
    next4: 'Munissez-vous de votre pièce d\'identité et de cet e-mail.',
    next5: 'Report ou annulation gratuits, il suffit de nous prévenir quelques heures à l\'avance.',
    contactIntro: 'Besoin d\'aide ? Appelez-nous ou écrivez-nous à tout moment :',
    rightsReserved: 'Tous droits réservés.'
  },
  ru: {
    subject: 'Подтверждение бронирования полёта — Sapa Paragliding',
    packageName: 'Парапланеризм в Сапе',
    genderMale: 'Мужской',
    genderFemale: 'Женский',
    headerTitle: 'ПОДТВЕРЖДЕНИЕ БРОНИРОВАНИЯ ПОЛЁТА',
    bookingIdLabel: 'Код бронирования:',
    greeting: 'Здравствуйте, {name}!',
    intro: 'Благодарим вас за бронирование полёта на параплане с Sapa Paragliding. Ваш полёт зарегистрирован, детали ниже:',
    secFlight: 'Информация о полёте',
    secPassengers: 'Список пассажиров',
    secPrice: 'Детали стоимости',
    secExtras: 'Выбранные вами дополнительные услуги',
    secPrepare: 'Подготовка к полёту',
    secRequests: 'Ваши особые пожелания',
    secNext: 'Что дальше',
    secContact: 'Контакты',
    takeoffPoint: 'Место взлёта',
    landingPoint: 'Место посадки',
    landingName: 'Cầu Lao Chải, коммуна Tả Van',
    package: 'Тариф полёта',
    flightDate: 'Дата полёта',
    flightTime: 'Время полёта',
    timeFlexible: 'Гибкое',
    guestCount: 'Количество гостей',
    guestUnit: 'чел.',
    pickupPoint: 'Место встречи трансфера',
    pickupDefault: 'Ваш отель в Sa Pa',
    meetingPoint: 'Место встречи',
    meetingSelfArrive: 'гость приезжает к месту взлёта самостоятельно',
    pickupNote: '⏱️ Машина забирает вас примерно за 30 минут до полёта, водитель позвонит перед приездом.',
    thName: 'Фамилия и имя',
    thDob: 'Дата рождения',
    thGender: 'Пол',
    thWeight: 'Вес',
    thNationality: 'Гражданство',
    thId: 'Удостоверение/паспорт',
    idMasked: '🔒 Номер документа частично скрыт для защиты ваших персональных данных.',
    priceFlight: 'Стоимость тарифа',
    unitGuest: 'чел.',
    unitTime: 'услуга',
    groupDiscount: 'Групповая скидка',
    total: 'ИТОГО',
    payNote: '💳 Оплата напрямую на месте полёта перед взлётом. Депозит не требуется.',
    noExtras: 'Вы не выбрали дополнительных услуг.',
    optHotelTransfer: '🚐 Трансфер от отеля и обратно',
    optDrone: '🚁 Съёмка с дрона',
    optCamera360: '📷 Камера 360°',
    guideClothingLabel: '👕 Одежда',
    guideClothingText: 'Длинные брюки, рубашка с длинным рукавом, кроссовки. Без платьев, без каблуков, без шлёпанцев.',
    guideBringLabel: '🎒 Взять с собой',
    guideBringText: 'Удостоверение личности, солнцезащитные очки, тонкую куртку, шапку, шарф, палку для селфи — всё это можно спокойно брать. На телефоне оставьте около 4 ГБ свободного места для фото и видео.',
    guideAvoidLabel: '🚫 Не брать',
    guideAvoidText: 'Дорогие вещи, острые предметы, громоздкие и тяжёлые вещи.',
    next1: 'Мы позвоним вам в ближайшее время, чтобы подтвердить время полёта и погодные условия.',
    next2: 'Приходите за 15 минут до полёта для оформления и инструктажа по безопасности.',
    next3: 'Нажмите на название места взлёта выше, чтобы открыть маршрут в Google Maps.',
    next4: 'Возьмите с собой удостоверение личности и это письмо.',
    next5: 'Перенос даты или отмена полёта — бесплатно, достаточно предупредить за несколько часов.',
    contactIntro: 'Если нужна помощь, звоните или пишите нам в любое время:',
    rightsReserved: 'Все права защищены.'
  },
  zh: {
    subject: 'Sapa Paragliding 飞行预订确认',
    packageName: 'Sapa 滑翔伞',
    genderMale: '男',
    genderFemale: '女',
    headerTitle: '飞行预订确认',
    bookingIdLabel: '预订编号：',
    greeting: '{name}，您好：',
    intro: '感谢您预订 Sapa Paragliding 双人滑翔伞飞行体验。您的飞行安排已成功登记，详情如下：',
    secFlight: '飞行信息',
    secPassengers: '飞行乘客名单',
    secPrice: '费用明细',
    secExtras: '您已加选的服务',
    secPrepare: '飞行前准备',
    secRequests: '您的特别要求',
    secNext: '接下来',
    secContact: '联系我们',
    takeoffPoint: '起飞点',
    landingPoint: '降落点',
    landingName: 'Cầu Lao Chải，Tả Van 乡',
    package: '飞行套餐',
    flightDate: '飞行日期',
    flightTime: '飞行时间',
    timeFlexible: '时间灵活',
    guestCount: '人数',
    guestUnit: '人',
    pickupPoint: '接送地点',
    pickupDefault: '您在 Sa Pa 的酒店',
    meetingPoint: '集合地点',
    meetingSelfArrive: '客人自行前往起飞点',
    pickupNote: '⏱️ 接送车将在飞行前约30分钟出发接您，司机会提前致电。',
    thName: '姓名',
    thDob: '出生日期',
    thGender: '性别',
    thWeight: '体重',
    thNationality: '国籍',
    thId: '身份证/护照',
    idMasked: '🔒 证件号码已部分隐藏，以保护您的个人信息。',
    priceFlight: '飞行套餐价格',
    unitGuest: '人',
    unitTime: '次',
    groupDiscount: '团体优惠',
    total: '总计',
    payNote: '💳 起飞前在飞行点现场付款，无需支付定金。',
    noExtras: '您尚未加选任何服务。',
    optHotelTransfer: '🚐 酒店接送',
    optDrone: '🚁 无人机航拍',
    optCamera360: '📷 360° 全景相机',
    guideClothingLabel: '👕 着装',
    guideClothingText: '长裤、长袖上衣、运动鞋。请勿穿裙子、高跟鞋和拖鞋。',
    guideBringLabel: '🎒 建议携带',
    guideBringText: '身份证件、太阳镜、薄外套、帽子、围巾、自拍杆——均可放心携带。手机请预留约4GB空间，以便拷贝照片和视频。',
    guideAvoidLabel: '🚫 请勿携带',
    guideAvoidText: '贵重物品、尖锐物品、体积过大或过重的物品。',
    next1: '我们会尽快致电与您确认飞行时间及天气情况。',
    next2: '请在飞行前15分钟到场办理手续并听取安全讲解。',
    next3: '点击上方起飞点名称，即可打开 Google Maps 导航。',
    next4: '请携带身份证件和这封邮件。',
    next5: '改期或取消飞行均免费，只需提前几小时告知我们。',
    contactIntro: '如需帮助，您可以随时致电或发消息给我们：',
    rightsReserved: '保留所有权利。'
  },
  hi: {
    subject: 'Sapa Paragliding उड़ान बुकिंग की पुष्टि',
    packageName: 'सापा पैराग्लाइडिंग',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    headerTitle: 'उड़ान बुकिंग की पुष्टि',
    bookingIdLabel: 'बुकिंग कोड:',
    greeting: 'नमस्ते {name},',
    intro: 'Sapa Paragliding के साथ टैंडम पैराग्लाइडिंग बुक करने के लिए धन्यवाद। आपकी उड़ान दर्ज कर ली गई है, विवरण इस प्रकार है:',
    secFlight: 'उड़ान की जानकारी',
    secPassengers: 'यात्रियों की सूची',
    secPrice: 'कीमत का विवरण',
    secExtras: 'आपकी चुनी गई अतिरिक्त सेवाएँ',
    secPrepare: 'उड़ान से पहले तैयारी',
    secRequests: 'आपके विशेष अनुरोध',
    secNext: 'आगे क्या',
    secContact: 'संपर्क',
    takeoffPoint: 'टेक-ऑफ पॉइंट',
    landingPoint: 'लैंडिंग पॉइंट',
    landingName: 'Cầu Lao Chải, Tả Van',
    package: 'उड़ान पैकेज',
    flightDate: 'उड़ान की तारीख',
    flightTime: 'उड़ान का समय',
    timeFlexible: 'लचीला',
    guestCount: 'मेहमानों की संख्या',
    guestUnit: 'मेहमान',
    pickupPoint: 'पिक-अप पॉइंट',
    pickupDefault: 'Sa Pa में आपका होटल',
    meetingPoint: 'मिलने की जगह',
    meetingSelfArrive: 'मेहमान स्वयं टेक-ऑफ पॉइंट पहुँचेंगे',
    pickupNote: '⏱️ गाड़ी उड़ान से लगभग 30 मिनट पहले लेने आएगी, ड्राइवर पहुँचने से पहले कॉल करेंगे।',
    thName: 'पूरा नाम',
    thDob: 'जन्म तिथि',
    thGender: 'लिंग',
    thWeight: 'वज़न',
    thNationality: 'राष्ट्रीयता',
    thId: 'ID/पासपोर्ट',
    idMasked: '🔒 आपकी निजी जानकारी की सुरक्षा के लिए दस्तावेज़ नंबर आंशिक रूप से छिपाया गया है।',
    priceFlight: 'उड़ान पैकेज की कीमत',
    unitGuest: 'व्यक्ति',
    unitTime: 'बार',
    groupDiscount: 'ग्रुप छूट',
    total: 'कुल योग',
    payNote: '💳 भुगतान टेक-ऑफ से पहले सीधे उड़ान स्थल पर करें। कोई एडवांस जमा करने की जरूरत नहीं।',
    noExtras: 'आपने कोई अतिरिक्त सेवा नहीं चुनी है।',
    optHotelTransfer: '🚐 होटल पिक-अप और ड्रॉप',
    optDrone: '🚁 फ्लाईकैम वीडियो',
    optCamera360: '📷 360° कैमरा',
    guideClothingLabel: '👕 पहनावा',
    guideClothingText: 'लंबी पैंट, फुल-स्लीव टॉप, स्पोर्ट्स शूज़। स्कर्ट, हील्स और चप्पल नहीं।',
    guideBringLabel: '🎒 साथ लाएँ',
    guideBringText: 'पहचान पत्र, सनग्लासेस, हल्की जैकेट, टोपी, स्कार्फ, सेल्फी स्टिक — ये सब आराम से ला सकते हैं। फोटो और वीडियो कॉपी करने के लिए फ़ोन में लगभग 4GB खाली जगह रखें।',
    guideAvoidLabel: '🚫 न लाएँ',
    guideAvoidText: 'कीमती सामान, नुकीली चीज़ें, भारी या बड़े आकार का सामान।',
    next1: 'हम जल्द ही आपको कॉल करके उड़ान का समय और मौसम की स्थिति की पुष्टि करेंगे।',
    next2: 'चेक-इन और सुरक्षा ब्रीफिंग के लिए उड़ान के समय से 15 मिनट पहले पहुँचें।',
    next3: 'Google Maps पर रास्ता देखने के लिए ऊपर दिए टेक-ऑफ पॉइंट के नाम पर क्लिक करें।',
    next4: 'अपना पहचान पत्र और यह ईमेल साथ लाएँ।',
    next5: 'तारीख बदलना या बुकिंग रद्द करना मुफ़्त है, बस कुछ घंटे पहले सूचित कर दें।',
    contactIntro: 'किसी भी मदद के लिए हमें कभी भी कॉल या मैसेज करें:',
    rightsReserved: 'सर्वाधिकार सुरक्षित।'
  }
}

/** Ngôn ngữ lạ hoặc thiếu thì về tiếng Anh — đa số khách là người nước ngoài. */
export function resolveEmailLocale(raw: unknown): EmailLocale {
  const code = String(raw ?? '').slice(0, 2).toLowerCase()
  return (EMAIL_LOCALES as readonly string[]).includes(code) ? (code as EmailLocale) : 'en'
}
