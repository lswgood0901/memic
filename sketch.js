let img_list = [];
let button_list = []
let mouse_event;
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
let input_flag = false;
let pose_flag = false;
let button_flag = false;
let button;
let temp_i;

function preload() {
  for (let i = 1; i < 12; i++){
    let list = 'images/' + i + '.jpg'
    let img1 = loadImage(list)
    img_list.push(img1)
  }
}
function setup() {
  createCanvas(480, 1600)
  for (let i = 0; i < 11; i++) {
    button_list.push(new Button(i, img_list[i]))
    
    // button_list[i].display()
    // button_list[i].over()
    // image(img_list[i], 8+(i)%2*228+i%2*8, 16+Math.floor(i/2)*228+i%2*8, 228, 228)
  }
  // createCanvas(480, 640);
  // img = createImg('images/lisa_2.jpg', imageReady);
  // img.size(480, 480);
  // img.hide(); 
  
  // video = createCapture(VIDEO);
  // video.size(480, 480);
  
  // poseNet_video = ml5.poseNet(video);
  // poseNet_video.on('pose', function(results) {
  //   poseNet_video_poses = results;
  // });
  // facemesh_video = ml5.facemesh(video);
  // facemesh_video.on("predict", results => {
  //   predictions_video =  results;
  // });
  // video.hide()
  // button = createButton("click me")
  // button.position(220, 600)
  // button.mousePressed(() => {
  //   button_flag = !button_flag
  //   console.log(button_flag)
  // })
}

function draw() {
  temp_i = undefined
  if(!input_flag){
    for (let i = 0; i < 11; i++) {
      button_list[i].display()
      if (button_list[i].over()) {
        temp_i = i
      }
      // image(img_list[i], 8+(i)%2*228+i%2*8, 16+Math.floor(i/2)*228+i%2*8, 228, 228)
    }
  }
  if (pose_flag) {
    mode_transition(temp_i)
    pose_flag = false
    input_flag = true
  }
  if(input_flag){
    background(255)
    image(video, 0, 0, 640, 480);
    drawInput(button_flag, predictions_input, poseNet_input_poses)
    drawSilhouette(button_flag, predictions_video, predictions_input, poseNet_video_poses, poseNet_input_poses)
    }
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
function mode_transition(i) {
  resizeCanvas(480, 640);
  img = createImg('images/'+(i+1)+'.jpg', imageReady);
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
  button_flag = !button_flag
  })
}
function drawInput(toggle, prediction, poses) {
  if(toggle){
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
      // for (let j = 0; j < skeleton.length; j++) {
      //     let partA = skeleton[j][0];
      //     let partB = skeleton[j][1];
      //     stroke(255);
      //     strokeWeight(3);
      //     line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      //   }
    }
  }
}
function drawSilhouette(toggle, prediction1, prediction2, pose1, pose2) {
  if(toggle) {
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
  }
}

class Button {
  constructor(i, inImg) {
    this.i = i
    this.x = 8+(i)%2*228+i%2*8;
    this.y = 16+Math.floor(i/2)*228+i%2*8;
    this.w = 228
    this.h = 228
    this.img = inImg;
  }
  display() {
    stroke(0);
    if (this.over()) {
      tint(230, 230, 230);
    } else {
      noTint();
    }
    image(this.img, this.x, this.y, this.w, this.h);
  }
  over() {
    if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
      return true;
    } else {
      return false;
    }
  }
}
function mouseReleased() {
  if (temp_i !== undefined) {
    pose_flag = true
  }
}
