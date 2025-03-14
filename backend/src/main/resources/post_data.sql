INSERT INTO posts (title, content, image_url, country_id, created_by, created_at, updated_at, like_count, comment_count, view_count) VALUES
-- ✅ 최근 1일 이내 게시글 (일간)
('호주의 시드니 오페라하우스 방문기', '시드니의 대표적인 랜드마크에서 멋진 야경을 감상했습니다.', 'https://source.unsplash.com/400x300/?sydney,opera', 1, 1, NOW(), NOW(), 10, 5, 200),
('오스트리아 빈 숀브룬 궁전 탐방', '화려한 궁전과 정원이 어우러진 빈의 대표 명소.', 'https://source.unsplash.com/400x300/?vienna,palace', 2, 1, NOW(), NOW(), 8, 3, 150),

-- ✅ 최근 1주일 이내 게시글 (주간)
('브라질 리우데자네이루 해변 여행', '코파카바나 해변에서 브라질의 정열을 느껴보세요!', 'https://source.unsplash.com/400x300/?brazil,beach', 3, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW(), 15, 7, 320),
('캐나다 로키산맥 하이킹', '웅장한 로키산맥을 등반하며 자연을 만끽한 여행.', 'https://source.unsplash.com/400x300/?canada,rocky', 4, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), 12, 4, 180),

-- ✅ 최근 1개월 이내 게시글 (월간)
('중국 만리장성 투어', '세계 7대 불가사의 중 하나인 만리장성을 걸으며.', 'https://source.unsplash.com/400x300/?china,greatwall', 5, 1, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW(), 9, 2, 130),
('체코 프라하 구시가지 여행', '유럽의 보석, 프라하에서 즐긴 감성 여행.', 'https://source.unsplash.com/400x300/?prague,city', 6, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NOW(), 5, 2, 110),

-- ✅ 최근 1년 이내 게시글 (연간)
('이집트 피라미드 탐방', '기원전부터 이어진 피라미드와 스핑크스를 직접 보다.', 'https://source.unsplash.com/400x300/?egypt,pyramids', 7, 1, DATE_SUB(NOW(), INTERVAL 123 DAY), NOW(), 7, 1, 140),
('프랑스 파리 에펠탑 야경', '낭만적인 파리에서 에펠탑의 불빛을 감상한 밤.', 'https://source.unsplash.com/400x300/?paris,eiffel', 8, 1, DATE_SUB(NOW(), INTERVAL 65 DAY), NOW(), 9, 3, 190),
('독일 베를린 장벽 방문기', '독일 통일의 상징인 베를린 장벽을 직접 본 소감.', 'https://source.unsplash.com/400x300/?berlin,wall', 9, 1, DATE_SUB(NOW(), INTERVAL 89 DAY), NOW(), 4, 1, 95);