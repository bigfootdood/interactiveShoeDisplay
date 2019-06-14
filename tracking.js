const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d');
const box = document.getElementById('mainContainer');
var imageElement = document.getElementById('guy');
let video;
let net;
let pointerX = 0;
let pointerY = 0;

let pointer = new Image();
pointer.src = 'assets/cursor.png';

var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

console.log("width:" + box.style.width)


async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }
    const video = document.getElementById('videoElement');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
        },
    });

    video.width = video.videoWidth;
    video.height = video.videoHeight;
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}



function render(video, net) {
    async function detect() {
        //capture current frame's pose
        const pose = await net.estimatePoses(video, {
            flipHorizontal: false,
            maxPoseDetections: 2,
            scoreThreshold: 0.6,
            nmsRadius: 20
        })
        //Check if there is a person present
        if (pose[0]) {
            //hide Logo page
            document.getElementById("coverPage").style.display = "none";
            //update pointer coords
            pointerX = pose[0].keypoints[10].position.x;
            pointerY = pose[0].keypoints[10].position.y;
            await animateHands();
        } else {
            //show logo page
            document.getElementById("coverPage").style.display = "block";
            console.log("NOT IN FIELD OF VIEW");
            //clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(detect);
    }
    detect();
}


async function animateHands() {
    //clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    //draw circle
    context.beginPath();
    context.arc(pointerX, pointerY, 15, 0, 2 * Math.PI);
    context.stroke();
    context.fillStyle = "blue";
    context.fill();
    selectBoxes();
}

function selectBoxes() {
    var thirdWidth = canvas.width / 3;
    var fourthHeight = canvas.height / 4;

    if (pointerY < fourthHeight) {
        console.log("TOP");
        if (pointerX < thirdWidth) {
            console.log("RIGHT");
            shoeSelection(3);
        } else if (pointerX > thirdWidth && pointerX < (canvas.width - thirdWidth)) {
            console.log("MIDDLE");
            shoeSelection(2);
        } else {
            console.log("LEFT");
            shoeSelection(1);
        }
    } else if (pointerY > (canvas.height - fourthHeight)) {
        console.log("BOTTOM")
        if (pointerX < thirdWidth) {
            console.log("RIGHT");
            shoeSelection(6);
        } else if (pointerX > thirdWidth && pointerX < (canvas.width - thirdWidth)) {
            console.log("MIDDLE");
            shoeSelection(5);
        } else {
            console.log("LEFT");
            shoeSelection(4);
        }
    }
}

//animate shoe then trigger corresponding QR code
function shoeSelection(shoe) {
    console.log("SHOE :" + shoe)

    //jiggle selected shoe
    let shoeElem = document.getElementById("airmax" + shoe);
    shoeElem.style.WebkitAnimation = "shake 0.82s cubic-bezier(.36,.07,.19,.97) both";

    //refesh element for further animation
    var newElem = shoeElem;
    var newone = shoeElem.cloneNode(true);
    shoeElem.parentNode.replaceChild(newone, shoeElem);

    //update shoe QR code

}


async function main() {
    video = await loadVideo();
    const net = await posenet.load();
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    canvas.height = video.height;
    canvas.width = video.width;
    // document.getElementsByClassName('mainContainer').setAttribute("style","width: 1280px");
    render(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

main();
