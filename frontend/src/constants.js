export const DEFAULT_POSTER = '/default-book-cover.png';

export const FALLBACK_COLORS = [
  'cover-yellow', 'cover-blue', 'cover-cyan', 'cover-cream',
  'cover-gray', 'cover-pink', 'cover-purple', 'cover-orange',
];

export const STATUS_LABELS = {
  all: '전체 책',
  want: '읽고 싶은 책',
  reading: '읽는 중',
  stopped: '중단한 책',
  finished: '완독',
};

export const STATUS_ICONS = {
  all: '╱╱',
  want: '☆',
  reading: '▯',
  stopped: '↓',
  finished: '✓',
};

export const STATUS_LABEL_TO_API = {
  '읽고 싶은 책': 'want',
  '읽는 중': 'reading',
  '중단한 책': 'stopped',
  '완독': 'finished',
};

export const STATUS_API_TO_LABEL = {
  want: '읽고 싶은 책',
  reading: '읽는 중',
  stopped: '중단한 책',
  finished: '완독',
};

export const REVIEW_TAG_OPTIONS = [
  '감성적인', '몰입되는', '강렬한', '따뜻한', '먹먹한', '아름다운',
  '빠른 전개', '반전 있는', '긴장감 있는', '공감되는', '독특한', '잊히지 않는',
];

export const MOODS = [
  '몰입되는', '쉽게 읽히는', '강렬한', '중독적인', '감성적인', '따뜻한',
  '의미 있는', '독특한', '잊히지 않는', '아름다운', '신선한', '매력적인',
  '빠른 전개', '어두운', '먹먹한', '반전 있는', '긴장감 있는', '설레는',
  '공감되는', '솔직한',
];
