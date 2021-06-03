<template v-if="editor">
  <div style="padding-bottom: 50px;height: 100vh;" class="editor">
    <div style="top: 0:left: 0;" v-if="loading_upload" class="loading_upload">
      <div
        style="font-size: 25px; width: 3em; height: 3em"
        class="spinner-border text-light"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div
      v-if="url != ''"
      style="margin-top: 50px; border-radius: 0"
      class="dark_div_profile add_field shadow-sm"
    >
      <button style="padding: 10px 25px;" @click="download" id="new_btn">
        <div >
          <p class="m-0 mr-2">SAVE </p>

          <i style="transform:translateY(1px)" class="fas fa-upload"></i>
        </div>
      </button>
      <i v-if="url != ''" @click="another()" class="restart fas fa-undo"></i>
    </div>

    <div class="h1_text">
      <h1 v-if="url == ''">Create your own memes online</h1>
      <button v-if="url == ''" @click="file()" id="new_btn">
        <div>
          <p class="m-0">Upload Image</p>
          <br />
          <i class="fas fa-upload"></i>
        </div>
      </button>
    </div>

    <!-- CONFIG IMAGE -->
    <div class="side-config">
      <div style="display: flex" class="image-edit">
        <input
          style="display: none"
          class="input_text"
          type="file"
          @change="onFileChange"
        />
        <br />
        <div v-if="url != ''" class="config">
          <div style="display: grid; margin-right: 5px">
            <label>SIZE : </label>
            <input type="range" min="30" max="150" step="1" v-model="value" />
          </div>
          <div style="display: grid; margin-right: 5px">
            <label>POSITION Y : </label>
            <input type="range" min="-500" max="500" step="1" v-model="pos_y" />
          </div>
          <div style="display: grid; margin-right: 5px">
            <label>HEIGHT : </label>
            <input
              type="range"
              min="300"
              max="1000"
              step="1"
              v-model="height_"
            />
          </div>
        </div>
      </div>

      <div class="mt-3" style="width: 100%; text-align: center">
        <button class="add_text" v-if="url != ''" @click="add_text()">
          <i class="far fa-edit"></i>
          <p>Add Text</p>
        </button>
      </div>
     
      <div v-if="text_1 && text_num > 0">
        <div class="text_config">
          <div style="display: grid; margin-right: 5px">
            <label>Text size : </label>
            <input
              type="range"
              min="10"
              value="20"
              max="100"
              step="1"
              v-on:input="text_size($event)"
            />
          </div>
          <div style="display: grid; margin-right: 5px">
            <label>Stroke size & color </label>
            <div style="display: flex">
              <input
                style="width: 80px"
                type="range"
                min="0"
                value="0"
                max="5"
                step="1"
                v-on:input="stroke_size($event)"
              />
              <input
                style="transform: translate(10px, 8px)"
                v-on:input="stroke_color($event)"
                type="color"
                id="heed2"
                name="head2"
                value="#000"
              />
            </div>
          </div>
        </div>

        <div class="mt-3 textarea_config">
          <textarea
            placeholder="Text..."
            class="mr-2"
            v-model="text"
            name=""
            id="textarea"
            cols="30"
            rows="1"
          ></textarea>

          <input
            class="mr-2"
            v-on:input="text_color($event)"
            type="color"
            id="head"
            name="head"
            value="#000"
          />
          <input
            v-on:input="background($event)"
            type="color"
            id="heed2"
            name="head2"
            value="#ffffff"
          />
          <i @click="remove_text()" class="fas fa-trash-alt"></i>
        </div>
      </div>
    </div>

    <div class="content-all">
      <div v-show="url != ''" id="my-node" style="width: 500px;
    height: 500px;" class="div">
        <vue-draggable-resizable
          class-name-active="actived"
          v-for="ar in arr"
          :key="ar"
          class="drag"
          @resizing="onResize"
          @dragstop="onDragstop"
          @deactivated="onDeactivated"
          @dragging="onDragging"
          style="border: none"
          :w="250"
          :h="50"
          :parent="true"
        >
          <div @click="get_id($event)" :id="ar" class="text-field">
            {{ ar }}
          </div>
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
    url(val) {
      var node = document.getElementById("my-node");
      node.style.backgroundImage = `url(${val})`;
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
    text(val) {
      document.getElementById(`${this.text_id}`).innerHTML = val;
    },
  },
  data: function () {
    return {
      loading_upload: false,
      arr: [],
      text_id: "",
      editor: true,
      color: "",
      text: "",
      text_num: 0,
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
    another() {
      this.$router.push("/");
      this.$nextTick(() => {
        this.$router.push("/editor");
      });
    },
    file() {
      var input_text = document.querySelector(".input_text");
      input_text.click();
    },
    remove_text() {
      const index = this.arr.indexOf(this.text_id);
      if (index > -1) {
        this.arr.splice(index, 1);
        this.text_num--;
        this.text = "";
      }
    },
    stroke_color(event) {
      var text = document.querySelector(`#${this.text_id}`);

      text.style.setProperty(
        "-webkit-text-stroke-color",
        `${event.target.value}`
      );
    },
    stroke_size(event) {
      var text = document.querySelector(`#${this.text_id}`);
      var val = event.target.value;
      text.style.setProperty("-webkit-text-stroke-width", `${val}px`);
    },
    text_size(event) {
      var text = document.querySelector(`#${this.text_id}`);

      text.style.fontSize = `${event.target.value}px`;
    },
    text_color(event) {
      var text = document.querySelector(`#${this.text_id}`);
      text.style.color = event.target.value;
    },
    background(event) {
      var text = document.querySelector(`#${this.text_id}`);
      text.style.backgroundColor = event.target.value;
    },
    get_id(event) {
      var textarea = document.querySelector("#textarea");
      textarea.focus();
      this.text_id = event.currentTarget.id;
      var node = document.getElementById(`${this.text_id}`);

      this.text = node.textContent || node.innerText;
    },
    add_text() {
      this.arr.push(`text_${this.text_num}`);
      this.text_1 = true;
      this.text_id = `text_${this.text_num}`;
      this.text_num++;
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

    onFileChange(e) {
      this.text_1 = false;
      if (!e.target.files[0].name.match(/.(jpg|jpeg|png|gif)$/i)) {
        alert("not an image");
      } else {
        const file = e.target.files[0];
        this.url = URL.createObjectURL(file);
        var node = document.getElementById("my-node");
        node.style.width = "500px";
        node.style.height = "500px";
        // setTimeout(() => {
        //         this.ajuster()
        // }, 500);
      }
    },
    download() {
      var _this = this;
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

      domtoimage
        .toJpeg(node, { quality: 0.85 })
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
              axios.post("/image", formData).then((res) => {
                console.log(res.status);
                if (res.status === 200) {
                  _this.loading_upload = false;

                  _this.$router.push({
                    path: "/home",
                  });
                  _this.$nextTick(() => {
                    _this.$router.push({
                      path: "/",
                    });
                  });
                }
              });
            });
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
      this.loading_upload = true;
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
    if ( this.$route.params.image_url) {
          this.url = this.$route.params.image_url
    }

    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
  },
};
</script>
<style scoped>
@font-face {
  font-family: "Impact";
  src: url("/impact.woff") format("woff");
}

