SET time_zone = "+00:00";
-- Create database schema for RSS Reader
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(191) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(191) NOT NULL,
    name VARCHAR(191),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rss_sources (
    id VARCHAR(191) PRIMARY KEY,
    feedly_id VARCHAR(191) UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    feed_url VARCHAR(500) NOT NULL,
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    last_fetched_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(191) PRIMARY KEY,
    user_id VARCHAR(191) NOT NULL,
    source_id VARCHAR(191) NOT NULL,
    priority ENUM('see_first', 'normal', 'see_less') DEFAULT 'normal',
    allow_noti BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES rss_sources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_source (user_id, source_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(191) PRIMARY KEY,
    source_id VARCHAR(191) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    content TEXT,
    summary TEXT,
    url VARCHAR(1000) NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMP,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES rss_sources(id) ON DELETE CASCADE,
    INDEX idx_published_at (published_at),
    INDEX idx_source_published (source_id, published_at)
);

CREATE TABLE IF NOT EXISTS user_interactions (
    id VARCHAR(191) PRIMARY KEY,
    user_id VARCHAR(191) NOT NULL,
    post_id VARCHAR(191) NOT NULL,
    interaction_type ENUM('read', 'like', 'bookmark') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_interaction (user_id, post_id, interaction_type)
);
