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
let v_width;
let v_height;
let input_flag = false;
let pose_flag = false;
let button_flag = true;
let shot_flag = false
let button;
let temp_i;
let cur_i;
let nose_dist;
let searchBox;
let hideBtn;
let shotBtn;
let showBtn;
let backBtn;
let cur_status = [0,false];
let face_outline = [21, 54, 103, 67, 109, 10, 338, 297, 332,
  284, 251, 389, 356, 454, 323, 401, 435, 288, 367, 397, 365,
  364, 365, 394, 379, 378, 400, 377, 152, 148, 176, 140, 149,
  170, 150, 169, 136, 135, 172, 138, 192, 58, 215, 213, 177,
  137, 227, 34, 127, 162, 68, 104, 69, 108, 151, 337, 299, 333,
  298, 301, 368, 264, 447, 366, 361, 433, 416, 434, 430, 431,
  395, 369, 396, 175, 171, 32, 211, 210, 214, 207, 187, 147, 132,
  123, 93, 234, 116, 34, 143, 139, 71];
  let feedback_text = ["Come closer.", "Step back a little.","Almost done!" ,"It's time to take a shot!"]
function preload() {
  for (let i = 1; i < 26; i++){
    let list = 'images/' + i + '.jpg'
    let img1 = loadImage(list)
    img_list.push(img1)
  }
  searchBox = loadImage('images/searchBox.png')
  hideBtn = loadImage('images/hideBtn.png')
  shotBtn = loadImage('images/shotBtn.png')
  showBtn = loadImage('images/showBtn.png')
  backBtn = loadImage('images/backBtn.png')

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
  if (!input_flag) {
    background(0)
    image(searchBox, 18, 123, 1044, 72)
    for (let i = 0; i < 25; i++) {
      button_list[i].display()
      if (button_list[i].over()) {
        temp_i = i
      }
    }
  }
  if (pose_flag) {
    mode_transition(temp_i)
    setTimeout(() => {
      input_flag = true
    }, 1000)
    pose_flag = false
    cur_i = temp_i
  }
  if(input_flag){
    background(0)
    noTint();
    image(video, 0, 372, 1440, 1080);
    image(shotBtn, 450, 1884, 180, 180)
    image(backBtn, 168, 1902, 144, 144)
    if (button_flag) {
      image(hideBtn, 768, 1902, 144, 144)
    }
    else if (!button_flag) {
      image(showBtn, 768, 1902, 144, 144)
    }
    drawInput(button_flag, predictions_input, poseNet_input_poses)
    drawSilhouette(button_flag, predictions_video, predictions_input, poseNet_video_poses, poseNet_input_poses)
    feedback()
  }
  fill(127)
  rect(0, 0, 1080, 100)
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
  
  video.size(1080, 1440);
  
  poseNet_video = ml5.poseNet(video);
  poseNet_video.on('pose', function(results) {
    poseNet_video_poses = results;
  });
  facemesh_video = ml5.facemesh(video);
  facemesh_video.on("predict", results => {
    predictions_video =  results;
  });
  video.hide()
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
        if(!face_outline.includes(j)){
          fill("rgba(230, 230, 230, 0.8)")
          ellipse(x1,y1+372,8,8)
        } else if (face_outline.includes(j)){
          fill("rgba(230, 230, 230, 0.3)")
          ellipse(x1,y1+372,4,4)
        }
      }
    }
  }
}
function drawSilhouette(toggle, prediction1, prediction2, pose1, pose2) {
  if (toggle) {
    push()
    tint(255, 127);
    if(nose_dist){
      let map_d = 127
      if(nose_dist < 80){
        map_d = map(nose_dist, 0, 80, 5, 120)
        tint(255, map_d)
      }
    }

    image(img_list[cur_i], 0, 372, 1080, 1080);

    pop()
    for (let i = 0; i < prediction1.length; i++) {
      const flag = prediction2[i] ?? false;
      let status_check = new Array
      if (flag) {
        const keypoints1 = prediction1[i].scaledMesh;
        const keypoints2 = prediction2[i].scaledMesh;
        const [v_bbx1, v_bby1] = prediction1[i].boundingBox.topLeft[0]
        const [v_bbx2, v_bby2] = prediction1[i].boundingBox.bottomRight[0]
        const [i_bbx1, i_bby1] = prediction2[i].boundingBox.topLeft[0]
        const [i_bbx2, i_bby2] = prediction2[i].boundingBox.bottomRight[0]
        let aspect = ((v_bbx2 - v_bbx1)*2.25 * (v_bby2 - v_bby1)*2.25) / ((i_bbx2 - i_bbx1) * (i_bby2 - i_bby1))
        if (aspect < 0.9) {
          cur_status[0] = 0 // come closer
        }
        if (aspect > 1.1) {
          cur_status[0] = 1 // step back
        }
        if (aspect < 1.1 && aspect > 0.9 ) {
          cur_status[0] = 2 // good
        }
        for (let j = 0; j < keypoints1.length; j++) {
          const [x1, y1] = keypoints1[j];
          const [x2, y2] = keypoints2[j];
          const sil_dist = dist(x1 * 2.25, y1 * 2.25, x2, y2)
          if (sil_dist < 20 && !face_outline.includes(j)) {
            noStroke()
            fill("rgba(12, 236, 221, 0.9)")
            ellipse(x1 * 2.25, y1 * 2.25 + 372, 8, 8)
            status_check.push(1)
          }
          else if (sil_dist < 20 && face_outline.includes(j)) {
            noStroke()
            fill("rgba(12, 236, 221, 0.3)")
            ellipse(x1*2.25, y1*2.25+372, 4, 4)
          }
          else if (sil_dist >= 20 && !face_outline.includes(j)) {
            noStroke();
            fill("rgba(255, 103, 231,0.9)")
            ellipse(x1 * 2.25, y1 * 2.25 + 372, 8, 8)
            status_check.push(0)
          }
          else if(sil_dist >= 20 && face_outline.includes(j)){
            noStroke();
            fill("rgba(255, 103, 231,0.3)")
            ellipse(x1*2.25,y1*2.25+372,4,4)
          }
        }
        let status_ratio = status_check.reduce((a, b) => a + b, 0) / status_check.length
        if (status_ratio > 0.65 && nose_dist < 80) {
          cur_status[1] = true
        } else {
          cur_status[1] = false
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
// function mouseReleased() {
//   if (temp_i !== undefined) {
//     pose_flag = true
//   }
//   if (dist(mouseX, mouseY, 240, 1974) < 80) {
//     input_flag = !input_flag
//   }
//   if (dist(mouseX, mouseY, 840, 1974) < 80) {
//     button_flag = !button_flag
//   }
//   if (dist(mouseX, mouseY, 540, 1974) < 100) {
//     button_flag = false
//     saveFrames(video, 'jpg', 1, 1)
//     setTimeout(() => {
//       button_flag=true
//     }, 2000)

//   } 
// }
function touchEnded() {
  if (temp_i !== undefined) {
    pose_flag = true
  }
  if (dist(mouseX, mouseY, 840, 1974) < 80) {
    button_flag = !button_flag
  }
  if (dist(mouseX, mouseY, 240, 1974) < 80) {
    input_flag = !input_flag
  }
  if (dist(mouseX, mouseY, 540, 1974) < 100) {
    button_flag = false
    saveFrames(video, 'jpg', 1, 1)
    setTimeout(() => {
      button_flag=true
    }, 2000)
  }
  return false 
}

function feedback() {
  if (cur_status[0] == 0 && cur_status[1] == false) {
    push()
    fill(230)
      .strokeWeight(0)
      .textSize(40)
    textFont('Roboto')
    textStyle('BOLD')
    textAlign(CENTER)
    text(feedback_text[0], 276, 1632, 528, 72)
    pop()
  }
  else if (cur_status[0] == 1 && cur_status[1] == false) {
    push()
    fill(230)
      .strokeWeight(0)
      .textSize(40)
    textFont('Roboto')
    textStyle('BOLD')
    textAlign(CENTER)
    text(feedback_text[1], 276, 1632, 528, 72)
    pop()
  }
  else if (cur_status[0] == 2 && cur_status[1] == false) {
    push()
    fill(230)
      .strokeWeight(0)
      .textSize(40)
    textFont('Roboto')
    textStyle('BOLD')
    textAlign(CENTER)
    text(feedback_text[2], 276, 1632, 528, 72)
    pop()
  }
  else if (cur_status[0] == 2 && cur_status[1] == true) {
    push()
    fill(230)
      .strokeWeight(0)
      .textSize(40)
    textFont('Roboto')
    textStyle('BOLD')
    textAlign(CENTER)
    text(feedback_text[3], 276, 1632, 528, 72)
    pop()
    button_flag = false
    setTimeout(() => {
      button_flag = true
    }, 1000);
  }
}



// 타겟 사진 >> 결과물 
// 최종 디자인 정리 
// 저장
// 뒤로가기버튼