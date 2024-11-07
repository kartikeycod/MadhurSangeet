let currentSong = new Audio();
let songs;

function secondstoMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60); // Calculate the total minutes
    const remainingSeconds = Math.floor(seconds % 60); // Calculate the remaining seconds

    // Format minutes and seconds as two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return ${formattedMinutes}:${formattedSeconds}; // Return the formatted time
}

async function getSongs() {
    // Get all songs
    let response = await fetch("http://127.0.0.1:5500/exp.html");
    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let fullName = element.href.split("/").pop().replace(/%20/g, " ");
            // Remove the .mp3 extension
            let songTitle = fullName.replace(".mp3", "");
            songs.push(songTitle);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    const encodedTrack = encodeURIComponent(track.trim()); // Encode the track name for safe URL
    currentSong.src = "/songs/" + encodedTrack + ".mp3"; // Set the audio source
    console.log("Attempting to play:", currentSong.src); // Log the source for debugging

    if (!pause) {
        currentSong.play().catch(error => {
            console.error("Error playing the song:", error); // Log any playback errors
        });
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00";
}

async function main() {
    // Get the list of all songs
    songs = await getSongs();
    playMusic(songs[0], true); // Start playing the first song
    console.log(songs);

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div></div>
            </div>
            <div class="playnow">
                <img class="invert" src="play.svg" alt="">
                <span>Play Now</span>
            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    // Attach event listeners for play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Listen for time updates events
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = ${secondstoMinutesSeconds(currentSong.currentTime)}/${secondstoMinutesSeconds(currentSong.duration)};
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let seekbar = e.target;
        let seekPosition = (e.offsetX / seekbar.getBoundingClientRect().width) * currentSong.duration;
        
        // Update the current time of the song
        currentSong.currentTime = seekPosition;

        let percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
        // Update the position of the circle (seek handle)
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Add event listeners for hamburger and close buttons
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add event listeners for next and previous buttons
    let currentIndex = 0; // Track the current song index
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        currentIndex = (currentIndex - 1 + songs.length) % songs.length; // Decrement the index, wrapping around if necessary
        playMusic(songs[currentIndex]);
    });
    
    next.addEventListener("click", () => {
        console.log("Next clicked");
        currentIndex = (currentIndex + 1) % songs.length; // Increment the index, wrapping around if necessary
        playMusic(songs[currentIndex]);
    });

    // add event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

currentSong.volume=parseInt(e.target.value)/100;

    });
}

main();