// // ============================================================
// // IMAGE UPLOAD PREDICTION
// // ============================================================

// const imageInput =
//     document.getElementById("imageInput");

// const submitButton =
//     document.getElementById("submitButton");

// const imagePreview =
//     document.getElementById("imagePreview");

// const uploadMudra =
//     document.getElementById("uploadMudra");

// const uploadConfidence =
//     document.getElementById("uploadConfidence");


// imageInput.addEventListener(
//     "change",
//     function () {

//         const file =
//             imageInput.files[0];

//         if (!file) {
//             return;
//         }

//         const imageURL =
//             URL.createObjectURL(file);

//         imagePreview.src =
//             imageURL;

//         imagePreview.style.display =
//             "block";
//     }
// );


// submitButton.addEventListener(
//     "click",
//     async function () {

//         const file =
//             imageInput.files[0];

//         if (!file) {

//             alert(
//                 "Please choose an image first."
//             );

//             return;
//         }

//         uploadMudra.textContent =
//             "PREDICTING...";

//         uploadConfidence.textContent =
//             "--";


//         const formData =
//             new FormData();

//         formData.append(
//             "file",
//             file
//         );


//         try {

//             const response =
//                 await fetch(
//                     "/predict",
//                     {
//                         method: "POST",
//                         body: formData
//                     }
//                 );


//             const result =
//                 await response.json();


//             uploadMudra.textContent =
//                 result.mudra.toUpperCase();


//             uploadConfidence.textContent =
//                 result.confidence + "%";


//         } catch (error) {

//             console.error(error);

//             uploadMudra.textContent =
//                 "ERROR";

//             uploadConfidence.textContent =
//                 "Prediction failed.";
//         }
//     }
// );

// // ============================================================
// // LIVE CAMERA
// // ============================================================

// const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");

// const liveMudra = document.getElementById("liveMudra");
// const liveConfidence = document.getElementById("liveConfidence");

// let cameraStream = null;
// let liveRunning = false;
// let processingFrame = false;

// let processing = false;

// // ============================================================
// // MEDIAPIPE HAND CONNECTIONS
// // ============================================================

// const HAND_CONNECTIONS = [

//     // Thumb
//     [0, 1],
//     [1, 2],
//     [2, 3],
//     [3, 4],

//     // Index finger
//     [0, 5],
//     [5, 6],
//     [6, 7],
//     [7, 8],

//     // Middle finger
//     [0, 9],
//     [9, 10],
//     [10, 11],
//     [11, 12],

//     // Ring finger
//     [0, 13],
//     [13, 14],
//     [14, 15],
//     [15, 16],

//     // Little finger
//     [0, 17],
//     [17, 18],
//     [18, 19],
//     [19, 20],

//     // Palm
//     [5, 9],
//     [9, 13],
//     [13, 17]
// ];


// // ============================================================
// // START CAMERA
// // ============================================================

// async function startCamera() {

//     try {

//         cameraStream = await navigator.mediaDevices.getUserMedia({
//             video: {
//                 width: {
//                     ideal: 640
//                 },
//                 height: {
//                     ideal: 480
//                 },
//                 facingMode: "user"
//             },
//             audio: false
//         });

//         video.srcObject = cameraStream;

//         await video.play();

//         liveRunning = true;

//         requestAnimationFrame(processLiveFrame);

//     } catch (error) {

//         console.error(
//             "Camera error:",
//             error
//         );

//         liveMudra.textContent = "CAMERA ERROR";

//         liveConfidence.textContent = "";

//     }
// }


// // ============================================================
// // PROCESS LIVE FRAME
// // ============================================================

// async function processLiveFrame() {

//     if (!liveRunning) {
//         return;
//     }

//     // Keep processing only one request at a time
//     if (!processingFrame) {

//         processingFrame = true;

//         try {

//             // Make canvas same size as video
//             if (
//                 video.videoWidth > 0 &&
//                 video.videoHeight > 0
//             ) {

