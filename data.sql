CREATE DATABASE IF NOT EXISTS todo;
USE todo;
DROP TABLE IF EXISTS kegiatan;

CREATE TABLE kegiatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    completed TINYINT(1) DEFAULT 0,
    date DATE DEFAULT NULL,
    notification_time DATETIME DEFAULT NULL,
    image LONGTEXT DEFAULT NULL,
    type ENUM('personal', 'shared') DEFAULT 'personal'
);

-- 4. Memasukkan Dummy Data (Data Tiruan)
INSERT INTO todos (title, priority, completed, date, type) VALUES
('Mengerjakan tugas PWEB', 'High', 0, '2026-06-10', 'personal'),
('Membeli kebutuhan kos', 'Medium', 1, '2026-06-05', 'personal'),
('Bermain futsal', 'Low', 0, '2026-06-12', 'shared'),
('Diskusi mengenai tugas akhir', 'High', 0, '2026-06-15', 'shared'),
('Membuat dokumentasi sistem backend', 'Medium', 0, '2026-06-20', 'shared');