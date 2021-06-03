<template>
  <div
    style="padding: 20px 0;min-height: 143px;"
    class="mb-0 dark_div_profile add_field shadow-sm"
  >
    <div style="" v-if="loading_upload" class="loading_upload">
      <div
        style="font-size: 25px; width: 3em; height: 3em"
        class="spinner-border text-light"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <!-- <button
      style="margin: 15px"
      v-if="show_create"
      @click="show_create = false"
      id="new_btn"
    >
      <div>
        <img
          class="mr-2"
          style="width: 40px"
          src="/images/new_post_icon.png"
          alt=""
        />
        <p class="m-0">Create New Post</p>
      </div>
    </button> -->
    <div
      style="
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      "
      v-if="!show_create"
    >
      <div v-if="file == ''" @click="upload" id="up_btn" class="btn_img">
        <p style=" transform: translateY(-1px);" class="m-0">Upload Memes</p>
        <i
          style="font-size: 27px;
    transform: translateY(4px);
    margin-bottom: 6px;"
          class="fas fa-upload"
        ></i>
        <br />
      </div>

      <router-link v-if="file == ''" tag="div" :to="{ name: 'editor' }">
        <div class="btn_img ml-0">
          <p style="width: 100%;transform: translateY(-1px);" class="m-0">Edit memes</p>
         <i style="    font-size: 35px;
    transform: translateY(5px);
    position: relative;
    top: -4px;" class="far fa-image"></i>
          <br />
        </div>
      </router-link>

      <!-- VIEW IMG -->
   
      <div v-if="file != ''" style="margin: 20px" class="model_img">
           <router-link  :to="{ name: 'editor', params: { image_url: url }}">
     <p style="    color: #e87f57;">
       <i style="    font-size: 20px;" class="fas fa-edit"></i>
       Edit image before uploading</p>
           </router-link>
        <div class="container-img">
          <img style="width: 40vh" :src="url" alt="" />
        </div>

        <button style="" @click="submit()" class="btn_up_img">
          <i class="fas fa-upload"></i>
        </button>
        <button
          style=""
          @click="cancel()"
          v-if="file != ''"
          class="btn_up_img ml-2"
        >
          <i class="fas fa-reply"></i>
        </button>
      </div>
      
      <!-- VIEW IMG -->
      
      <form style="position: relative" @submit.prevent="submit">
        <input
          style="display: none"
          class="input_file"
          type="file"
          ref="file"
          name="file"
          id="uploadFile"
        />
      </form>
    </div>
    <span  v-if="show_create"
      @click="show_create = false">
 <span  class="clip" >
   
        <img
          class="mr-2"
          style="width: 40px"
          src="/images/new_post_icon.png"
          alt=""
        />
        <p class="m-0">Create New Post</p>
     
    </span>
    </span>
     
  </div>
</template>

<script>

import axios from "axios";
export default {
  props: ["username_id", "username"],
  name: "New_POST",
  data() {
    return {
      show_create: true,
      file: "",
      loading_upload: false,
      url: "",
    };
  },
  methods: {
    cancel() {
      this.url = "";
      this.file = "";
      document.getElementById("uploadFile").value = "";
    },
    submit() {
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
      this.file = this.$refs.file.files[0];
      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("user", this.username_id);
      formData.append("username", this.username);
      formData.append("date", date);
      formData.append("time", time);

      axios.post("/image", formData).then((res) => {
        console.log(res.status);
        if (res.status === 200) {
          this.loading_upload = false;

          this.$router.push({
            path: "/home",
          });
          this.$nextTick(() => {
            this.$router.push({
              path: "/",
            });
          });
        }
      });
      this.loading_upload = true;
      document.getElementById("uploadFile").value = "";
    },
    getFile(filePath) {
      return filePath.substr(filePath.lastIndexOf("\\") + 1).split(".")[0];
    },
    upload() {
      var file = document.querySelector("#uploadFile");

      file.click();
      file.onchange = () => {
        if (!this.$refs.file.files[0].name.match(/.(jpg|jpeg|png|gif)$/i)) {
          alert("not an image");
        } else {
          this.file = this.$refs.file.files[0];

          this.url = URL.createObjectURL(this.file);

          console.log(this.$refs.file.files[0].name);
        }

        //        const name = event.target.files[0].name;
        // const lastDot = name.lastIndexOf('.');

        // const fileName = name.substring(0, lastDot);
        // const ext = name.substring(lastDot + 1);

        // console.log(ext,fileName)
      };
    },
  },
  created() {},
  mounted() {
    window.click = () =>{
      console.log("sss")
    }
  },
};
</script>

<style scoped>
span{
      height: 60px;
  filter: drop-shadow(6px 6px 0px burlywood);
  transform: translateY(-2px);
  cursor: pointer;
}
.clip:hover{
 
}
.clip{
      clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
    background: rgb(227 119 96);
    color: rgb(34, 34, 34);
    padding: 10px 22px;
    color: white;
    box-shadow: 3px 3px 3px black;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}
.btn_up_img:hover {
  filter: drop-shadow(2px 4px 6px black);
}
.btn_up_img {
  margin-top: 20px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  color: white;
  background: #e87f57;
  position: relative;
}
.btn_up_img > i {
  font-size: 30px;
}
.container-img {
  position: relative;
  max-height: 300px;
  overflow: auto;
}
.file_btn {
  word-break: break-word;
  position: relative;

  outline: none;
  border: none;
  padding: 15px 50px;
  border-radius: 10px;
  background: #e37760;
  color: white;
  font-weight: 600;
  transition: 0.2s;
}
.btn_img:hover {
  box-shadow: 1px 4px 3px black;
  filter: opacity(0.8);
}
.btn_img {
  transition: 0.3s;
  height: 75px;
  margin: 14px;
  color: white;
  width: 116px;
  padding: 11px;
  background: #ffffff29;
  border-radius: 11px;
  cursor: pointer;
  display: flex;
  width: 133px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
#new_btn {
  margin-right: 10px;
  padding: 15px !important;
}
</style>