//                 canvas.width = video.videoWidth;
//                 canvas.height = video.videoHeight;

//             }

//             // Clear previous drawing
//             ctx.clearRect(
//                 0,
//                 0,
//                 canvas.width,
//                 canvas.height
//             );

//             // Capture current video frame
//             const frameCanvas =
//                 document.createElement("canvas");

//             frameCanvas.width =
//                 video.videoWidth;

//             frameCanvas.height =
//                 video.videoHeight;

//             const frameCtx =
//                 frameCanvas.getContext("2d");

//             frameCtx.drawImage(
//                 video,
//                 0,
//                 0,
//                 frameCanvas.width,
//                 frameCanvas.height
//             );

//             // Convert to JPEG
//             const blob =
//                 await new Promise(resolve => {

//                     frameCanvas.toBlob(
//                         resolve,
//                         "image/jpeg",
//                         0.75
//                     );

//                 });

//             const formData =
//                 new FormData();

//             formData.append(
//                 "file",
//                 blob,
//                 "frame.jpg"
//             );

//             // Send to backend
//             const response =
//                 await fetch(
//                     "/live_predict",
//                     {
//                         method: "POST",
//                         body: formData
//                     }
//                 );

//             if (!response.ok) {
//                 throw new Error(
//                     "Live prediction failed"
//                 );
//             }

//             const data =
//                 await response.json();

//             // Draw result
//             drawHandResult(data);

//         } catch (error) {

//             console.error(
//                 "Live prediction error:",
//                 error
//             );

//         } finally {

//             processingFrame = false;

//         }
//     }

//     // Continue loop
//     requestAnimationFrame(
//         processLiveFrame
//     );
// }


// // ============================================================
// // DRAW HAND RESULT
// // ============================================================

// function drawHandResult(data) {

//     // Clear canvas
//     ctx.clearRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );


//     // ========================================================
//     // NO HAND
//     // ========================================================

//     if (
//         !data.detected ||
//         !data.landmarks ||
//         data.landmarks.length !== 21
//     ) {

//         liveMudra.textContent =
//             "SHOW A MUDRA";

//         liveConfidence.textContent =
//             "--";

//         return;
//     }


//     // ========================================================
//     // UPDATE PREDICTION
//     // ========================================================

//     liveMudra.textContent =
//         data.mudra.toUpperCase();

//     liveConfidence.textContent =
//         `${data.confidence}%`;


//     // ========================================================
//     // SCALE FACTOR
//     // ========================================================

//     const scaleX =
//         canvas.width / video.videoWidth;

//     const scaleY =
//         canvas.height / video.videoHeight;


//     // ========================================================
//     // CONVERT LANDMARKS
//     // ========================================================

//     const points =
//         data.landmarks.map(point => {

//             return {
//                 x: point.x * scaleX,
//                 y: point.y * scaleY
//             };

//         });


//     // ========================================================
//     // DRAW FINGER / PALM CONNECTIONS
//     // ========================================================

//     ctx.lineWidth = 3;

//     ctx.lineCap = "round";

//     ctx.lineJoin = "round";

//     ctx.strokeStyle = "#00ff66";

//     for (
//         const connection of HAND_CONNECTIONS
//     ) {

//         const start =
//             points[connection[0]];

//         const end =
//             points[connection[1]];

//         if (!start || !end) {
//             continue;
//         }

//         ctx.beginPath();

//         ctx.moveTo(
//             start.x,
//             start.y
//         );

//         ctx.lineTo(
//             end.x,
//             end.y
//         );

//         ctx.stroke();
//     }


//     // ========================================================
//     // DRAW LANDMARK POINTS
//     // ========================================================

//     for (const point of points) {

//         ctx.beginPath();

//         ctx.arc(
//             point.x,
//             point.y,
//             5,
//             0,
//             Math.PI * 2
//         );

//         ctx.fillStyle = "#00ff66";

