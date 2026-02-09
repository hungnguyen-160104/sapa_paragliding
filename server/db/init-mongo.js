// Initialize MongoDB with collections and sample data
db = db.getSiblingDB('sapa_paragliding');

// Create posts collection
db.createCollection('posts');
db.createCollection('bookings');

// Create indexes
db.posts.createIndex({ id: 1 }, { unique: true });
db.posts.createIndex({ category: 1 });
db.posts.createIndex({ published: 1 });
db.posts.createIndex({ date: -1 });
db.bookings.createIndex({ id: 1 }, { unique: true });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ flightDateUtc: 1 });
db.bookings.createIndex({ createdAt: 1 });

// Insert sample posts
db.posts.insertMany([
  {
    id: '1',
    title: 'Experience the Thrill of Paragliding in Sapa',
    titleVi: 'Trải Nghiệm Cảm Giác Bay Dù Lượn Tại Sapa',
    excerpt: 'Discover the breathtaking views of Sapa from above. Our professional pilots ensure a safe and unforgettable experience.',
    excerptVi: 'Khám phá khung cảnh ngoạn mục của Sapa từ trên cao. Các phi công chuyên nghiệp của chúng tôi đảm bảo trải nghiệm an toàn và khó quên.',
    content: '<h2>An Unforgettable Adventure</h2><p>Paragliding in Sapa offers a unique perspective of Vietnam\'s stunning northern highlands.</p>',
    contentVi: '<h2>Một Cuộc Phiêu Lưu Khó Quên</h2><p>Bay dù lượn tại Sapa mang đến góc nhìn độc đáo về vùng cao phía Bắc tuyệt đẹp của Việt Nam.</p>',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
    author: 'Sapa Paragliding Team',
    date: '2024-11-01',
    category: 'Adventure',
    published: true,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01')
  },
  {
    id: '2',
    title: 'Safety Guidelines for First-Time Flyers',
    titleVi: 'Hướng Dẫn An Toàn Cho Người Bay Lần Đầu',
    excerpt: 'Everything you need to know before your first paragliding experience. Safety is our top priority.',
    excerptVi: 'Mọi thứ bạn cần biết trước trải nghiệm bay dù lượn đầu tiên. An toàn là ưu tiên hàng đầu của chúng tôi.',
    content: '<h2>Your Safety Matters</h2><p>At Sapa Paragliding, we prioritize your safety above all else.</p>',
    contentVi: '<h2>An Toàn Của Bạn Là Quan Trọng</h2><p>Tại Sapa Paragliding, chúng tôi ưu tiên an toàn của bạn trên hết.</p>',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    author: 'Safety Team',
    date: '2024-10-28',
    category: 'Safety',
    published: true,
    createdAt: new Date('2024-10-28'),
    updatedAt: new Date('2024-10-28')
  },
  {
    id: '3',
    title: 'Capturing Your Flight: Photography Tips',
    titleVi: 'Ghi Lại Chuyến Bay: Mẹo Chụp Ảnh',
    excerpt: 'Learn how to get the best photos and videos during your paragliding adventure.',
    excerptVi: 'Tìm hiểu cách chụp ảnh và quay video đẹp nhất trong chuyến phiêu lưu bay dù lượn của bạn.',
    content: '<h2>Preserve Your Memories</h2><p>Your paragliding experience deserves to be captured in stunning detail.</p>',
    contentVi: '<h2>Lưu Giữ Kỷ Niệm</h2><p>Trải nghiệm bay dù lượn của bạn xứng đáng được ghi lại một cách tuyệt đẹp.</p>',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    author: 'Media Team',
    date: '2024-10-25',
    category: 'Tips',
    published: true,
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-10-25')
  },
  {
    id: '4',
    title: 'Sapa Weather Guide for Paragliding',
    titleVi: 'Hướng Dẫn Thời Tiết Sapa Cho Bay Dù Lượn',
    excerpt: 'Understanding Sapa\'s weather patterns to plan your perfect paragliding day.',
    excerptVi: 'Hiểu về thời tiết Sapa để lên kế hoạch cho ngày bay dù lượn hoàn hảo.',
    content: '<h2>Weather Patterns in Sapa</h2><p>Sapa\'s unique climate creates ideal conditions for paragliding during certain seasons.</p>',
    contentVi: '<h2>Thời Tiết Tại Sapa</h2><p>Khí hậu độc đáo của Sapa tạo điều kiện lý tưởng cho bay dù lượn trong một số mùa nhất định.</p>',
    image: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=800',
    author: 'Weather Team',
    date: '2024-10-20',
    category: 'Guide',
    published: true,
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20')
  }
]);

