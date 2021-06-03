<template>
  <div class="container">
    <div class="row flex-lg-nowrap">
      <input
        style="display: none"
        class="input_text"
        type="file"
        @change="onFileChange"
      />
      <div class="col">
        <div class="row">
          <div class="col mb-3">
            <div class="card">
              <div class="card-body px-0">
                <div class="e-profile">
                  <div class="row">
                    <div
                      style="display: flex; justify-content: center"
                      class="col-12 col-sm-auto mb-3"
                    >
                      
                      <div
                       
                        class="img_content"
                        
                        style="width: 160px; height: 160px; overflow: hidden"
                      >
                      </div>
                    </div>
                    <div
                      class="col d-flex flex-column flex-sm-row justify-content-between mb-3"
                    >
                      <div class="text-center text-sm-left mb-2 mb-sm-0">
                        <h4
                          v-if="user_profile.full_name"
                          class="pt-sm-2 pb-1 mb-0 text-nowrap"
                        >
                          {{ user_profile.full_name }}
                        </h4>
                        <p class="mb-0">@{{ user_profile.username }}</p>

                        <div v-if="!loaging_img" class="mt-2">
                          <button
                            v-if="!upload_img_confirm"
                            @click="file()"
                            class="btn_info"
                            type="button"
                          >
                            <i class="fa fa-fw fa-camera"></i>
                            <span>Upload Image</span>
                          </button>
                          <button
                            v-if="upload_img_confirm"
                            @click="cancel_upload()"
                            class="btn_info mr-2"
                            type="button"
                          >
                            <span>X Cancel</span>
                          </button>
                          <button
                            v-if="upload_img_confirm"
                            @click="upload()"
                            class="btn_info"
                            type="button"
                          >
                            <i class="fa fa-fw fa-camera"></i>
                            <span>Save Image</span>
                          </button>
                        </div>
                        <div v-else >
                           Loading ...
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="!loaging_img" class="tab-content pt-3">
                    <div class="tab-pane active">
                      <div class="row">
                        <div class="col">
                          <div class="row">
                            <div class="col">
                              <div class="form-group">
                                <label>Full Name</label>
                                <input
                                  spellcheck="false"
                                  v-model="full_name"
                                  class="form-control"
                                  type="text"
                                  name="name"
                                  placeholder="full name"
                                  value=""
                                />
                              </div>
                            </div>
                            <div class="col">
                              <div class="form-group">
                                <label v-if="alert == ''">Username</label>
                                <label class="alert_update" v-else>{{
                                  alert
                                }}</label>
                                <input
                                  spellcheck="false"
                                  v-model="username"
                                  class="form-control"
                                  type="text"
                                  name="username"
                                  placeholder="johnny.s"
                                  value="johnny.s"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col">
                              <div class="form-group">
                                <label>Email</label>
                                <input
                                  @blur="validateEmail"
                                  v-model="email"
                                  class="form-control"
                                  type="text"
                                  placeholder="user@example.com"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  <!--   <div class="row">
                        <div class="col-12 col-sm-6 mb-3">
                          <div class="mb-2"><b>Change Password</b></div>
                          <div class="row">
                            <div class="col">
                              <div class="form-group">
                                <label class="password_label"
                                  >Current Password</label
                                >
                                <input
                                  class="form-control"
                                  type="password"
                                  placeholder="••••••"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col">
                              <div class="form-group">
                                <label class="password_label"
                                  >New Password</label
                                >
                                <input
                                  class="form-control"
                                  type="password"
                                  placeholder="••••••"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col">
                              <div class="form-group">
                                <label class="password_label"
                                  >Confirm
                                  <span class="d-none d-xl-inline"
                                    >Password</span
                                  ></label
                                >
                                <input
                                  class="form-control"
                                  type="password"
                                  placeholder="••••••"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      -->
                      <div class="row">
                        <div class="col d-flex justify-content-end">
                          <button class="btn_info" @click="updates">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import domtoimage from "dom-to-image";

import { socket } from "../init_socket";
export default {
  name: "user_info",
  props: ["user_profile", "username_id"],
  data() {
    return {
      loaging_img : false,
      alert: "",
      email: this.user_profile.email,
      username: this.user_profile.username,
      full_name: this.user_profile.full_name,
      upload_img_confirm: false,
    };
  },
  watch: {
    username() {
      this.alert = "";
    },
  },
  methods: {
    cancel_upload() {
      this.upload_img_confirm = false;
      const img = document.querySelector(".img_profile");
      if (this.user_profile.picture) img.src = this.user_profile.picture;
      else img.src = "/images/utilisateur.png";
    },
    upload() {
      var _this = this;

      const content = document.querySelector(".img_content");
      domtoimage.toJpeg(content, { quality: 0.8 }).then(function (dataUrl) {
        fetch(dataUrl);
        let data = {
          dataUrl,
          user_id: _this.username_id,
        };

        socket.emit("UPDATES_IMG", data);
        _this.upload_img_confirm = false;
      });
      this.loaging_img = true
    },
    file() {
      var input_text = document.querySelector(".input_text");
      input_text.click();
    },
    onFileChange(e) {
      const content = document.querySelector(".img_content");
      // const img = document.querySelector(".img_profile")
      this.text_1 = false;
      if (!e.target.files[0]) return;
      if (!e.target.files[0].name.match(/.(jpg|jpeg|png|gif)$/i)) {
        alert("not an image");
      } else {
        const file = e.target.files[0];
        this.url = URL.createObjectURL(file);
        //  img.src =  this.url
        content.style.backgroundImage = `url(${this.url})`;
        this.upload_img_confirm = true;
      }
    },
    validateEmail() {},
    updates() {
      if (this.email == '' || this.username == '' || this.full_name == '') {
        return
      }
      let data = {
        email: this.email,
        username: this.username,
        full_name: this.full_name,
        username_id: this.username_id,
      };
      console.log(data) 
      socket.emit("UPDATE_USER", data);
    },
  },
  created() {
    socket.on("UPDATE_USER", (data) => {

      if (data._id) {
       this.$emit("set_user_update",data)
      }
      else  this.alert = data;
   
    });

       socket.on(`updated_img${this.username_id}`,()=>{
      
   this.loaging_img = false
    })

  },
  mounted() {
    const content = document.querySelector(".img_content");
    if(content && this.user_profile.picture) 
    content.style.backgroundImage = `url(${this.user_profile.picture})`;
     if(content && !this.user_profile.picture) 
       content.style.backgroundImage = `url('/images/utilisateur.png')`;
  },
};
</script>

<style scoped>
.alert_update {
  color: tomato;
  font-size: 15px;
}
.img_content {
  width: 160px;
  height: 160px;
  overflow: hidden;
  display: flex;
  align-items: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.card {
  color: burlywood;
  border: none;
  background: transparent;
}
.form-control {
  color: #dfdfdf;
  background: transparent;
  outline: none;
  border: 0;
  border-bottom: 1px solid #535353;
  border-radius: 0;
}
.form-control:focus {
  outline: none !important;
  background: transparent;
  box-shadow: none;
  border-bottom: 1px solid burlywood;
  color: burlywood;
}
.btn_info {
  padding: 5px 10px;
  outline: none;
  border: none;
  background: #e37760;
  border-radius: 8px;
  color: white;
}
.fa-camera {
  margin-right: 6px;
}
.password_label {
  color: #a6a6a6;
  font-size: 14px;
}

@media screen and (max-width: 500px) {
  .col{
    width: 100% !important;
  }
  .row{
    display: block;
  }
}
</style>