//         ctx.fill();

//         ctx.strokeStyle = "#ffffff";

//         ctx.lineWidth = 1.5;

//         ctx.stroke();
//     }


//     // ========================================================
//     // DRAW BOUNDING BOX
//     // ========================================================

//     if (data.bbox) {

//         const boxX =
//             data.bbox.x * scaleX;

//         const boxY =
//             data.bbox.y * scaleY;

//         const boxWidth =
//             data.bbox.width * scaleX;

//         const boxHeight =
//             data.bbox.height * scaleY;


//         ctx.strokeStyle = "#00ff66";

//         ctx.lineWidth = 3;

//         ctx.setLineDash([
//             8,
//             5
//         ]);

//         ctx.strokeRect(
//             boxX,
//             boxY,
//             boxWidth,
//             boxHeight
//         );

//         ctx.setLineDash([]);
//     }
// }


// // ============================================================
// // START CAMERA WHEN PAGE LOADS
// // ============================================================

// window.addEventListener(
//     "load",
//     () => {

//         startCamera();

//     }
// );


// // ============================================================
// // START CAMERA
// // ============================================================

// async function startCamera() {

//     try {

//         cameraStream =
//             await navigator.mediaDevices
//                 .getUserMedia({
//                     video: {
//                         width: 640,
//                         height: 480
//                     },
//                     audio: false
//                 });


//         video.srcObject =
//             cameraStream;


//         video.addEventListener(
//             "loadedmetadata",
//             function () {

//                 canvas.width =
//                     video.videoWidth;

//                 canvas.height =
//                     video.videoHeight;

//                 processFrame();
//             }
//         );


//     } catch (error) {

//         console.error(
//             "Camera error:",
//             error
//         );

//         liveMudra.textContent =
//             "CAMERA ERROR";

//         liveConfidence.textContent =
//             "Allow camera access.";
//     }
// }


// // ============================================================
// // DRAW HAND SKELETON
// // ============================================================

// const connections = [

//     [0, 1],
//     [1, 2],
//     [2, 3],
//     [3, 4],

//     [0, 5],
//     [5, 6],
//     [6, 7],
//     [7, 8],

//     [5, 9],
//     [9, 10],
//     [10, 11],
//     [11, 12],

//     [9, 13],
//     [13, 14],
//     [14, 15],
//     [15, 16],

//     [13, 17],
//     [17, 18],
//     [18, 19],
//     [19, 20],

//     [0, 17]
// ];


// function drawHand(landmarks, bbox) {

//     ctx.clearRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );


//     // ========================================================
//     // HAND CONNECTIONS / FINGER SKELETON
//     // ========================================================

//     ctx.lineWidth = 4;
//     ctx.strokeStyle = "#00ff66";
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";


//     for (const [start, end] of connections) {

//         const p1 = landmarks[start];
//         const p2 = landmarks[end];

//         if (!p1 || !p2) continue;

//         ctx.beginPath();

//         ctx.moveTo(
//             p1.x,
//             p1.y
//         );

//         ctx.lineTo(
//             p2.x,
//             p2.y
//         );

//         ctx.stroke();
//     }


//     // ========================================================
//     // LANDMARK POINTS
//     // ========================================================

//     ctx.fillStyle = "#ff0000";

//     for (const point of landmarks) {

//         ctx.beginPath();

//         ctx.arc(
//             point.x,
//             point.y,
//             5,
//             0,
//             Math.PI * 2
//         );

//         ctx.fill();
//     }


//     // ========================================================
//     // OUTER BOUNDING BOX
//     // ========================================================

//     if (bbox) {

//         ctx.strokeStyle = "#00ffff";
//         ctx.lineWidth = 3;

//         ctx.strokeRect(
//             bbox.x,
//             bbox.y,
//             bbox.width,
//             bbox.height
//         );
//     }
// }


// // ============================================================
// // PROCESS LIVE FRAME
// // ============================================================

