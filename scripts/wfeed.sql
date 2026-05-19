-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 19, 2026 at 04:50 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rss_reader_v2`
--

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` varchar(191) NOT NULL,
  `source_id` varchar(191) NOT NULL,
  `title` varchar(1000) NOT NULL,
  `content` text DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `url` varchar(1000) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `published_date` date GENERATED ALWAYS AS (cast(`published_at` as date)) STORED,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `source_id`, `title`, `content`, `summary`, `url`, `author`, `published_at`, `image_url`, `created_at`) VALUES
('06889249-60bc-4bea-b301-d512f542924d', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'NYC Health + Hospitals says hackers stole medical data and fingerprints during breach affecting at least 1.8 million people', 'The New York public healthcare system said hackers stole personal and medical data, and scans of biometrics — including fingerprints — in one of the largest recorded breaches of 2026.', 'The New York public healthcare system said hackers stole personal and medical data, and scans of biometrics — including fingerprints — in one of the largest recorded breaches of 2026.', 'https://techcrunch.com/2026/05/18/nyc-health-and-hospitals-says-hackers-stole-medical-data-and-fingerprints-during-breach-affecting-at-least-1-8-million-people/', 'Zack Whittaker', '2026-05-18 16:32:33', NULL, '2026-05-19 12:05:17'),
('14457a4d-f49a-4d97-b24a-e752384baed6', '161f5e17-76a5-49e2-be47-37617398bc5b', 'Have you ever had an imaginary friend? Watch this', NULL, '', 'https://www.youtube.com/watch?v=qLrnn24C3zU', 'TED-Ed', '2026-04-09 15:00:47', NULL, '2026-05-19 12:09:54'),
('159057e1-d37c-4b78-96a3-8bbe461ddc00', '161f5e17-76a5-49e2-be47-37617398bc5b', '3 grammar rules that you don’t need to follow anymore - Arika Okrent', NULL, '', 'https://www.youtube.com/watch?v=65I_1sgTMLE', 'TED-Ed', '2026-04-28 15:01:02', NULL, '2026-05-19 12:09:54'),
('16d5b0c0-015a-4a34-a5d8-156d4f3a09c8', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'If you’re giving a commencement speech in 2026, maybe don’t mention AI', 'It\'s tough to get graduating students excited about a future shaped by artificial intelligence.', 'It\'s tough to get graduating students excited about a future shaped by artificial intelligence.', 'https://techcrunch.com/2026/05/17/if-youre-giving-a-commencement-speech-in-2026-maybe-dont-mention-ai/', 'Anthony Ha', '2026-05-17 16:32:04', NULL, '2026-05-19 12:05:17'),
('1828a5d0-35f5-40cd-aeeb-1ada4692c333', '161f5e17-76a5-49e2-be47-37617398bc5b', 'War, love, and betrayal: The epic tale of the “Legend of the Condor Heroes” - Gladys Mac', NULL, '', 'https://www.youtube.com/watch?v=NEFmWclWiOw', 'TED-Ed', '2026-04-21 15:01:43', NULL, '2026-05-19 12:09:54'),
('19f52ccf-ef9f-4055-8235-2c2eb382951b', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Marketing operating system Nectar Social raises $30M Series A led by Menlo', 'AI-powered marketing platform Nectar Social announced Thursday that it raised a $30 million Series A round led by Menlo Ventures and its Anthology Fund, which was created alongside Anthropic.', 'AI-powered marketing platform Nectar Social announced Thursday that it raised a $30 million Series A round led by Menlo Ventures and its Anthology Fund, which was created alongside Anthropic.', 'https://techcrunch.com/2026/05/16/marketing-operating-system-nectar-social-raises-30m-series-a-in-round-led-by-menlo/', 'Dominic-Madori Davis', '2026-05-16 19:26:14', NULL, '2026-05-19 12:05:17'),
('28104d9f-70a4-4eff-9f72-912bae2574a0', '161f5e17-76a5-49e2-be47-37617398bc5b', 'Why Iceland\'s lava is so hard to control - Arianna Soldati', NULL, '', 'https://www.youtube.com/watch?v=8H--GLt3h8I', 'TED-Ed', '2026-05-07 15:01:07', NULL, '2026-05-19 12:09:54'),
('2981cc49-08dd-4114-8e7d-5cade8e985c5', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Research repository ArXiv will ban authors for a year if they let AI do all the work', 'ArXiv is doing more to crack down on the careless use of large language models in scientific papers.', 'ArXiv is doing more to crack down on the careless use of large language models in scientific papers.', 'https://techcrunch.com/2026/05/16/research-repository-arxiv-will-ban-authors-for-a-year-if-they-let-ai-do-all-the-work/', 'Anthony Ha', '2026-05-16 18:54:28', NULL, '2026-05-19 12:05:17'),
('35eb7f09-df11-4374-844f-870a439d591e', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Elon Musk has lost his lawsuit against Sam Altman and OpenAI', 'Elon Musk\'s claim that he was mistreated by his OpenAI co-founders failed after nine California jurors decided in a unanimous verdict that his lawsuits had been filed too late.', 'Elon Musk\'s claim that he was mistreated by his OpenAI co-founders failed after nine California jurors decided in a unanimous verdict that his lawsuits had been filed too late.', 'https://techcrunch.com/2026/05/18/elon-musk-has-lost-his-lawsuit-against-sam-altman-and-openai/', 'Tim Fernholz', '2026-05-18 17:34:43', NULL, '2026-05-19 12:05:17'),
('369e6cca-4406-4f39-add5-259c574db56f', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Amazon’s new Alexa+ powered feature can generate podcast episodes', 'Amazon’s Alexa+ can now generate custom AI podcasts on demand, as the company expands its assistant into a personalized AI content platform.', 'Amazon’s Alexa+ can now generate custom AI podcasts on demand, as the company expands its assistant into a personalized AI content platform.', 'https://techcrunch.com/2026/05/18/amazons-new-alexa-powered-feature-can-generate-podcast-episodes/', 'Lauren Forristal', '2026-05-18 14:56:47', NULL, '2026-05-19 12:05:17'),
('3894586c-78fd-4f62-ba8f-58a4b227a4d0', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Kin Health raises $9M to build an AI notetaker for patients', 'The app is similar to a meeting notetaker — you can record doctor visits, and it will return an AI summary of the meeting, with the next steps, all of which you share with family and friends if you want to.', 'The app is similar to a meeting notetaker — you can record doctor visits, and it will return an AI summary of the meeting, with the next steps, all of which you share with family and friends if you want to.', 'https://techcrunch.com/2026/05/18/kin-health-raises-9m-to-build-an-ai-notetaker-for-patients/', 'Ivan Mehta', '2026-05-18 15:26:00', NULL, '2026-05-19 12:05:17'),
('3af15942-e928-4418-b0d6-071b28a8a91b', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'South Korea’s LetinAR is building optics behind AI glasses', 'A lens the size of a thumbnail — and the South Korean startup that makes it — could become the optical backbone of the AI glasses era.', 'A lens the size of a thumbnail — and the South Korean startup that makes it — could become the optical backbone of the AI glasses era.', 'https://techcrunch.com/2026/05/18/south-koreas-letinar-is-building-the-optics-behind-ai-glasses/', 'Kate Park', '2026-05-18 11:00:00', NULL, '2026-05-19 12:05:17'),
('64fc5442-2433-4a62-8afe-dade28c67da9', '161f5e17-76a5-49e2-be47-37617398bc5b', 'What happens if you eat a silica gel packet? - Vivian Jiang', NULL, '', 'https://www.youtube.com/watch?v=QWCHnR53oIw', 'TED-Ed', '2026-03-31 15:00:30', NULL, '2026-05-19 12:09:54'),
('6c427cd4-b27f-4954-9511-d604e4ac5883', '161f5e17-76a5-49e2-be47-37617398bc5b', 'What is \"The Thinker\" actually thinking about? - Noah Charney', NULL, '', 'https://www.youtube.com/watch?v=dOqqBQ5Ha6Q', 'TED-Ed', '2026-04-14 15:01:06', NULL, '2026-05-19 12:09:54'),
('785886ec-fd33-43fb-bf8a-e1d277824b99', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Apple’s Siri revamp could include auto-deleting chats', 'Privacy will be a major theme when Apple unveils a new version of Siri.', 'Privacy will be a major theme when Apple unveils a new version of Siri.', 'https://techcrunch.com/2026/05/17/apples-siri-revamp-could-include-auto-deleting-chats/', 'Anthony Ha', '2026-05-17 20:15:00', NULL, '2026-05-19 12:05:17'),
('7adde700-9f18-4c64-8c1c-ee32b0da1b77', '161f5e17-76a5-49e2-be47-37617398bc5b', 'You’re invited to the masquerade. Do you dare attend? - Iseult Gillespie', NULL, '', 'https://www.youtube.com/watch?v=HdieAFhQtPo', 'TED-Ed', '2026-05-14 15:01:33', NULL, '2026-05-19 12:09:54'),
('86f958d5-0650-4718-8d12-bc0f85ba217c', '161f5e17-76a5-49e2-be47-37617398bc5b', 'Write every day, even if it’s terrible | Think Like A Musician', NULL, '', 'https://www.youtube.com/watch?v=2x3rJMBVB28', 'TED-Ed', '2026-04-23 15:00:33', NULL, '2026-05-19 12:09:54'),
('9500bd8c-b9e5-4c03-9ebd-f360cad96643', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'TechCrunch Mobility: The AI skills arms race is coming for automotive', 'Welcome back to TechCrunch Mobility — your central hub for news and insights on the future of transportation.', 'Welcome back to TechCrunch Mobility — your central hub for news and insights on the future of transportation.', 'https://techcrunch.com/2026/05/17/techcrunch-mobility-the-ai-skills-arms-race-is-coming-for-automotive/', 'Kirsten Korosec', '2026-05-17 16:05:00', NULL, '2026-05-19 12:05:17'),
('9df005f1-2538-4377-825b-b9f0c6cc709f', '161f5e17-76a5-49e2-be47-37617398bc5b', 'How do snakes swallow animals so much bigger than they are? - Niko Zlotnik', NULL, '', 'https://www.youtube.com/watch?v=m2BE9GZJJbs', 'TED-Ed', '2026-04-07 15:00:34', NULL, '2026-05-19 12:09:54'),
('9f17ccac-b4fd-44fe-adec-d2791fe677dc', '161f5e17-76a5-49e2-be47-37617398bc5b', 'The fascinating reason you loved peek-a-boo', NULL, '', 'https://www.youtube.com/watch?v=qKM4JzToM-A', 'TED-Ed', '2026-04-30 15:00:52', NULL, '2026-05-19 12:09:54'),
('a2b68482-62ef-4e29-86a1-2802ee4e2251', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'The haves and have-nots of the AI gold rush', 'The vibes around the current AI boom aren\'t great, even in the tech industry.', 'The vibes around the current AI boom aren\'t great, even in the tech industry.', 'https://techcrunch.com/2026/05/16/the-haves-and-have-nots-of-the-ai-gold-rush/', 'Anthony Ha', '2026-05-16 20:17:16', NULL, '2026-05-19 12:05:17'),
('a5d8540a-58bc-4d60-aa1e-8461149ef76c', '6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'Ship AI with Laravel: Real-Time Streaming Chat UI with Livewire', 'The agent\'s been talking to us through JSON. In this episode we build a real-time chat widget with Livewire, Alpine, and server-sent events so responses stream in word by word as the agent generates them. Same agent, same tools, just live. The post Ship AI with Laravel: Real-Time Streaming Chat UI with Livewire appeared first on Laravel News. Join the Laravel Newsletter to get all the latest Laravel articles like this directly in your inbox.', 'The agent\'s been talking to us through JSON. In this episode we build a real-time chat widget with Livewire, Alpine, and server-sent events so responses stream in word by word as the agent generates them. Same agent, same tools, just live. The post Ship AI with Laravel: Real-Time Streaming Chat UI with Livewire appeared first on Laravel News. Join the Laravel Newsletter to get Laravel articles like this directly in your inbox.', 'https://laravel-news.com/ship-ai-with-laravel-real-time-streaming-chat-ui-with-livewire?utm_medium=feed&utm_source=feedpress.me&utm_campaign=Feed%3A+laravelnews', 'Harris Raftopoulos', '2026-05-17 10:52:15', NULL, '2026-05-19 12:13:38'),
('a5ef42d9-f8f0-470f-90ac-17bce93d6508', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'For Eclipse, the $2.5B Cerebras win is just the start of realizing its physical-world thesis', 'Investing in the real world was lonely for Lior Susan 10 years ago. Now his firm finds itself at the center of the tech world\'s action.', 'Investing in the real world was lonely for Lior Susan 10 years ago. Now his firm finds itself at the center of the tech world\'s action.', 'https://techcrunch.com/2026/05/17/for-eclipse-the-2-5b-cerebras-win-is-just-the-start-of-realizing-its-physical-world-thesis/', 'Marina Temkin', '2026-05-17 15:00:00', NULL, '2026-05-19 12:05:17'),
('b4b0246c-214f-4022-a010-6103e03799c5', '161f5e17-76a5-49e2-be47-37617398bc5b', 'How did detectives solve the case of the bloody motel? - Theodore E. Yeshion', NULL, '', 'https://www.youtube.com/watch?v=P8OEz3PvWZQ', 'TED-Ed', '2026-05-05 15:01:09', NULL, '2026-05-19 12:09:54'),
('b54166b7-968d-4d1a-8d07-5f1cc19c80f7', '161f5e17-76a5-49e2-be47-37617398bc5b', 'The haunting history of the Paris Catacombs - Stephanie H. Smith', NULL, '', 'https://www.youtube.com/watch?v=ngarNTPMclE', 'TED-Ed', '2026-04-02 15:00:06', NULL, '2026-05-19 12:09:54'),
('b579014d-4259-4fd4-a4aa-28573858ec31', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Open source tool maker Grafana Labs says hackers stole its code, refuses to pay ransom', 'The open source project said hackers stole its codebase and threatened to publish its source code if the company did not pay.', 'The open source project said hackers stole its codebase and threatened to publish its source code if the company did not pay.', 'https://techcrunch.com/2026/05/18/open-source-tool-maker-grafana-labs-says-hackers-stole-its-code-refuses-to-pay-ransom/', 'Zack Whittaker', '2026-05-18 13:42:19', NULL, '2026-05-19 12:05:17'),
('b595da0d-3a6f-447a-8bf6-93e7ed25f3a4', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Anthropic has acquired the dev tools startup used by OpenAI, Google, and Cloudflare', 'Stainless, a New York-based startup, founded in 2022, rose to prominence in the emerging AI industry for automating the creation and maintenance of software development kits, or SDKs — the libraries developers use to interact with APIs.', 'Stainless, a New York-based startup, founded in 2022, rose to prominence in the emerging AI industry for automating the creation and maintenance of software development kits, or SDKs — the libraries developers use to interact with APIs.', 'https://techcrunch.com/2026/05/18/anthropic-has-acquired-the-dev-tools-startup-used-by-openai-google-and-cloudflare/', 'Kirsten Korosec', '2026-05-18 19:27:52', NULL, '2026-05-19 12:05:17'),
('b88a5402-20fb-46fe-93aa-8d398a649a68', '6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'Use a Google Sheet as Your Laravel Database with the Google Sheets Database Driver', 'Laravel Google Sheets Database Driver let\'s you register Google Sheets as a database connection, so Eloquent and migrations can read and write directly to a spreadsheet. The post Use a Google Sheet as Your Laravel Database with the Google Sheets Database Driver appeared first on Laravel News. Join the Laravel Newsletter to get all the latest Laravel articles like this directly in your inbox.', 'Laravel Google Sheets Database Driver let\'s you register Google Sheets as a database connection, so Eloquent and migrations can read and write directly to a spreadsheet. The post Use a Google Sheet as Your Laravel Database with the Google Sheets Database Driver appeared first on Laravel News. Join the Laravel Newsletter to get Laravel articles like this directly in your inbox.', 'https://laravel-news.com/use-a-google-sheet-as-your-laravel-database-with-the-google-sheets-database-driver?utm_medium=feed&utm_source=feedpress.me&utm_campaign=Feed%3A+laravelnews', 'Yannick Lyn Fatt', '2026-05-18 03:31:15', NULL, '2026-05-19 12:13:38'),
('ba38ac1e-f190-4742-9da7-a0d611e9ce1d', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Why trust is a big question at the Elon Musk-OpenAI trial', 'A big theme in the trial’s final days was whether OpenAI CEO Sam Altman is trustworthy.', 'A big theme in the trial’s final days was whether OpenAI CEO Sam Altman is trustworthy.', 'https://techcrunch.com/2026/05/17/why-trust-is-a-big-question-at-the-elon-musk-openai-trial/', 'Anthony Ha', '2026-05-17 19:46:34', NULL, '2026-05-19 12:05:17'),
('cc9188ba-8eac-4556-8df8-2cc8662b86bf', '6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'Frontend Nation 2026 Returns June 3-4 with Laravel in the Lineup', 'Frontend Nation 2026 is back June 3-4 as a free, two-day online event covering web development and AI. Laravel is named in the framework lineup, with Pascal Baljet, Steve McDougall, and Vishal Rajpurohit among the speakers. The post Frontend Nation 2026 Returns June 3-4 with Laravel in the Lineup appeared first on Laravel News. Join the Laravel Newsletter to get all the latest Laravel articles like this directly in your inbox.', 'Frontend Nation 2026 is back June 3-4 as a free, two-day online event covering web development and AI. Laravel is named in the framework lineup, with Pascal Baljet, Steve McDougall, and Vishal Rajpurohit among the speakers. The post Frontend Nation 2026 Returns June 3-4 with Laravel in the Lineup appeared first on Laravel News. Join the Laravel Newsletter to get Laravel articles like this directly in your inbox.', 'https://laravel-news.com/frontend-nation-2026-returns-june-3-4-with-laravel-in-the-lineup?utm_medium=feed&utm_source=feedpress.me&utm_campaign=Feed%3A+laravelnews', 'Eric L. Barnes', '2026-05-18 14:16:06', NULL, '2026-05-19 12:13:38'),
('d1586e00-9cb4-45fb-92c7-187f08c06d7f', '161f5e17-76a5-49e2-be47-37617398bc5b', 'How can you overcome writer’s block?', NULL, '', 'https://www.youtube.com/shorts/QRA1-6imP3s', 'TED-Ed', '2026-04-23 17:45:26', NULL, '2026-05-19 12:09:54'),
('d1fc71dc-4f8a-453f-a21d-9ea5abaa33ba', '161f5e17-76a5-49e2-be47-37617398bc5b', 'Why kids need to take more risks', NULL, '', 'https://www.youtube.com/watch?v=kRAl4Xgs_NU', 'TED-Ed', '2026-04-16 15:00:45', NULL, '2026-05-19 12:09:54'),
('d5c415f0-edbf-42ca-89f7-e000c9019955', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Theo Baker spent four years investigating Stanford. Before he leaves, here’s what he found.', '\"There\'s a common refrain among [young] people in this world that it\'s easier to raise money for a startup right now than to get an internship. Which is remarkable, right?\"', '\"There\'s a common refrain among [young] people in this world that it\'s easier to raise money for a startup right now than to get an internship. Which is remarkable, right?\"', 'https://techcrunch.com/2026/05/18/theo-baker-spent-four-years-investigating-stanford-before-he-leaves-heres-what-he-found/', 'Connie Loizos', '2026-05-19 05:50:49', NULL, '2026-05-19 12:05:17'),
('d943f60b-666f-4f15-a2ec-40d50a02dcfd', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'SandboxAQ brings its drug discovery models to Claude — no PhD in computing required', 'Other venture-backed companies like Chai Discovery and Isomorphic Labs have raced to build better models. SandboxAQ is betting that access is the bigger obstacle and that Claude solves it.', 'Other venture-backed companies like Chai Discovery and Isomorphic Labs have raced to build better models. SandboxAQ is betting that access is the bigger obstacle and that Claude solves it.', 'https://techcrunch.com/2026/05/18/sandboxaq-brings-its-drug-discovery-models-to-claude-no-phd-in-computing-required/', 'Lucas Ropek', '2026-05-18 21:29:31', NULL, '2026-05-19 12:05:17'),
('de62296e-b4d3-4c41-a6f5-7cc3a164c64c', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Stilta raises $10.5M from a16z and YC to help companies rediscover the patents they forgot they had', 'Stilta announced Tuesday a $10 million seed round led by Andreessen Horowitz. Other investors in the round include YC and operators from companies like OpenAI, Legora, and Lovable.', 'Stilta announced Tuesday a $10 million seed round led by Andreessen Horowitz. Other investors in the round include YC and operators from companies like OpenAI, Legora, and Lovable.', 'https://techcrunch.com/2026/05/19/legal-tech-announced-stilta-announces-10m-seed-backed-by-yc-and-a16z-months-after-launch/', 'Dominic-Madori Davis', '2026-05-19 12:00:00', NULL, '2026-05-19 12:05:17'),
('dfff172d-86d1-4152-951f-398a9d649495', '161f5e17-76a5-49e2-be47-37617398bc5b', 'The missing ingredient in how we learn', NULL, '', 'https://www.youtube.com/watch?v=mA1lnxfqHk8', 'TED-Ed', '2026-05-12 15:00:54', NULL, '2026-05-19 12:09:54'),
('e0d80fe1-476e-4fe5-adc4-3288625abd0f', '6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'Larapanda: A Type-Safe Lightpanda Browser SDK for Laravel', 'Larapanda wraps the Lightpanda headless browser in a type-safe Laravel SDK with named instance profiles, CLI/Docker runtime resolution, and adapters for the Laravel AI SDK and MCP server. The post Larapanda: A Type-Safe Lightpanda Browser SDK for Laravel appeared first on Laravel News. Join the Laravel Newsletter to get all the latest Laravel articles like this directly in your inbox.', 'Larapanda wraps the Lightpanda headless browser in a type-safe Laravel SDK with named instance profiles, CLI/Docker runtime resolution, and adapters for the Laravel AI SDK and MCP server. The post Larapanda: A Type-Safe Lightpanda Browser SDK for Laravel appeared first on Laravel News. Join the Laravel Newsletter to get Laravel articles like this directly in your inbox.', 'https://laravel-news.com/larapanda-a-type-safe-lightpanda-browser-sdk-for-laravel?utm_medium=feed&utm_source=feedpress.me&utm_campaign=Feed%3A+laravelnews', 'Paul Redmond', '2026-05-15 03:33:41', NULL, '2026-05-19 12:13:38'),
('e5e6d6bc-a827-4938-a8d3-8c2dd54a127d', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'OSHA probing worker death at SpaceX’s Starbase site', 'The death is the latest worker safety issue at the Starbase facility, which has a higher injury rate than all other SpaceX sites.', 'The death is the latest worker safety issue at the Starbase facility, which has a higher injury rate than all other SpaceX sites.', 'https://techcrunch.com/2026/05/18/osha-probing-worker-death-at-spacexs-starbase-site/', 'Sean O\'Kane', '2026-05-18 21:55:02', NULL, '2026-05-19 12:05:17'),
('fb9366b5-b9f3-497c-9ce1-fd71838f6ae1', '6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'Generate HTML Password Rules Attribute in Laravel 13.9.0', 'Laravel 13.9.0 adds a method to generate HTML passwordrules attributes from your Password validation rule, Cloud queue metrics, optional disk storage for large SQS payloads, Concurrency run timeouts, PendingDispatch conditionable support, and more. The post Generate HTML Password Rules Attribute in Laravel 13.9.0 appeared first on Laravel News. Join the Laravel Newsletter to get all the latest Laravel articles like this directly in your inbox.', 'Laravel 13.9.0 adds a method to generate HTML passwordrules attributes from your Password validation rule, Cloud queue metrics, optional disk storage for large SQS payloads, Concurrency run timeouts, PendingDispatch conditionable support, and more. The post Generate HTML Password Rules Attribute in Laravel 13.9.0 appeared first on Laravel News. Join the Laravel Newsletter to get Laravel articles like this directly in your inbox.', 'https://laravel-news.com/laravel-13-9-0?utm_medium=feed&utm_source=feedpress.me&utm_campaign=Feed%3A+laravelnews', 'Paul Redmond', '2026-05-14 13:31:21', NULL, '2026-05-19 12:13:38'),
('ff0a908b-e765-42ae-bcab-86e2e542fa9f', 'f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'Solar to dominate energy by 2035, but AI data centers will keep fossil fuels in business', 'Costs for solar panels are expected to drop another 30% in the coming decade, helping the tech cement its lead in energy markets.', 'Costs for solar panels are expected to drop another 30% in the coming decade, helping the tech cement its lead in energy markets.', 'https://techcrunch.com/2026/05/19/solar-to-dominate-energy-in-2035-but-data-centers-will-keep-fossil-fuels-in-business/', 'Tim De Chant', '2026-05-19 10:00:00', NULL, '2026-05-19 12:05:17');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `auth` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `push_subscriptions`
--

INSERT INTO `push_subscriptions` (`id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`) VALUES
(1, '3c49a946-ac29-4faa-b2b4-6bb7c6dd6f56', 'https://wns2-pn1p.notify.windows.com/w/?token=BQYAAAA5lUnrChZlbFKpqZ6q1Svinq0MhutTxN7Taft%2fB6zSS%2boQTSA6MMk27UvyRROrndd%2f9al2aWwhC629tAVDgWT0gZ%2f4aQ7jwtbGc8LYn4nfBJoXevCndLm%2bj66O3cGzCVeGZu7D%2fi6AwW6wrbVTa1EOepGIqyeg2OSUm8ZpPy8%2f0MCgT8B%2bwijxjajHeGFMrSTy5jvC2P2kzn%2fkwK0F5WCy4XPKtwoy8r7gBpDVSpi79pWKxzU5OtJOlC9LglpLO%2b8GRX1uJmBLz5kZ4NsJ1s3dInj7vJHtsSzYPSEOS10DNLV8WnKjvMy2DLQXovqs22%2fLBEEE%2baidS8lxMtAQ0fLl', 'BOMYx_xHdnb9qOqd2usQQ9oBm9QWaZkgne18og0Go6j--0sPXMHJh0OgXDwwjF7WVmiITrsx-dRNePJjiEKEd9Q', 'piJognF6_gS0HKNfsEB3BA', '2025-09-07 09:04:26');

-- --------------------------------------------------------

--
-- Table structure for table `rss_sources`
--

CREATE TABLE `rss_sources` (
  `id` varchar(191) NOT NULL,
  `feedly_id` varchar(191) DEFAULT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `feed_url` varchar(500) NOT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `is_top` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rss_sources`
--

INSERT INTO `rss_sources` (`id`, `feedly_id`, `title`, `description`, `website_url`, `feed_url`, `icon_url`, `is_top`, `created_at`) VALUES
('161f5e17-76a5-49e2-be47-37617398bc5b', 'feed/http://gdata.youtube.com/feeds/base/users/TEDEducation/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile', 'TED-Ed', 'ED-Ed’s commitment to creating lessons worth sharing is an extension of TED’s mission of spreading great ideas.', 'https://www.youtube.com/playlist?list=UUsooa4yRKGN_zEE8iknghZA', 'https://www.youtube.com/feeds/videos.xml?playlist_id=UUsooa4yRKGN_zEE8iknghZA', 'https://storage.googleapis.com/site-assets/zq9Ebx9IilzJgTaYheLKKvXxJG2Nhi1mojvCJ3CpMQE_sicon-1865bd2099c', 0, '2026-05-19 12:09:53'),
('6c17aac9-6bf7-4fd2-af38-24eef90fa280', 'feed/http://laravel-news.com/rss', 'Laravel News', 'Laravel News is the official blog of Laravel. Every day bringing you the latest news, tutorials, and packages for the framework.', 'https://laravel-news.com', 'http://laravel-news.com/rss', 'https://storage.googleapis.com/site-assets/4HSK2TCyFDhOT41qJ5-jCRhDmS46k3vwaLJxNpgQudQ_icon-1779362b294', 0, '2026-05-19 12:13:35'),
('e9b66c96-48f4-4203-8a39-c6232f747fd4', 'feed/http://blog.laravel.com/feed/', 'Laravel Blog', 'Laravel is a PHP web application framework with expressive, elegant syntax. We’ve already laid the foundation — freeing you to create without sweating the small things.', 'https://laravel.com/feed', 'http://blog.laravel.com/feed/', 'https://storage.googleapis.com/site-assets/v3XuR5tkP7gxwHjKU23z08qYam0lfRIdEKmv-7fF2iI_icon-16cc2a0ed99', 0, '2026-05-19 12:13:14'),
('f5aeacd8-1f6b-4b24-b283-7778c6d1b52f', 'feed/https://techcrunch.com/feed/', 'TechCrunch', 'TechCrunch • Reporting on the business of technology, startups, venture capital funding, and Silicon Valley', 'https://techcrunch.com/', 'https://techcrunch.com/feed/', 'https://storage.googleapis.com/site-assets/Xne8uW_IUiZhV1EuO2ZMzIrc2Ak6NlhGjboZ-Yk0rJ8_icon-18314434d99', 0, '2026-05-19 12:05:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `created_at`, `updated_at`) VALUES
('3c49a946-ac29-4faa-b2b4-6bb7c6dd6f56', 'waihtikelin279@gmail.com', '$2a$12$NBna3U/ST/4ex1.TpK9iAeQkgT0tKiWkzl0Tydihqqla9JmVtlTK6', 'Wai Htike Lin', '2025-07-27 08:14:02', '2025-07-27 08:14:02'),
('eea76c7e-b9da-4a4b-8837-be80de7ec2ef', 'waihtikelinjan@gmail.com', '$2a$12$s/HiWzJkwIq.vkSmFsD3.eLILENiTYWRNjZ3FMp/3wCa.mGw0yFBq', 'Wai', '2026-05-19 05:57:16', '2026-05-19 05:57:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_interactions`
--

CREATE TABLE `user_interactions` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `post_id` varchar(191) NOT NULL,
  `interaction_type` enum('read','like','bookmark') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `source_id` varchar(191) NOT NULL,
  `priority` enum('see_first','normal','see_less') DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_published_at` (`published_at`),
  ADD KEY `idx_source_published` (`source_id`,`published_at`),
  ADD KEY `idx_published_date` (`published_date`),
  ADD KEY `idx_top_source_date` (`source_id`,`published_date`);

--
-- Indexes for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_user_endpoint` (`user_id`,`endpoint`(255));

--
-- Indexes for table `rss_sources`
--
ALTER TABLE `rss_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `feedly_id` (`feedly_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_interaction` (`user_id`,`post_id`,`interaction_type`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_source` (`user_id`,`source_id`),
  ADD KEY `source_id` (`source_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `rss_sources` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD CONSTRAINT `user_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interactions_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`source_id`) REFERENCES `rss_sources` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
