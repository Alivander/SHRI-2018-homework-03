(function() {
  const video = document.querySelector(".video");
  const canvasFrequency = document.querySelector(".player");
  const canvasVolume = document.querySelector(".volume__scale");
  const interfaceColor = "rgb(34, 236, 255)";
  const interfaceColorRGBA = "rgba(34, 236, 255, 0.15)";

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
      .then(function(stream) {

        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream);
        }
        video.onloadedmetadata = function(e) {
          video.play();
        };

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const destination = audioContext.destination;
        const filter = audioContext.createBiquadFilter()
        const analyser = audioContext.createAnalyser();

        filter.type = "lowshelf";
        filter.frequency.value = 1000;
        filter.gain.value = 3;

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
          const canvasFrequencyContext = canvasFrequency.getContext("2d");
          const canvasVolumeContext = canvasVolume.getContext("2d");
          const barHeight = (canvasFrequency.height / bufferLength) * 2.5;
          const gradient = canvasVolumeContext.createLinearGradient(0, 0, canvasVolume.width, 0);
          const barMinWidth = 5;
          var barWidth;
          var y = 0;
          var volumeValue;

          canvasFrequencyContext.clearRect(0, 0, canvasFrequency.width, canvasFrequency.height);
          canvasVolumeContext.clearRect(0, 0, canvasFrequency.width, canvasFrequency.height);

          drawVisual = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          for (var i = 0; i < bufferLength; i++) {
            barWidth = dataArray[i] + barMinWidth;
            canvasFrequencyContext.fillStyle = interfaceColor;
            canvasFrequencyContext.fillRect(canvasFrequency.width - barWidth / 2, y, barWidth, barHeight);
            y += barHeight + 1;
          };


          volumeValue = Math.max.apply(Math, dataArray) / 2;
          gradient.addColorStop(0, interfaceColor);
          gradient.addColorStop(1, interfaceColorRGBA);
          canvasVolumeContext.fillStyle = gradient;
          canvasVolumeContext.fillRect(0, 0, volumeValue, canvasVolume.height);

        };

        draw();

        source.connect(filter);
        filter.connect(analyser);
        analyser.connect(destination);
      })
      .catch(function(err) {
        console.log("The following error occured: " + err);
      });
  } else {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  };
})();
