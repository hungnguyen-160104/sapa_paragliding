// Get posts by category
export default defineEventHandler((event) => {
  const category = getRouterParam(event, 'category')

  // Mock data
  const allPosts = [
    {
      id: '1',
      title: 'Experience the Thrill of Paragliding in Sapa',
      titleVi: 'Trải Nghiệm Cảm Giác Bay Dù Lượn Tại Sapa',
      excerpt: 'Discover the breathtaking views of Sapa from above.',
      excerptVi: 'Khám phá khung cảnh ngoạn mục của Sapa từ trên cao.',
      image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
      author: 'Sapa Paragliding Team',
      date: '2024-11-01',
      category: 'Adventure',
      published: true
    },
    {
      id: '2',
      title: 'Safety Guidelines for First-Time Flyers',
      titleVi: 'Hướng Dẫn An Toàn Cho Người Bay Lần Đầu',
      excerpt: 'Everything you need to know before your first paragliding experience.',
      excerptVi: 'Mọi thứ bạn cần biết trước trải nghiệm bay dù lượn đầu tiên.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      author: 'Safety Team',
      date: '2024-10-28',
      category: 'Safety',
      published: true
    },
    {
      id: '3',
      title: 'Capturing Your Flight: Photography Tips',
      titleVi: 'Ghi Lại Chuyến Bay: Mẹo Chụp Ảnh',
      excerpt: 'Learn how to get the best photos and videos during your paragliding adventure.',
      excerptVi: 'Tìm hiểu cách chụp ảnh và quay video đẹp nhất trong chuyến phiêu lưu bay dù lượn của bạn.',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
      author: 'Media Team',
      date: '2024-10-25',
      category: 'Tips',
      published: true
    },
    {
      id: '4',
      title: 'Sapa Weather Guide for Paragliding',
      titleVi: 'Hướng Dẫn Thời Tiết Sapa Cho Bay Dù Lượn',
      excerpt: 'Understanding Sapa\'s weather patterns to plan your perfect paragliding day.',
      excerptVi: 'Hiểu về thời tiết Sapa để lên kế hoạch cho ngày bay dù lượn hoàn hảo.',
      image: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=800',
      author: 'Weather Team',
      date: '2024-10-20',
      category: 'Guide',
      published: true
    }
  ]

  const filteredPosts = allPosts.filter(
    post => post.category.toLowerCase() === (category as string).toLowerCase() && post.published
  )

  return {
    success: true,
    category,
    data: filteredPosts,
    total: filteredPosts.length
  }
})
