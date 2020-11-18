document.getElementById('startButton').onclick = start;
document.getElementById('stopButton').onclick = stop;

//for the meters to start displaying
const instantMeter = document.querySelector('#instant meter');
const slowMeter = document.querySelector('#slow meter');

//enable for audio value to be display
const instantValueDisplay = document.querySelector('#instant .value');
const slowValueDisplay = document.querySelector('#slow .value');

const constraints = window.constraints = {
    audio: true,
    video: false
};
let meterRefresh = null;

function handleSuccess(stream) {
    window.stream = stream;
    const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
    soundMeter.connectToSource(stream, function (e) {
        if (e) {
            alert(e);
            return;
        }
        meterRefresh = setInterval(() => {
            instantMeter.value = instantValueDisplay.innerText =
                soundMeter.instant.toFixed(2);
            slowMeter.value = slowValueDisplay.innerText =
                soundMeter.slow.toFixed(2);
        });
    });
}

function handleError(error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>getUserMedia error: ${error}</p>`;
  }
  

function start() {
    startButton.disabled = true;
    stopButton.disabled = false;

    try {
        const AudioC = window.AudioContext;
        window.audioContext = new AudioC();
    } catch (e) {
        alert('Web Audio API not supported.');
    }

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
}

function stop() {
    startButton.disabled = false;
    stopButton.disabled = true;

    clearInterval(meterRefresh);
    instantMeter.value = instantValueDisplay.innerText = '';
    slowMeter.value = slowValueDisplay.innerText = '';
    clipMeter.value = clipValueDisplay.innerText = '';
}

//SOUNDMETER

function SoundMeter(context) {
    this.context = context;
    this.instant = 0.0;
    this.slow = 0.0;
    this.script = context.createScriptProcessor(2048, 1, 1);
    const that = this;
    this.script.onaudioprocess = function (event) {
        const input = event.inputBuffer.getChannelData(0);
        let i;
        let sum = 0.0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        that.instant = Math.sqrt(sum / input.length);
        that.slow = 0.95 * that.slow + 0.05 * that.instant;
    };
}

SoundMeter.prototype.connectToSource = function (stream, callback) {
    try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        // necessary to make sample run, but should not be.
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
            callback(null);
        }
    } catch (e) {
        console.error(e);
        if (typeof callback !== 'undefined') {
            callback(e);
        }
    }
};

SoundMeter.prototype.stop = function () {
    console.log('SoundMeter stopping');
    this.mic.disconnect();
    this.script.disconnect();
};