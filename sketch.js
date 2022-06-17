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
let cur_i;
let nose_dist;

function preload() {
  for (let i = 1; i < 26; i++){
    let list = 'images/' + i + '.jpg'
    let img1 = loadImage(list)
    img_list.push(img1)
  }
}
function setup() {
  createCanvas(1080, 2280)
  background(255)
  for (let i = 0; i < 25; i++) {
    button_list.push(new Button(i, img_list[i]))
  }
} 

function draw() {
  temp_i = undefined
  if(!input_flag){
    for (let i = 0; i < 25; i++) {
      button_list[i].display()
      if (button_list[i].over()) {
        temp_i = i
      }
    }
  }
  if (pose_flag) {
    mode_transition(temp_i)
    cur_i = temp_i
    pose_flag = false
    input_flag = true
  }
  if(input_flag){
    background(0)
    noTint();
    image(video, 0, 372, 1440, 1080);
    
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
  // resizeCanvas(480, 640);
  img = createImg('images/'+(i+1)+'.jpg', imageReady);
  img.size(1080, 1080);
  img.hide(); 
  video = createCapture(VIDEO);
  video.size(1440, 1080);
  
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
  button.position(660, 1800)
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
        ellipse(x1,y1+372,9,9)
      }
    }
  }
}
function drawSilhouette(toggle, prediction1, prediction2, pose1, pose2) {
  push()
  tint(255, 127);
  if(nose_dist){
    let map_d = 127
    if(nose_dist < 80){
      map_d = map(nose_dist, 0, 80, 0, 127)
      tint(255, map_d)
    }
  }
  image(img_list[cur_i], 0, 372, 1080, 1080);
  pop()
  if (toggle) {
    for (let i = 0; i < prediction1.length; i++) {
      const flag = prediction2[i] ?? false;
      if (flag) {
        const keypoints1 = prediction1[i].scaledMesh;
        const keypoints2 = prediction2[i].scaledMesh;
        for (let j = 0; j < keypoints1.length; j++) {
          const [x1, y1] = keypoints1[j];
          const [x2, y2] = keypoints2[j];
          const sil_dist = dist(x1 * 2.25, y1 * 2.25, x2, y2)
          if (sil_dist < 20) {
            noStroke()
            fill("rgba(12, 236, 221, 0.9)")
            ellipse(x1*2.25, y1*2.25+372, 8, 8)
          }
          else {
            noStroke();
            fill("rgba(255, 103, 231,0.9)")
            ellipse(x1*2.25,y1*2.25+372,8,8)
          }
        }
        let [n_x1, n_y1, z1] = prediction1[i].annotations.noseTip[0]
        let [n_x2, n_y2, z2] = prediction2[i].annotations.noseTip[0]
        nose_dist = dist(n_x1*2.25, n_y1*2.25, n_x2, n_y2)
      }
    }
  }
}

class Button {
  constructor(i, inImg) {
    this.i = i
    this.x = 18+(i)%2*516+i%2*12;
    this.y = 210+Math.floor(i/2)*516 + Math.floor(i/2)*12;
    this.w = 516
    this.h = 516
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
// 외부 링크나 파일 추가할수있는 버튼
// 타겟 사진 >> 결과물 
// 버튼추가해서 인풋 이미지 오버레이해서 보여주기 + 가까워지면 오버레이 0 되게 고민. 
// 최종 디자인 정리 
// 저장
// 뒤로가기버튼