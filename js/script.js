let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/spotify_clone/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    // let tds = div.getElementsByTagName("td")
    // console.log(tds)
    let as = div.getElementsByTagName("a")
    // console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // songs.push(element.href)
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        // songUL.innerHTML = songUL.innerHTML + song;
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Sanyu</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div> </li>`;
    }

    //attact an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        // console.log(e.getElementsByTagName("div")[0])
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/spotify_clone/songs/" + track)
    // audio.play()
    currentSong.src = `/spotify_clone/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/spotify_clone/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get metadata of the folders
            let a = await fetch(`http://127.0.0.1:3000/spotify_clone/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#000000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/spotify_clone/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    });
}

async function main() {

    //get the list of all songs
    await getSongs("songs/ncs")
    // console.log(songs)
    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums()

    //play the first song
    //First we have to interact with the document then only audio will be played

    // var audio = new Audio(songs[0])
    // audio.play()

    // audio.addEventListener("loadeddata", () => {
    //     // let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    // });

    //attach an event listener to play, previous, next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add event lostener to previou and next
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to: ", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()