// Insert sample bookings
db.bookings.insertMany([
  {
    id: 'BID_000001_20240101_120000',
    bookingId: 'BID_000001_20240101_120000',
    customerName: 'Linh Tran',
    email: 'linh@example.com',
    phone: '+84901234567',
    location: 'Sapa Center',
    status: 'PENDING',
    contactStatus: 'NOT_CONTACTED',
    serviceId: 'classic-flight',
    serviceName: 'Classic Paragliding Flight',
    servicePrice: 1900000,
    numberOfPassengers: 2,
    passengers: [],
    selectedOptions: ['drone'],
    optionalServicesTotal: 300000,
    price: 4100000,
    discountPerPerson: 50000,
    pickupLocation: 'Hotel de la Coupole',
    preferredTime: '08:00',
    flightDate: '2024-12-20',
    flightTime: '08:00',
    flightDateUtc: new Date('2024-12-20T00:00:00Z'),
    source: 'website',
    createdAt: new Date('2024-12-01T02:00:00Z'),
    updatedAt: new Date('2024-12-01T02:00:00Z')
  },
  {
    id: 'BID_000002_20240102_090000',
    bookingId: 'BID_000002_20240102_090000',
    customerName: 'Bao Nguyen',
    email: 'bao@example.com',
    phone: '+84881234567',
    location: 'Fansipan cable station',
    status: 'CONFIRMED',
    contactStatus: 'CONTACTED',
    serviceId: 'vip-flight',
    serviceName: 'VIP Paragliding',
    servicePrice: 2500000,
    numberOfPassengers: 1,
    passengers: [],
    selectedOptions: ['camera360'],
    optionalServicesTotal: 500000,
    price: 3000000,
    discountPerPerson: 0,
    pickupLocation: 'Hotel BB Sapa',
    preferredTime: '10:00',
    flightDate: '2024-12-22',
    flightTime: '10:00',
    flightDateUtc: new Date('2024-12-22T00:00:00Z'),
    source: 'website',
    createdAt: new Date('2024-12-02T03:00:00Z'),
    updatedAt: new Date('2024-12-05T05:00:00Z')
  },
  {
    id: 'BID_000003_20240103_150000',
    bookingId: 'BID_000003_20240103_150000',
    customerName: 'Minh Pham',
    email: 'minh@example.com',
    phone: '+84771234567',
    location: 'Muong Hoa valley',
    status: 'COMPLETED',
    contactStatus: 'CONTACTED',
    serviceId: 'sunset-flight',
    serviceName: 'Sunset Experience',
    servicePrice: 2100000,
    numberOfPassengers: 3,
    passengers: [],
    selectedOptions: ['drone', 'camera360'],
    optionalServicesTotal: 800000,
    price: 6700000,
    discountPerPerson: 70000,
    pickupLocation: 'Silk Path Grand',
    preferredTime: '16:30',
    flightDate: '2024-12-15',
    flightTime: '16:30',
    flightDateUtc: new Date('2024-12-15T00:00:00Z'),
    source: 'website',
    createdAt: new Date('2024-11-28T08:00:00Z'),
    updatedAt: new Date('2024-12-16T09:00:00Z')
  }
]);

print('MongoDB initialization completed successfully!');
