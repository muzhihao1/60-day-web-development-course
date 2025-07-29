---
title: "HTML5多媒体元素示例"
description: "HTML5音频、视频和响应式图片的完整实现示例"
category: "multimedia"
language: "html"
day: 3
concepts:
  - "视频嵌入"
  - "音频控制"
  - "响应式图片"
relatedTopics:
  - "媒体格式"
  - "性能优化"
---

# HTML5多媒体元素完整示例

## 视频播放器实现

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML5视频播放器</title>
    <style>
        .video-container {
            position: relative;
            max-width: 800px;
            margin: 0 auto;
        }
        
        video {
            width: 100%;
            height: auto;
            background: #000;
        }
        
        .video-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .play-pause {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        
        .progress-bar {
            flex: 1;
            height: 5px;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            position: relative;
        }
        
        .progress {
            height: 100%;
            background: #ff0000;
            width: 0%;
        }
        
        .time {
            color: white;
            font-size: 14px;
        }
        
        .volume-control {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .volume-slider {
            width: 80px;
        }
    </style>
</head>
<body>
    <div class="video-container">
        <video id="myVideo" 
               poster="video-poster.jpg"
               preload="metadata">
            <!-- 多格式支持 -->
            <source src="video.webm" type="video/webm">
            <source src="video.mp4" type="video/mp4">
            <source src="video.ogv" type="video/ogg">
            
            <!-- 字幕轨道 -->
            <track kind="subtitles" 
                   src="subtitles-zh.vtt" 
                   srclang="zh" 
                   label="中文" 
                   default>
            
            <track kind="subtitles" 
                   src="subtitles-en.vtt" 
                   srclang="en" 
                   label="English">
            
            <!-- 章节标记 -->
            <track kind="chapters" 
                   src="chapters.vtt" 
                   srclang="zh">
            
            <!-- 后备内容 -->
            <p>您的浏览器不支持HTML5视频。
               <a href="video.mp4">下载视频</a>。</p>
        </video>
        
        <!-- 自定义控制条 -->
        <div class="video-controls">
            <button class="play-pause" id="playPause">▶️</button>
            <div class="progress-bar" id="progressBar">
                <div class="progress" id="progress"></div>
            </div>
            <span class="time">
                <span id="currentTime">0:00</span> / 
                <span id="duration">0:00</span>
            </span>
            <div class="volume-control">
                <span>🔊</span>
                <input type="range" 
                       class="volume-slider" 
                       id="volume" 
                       min="0" 
                       max="100" 
                       value="50">
            </div>
            <button id="fullscreen">⛶</button>
        </div>
    </div>

    <script>
        const video = document.getElementById('myVideo');
        const playPause = document.getElementById('playPause');
        const progressBar = document.getElementById('progressBar');
        const progress = document.getElementById('progress');
        const currentTimeSpan = document.getElementById('currentTime');
        const durationSpan = document.getElementById('duration');
        const volumeSlider = document.getElementById('volume');
        const fullscreenBtn = document.getElementById('fullscreen');

        // 播放/暂停
        playPause.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPause.textContent = '⏸️';
            } else {
                video.pause();
                playPause.textContent = '▶️';
            }
        });

        // 更新进度条
        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = percent + '%';
            currentTimeSpan.textContent = formatTime(video.currentTime);
        });

        // 设置总时长
        video.addEventListener('loadedmetadata', () => {
            durationSpan.textContent = formatTime(video.duration);
        });

        // 点击进度条跳转
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        });

        // 音量控制
        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value / 100;
        });

        // 全屏
        fullscreenBtn.addEventListener('click', () => {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            }
        });

        // 格式化时间
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    </script>
</body>
</html>
```

## 音频播放器实现

```html
<div class="audio-player">
    <audio id="audioPlayer" preload="metadata">
        <source src="audio.mp3" type="audio/mpeg">
        <source src="audio.ogg" type="audio/ogg">
        <source src="audio.wav" type="audio/wav">
        <p>您的浏览器不支持HTML5音频。</p>
    </audio>
    
    <div class="audio-controls">
        <button class="play-btn" onclick="togglePlay()">
            <span class="play-icon">▶</span>
            <span class="pause-icon" style="display:none">⏸</span>
        </button>
        
        <div class="audio-info">
            <div class="track-name">音轨名称</div>
            <div class="progress-container">
                <span class="time-current">0:00</span>
                <div class="audio-progress">
                    <div class="audio-progress-filled"></div>
                </div>
                <span class="time-total">0:00</span>
            </div>
        </div>
        
        <div class="volume-container">
            <button class="mute-btn" onclick="toggleMute()">🔊</button>
            <input type="range" class="volume-slider" min="0" max="100" value="70">
        </div>
    </div>
</div>