.textarea_config {
  display: flex;
  justify-content: center;
  padding: 0 10px;
  flex-wrap: wrap;
}
.text_config {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.side-config {
  margin: 25px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.h1_text > button {
  filter: drop-shadow(2px 4px 6px black);
}
.h1_text > h1 {
  filter: drop-shadow(2px 4px 6px black);
  color: white;
  font-family: "Luckiest Guy", cursive;
  font-size: 60px;
}
.h1_text {
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  text-align: center;
}
.restart {
  font-size: 32px;
  color: #e37760;
  transform: translate(10px, 6px);
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: 0.3s;
}
.restart:hover {
  background: #292929;
}
.add_text {
  outline: none;
  width: 130px;
  padding: 8px 10px;
  border: none;
  background: #e37760;
  color: white;
  font-weight: 600;
  margin-top: 15px;
  border-radius: 7px;
}
.add_text > p {
  margin: 0;
  transform: translate(4px, -3px);
}
.add_text > i {
  font-size: 25px;
  margin-left: -4px;
}
.save:hover {
  color: rgb(233 129 84 / 69%) !important;
}
#textarea {
  background: #121212;
  color: white;
  outline: none;
  padding: 10px;
}
.fa-trash-alt {
  font-size: 23px;
  color: #efefef;
  margin-left: 10px;
  cursor: pointer;
}
.actived {
  border: 5px dashed #ffffff00 !important;
}
.text-field > p {
  margin: 0;
}
.text-field {
  font-family: Impact;
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
label {
  margin: 0;
  color: #efefef;
  text-align: center;
  font-size: 14px;
}
.config {
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
  padding: 0px 10px;
  margin-top: 40px;
}
.buttons {
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

.handle-tl {
  width: 10px !important;
  height: 10px !important;
  background: red !important;
}
</style>