// async function processFrame() {

//     if (
//         !video.videoWidth ||
//         !video.videoHeight
//     ) {

//         requestAnimationFrame(
//             processFrame
//         );

//         return;
//     }
    

//     if (!processing) {

//         processing = true;


//         try {

//             // ------------------------------------------------
//             // Capture current frame
//             // ------------------------------------------------

//             const frameCanvas =
//                 document.createElement(
//                     "canvas"
//                 );

//             frameCanvas.width =
//                 video.videoWidth;

//             frameCanvas.height =
//                 video.videoHeight;


//             const frameCtx =
//                 frameCanvas.getContext(
//                     "2d"
//                 );


//             frameCtx.drawImage(
//                 video,
//                 0,
//                 0,
//                 frameCanvas.width,
//                 frameCanvas.height
//             );


//             // ------------------------------------------------
//             // Convert to JPEG
//             // ------------------------------------------------

//             const blob =
//                 await new Promise(
//                     resolve =>
//                         frameCanvas.toBlob(
//                             resolve,
//                             "image/jpeg",
//                             0.75
//                         )
//                 );


//             const formData =
//                 new FormData();

//             formData.append(
//                 "file",
//                 blob,
//                 "frame.jpg"
//             );


//             // ------------------------------------------------
//             // Send to FastAPI
//             // ------------------------------------------------

//             const response =
//                 await fetch(
//                     "/live_predict",
//                     {
//                         method: "POST",
//                         body: formData
//                     }
//                 );


//             const result =
//                 await response.json();


//             // ------------------------------------------------
//             // Draw / display result
//             // ------------------------------------------------

//             if (result.detected) {

//                 drawHand(result.landmarks, result.bbox);


//                 liveMudra.textContent =
//                     result.mudra.toUpperCase();


//                 liveConfidence.textContent =
//                     result.confidence + "%";

//             } else {

//                 ctx.clearRect(
//                     0,
//                     0,
//                     canvas.width,
//                     canvas.height
//                 );


//                 liveMudra.textContent =
//                     "SHOW A MUDRA";


//                 liveConfidence.textContent =
//                     "--";
//             }


//         } catch (error) {

//             console.error(
//                 "Live prediction error:",
//                 error
//             );

//         } finally {

//             processing = false;
//         }
//     }


//     // Run continuously
//     requestAnimationFrame(
//         processFrame
//     );
// }


// // ============================================================
// // START
// // ============================================================

// startCamera();




































































































































// ============================================================
// BHARATIYA NATYA MUDRA RECOGNITION
// LIVE HAND TRACKING + MUDRA CLASSIFICATION
// ============================================================

import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";


// ============================================================
// IMAGE UPLOAD
// ============================================================

const imageInput =
    document.getElementById("imageInput");

const submitButton =
    document.getElementById("submitButton");

const imagePreview =
    document.getElementById("imagePreview");

const uploadMudra =
    document.getElementById("uploadMudra");

const uploadConfidence =
    document.getElementById("uploadConfidence");


imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    imagePreview.src =
        URL.createObjectURL(file);

    imagePreview.style.display = "block";
});


