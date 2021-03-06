<template>
  <div>
    <div class="buttons">
     
      <button v-if="url != '' " @click="add_text()">ADD TEXT</button>
      <button  v-if="url != '' " @click="download">SAVE</button>
      <input class="input_text" type="file" @change="onFileChange" />
      <br />
      <div  v-if="url != '' " class="config">
        <div style="display:grid;margin-right:5px">
              <label>SIZE : </label>
        <input type="range" min="0" max="150" step="1" v-model="value" />

        </div>
         <div style="display:grid;margin-right:5px">
        <label>POSITION Y : </label>
        <input type="range" min="-500" max="500" step="1" v-model="pos_y" />
     </div>
           <div style="display:grid;margin-right:5px">
        <label>HEIGHT : </label>
        <input type="range" min="350" max="1000" step="1" v-model="height_" />
       </div>
      </div>
    </div>
    <div v-if="text_1" class="mt-3" style="display: flex;align-items: center;justify-content: center;
">
       <label class="mr-2" for="">TEXT_1: </label> 
      <textarea  class="mr-2"  v-model="text" name="" id="" cols="30" rows="1"></textarea>
    <input v-model="color" type="color" id="head" name="head"
           value="#e66465">
 
</div>
     
    <div   class="content-all">
      <div
        v-bind:style="{ 'background-image': 'url(' + url + ')' }"
        id="my-node"
        class="div"
      >
        <vue-draggable-resizable
         
      
          class="drag"
        
          @resizing="onResize"
          @dragstop="onDragstop"
          @deactivated="onDeactivated"
          @dragging="onDragging"
          v-if="url != '' && text_1"
          style="border: none"
          :w="250"
          :h="100"
          :parent="true"
        >
         <div    @click="get_id($event)"   id="text_1" class="text-field"><p>
            {{text}}
           </p></div>
        </vue-draggable-resizable>
      </div>
    </div>
  </div>
</template>

<script>
// import $ from "jquery";
import domtoimage from "dom-to-image";
import axios from "axios";
// import * as htmlToImage from 'html-to-image';

export default {
  
  watch: {
     color(val){
     
       var text = document.querySelector('#text_1')
     text.style.color = val
     },
    pos_y(val) {
      var node = document.getElementById("my-node");
      node.style.setProperty("background-position-y", `${val}px`, "important");
    },
    value(val) {
      var node = document.getElementById("my-node");
      node.style.setProperty("background-size", `${val}%`, "important");
    },
    height_(val) {
      var node = document.getElementById("my-node");
      node.style.setProperty("height", `${val}px`, "important");
    },
  },
  data: function () {
    return {
      text_id : '',
      color : '',
      text:'text_1',
      text_num : 0,
      width_: 500,
      height_: 500,
      pos_y: 0,
      value: 100,
      url: "",
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      username_id: "",
      username: "",
      text_1: false,
    };
  },
  methods: {
    get_id(event){
    
      this.text_id = event.currentTarget.id 
    },
    add_text(){
      if (this.text_num == 0) {
        this.text_1 = !this.text_1
      }
      
    },
    size() {
      console.log("size");
    },
    center() {
      var node = document.getElementById("my-node");
      // node.style.backgroundPosition = 'center !important'

      node.style.setProperty("background-position-x", "center", "important");
    },
    onDragstop() {
      document.body.style.overflow = null;
    },
    onDeactivated() {
      document.body.style.overflow = null;
    },
  
    onDragging() {
    
      // alert('scroll no')
      document.body.style.overflow = "hidden";
      document.querySelector("html").scrollTop = window.scrollY;
    },
    ajuster() {
      this.text_1 = false;
      // var img = new Image();

      //     img.src = this.url;
      //     console.log(img)
      //      var height = img.height ;
      // var width = img.width ;
      //  var myImg = document.querySelector(".img");
      // console.log(myImg.clientHeight)
      //  var node = document.getElementById("my-node");
      //       node.style.width = "500px"
      //       node.style.height = "500px"
    },

    onFileChange(e) {
      this.text_1 = false;
      const file = e.target.files[0];
      this.url = URL.createObjectURL(file);
      var node = document.getElementById("my-node");
      node.style.width = "500px";
      node.style.height = "500px";
      // setTimeout(() => {
      //         this.ajuster()
      // }, 500);
    },
    download() {
      this.username = localStorage.getItem("username");
      this.username_id = localStorage.getItem("username_id");
      var today = new Date();
      var date =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();

      var h = (today.getHours() < 10 ? "0" : "") + today.getHours();
      var m = (today.getMinutes() < 10 ? "0" : "") + today.getMinutes();
      var time = h + ":" + m;

      var node = document.getElementById("my-node");
      console.log(node);
      domtoimage
        .toJpeg(node, { quality: 1 })
        .then(function (dataUrl) {
          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const formData = new FormData();

              formData.append("user", localStorage.getItem("username_id"));
              formData.append("username", localStorage.getItem("username"));
              formData.append("date", date);
              formData.append("time", time);
              formData.append("file", blob);
              axios.post("/url", formData).then((res) => {
                console.log(res.status);
              });
            });
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
    },
    onResize: function (x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    },
    onDrag: function (x, y) {
      this.x = x;
      this.y = y;
    },
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
  },
};
</script>
<style scoped>
.text-field > p{
  margin: 0;
}
.text-field{
  overflow-wrap: anywhere;
     background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 15px;
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bolder;
}
.div {
  transition: 0.1s;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.514);
  background-size: 100%;
  background-position-x: center;
}
label{
  margin: 0;
    color: #efefef;
    font-weight: 600;
    font-size: 14px;
}
.config {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.content-all {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 30px;
  margin-top: 10px;
}
.buttons {
  padding-top: 100px;
  text-align: center;
  color: white;
}
/* .memes_text1 {
  resize: none;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 30px;
  font-family: fantasy;
  padding: 0 10px;
} */
/* .img{
  cursor: pointer;
  transition: 0.3s;
}
.img:hover{
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.719);
} */
</style>