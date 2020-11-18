document.querySelector('#hd').addEventListener('click', e => getHD(e));
document.querySelector('#vga').addEventListener('click', e => getVga(e));
document.querySelector('#qvga').addEventListener('click', e => getQvga(e));

async function getHD(e) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { exact: 1280 }, height: { exact: 720 } },
        });
        handleSuccess(stream);
        e.target.disabled = true;
    } catch (e) {
        handleError(e);
    }
}

async function getVga(e) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { exact: 640 }, height: { exact: 480 } },
        });
        handleSuccess(stream);
        e.target.disabled = true;
    } catch (e) {
        handleError(e);
    }
}

async function getQvga(e) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { exact: 320 }, height: { exact: 240 } },
        });
        handleSuccess(stream);
        e.target.disabled = true;
    } catch (e) {
        handleError(e);
    }
}

function handleSuccess(stream) {
    const video = document.querySelector('video');
    //const videoTracks = stream.getVideoTracks();
    //const label = videoTracks[0].label;
    window.stream = stream;
    video.srcObject = stream;
}

function handleError(error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>getUserMedia error: ${error}</p>`;
}

