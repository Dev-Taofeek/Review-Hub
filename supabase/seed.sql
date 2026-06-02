-- =====================================================
-- ReviewHub Platform - Seed Data
-- =====================================================

-- Categories
INSERT INTO categories (id, name, slug, description, icon) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Electronics', 'electronics', 'Gadgets, devices, and tech accessories', '💻'),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Audio', 'audio', 'Headphones, speakers, and audio gear', '🎧'),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'Wearables', 'wearables', 'Smartwatches, fitness trackers', '⌚'),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'Gaming', 'gaming', 'Gaming peripherals and accessories', '🎮'),
  ('a1b2c3d4-0001-0001-0001-000000000005', 'Home & Kitchen', 'home-kitchen', 'Smart home devices and kitchen appliances', '🏠'),
  ('a1b2c3d4-0001-0001-0001-000000000006', 'Cameras', 'cameras', 'Digital cameras and photography accessories', '📷'),
  ('a1b2c3d4-0001-0001-0001-000000000007', 'Mobile', 'mobile', 'Smartphones and mobile accessories', '📱'),
  ('a1b2c3d4-0001-0001-0001-000000000008', 'Computers', 'computers', 'Laptops, desktops, and components', '🖥️');

-- Sample products (Note: In production these would be created by admin users)
-- The seed uses a placeholder UUID for created_by that should match a real admin user
INSERT INTO products (id, name, slug, description, brand, category_id, price, average_rating, total_reviews, is_active) VALUES
  (
    'b0000001-0000-0000-0000-000000000001',
    'Sony WH-1000XM5 Wireless Headphones',
    'sony-wh-1000xm5-wireless-headphones',
    'Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging.',
    'Sony',
    'a1b2c3d4-0001-0001-0001-000000000002',
    349.99,
    4.7,
    0,
    TRUE
  ),
  (
    'b0000002-0000-0000-0000-000000000002',
    'Apple MacBook Pro 14-inch M3',
    'apple-macbook-pro-14-m3',
    'Supercharged by M3 Pro or M3 Max. The most advanced pro notebook ever. Up to 22 hours battery life.',
    'Apple',
    'a1b2c3d4-0001-0001-0001-000000000008',
    1999.00,
    4.8,
    0,
    TRUE
  ),
  (
    'b0000003-0000-0000-0000-000000000003',
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra',
    'The ultimate Galaxy S24 experience. Built-in S Pen. 200MP camera. 5000mAh battery. Titanium frame.',
    'Samsung',
    'a1b2c3d4-0001-0001-0001-000000000007',
    1299.99,
    4.6,
    0,
    TRUE
  ),
  (
    'b0000004-0000-0000-0000-000000000004',
    'Logitech MX Master 3S Mouse',
    'logitech-mx-master-3s',
    'Advanced wireless mouse for performance. 8K DPI sensor. Quiet clicks. MagSpeed electromagnetic scrolling.',
    'Logitech',
    'a1b2c3d4-0001-0001-0001-000000000001',
    99.99,
    4.5,
    0,
    TRUE
  ),
  (
    'b0000005-0000-0000-0000-000000000005',
    'Apple Watch Series 9',
    'apple-watch-series-9',
    'Smarter. Brighter. More capable. The most advanced Apple Watch with S9 chip. Double Tap gesture.',
    'Apple',
    'a1b2c3d4-0001-0001-0001-000000000003',
    399.00,
    4.7,
    0,
    TRUE
  ),
  (
    'b0000006-0000-0000-0000-000000000006',
    'Sony PlayStation 5 DualSense Controller',
    'sony-ps5-dualsense-controller',
    'Experience haptic feedback and adaptive triggers. Built-in microphone array. USB-C charging.',
    'Sony',
    'a1b2c3d4-0001-0001-0001-000000000004',
    69.99,
    4.6,
    0,
    TRUE
  ),
  (
    'b0000007-0000-0000-0000-000000000007',
    'Dyson V15 Detect Absolute',
    'dyson-v15-detect-absolute',
    'Laser detects invisible dust. Piezo sensor scientifically validates your clean. 60 minutes run time.',
    'Dyson',
    'a1b2c3d4-0001-0001-0001-000000000005',
    749.99,
    4.4,
    0,
    TRUE
  ),
  (
    'b0000008-0000-0000-0000-000000000008',
    'Sony Alpha A7 IV Full-Frame Camera',
    'sony-alpha-a7-iv',
    '33MP full-frame BSI sensor. 4K 60fps video. Real-time Eye AF. 10fps continuous shooting.',
    'Sony',
    'a1b2c3d4-0001-0001-0001-000000000006',
    2499.99,
    4.8,
    0,
    TRUE
  );
