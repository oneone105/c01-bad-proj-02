function openCvReady() {
    cv['onRuntimeInitialized'] = ()=>{
        const constraints = {
            audio: false,
            video: {
                width: 320,
                height: 240
            }
        }
        let video = document.getElementById('videoInput');
        navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("[Error]: " + err);
        });
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(videoInput);

        const FPS = 30;
        
        async function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            frame64 = getFrame()
            const res = await fetch('http://localhost:8000/stream',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({img: frame64})
            })
            prediction = await res.json();
            console.log(prediction)

            cv.imshow("canvasOutput", dst);
            // schedule next one.
            let delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }

        function getFrame() {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const data = canvas.toDataURL('image/jpeg');
            return data;
        }

        // schedule first one.
        setTimeout(processVideo, 0);
    };
}