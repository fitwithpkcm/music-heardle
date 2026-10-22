CREATE TABLE IF NOT EXISTS picture_puzzles (id INT AUTO_INCREMENT PRIMARY KEY, movie VARCHAR(255) NOT NULL, aliases JSON NOT NULL, image_url VARCHAR(600) NOT NULL, mobile_image_url VARCHAR(600) NULL);

INSERT INTO picture_puzzles (movie, aliases, image_url, mobile_image_url)
SELECT 'In Ghost House Inn', JSON_ARRAY('In Ghost House', 'Ghost House Inn'), '/picture-clues/scene-001.png', '/picture-clues/scene-001-mobile-v2.png'
WHERE NOT EXISTS (SELECT 1 FROM picture_puzzles WHERE image_url = '/picture-clues/scene-001.png');
