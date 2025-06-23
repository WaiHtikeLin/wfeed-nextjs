-- Add isTop column to existing rss_sources table
ALTER TABLE rss_sources 
ADD COLUMN is_top BOOLEAN DEFAULT FALSE AFTER icon_url;

-- Add published_date column to existing posts table for better date querying
ALTER TABLE posts 
ADD COLUMN published_date DATE AS (DATE(published_at)) STORED AFTER published_at,
ADD INDEX idx_published_date (published_date),
ADD INDEX idx_top_source_date (source_id, published_date);

-- Mark the top 10 RSS sources
UPDATE rss_sources SET is_top = TRUE WHERE feedly_id IN (
    'feed/http://feeds.bbci.co.uk/news/rss.xml',
    'feed/http://rss.cnn.com/rss/edition.rss',
    'feed/https://feeds.reuters.com/reuters/topNews',
    'feed/https://feeds.apnews.com/rss/apf-topnews',
    'feed/https://www.theguardian.com/world/rss',
    'feed/https://techcrunch.com/feed/',
    'feed/http://feeds.arstechnica.com/arstechnica/index',
    'feed/https://hnrss.org/frontpage',
    'feed/https://www.wired.com/feed/rss',
    'feed/https://www.engadget.com/rss.xml'
);

-- Insert top sources if they don't exist
INSERT IGNORE INTO rss_sources (id, feedly_id, title, feed_url, website_url, icon_url, description, is_top) VALUES
('bbc-news', 'feed/http://feeds.bbci.co.uk/news/rss.xml', 'BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'https://www.bbc.com/news', 'https://static.files.bbci.co.uk/ws/simorgh-assets/public/news/images/metadata/poster-1024x576.png', 'Breaking news, sport, TV, radio and a whole lot more from the BBC', TRUE),
('cnn', 'feed/http://rss.cnn.com/rss/edition.rss', 'CNN', 'http://rss.cnn.com/rss/edition.rss', 'https://www.cnn.com', 'https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/cnn-logo.png', 'CNN.com delivers the latest breaking news and information', TRUE),
('reuters', 'feed/https://feeds.reuters.com/reuters/topNews', 'Reuters', 'https://feeds.reuters.com/reuters/topNews', 'https://www.reuters.com', 'https://www.reuters.com/pf/resources/images/reuters/reuters-default.png', 'Reuters, the news and media division of Thomson Reuters', TRUE),
('ap-news', 'feed/https://feeds.apnews.com/rss/apf-topnews', 'Associated Press', 'https://feeds.apnews.com/rss/apf-topnews', 'https://apnews.com', 'https://apnews.com/apple-touch-icon.png', 'The Associated Press is an independent global news organization', TRUE),
('guardian', 'feed/https://www.theguardian.com/world/rss', 'The Guardian', 'https://www.theguardian.com/world/rss', 'https://www.theguardian.com', 'https://assets.guim.co.uk/images/favicons/fee5e2d638d1c35f6d501fa397e53329/152x152.png', 'Latest news, sport and comment from the Guardian', TRUE),
('techcrunch', 'feed/https://techcrunch.com/feed/', 'TechCrunch', 'https://techcrunch.com/feed/', 'https://techcrunch.com', 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', 'Startup and Technology News', TRUE),
('ars-technica', 'feed/http://feeds.arstechnica.com/arstechnica/index', 'Ars Technica', 'http://feeds.arstechnica.com/arstechnica/index', 'https://arstechnica.com', 'https://cdn.arstechnica.net/favicon.ico', 'Technology news and analysis', TRUE),
('hacker-news', 'feed/https://hnrss.org/frontpage', 'Hacker News', 'https://hnrss.org/frontpage', 'https://news.ycombinator.com', 'https://news.ycombinator.com/favicon.ico', 'Hacker News RSS', TRUE),
('wired', 'feed/https://www.wired.com/feed/rss', 'Wired', 'https://www.wired.com/feed/rss', 'https://www.wired.com', 'https://www.wired.com/favicon.ico', 'Technology, science, culture and business news', TRUE),
('engadget', 'feed/https://www.engadget.com/rss.xml', 'Engadget', 'https://www.engadget.com/rss.xml', 'https://www.engadget.com', 'https://www.engadget.com/favicon.ico', 'Technology news and reviews', TRUE);
