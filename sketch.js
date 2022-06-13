let img;
let facemesh_input;
let predictions_input = [];
let poseNet_input;
let poseNet_input_poses = [];
let facemesh_video;
let predictions_video = [];
let poseNet_video;
let poseNet_video_poses = [];
let sillhoutte_distance = [];
let video;
let button_flag = false;
let button;

function setup() {
  createCanvas(480, 640);

  img = createImg('images/lisa_2.jpg', imageReady);
  // img.size(384, 480);
  img.size(480, 480);
  img.hide(); 
  
  video = createCapture(VIDEO);
  video.size(480, 480);
  
  poseNet_video = ml5.poseNet(video);
  poseNet_video.on('pose', function(results) {
    poseNet_video_poses = results;
  });
  facemesh_video = ml5.facemesh(video);
  facemesh_video.on("predict", results => {
    predictions_video =  results;
  });
  video.hide()
  button = createButton("click me")
  button.position(220, 600)
  button.mousePressed(() => {
    console.log("hi")
  })
}

function draw() {
  background(255)
  image(video, 0, 0, 640, 480);
  drawInput(true, predictions_input, poseNet_input_poses)
  drawSilhouette(true, predictions_video, predictions_input, poseNet_video_poses, poseNet_input_poses)
}

function imageReady(){

  poseNet_input = ml5.poseNet(posemodelReady);
  poseNet_input.on('pose', function (results) {
      poseNet_input_poses = results;
  });
  facemesh_input = ml5.facemesh(facemodelReady);
  facemesh_input.on("predict", results => {
    predictions_input = results;
  });
}
function facemodelReady() {
  console.log("Face Model ready!");
  facemesh_input.predict(img);
}
function posemodelReady() {
  console.log("Pose Model ready!");
  poseNet_input.singlePose(img)
}

function drawInput(toggle, prediction, poses) {
  for (let i = 0; i < prediction.length; i += 1) {
    let flag = prediction[i].scaledMesh ?? false
    if (flag) {
      
    }
    const keypoints = prediction[i].scaledMesh
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x1, y1] = keypoints[j];
      noStroke()
      fill("rgba(230, 230, 230, 0.8)")
      ellipse(x1,y1,3,3)
    }
  }
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose
    let skeleton = poses[i].skeleton
    for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        if (keypoint.score >  0.1 && j > 4) {
          fill(230, 230, 230);
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          textSize(12)
          text(keypoint.part, keypoint.position.x+8, keypoint.position.y+8)
        }
    }
    for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255);
        strokeWeight(3);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
  }
}
function drawSilhouette(videoFlag, prediction1, prediction2, pose1, pose2) {
  for (let i = 0; i < prediction1.length; i++) {
    const flag = prediction2[i] ?? false;
    if (flag) {
      const keypoints1 = prediction1[i].scaledMesh;
      const keypoints2 = prediction2[i].scaledMesh;
      for (let j = 0; j < keypoints1.length; j++) {
        const [x1, y1] = keypoints1[j];
        const [x2, y2] = keypoints2[j];
        const sil_dist = dist(x1, y1, x2, y2)
        if (sil_dist < 20) {
          stroke("rgba(12,236,221,0.1)")
          strokeWeight(1)
          line(x1,y1,x2,y2)
          noStroke()
          fill("rgba(12, 236, 221, 0.9)")
          ellipse(x1, y1, 4, 4)
        }
        else {
          stroke("rgba(255,103,231,0.1)")
          strokeWeight(1)
          line(x1,y1,x2,y2)
          noStroke();
          fill("rgba(255, 103, 231,0.9)")
          ellipse(x1,y1,4,4)
        }
      }
    }
  }
  const pose1_flag = pose1[0] ?? false;
  const pose2_flag = pose2[0] ?? false;

  if (pose1_flag && pose2_flag) {
    const poses1 = pose1[0].pose
    const skeleton1 = pose1[0].skeleton
    const poses2 = pose2[0].pose
    const skeleton2 = pose2[0].skeleton
    for (let i = 0; i < poses2.keypoints.length; i++) {
      let keypoint1 = poses1.keypoints[i]
      console.log(keypoint1)
      let keypoint2 = poses2.keypoints[i]
      const key_dist = dist(keypoint1.position.x, keypoint1.position.y, keypoint2.position.x, keypoint2.position.y)
      if(keypoint1.score >  0.1 && keypoint2.score > 0.1 && i > 4){
        if (key_dist < 20) {
          noStroke()
          fill("rgba(12, 236, 221, 0.9)")
          ellipse(keypoint1.position.x, keypoint1.position.y, 10, 10)
          textSize(12)
          text(keypoint1.part, keypoint1.position.x+8, keypoint1.position.y+8)
        } else {
          noStroke()
          fill("rgba(255, 103, 231,0.9)")
          ellipse(keypoint1.position.x, keypoint1.position.y, 10, 10)
          textSize(12)
          text(keypoint1.part, keypoint1.position.x+8, keypoint1.position.y+8)
        }
      }
    }
  }
  
  // for (let i = 0; i < pose1.length; i++) {
  //   const pose = pose1[i].pose;
  //   const skeleton = pose1[i].skeleton;
  //   const pose_distance = dist()
  //   for (let j = 0; j < skeleton.length; j++){
  //     let partA = skeleton[j][0]
  //     let partB = skeleton[j][1]
  //   }
  // }
}

function drawPoseNet(poses) {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i].pose;
      let skeleton = poses[i].skeleton;
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        fill("rgba(255, 0, 0,0.8)");
        strokeWeight(1);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
      for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        if (keypoint.score >  0.1 && j > 4) {
          fill("rgba(255, 0, 0,0.9)");
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          console.log(keypoint.part)
          
        }
      }
  }
}
// 실루엣 켜고 끄는 토글 버튼 추가
// 가까이 가면 ( 포즈가 매치 되면) feedback alert 창
// 노선 (컨셉) >> 힙한 방향으로
// 화면 동작 