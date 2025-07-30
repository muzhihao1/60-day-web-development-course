import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// ========== 自定义Hooks ==========

// useAudio - 音频控制Hook
const useAudio = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('播放失败:', error);
          setError('播放失败，请重试');
        });
      }
    }
  }, [isPlaying]);
  
  // 跳转到指定时间
  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  // 设置音量
  const changeVolume = useCallback((newVolume) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);
  
  // 静音切换
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);
  
  // 设置播放速度
  const changePlaybackRate = useCallback((rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);
  
  // 设置音频源
  const setAudioSource = useCallback((src) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setError(null);
    }
  }, []);
  
  // 事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      setIsLoading(false);
      setError('音频加载失败');
      console.error('Audio error:', e);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isLoading,
    error,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    setAudioSource
  };
};
// usePlaylist - 播放列表管理Hook
const usePlaylist = (initialSongs = []) => {
  const [songs, setSongs] = useState(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none', 'all', 'one'
  const [history, setHistory] = useState([]);
  const [queue, setQueue] = useState([]);
  
  // 获取当前歌曲
  const currentSong = useMemo(() => {
    if (queue.length > 0) {
      return queue[0];
    }
    return songs[currentIndex] || null;
  }, [songs, currentIndex, queue]);
  
  // 播放指定歌曲
  const playSong = useCallback((index) => {
    if (index >= 0 && index < songs.length) {
      setHistory(prev => [...prev, currentIndex]);
      setCurrentIndex(index);
    }
  }, [songs.length, currentIndex]);
  
  // 下一首
  const playNext = useCallback(() => {
    // 如果有队列，播放队列中的下一首
    if (queue.length > 0) {
      const [nextSong, ...restQueue] = queue;
      setQueue(restQueue);
      const songIndex = songs.findIndex(s => s.id === nextSong.id);
      if (songIndex !== -1) {
        playSong(songIndex);
      }
      return;
    }
    
    let nextIndex;
    
    if (repeat === 'one') {
      // 单曲循环，保持当前索引
      return;
    } else if (shuffle) {
      // 随机播放
      const availableIndices = Array.from(
        { length: songs.length },
        (_, i) => i
      ).filter(i => i !== currentIndex);
      
      if (availableIndices.length > 0) {
        nextIndex = availableIndices[
          Math.floor(Math.random() * availableIndices.length)
        ];
      } else {
        nextIndex = currentIndex;
      }
    } else {
      // 顺序播放
      nextIndex = currentIndex + 1;
      
      if (nextIndex >= songs.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          // 播放结束
          return;
        }
      }
    }
    
    playSong(nextIndex);
  }, [songs, currentIndex, shuffle, repeat, queue, playSong]);
  
  // 上一首
  const playPrevious = useCallback(() => {
    if (history.length > 0) {
      const prevIndex = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentIndex(prevIndex);
    } else {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        playSong(prevIndex);
      } else if (repeat === 'all') {
        playSong(songs.length - 1);
      }
    }
  }, [history, currentIndex, songs.length, repeat, playSong]);
  
  // 添加到队列
  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);
  
  // 从队列移除
  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // 清空队列
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  // 切换随机播放
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);
  
  // 切换循环模式
  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      switch (prev) {
        case 'none':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'none';
        default:
          return 'none';
      }
    });
  }, []);
  
  // 添加歌曲到播放列表
  const addSong = useCallback((song) => {
    setSongs(prev => [...prev, song]);
  }, []);
  
  // 移除歌曲
  const removeSong = useCallback((index) => {
    setSongs(prev => prev.filter((_, i) => i !== index));
    
    // 调整当前索引
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    } else if (index === currentIndex && currentIndex === songs.length - 1) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  }, [currentIndex, songs.length]);
  
  // 清空播放列表
  const clearPlaylist = useCallback(() => {
    setSongs([]);
    setCurrentIndex(0);
    setHistory([]);
    clearQueue();
  }, [clearQueue]);
  
  return {
    songs,
    currentSong,
    currentIndex,
    shuffle,
    repeat,
    queue,
    history,
    playSong,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    toggleRepeat,
    addSong,
    removeSong,
    clearPlaylist
  };
};
// useMediaSession - 媒体会话API Hook
const useMediaSession = (song, handlers) => {
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song) return;
    
    // 设置元数据
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.artwork ? [
        { src: song.artwork, sizes: '96x96', type: 'image/png' },
        { src: song.artwork, sizes: '128x128', type: 'image/png' },
        { src: song.artwork, sizes: '192x192', type: 'image/png' },
        { src: song.artwork, sizes: '256x256', type: 'image/png' },
        { src: song.artwork, sizes: '384x384', type: 'image/png' },
        { src: song.artwork, sizes: '512x512', type: 'image/png' }
      ] : []
    });
    
    // 设置操作处理器
    const actionHandlers = {
      play: handlers.onPlay,
      pause: handlers.onPause,
      previoustrack: handlers.onPrevious,
      nexttrack: handlers.onNext,
      seekbackward: () => handlers.onSeek(-10),
      seekforward: () => handlers.onSeek(10)
    };
    
    for (const [action, handler] of Object.entries(actionHandlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`不支持 "${action}" 操作`);
      }
    }
    
    return () => {
      // 清理
      for (const action of Object.keys(actionHandlers)) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // 忽略错误
        }
      }
    };
  }, [song, handlers]);
};
// useKeyboardShortcuts - 键盘快捷键Hook
const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 忽略输入框中的按键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.onPrevious();
          } else {
            handlers.onSeekBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.onNext();
          } else {
            handlers.onSeekForward();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlers.onVolumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.onVolumeDown();
          break;
        case 'm':
          e.preventDefault();
          handlers.onMute();
          break;
        case 's':
          e.preventDefault();
          handlers.onShuffle();
          break;
        case 'r':
          e.preventDefault();
          handlers.onRepeat();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
// useLyrics - 歌词同步Hook
const useLyrics = (lyricsUrl, currentTime) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLine, setCurrentLine] = useState(-1);
  
  // 解析LRC格式歌词
  const parseLyrics = useCallback((lrcText) => {
    const lines = lrcText.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const text = match[4].trim();
        
        const time = minutes * 60 + seconds + milliseconds / 1000;
        parsed.push({ time, text });
      }
    });
    
    return parsed.sort((a, b) => a.time - b.time);
  }, []);
  
  // 加载歌词
  useEffect(() => {
    if (!lyricsUrl) {
      setLyrics([]);
      return;
    }
    
    fetch(lyricsUrl)
      .then(res => res.text())
      .then(text => {
        const parsed = parseLyrics(text);
        setLyrics(parsed);
      })
      .catch(error => {
        console.error('加载歌词失败:', error);
        setLyrics([]);
      });
  }, [lyricsUrl, parseLyrics]);
  
  // 更新当前歌词行
  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentLine(-1);
      return;
    }
    
    let line = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        line = i;
      } else {
        break;
      }
    }
    
    setCurrentLine(line);
  }, [currentTime, lyrics]);
  
  return { lyrics, currentLine };
};
// ========== 组件 ==========

