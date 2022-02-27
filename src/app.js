// import statements
import { desktopCapturer, remote } from 'electron';
const { writeFile } = require('fs');
const { dialog, Menu } = remote;

// Buttons
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// Get the available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );


    videoOptionsMenu.popup();
}


let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

// Change the videoSource window to record
async function selectSource(source) {

    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    // Preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

// startBtn function
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

// stopBtn function
stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};


// Captures all recorded chunks
function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({

        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}