<style>
.audio-player {
    background: #282828;
    border-radius: 8px;
    padding: 20px;
    color: white;
    max-width: 600px;
    margin: 20px auto;
}

.audio-controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.play-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #1db954;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
}

.audio-info {
    flex: 1;
}

.track-name {
    font-weight: bold;
    margin-bottom: 10px;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.audio-progress {
    flex: 1;
    height: 4px;
    background: #404040;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.audio-progress-filled {
    height: 100%;
    background: #1db954;
    border-radius: 2px;
    width: 0%;
}

.time-current, .time-total {
    font-size: 12px;
    color: #b3b3b3;
}

.volume-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.volume-slider {
    width: 100px;
}
</style>
```

## 响应式图片实现

```html
<!-- 基本响应式图片 -->
<img src="image-320w.jpg"
     srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1280w.jpg 1280w,
             image-1920w.jpg 1920w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            (max-width: 1280px) 1200px,
            1800px"
     alt="响应式图片示例">

<!-- Picture元素实现艺术指导 -->
<picture>
    <!-- WebP格式（现代浏览器） -->
    <source type="image/webp" 
            media="(min-width: 1200px)"
            srcset="hero-desktop.webp">
    
    <source type="image/webp" 
            media="(min-width: 768px)"
            srcset="hero-tablet.webp">
    
    <source type="image/webp"
            srcset="hero-mobile.webp">
    
    <!-- JPEG格式（后备） -->
    <source type="image/jpeg" 
            media="(min-width: 1200px)"
            srcset="hero-desktop.jpg">
    
    <source type="image/jpeg" 
            media="(min-width: 768px)"
            srcset="hero-tablet.jpg">
    
    <!-- 默认图片 -->
    <img src="hero-mobile.jpg" 
         alt="产品展示图"
         loading="lazy"
         decoding="async">
</picture>

<!-- 响应式背景图片 -->
<div class="hero-section">
    <h1>欢迎访问我们的网站</h1>
</div>

<style>
.hero-section {
    height: 50vh;
    background-image: url('hero-mobile.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (min-width: 768px) {
    .hero-section {
        background-image: url('hero-tablet.jpg');
    }
}

@media (min-width: 1200px) {
    .hero-section {
        background-image: url('hero-desktop.jpg');
        height: 70vh;
    }
}

/* 支持WebP的浏览器 */
.webp .hero-section {
    background-image: url('hero-mobile.webp');
}

@media (min-width: 768px) {
    .webp .hero-section {
        background-image: url('hero-tablet.webp');
    }
}

@media (min-width: 1200px) {
    .webp .hero-section {
        background-image: url('hero-desktop.webp');
    }
}
</style>
```

## 画廊实现示例

```html
<div class="gallery">
    <figure class="gallery-item">
        <picture>
            <source media="(min-width: 768px)" 
                    srcset="gallery-1-large.jpg">
            <img src="gallery-1-small.jpg" 
                 alt="画廊图片1"
                 loading="lazy">
        </picture>
        <figcaption>美丽的风景照片</figcaption>
    </figure>
    
    <figure class="gallery-item">
        <picture>
            <source media="(min-width: 768px)" 
                    srcset="gallery-2-large.jpg">
            <img src="gallery-2-small.jpg" 
                 alt="画廊图片2"
                 loading="lazy">
        </picture>
        <figcaption>城市夜景</figcaption>
    </figure>
    
    <!-- 更多图片... -->
</div>

<style>
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.gallery-item {
    margin: 0;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.gallery-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
}

.gallery-item:hover img {
    transform: scale(1.05);
}

.gallery-item figcaption {
    padding: 10px;
    background: #f5f5f5;
    text-align: center;
}
</style>
```

## 视频背景实现

```html
<section class="video-background-section">
    <video autoplay muted loop playsinline class="bg-video">
        <source src="background.mp4" type="video/mp4">
        <source src="background.webm" type="video/webm">
    </video>
    
    <div class="content-overlay">
        <h1>沉浸式视频背景</h1>
        <p>创造震撼的视觉体验</p>
        <button>了解更多</button>
    </div>
</section>

<style>
.video-background-section {
    position: relative;
    height: 100vh;
    overflow: hidden;
}

.bg-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    z-index: -1;
}

.content-overlay {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    background: rgba(0, 0, 0, 0.4);
}

.content-overlay h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.content-overlay button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #ff0000;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

/* 移动端优化：使用静态图片替代视频 */
@media (max-width: 768px) {
    .bg-video {
        display: none;
    }
    
    .video-background-section {
        background-image: url('mobile-bg.jpg');
        background-size: cover;
        background-position: center;
    }
}
</style>
```

这些示例展示了HTML5多媒体元素的完整实现，包括自定义控制、响应式设计和性能优化。