// 进度条组件
const ProgressBar = ({ currentTime, duration, onSeek }) => {
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleSeek(e);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSeek(e);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const time = percentage * duration;
    onSeek(time);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="progress-container">
      <span className="time current-time">{formatTime(currentTime)}</span>
      <div
        ref={progressRef}
        className="progress-bar"
        onMouseDown={handleMouseDown}
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="progress-handle"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <span className="time duration">{formatTime(duration)}</span>
    </div>
  );
};
// 音量控制组件
const VolumeControl = ({ volume, isMuted, onVolumeChange, onMute }) => {
  const volumeRef = useRef(null);
  
  const handleVolumeChange = (e) => {
    const rect = volumeRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newVolume = x / rect.width;
    onVolumeChange(newVolume);
  };
  
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };
  
  return (
    <div className="volume-control">
      <button onClick={onMute} className="volume-icon">
        {getVolumeIcon()}
      </button>
      <div
        ref={volumeRef}
        className="volume-bar"
        onClick={handleVolumeChange}
      >
        <div
          className="volume-fill"
          style={{ width: `${isMuted ? 0 : volume * 100}%` }}
        />
        <div
          className="volume-handle"
          style={{ left: `${isMuted ? 0 : volume * 100}%` }}
        />
      </div>
    </div>
  );
};
// 播放列表组件
const Playlist = ({ songs, currentIndex, onSongSelect, onRemove }) => {
  return (
    <div className="playlist">
      <h3>播放列表</h3>
      <div className="playlist-items">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={`playlist-item ${index === currentIndex ? 'active' : ''}`}
          >
            <div
              className="song-info"
              onClick={() => onSongSelect(index)}
            >
              <span className="song-index">{index + 1}</span>
              <img src={song.artwork} alt={song.title} />
              <div className="song-details">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <span className="song-duration">{song.duration}</span>
            </div>
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
// 歌词显示组件
const LyricsDisplay = ({ lyrics, currentLine }) => {
  const lyricsRef = useRef(null);
  
  useEffect(() => {
    if (currentLine >= 0 && lyricsRef.current) {
      const activeElement = lyricsRef.current.children[currentLine];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLine]);
  
  if (lyrics.length === 0) {
    return (
      <div className="lyrics-display empty">
        <p>暂无歌词</p>
      </div>
    );
  }
  
  return (
    <div className="lyrics-display" ref={lyricsRef}>
      {lyrics.map((line, index) => (
        <p
          key={index}
          className={`lyrics-line ${index === currentLine ? 'active' : ''}`}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
};
// ========== 主播放器组件 ==========
function MusicPlayer() {
  // 示例歌曲数据
  const sampleSongs = [
    {
      id: 1,
      title: '夜曲',
      artist: '周杰伦',
      album: '十一月的萧邦',
      duration: '3:46',
      url: '/music/song1.mp3',
      artwork: '/images/album1.jpg',
      lyrics: '/lyrics/song1.lrc'
    },
    {
      id: 2,
      title: '烟花易冷',
      artist: '周杰伦',
      album: '跨时代',
      duration: '4:22',
      url: '/music/song2.mp3',
      artwork: '/images/album2.jpg',
      lyrics: '/lyrics/song2.lrc'
    },
    {
      id: 3,
      title: '青花瓷',
      artist: '周杰伦',
      album: '我很忙',
      duration: '3:59',
      url: '/music/song3.mp3',
      artwork: '/images/album3.jpg',
      lyrics: '/lyrics/song3.lrc'
    }
  ];
  
  // Hooks
  const audio = useAudio();
  const playlist = usePlaylist(sampleSongs);
  const { lyrics, currentLine } = useLyrics(
    playlist.currentSong?.lyrics,
    audio.currentTime
  );
  
  // 显示模式
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  
  // 当歌曲改变时更新音频源
  useEffect(() => {
    if (playlist.currentSong) {
      audio.setAudioSource(playlist.currentSong.url);
      
      // 保存播放历史
      localStorage.setItem('lastPlayedSong', JSON.stringify({
        songId: playlist.currentSong.id,
        position: 0
      }));
    }
  }, [playlist.currentSong, audio.setAudioSource]);
  
  // 自动播放下一首
  useEffect(() => {
    const audioElement = audio.audioRef.current;
    if (!audioElement) return;
    
    const handleEnded = () => {
      if (playlist.repeat === 'one') {
        audio.seek(0);
        audio.togglePlay();
      } else {
        playlist.playNext();
      }
    };
    
    audioElement.addEventListener('ended', handleEnded);
    return () => audioElement.removeEventListener('ended', handleEnded);
  }, [audio, playlist]);
  
  // 媒体会话
  useMediaSession(playlist.currentSong, {
    onPlay: audio.togglePlay,
    onPause: audio.togglePlay,
    onPrevious: playlist.playPrevious,
    onNext: playlist.playNext,
    onSeek: (seconds) => audio.seek(audio.currentTime + seconds)
  });
  
  // 键盘快捷键
  useKeyboardShortcuts({
    onPlayPause: audio.togglePlay,
    onPrevious: playlist.playPrevious,
    onNext: playlist.playNext,
    onSeekBackward: () => audio.seek(Math.max(0, audio.currentTime - 10)),
    onSeekForward: () => audio.seek(Math.min(audio.duration, audio.currentTime + 10)),
    onVolumeUp: () => audio.changeVolume(Math.min(1, audio.volume + 0.1)),
    onVolumeDown: () => audio.changeVolume(Math.max(0, audio.volume - 0.1)),
    onMute: audio.toggleMute,
    onShuffle: playlist.toggleShuffle,
    onRepeat: playlist.toggleRepeat
  });
  
  // 恢复上次播放位置
  useEffect(() => {
    const lastPlayed = localStorage.getItem('lastPlayedSong');
    if (lastPlayed) {
      try {
        const { songId, position } = JSON.parse(lastPlayed);
        const songIndex = sampleSongs.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
          playlist.playSong(songIndex);
          setTimeout(() => {
            audio.seek(position);
          }, 100);
        }
      } catch (error) {
        console.error('恢复播放位置失败:', error);
      }
    }
  }, []);
  
  // 保存播放位置
  useEffect(() => {
    const interval = setInterval(() => {
      if (playlist.currentSong && audio.currentTime > 0) {
        localStorage.setItem('lastPlayedSong', JSON.stringify({
          songId: playlist.currentSong.id,
          position: audio.currentTime
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [playlist.currentSong, audio.currentTime]);
  
  const repeatIcons = {
    none: '🔁',
    all: '🔁',
    one: '🔂'
  };
  
  return (
    <div className="music-player">
      <audio ref={audio.audioRef} />
      
      <div className="player-main">
        {/* 专辑封面和信息 */}
        <div className="now-playing">
          {playlist.currentSong ? (
            <>
              <img
                src={playlist.currentSong.artwork}
                alt={playlist.currentSong.title}
                className="album-art"
              />
              <div className="song-info">
                <h2>{playlist.currentSong.title}</h2>
                <h3>{playlist.currentSong.artist}</h3>
                <p>{playlist.currentSong.album}</p>
              </div>
            </>
          ) : (
            <div className="no-song">
              <p>请选择一首歌曲</p>
            </div>
          )}
        </div>
        
        {/* 播放控制 */}
        <div className="player-controls">
          <ProgressBar
            currentTime={audio.currentTime}
            duration={audio.duration}
            onSeek={audio.seek}
          />
          
          <div className="control-buttons">
            <button
              onClick={playlist.toggleShuffle}
              className={`shuffle-btn ${playlist.shuffle ? 'active' : ''}`}
            >
              🔀
            </button>
            
            <button onClick={playlist.playPrevious} className="prev-btn">
              ⏮️
            </button>
            
            <button
              onClick={audio.togglePlay}
              className="play-pause-btn"
              disabled={!playlist.currentSong}
            >
              {audio.isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <button onClick={playlist.playNext} className="next-btn">
              ⏭️
            </button>
            
            <button
              onClick={playlist.toggleRepeat}
              className={`repeat-btn ${playlist.repeat !== 'none' ? 'active' : ''}`}
            >
              {repeatIcons[playlist.repeat]}
            </button>
          </div>
          
          <div className="extra-controls">
            <VolumeControl
              volume={audio.volume}
              isMuted={audio.isMuted}
              onVolumeChange={audio.changeVolume}
              onMute={audio.toggleMute}
            />
            
            <select
              value={audio.playbackRate}
              onChange={(e) => audio.changePlaybackRate(parseFloat(e.target.value))}
              className="playback-rate"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
            
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`lyrics-toggle ${showLyrics ? 'active' : ''}`}
            >
              📝
            </button>
            
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`playlist-toggle ${showPlaylist ? 'active' : ''}`}
            >
              📋
            </button>
          </div>
        </div>
        
        {/* 错误提示 */}
        {audio.error && (
          <div className="error-message">
            {audio.error}
          </div>
        )}
        
        {/* 加载提示 */}
        {audio.isLoading && (
          <div className="loading-indicator">
            加载中...
          </div>
        )}
      </div>
      
      {/* 侧边栏 */}
      <div className="player-sidebar">
        {showLyrics && (
          <LyricsDisplay
            lyrics={lyrics}
            currentLine={currentLine}
          />
        )}
        
        {showPlaylist && (
          <>
            <Playlist
              songs={playlist.songs}
              currentIndex={playlist.currentIndex}
              onSongSelect={playlist.playSong}
              onRemove={playlist.removeSong}
            />
            
            {playlist.queue.length > 0 && (
              <div className="play-queue">
                <h3>播放队列</h3>
                <div className="queue-items">
                  {playlist.queue.map((song, index) => (
                    <div key={`queue-${index}`} className="queue-item">
                      <span>{song.title} - {song.artist}</span>
                      <button
                        onClick={() => playlist.removeFromQueue(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={playlist.clearQueue}
                  className="clear-queue-btn"
                >
                  清空队列
                </button>
              </div>
            )}
            
            {playlist.history.length > 0 && (
              <div className="play-history">
                <h3>播放历史</h3>
                <p>已播放 {playlist.history.length} 首歌曲</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default MusicPlayer;