submitButton.addEventListener("click", async () => {

    const file = imageInput.files[0];

    if (!file) {

        alert("Please choose an image first.");

        return;
    }

    uploadMudra.textContent =
        "PREDICTING...";

    uploadConfidence.textContent =
        "--";

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    try {

        const response =
            await fetch(
                "/predict",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {
            throw new Error(
                "Prediction failed"
            );
        }

        const result =
            await response.json();

        uploadMudra.textContent =
            result.mudra.toUpperCase();

        uploadConfidence.textContent =
            result.confidence + "%";

    } catch (error) {

        console.error(error);

        uploadMudra.textContent =
            "ERROR";

        uploadConfidence.textContent =
            "Prediction failed.";
    }
});


// ============================================================
// LIVE CAMERA
// ============================================================

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const liveMudra =
    document.getElementById("liveMudra");

const liveConfidence =
    document.getElementById("liveConfidence");


let handLandmarker = null;

let cameraRunning = false;

let lastVideoTime = -1;

let lastClassificationTime = 0;

let classifying = false;


// ============================================================
// MEDIAPIPE INITIALIZATION
// ============================================================

async function initializeHandLandmarker() {

    liveMudra.textContent =
        "LOADING HAND MODEL...";

    liveConfidence.textContent =
        "--";


        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

    handLandmarker =
        await HandLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {

                    modelAssetPath:
                        "/hand_landmarker.task"
                },

                runningMode: "VIDEO",

                numHands: 1,

                minHandDetectionConfidence: 0.5,

                minHandPresenceConfidence: 0.5,

                minTrackingConfidence: 0.5
            }
        );


    liveMudra.textContent =
        "SHOW A MUDRA";

    console.log(
        "Browser Hand Landmarker ready."
    );
}


// ============================================================
// START CAMERA
// ============================================================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        width: {
                            ideal: 640
                        },

                        height: {
                            ideal: 480
                        },

                        facingMode: "user"
                    },

                    audio: false
                }
            );


        video.srcObject =
            stream;


        await video.play();


        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


        cameraRunning = true;


        requestAnimationFrame(
            processVideo
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        liveMudra.textContent =
            "CAMERA ERROR";

        liveConfidence.textContent =
            "Allow camera access.";
    }
}


// ============================================================
// PROCESS VIDEO
// ============================================================

async function processVideo() {

    if (
        !cameraRunning ||
        !handLandmarker
    ) {

        requestAnimationFrame(
            processVideo
        );

        return;
    }


    const now =
        performance.now();


    // --------------------------------------------------------
    // Detect only when a new video frame is available
    // --------------------------------------------------------

    if (
        video.currentTime !== lastVideoTime
    ) {

        lastVideoTime =
            video.currentTime;


        const result =
            handLandmarker.detectForVideo(
                video,
                now
            );


        drawHand(result);


        // ----------------------------------------------------
        // Classify periodically instead of every frame
        // ----------------------------------------------------

        if (
            result.landmarks &&
            result.landmarks.length > 0
        ) {

            if (
                now - lastClassificationTime > 150 &&
                !classifying
            ) {

                lastClassificationTime =
                    now;

                classifyHand(
                    result
                );
            }

        } else {

            liveMudra.textContent =
                "SHOW A MUDRA";

            liveConfidence.textContent =
                "--";
        }
    }


    requestAnimationFrame(
        processVideo
    );
}


// ============================================================
// DRAW HAND
// ============================================================

function drawHand(result) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        !result.landmarks ||
        result.landmarks.length === 0
    ) {

        return;
    }


    const landmarks =
        result.landmarks[0];


    // --------------------------------------------------------
    // MediaPipe hand connections
    // --------------------------------------------------------

    const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],

        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],

        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12],

        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16],

        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20],

        [5, 9],
        [9, 13],
        [13, 17]
    ];


    // --------------------------------------------------------
    // Draw skeleton
    // --------------------------------------------------------

    ctx.strokeStyle =
        "#00ff66";

    ctx.lineWidth =
        3;

    ctx.lineCap =
        "round";


    for (
        const [start, end]
        of connections
    ) {

        const p1 =
            landmarks[start];

        const p2 =
            landmarks[end];


        ctx.beginPath();

        ctx.moveTo(
            p1.x * canvas.width,
            p1.y * canvas.height
        );

        ctx.lineTo(
            p2.x * canvas.width,
            p2.y * canvas.height
        );

        ctx.stroke();
    }


    // --------------------------------------------------------
    // Draw landmarks
    // --------------------------------------------------------

    ctx.fillStyle =
        "#ffffff";

    ctx.strokeStyle =
        "#00ff66";

    ctx.lineWidth =
        2;


    for (
        const point
        of landmarks
    ) {

        const x =
            point.x * canvas.width;

        const y =
            point.y * canvas.height;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();
    }


    // --------------------------------------------------------
    // Bounding box from landmarks
    // --------------------------------------------------------

    const xs =
        landmarks.map(
            p => p.x * canvas.width
        );

    const ys =
        landmarks.map(
            p => p.y * canvas.height
        );


    const minX =
        Math.min(...xs);

    const maxX =
        Math.max(...xs);

    const minY =
        Math.min(...ys);

    const maxY =
        Math.max(...ys);


    const padding = 20;


    const x =
        Math.max(
            0,
            minX - padding
        );

    const y =
        Math.max(
            0,
            minY - padding
        );

    const width =
        Math.min(
            canvas.width - x,
            maxX - minX + padding * 2
        );

    const height =
        Math.min(
            canvas.height - y,
            maxY - minY + padding * 2
        );


    ctx.strokeStyle =
        "#00ff66";

    ctx.lineWidth =
        2;

    ctx.setLineDash([
        8,
        5
    ]);


    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    ctx.setLineDash([]);
}


