/**
* 1. Render songs
* 2. Scroll top
* 3. Play / pause / seek
* 4. CD rotate
* 5. Next / prev
* 6. Random
* 7. Next / repeat when embed
* 8. Active song
* 9. Scroll active song into view
* 10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelector.bind(document);

const PLAYER_STORAGE_KEY = 'SOUNDWAVE';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');
const volumeUp = $('.btn-volume-up');
const volumeMute = $('.btn-volume-mute');
const progressVolume = $('#volume');
const timeStart = $('.time-start');
const timeEnd = $('.time-end');

let randomSongs = [];

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    ischangeProgress: true,
    currentVolume: 1,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Già Cùng Nhau Là Được',
            singer: 'Tùng TeA, PC, TaynguyenSound',
            path: './audio/giacungnhauladuoc.mp3',
            image: './images/giacungnhauladuoc.jpg',
        },
        {
            name: 'Nếu Lúc Đó',
            singer: 'T.linh, 2pillz',
            path: './audio/neulucdo.mp3',
            image: './images/neulucdo.jpg',
        },
        {
            name: 'Cupid - Twin Ver',
            singer: 'FIFTY FIFTY',
            path: './audio/cupid.mp3',
            image: './images/cupid.jpg',
        },
        {
            name: 'Không Thể Say',
            singer: 'HIEUTHUHAI, Kewtiie',
            path: './audio/khongthesay.mp3',
            image: './images/khongthesay.jpg',
        },
        {
            name: 'Chuyện Đôi Ta (feat. Muộii)',
            singer: 'Emcee L (Da LAB), Muộii (Starry Night)',
            path: './audio/chuyendoita.mp3',
            image: './images/chuyendoita.jpg',
        },
        {
            name: 'Yêu Anh Đi Mẹ Anh Bán Bánh Mì',
            singer: 'Phuc Du',
            path: './audio/yeuanhdimeanhbanbanhmi.mp3',
            image: './images/yeuanhdimeanhbanbanhmi.jpg',
        },
        {
            name: 'Chìm Sâu',
            singer: 'RPT MCK, Trung Trần',
            path: './audio/chimsau.mp3',
            image: './images/chimsau.jpg',
        },
        {
            name: 'Haegeum',
            singer: 'Agust D',
            path: './audio/haegeum.mp3',
            image: './images/haegeum.jpg',
        },
        {
            name: 'Chúng Ta Của Hiện Tại',
            singer: 'Sơn Tùng M-TP',
            path: './audio/chungtacuahientai.mp3',
            image: './images/chungtacuahientai.jpg',
        },
        {
            name: 'Don\'t Côi',
            singer: 'RPT Orijinn, Ronboogz',
            path: './audio/dontcoi.mp3',
            image: './images/dontcoi.jpg',
        },
        {
            name: 'There\'s No One At All',
            singer: 'Sơn Tùng M-TP',
            path: './audio/therenooneatall.mp3',
            image: './images/therenooneatall.jpg',
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="options">
                        <i class="fas fa-ellipsis-h btn-option"></i>
                    </div>
                </div>
            `
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, // lặp vòng xoay vô cực
        });
        cdThumbAnimate.pause();

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                _this.isPlaying = false;
                audio.pause();
                player.classList.remove('playing');
                cdThumbAnimate.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (_this.ischangeProgress && audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;

                _this.startTimer(audio.currentTime);
                _this.endTimer();
                // lấy current progress
                _this.setConfig('lastProgress', audio.currentTime);
            }

        }

        // Xử lí khi tua song
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // xử lí khi mousedown progress
        progress.onmousedown = function () {
            _this.ischangeProgress = false;
        }

        // xử lí khi mouseup progress
        progress.onmouseup = function () {
            _this.ischangeProgress = true;
        }

        // Khi next song 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lí bật / tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí khi repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý auto click & repeat khi song ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click(); // auto click lên element nextBtn
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            const songOption = e.target.closest('.options');

            // Xử lí khi click vào song
            if (songNode && !songOption) {
                _this.currentIndex = Number(songNode.dataset.index); // cover sang number
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
            // Xử lí khi click vào options song
            if (songOption) {
                // thực hiện chức năng option
            }
        }

        // Xử lí khi click vào button volume
        // icon volume up
        volumeUp.onclick = function () {
            volumeUp.style.display = 'none';
            volumeMute.style.display = 'block';
            audio.volume = 0;
            progressVolume.value = 0;
        }
        // icon volume mute
        volumeMute.onclick = function () {
            volumeMute.style.display = 'none';
            volumeUp.style.display = 'block';
            audio.volume = 1;
            // progressVolume.value = 100;
            if (currentVolume === 0) {
                currentVolume = 1;
            }
            audio.volume = currentVolume;
            progressVolume.value = currentVolume * 100;
        }

        // xử lí khi click thay đổi tiến độ volume
        progressVolume.onclick = function (e) {
            audio.volume = progressVolume.value / 100;
            currentVolume = audio.volume;
        }

        // Xử lí khi người dùng giữ chuột để thay đổi volume pc
        progressVolume.onmousemove = function (e) { // sự kiện lăn chuột qua phần tử 
            audio.volume = progressVolume.value / 100;
            currentVolume = audio.volume;
            if (audio.volume === 0) {
                volumeUp.style.display = 'none';
                volumeMute.style.display = 'block';
            } else {
                volumeUp.style.display = 'block';
                volumeMute.style.display = 'none';
            }
        }

        // Xử lí khi người dùng ngón tay để thay đổi volume trên mobile
        progressVolume.ontouchmove = function (e) { // sự kiện di chuyển ngón tay trên điện thoại 
            audio.volume = progressVolume.value / 100;
            currentVolume = audio.volume;
            if (audio.volume === 0) {
                volumeUp.style.display = 'none';
                volumeMute.style.display = 'block';
            } else {
                volumeUp.style.display = 'block';
                volumeMute.style.display = 'none';
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => $('.active.song').scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        }), 200);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        // this.render();
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        if (randomSongs.length === this.songs.length.length) {
            randomSongs = [];
        }

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        randomSongs.push(newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    startTimer: function (e) {
        let startMinutes = Math.floor(e / 60);
        let startSeconds = Math.floor(e % 60);

        let displayStartMinutes = startMinutes < 10 ? '0' + startMinutes : startMinutes;
        let displayStartSeconds = startSeconds < 10 ? '0' + startSeconds : startSeconds;

        timeStart.textContent = displayStartMinutes + ' : ' + displayStartSeconds;
    },
    endTimer: function () {
        let endMinutes = Math.floor(audio.duration / 60);
        let endSeconds = Math.floor(audio.duration % 60);

        let displayEndMinutes = endMinutes < 10 ? '0' + endMinutes : endMinutes;
        let displayEndSeconds = endSeconds < 10 ? '0' + endSeconds : endSeconds;

        timeEnd.textContent = displayEndMinutes + ' : ' + displayEndSeconds;
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object 
        this.defineProperties();

        // Lắng nghe / xử lí các sự kiện (DOM events)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiện thị trạng thái ban đầu button repeat && button random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();
