document.querySelector('#showVideo').addEventListener('click', e => init(e));

const constraints = window.constraints = {
  audio : true,
  video: true
};

function handleSuccess(stream) {
  const video = document.querySelector('video');
  //const videoTracks = stream.getVideoTracks();
  //const label = videoTracks[0].label;
  window.stream = stream;
  //console.log(label);
  video.srcObject = stream;
}

function handleError(error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>getUserMedia error: ${error}</p>`;
}

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
  }
}