// ============================================================
// CLASSIFY HAND
// ============================================================

async function classifyHand(result) {

    if (classifying) return;

    classifying = true;


    try {

        const landmarks =
            result.landmarks[0];


        // ----------------------------------------------------
        // Calculate hand bounding box
        // ----------------------------------------------------

        const xs =
            landmarks.map(
                p => p.x * video.videoWidth
            );

        const ys =
            landmarks.map(
                p => p.y * video.videoHeight
            );


        const minX =
            Math.min(...xs);

        const maxX =
            Math.max(...xs);

        const minY =
            Math.min(...ys);

        const maxY =
            Math.max(...ys);


        const padding = 40;


        const x1 =
            Math.max(
                0,
                Math.floor(minX - padding)
            );

        const y1 =
            Math.max(
                0,
                Math.floor(minY - padding)
            );

        const x2 =
            Math.min(
                video.videoWidth,
                Math.ceil(maxX + padding)
            );

        const y2 =
            Math.min(
                video.videoHeight,
                Math.ceil(maxY + padding)
            );


        const width =
            x2 - x1;

        const height =
            y2 - y1;


        if (
            width <= 0 ||
            height <= 0
        ) {

            return;
        }


        // ----------------------------------------------------
        // Create hand crop
        // ----------------------------------------------------

        const cropCanvas =
            document.createElement(
                "canvas"
            );


        cropCanvas.width =
            width;

        cropCanvas.height =
            height;


        const cropCtx =
            cropCanvas.getContext(
                "2d"
            );


        cropCtx.drawImage(
            video,
            x1,
            y1,
            width,
            height,
            0,
            0,
            width,
            height
        );


        // ----------------------------------------------------
        // Convert crop to blob
        // ----------------------------------------------------

        const blob =
            await new Promise(
                resolve =>
                    cropCanvas.toBlob(
                        resolve,
                        "image/jpeg",
                        0.85
                    )
            );


        if (!blob) return;


        const formData =
            new FormData();


        formData.append(
            "file",
            blob,
            "hand.jpg"
        );


        // ----------------------------------------------------
        // Send hand crop to CNN
        // ----------------------------------------------------

        const response =
            await fetch(
                "/predict",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "CNN prediction failed"
            );
        }


        const prediction =
            await response.json();


        liveMudra.textContent =
            prediction.mudra.toUpperCase();


        liveConfidence.textContent =
            prediction.confidence + "%";


    } catch (error) {

        console.error(
            "Classification error:",
            error
        );

    } finally {

        classifying = false;
    }
}


// ============================================================
// INITIALIZE
// ============================================================

async function initialize() {

    try {

        await initializeHandLandmarker();

        await startCamera();

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        liveMudra.textContent =
            "MODEL ERROR";

        liveConfidence.textContent =
            "--";
    }
}


initialize();