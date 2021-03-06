<template>
  <div style="" class="profile pb-5">
    <div v-if="loading_upload" class="loading_upload">
      <div class="spinner">
        <div class="spinner-border text-light" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>

    <div style="padding-top: 140px" class="container px-4">
      <div class="mx-auto">
        <!-- Profile widget -->
        <div class="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
            alt="..."
            width="130"
            class="photo_de_profil mb-2 img-thumbnail"
          />
          

          <div
            style="
              lign-items: center;
              position: realtive;
              padding: 38px 10px !important;
            "
            class="text-white dark_div_profile p-4 d-flex justify-content-end text-center"
          >
           
            <ul
              v-if="user_profile.username"
              class="stat text-white list-inline mb-0"
            >
              <li class="list-inline-item">
                <h5 class="font-weight-bold mb-0 d-block">
                  {{ user_post.length }}
                </h5>
                <small class="text-white">
                  <i class="fas fa-image mr-1"></i>Memes</small
                >
              </li>
              <li class="list-inline-item">
                <h5 class="font-weight-bold mb-0 d-block">
                  {{ friends.length }}
                </h5>

                <small class="text-white">
                  <i class="fas fa-user mr-1"></i>Friends</small
                >
              </li>
              <!-- ADD REQUEST -->
              <div v-if="$route.params.id != username_id">

                <!-- if friend -->
                <li
                  @click="delete_friend()"
                  style="font-size: 25px; color: #e57c5b"
                  v-if="friends.includes(username_id)"
                  class="list-inline-item"
                >
                 
                   <i class="fas fa-user-check"></i>
                   
                </li>

     <div v-else>

  

                  <!-- confirm friend  -->
                      <li style="color: #e88056;"
                  @click="cofirm_friend()"
                 v-if="if_req_confirm()"
                  class="list-inline-item"
                >
                  <i style="font-size: 22px;" class="fas fa-user mr-1"></i>
                  <small style="font-size: 16px;">
                  Accept</small>
                  
                </li>
           

            <div v-else>

           
                <li
                  @click="request_friend('add')"
                  v-if="!if_req(request,username_id)"
                  class="list-inline-item"
                >
                  <i style="color: #f8b26a;" class="fas fa-user-plus"></i>
                </li>
               
                
                <li
                  style="display:grid;color: #e98156;"
                  @click="request_friend('del')"
                      v-if="if_req(request,username_id)"
                  class="list-inline-item"
                > <i style="font-size: 22px;margin-bottom: 4px;" class="fas fa-user mr-1"></i>
                  <small >
                   Cancel Request</small
                  >
                </li>
                 </div>
                    </div>
              </div>
            </ul>
            <br />
            <div
              style="
                position: absolute;
                left: 50%;
                transform: translate(-50%, 35px);
              "
            >
              <h4 v-if="user_profile.username" class="text-white">
                {{ user_profile.username }}
              </h4>
            </div>
          </div>

          <div v-if="username_id == $route.params.id" class="py-3">
            <div class="dark_div_profile add_field shadow-sm">
              <button id="new_btn">
                <i
                  v-if="file != ''"
                  @click="reset_file($event)"
                  style="font-size: 22px"
                  class="fas fa-window-close"
                ></i>
                <div v-if="file == ''">
                  <p class="m-0">Uploads New Image</p>
                  <br />
                  <i class="fas fa-upload"></i>
                </div>
                <p style="font-weight: 100" class="m-0" v-else>
                  {{ file.name }}
                </p>
              </button>

              <br />
              <form @submit.prevent="submit">
                <input
                  style="display: none"
                  class="input_file"
                  type="file"
                  ref="file"
                  name="file"
                  id="uploadFile"
                />

                <button
                  v-if="file != ''"
                  class="btn btn-upload btn-outline-dark btn-sm btn-block"
                >
                  UPLOAD
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container py-4">
      <div
        v-if="(user_profile.friends && user_profile.friends.includes(username_id)) || $route.params.id == username_id"
        
        class="d-flex align-items-center justify-content-between mb-3"
      >
        
         <p  v-if="single_post_show" style="color: white" class="mb-0">{{focus_post.date}}</p>

         <h5 v-else style="color: white" class="mb-0">Recent photos</h5>
        <a
          v-if="single_post_show"
          @click="single_post_show = !single_post_show"
          class=" btn_show btn btn-link text-white"
          >Show all</a
        >
      </div>
    
    </div>

    <!-- <div @click="hide_img($event)" v-show="img_show" class="modal_img">
      <img class="img-fluid" :src="this.image" alt="" />
     
    </div> -->

    <div v-if="(user_profile.friends && user_profile.friends.includes(username_id)) || $route.params.id == username_id">
      <div v-if="single_post_show">
        <div
          class="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4 p-0 single_poste"
          style="margin: auto"
        >
          <!-- Comments Form -->
          <div class="card dark_post">
            <div class="dark_img post-img">
              <!-- <img class="images-post" :data-src="getImgUrl(post.images)"   v-bind:alt="pic">   -->
              <img
                v-bind:class="{
                  red_image_pofile: focus_post.dim[0].height > 800,
                }"
                class=" "
                :src="this.image"
                alt=""
              />
            </div>
            <Likes
              :scroll_comment="scroll_comment"
              :all_posts="user_post"
              :post="focus_post"
            />
          </div>
        </div>
      </div>
      <div v-if="!single_post_show" class="All_posts grid_3 container">
        <figure class="grid-img" v-for="post in user_post" :key="post._id">
          <div class="content-img-profile">
            <img
              v-bind:class="{ red_image: post.dim[0].height > 800 }"
              @click="show_img(post)"
              class="img-profile"
              :src="post.images_url"
            />
            <div style="display: flex" class="like_div">
              <div
                @click="like(post._id, post.likes)"
                v-bind:class="{ liked_div: post.likes.includes(username_id) }"
                class="likes"
              >
                <i class="fas fa-thumbs-up"></i>
                <span>{{ post.likes.length }}</span>
              </div>
              <div
                @click="show_img(post)"
                v-bind:class="{ liked_div: post.comments.length > 0 }"
                class="likes"
              >
                <i
                  style="font-size: 22px; transform: translate(1px, -2px)"
                  class="fas fa-comment-dots"
                ></i>
                <span>{{ post.comments.length }}</span>
              </div>
              <div style="margin-left: auto" class="likes">
                <i style="font-size: 28px" class="fas fa-ellipsis-h"></i>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </div>
      <div
      v-else-if="user_profile.friends"
        class="private_div"
        style="color: white"
   
      >
        <img src="/images/lock.png" alt="" />
        <p>This Profile Is Private</p>
      </div>
  </div>
</template>

<script>
import Likes from "../components/likes";
import axios from "axios";
import io from "socket.io-client";
var socket = io("http://localhost:3000");
export default {
  name: "profile",
  components: {
    Likes,
  },
  data() {
    return {
      connected_user :[],
      single_post_show: false,
      loading_upload: false,
      file: "",
      username: "",
      username_id: "",
      user_post: [],
      user_profile: [],
      show_component: true,
      img_show: false,
      image: "",
      friends: [],
      focus_post: "",
      scroll_comment: false,
      request: [],
      send_req: false,
    };
  },
  watch: {
    
    single_post_show(){
       this.$nextTick(() => {
       var element = document.querySelector('.profile')
    element.scrollTop = element.scrollHeight - element.clientHeight;
      });
    }
  },
  methods: {
      if_req_confirm(){
        if (this.connected_user != [] ) {
          if ( this.connected_user.request) {
             var req =  this.connected_user.request.find(x => x.sender_id == this.$route.params.id)
        
           if (req) {
               
               return true
           }
           else{
               return false
           }
          
          }
          
        }
    
    },
    if_req(id_profil,id_visitor){
        if (id_profil.length == 0) {
            return
        }
        else{
  var req =  id_profil.find(x => x.sender_id == id_visitor)
  
       if (req.sender_id) {
       
         return true
       }
       else {
      
          return false
       }
        }

// jsObjects.find(x => x.b === 6)
   
    
    },
     delete_friend(){
      let data = {
        user : this.username_id,
        new_friend : this.$route.params.id
      }
       socket.emit("DELETE_FRIEND",data)
    },
    cofirm_friend(){
      let data = {
        user_name : this.username,
        user : this.username_id,
          sender_name : this.user_profile.username,
        sender : this.$route.params.id,
      
      }
       socket.emit("CONFIRM_FRIEND",data)
    },
    request_friend(req) {
      socket.emit("ADD_FREIND", {
        req,
        profile_id: this.$route.params.id,
        sender_id: this.username_id,
        sender : this.username
        
      });
    },
    is_friend() {
      // else {
      //   const req = this.user_profile.friends.find(
      //     (req) => req.sender == this.username_id
      //   );
      //   if (req) {
      //     this.send_req = true;
      //   }
      //   return req.accept;
      // }
    },
    like(id) {
      this.get(id);
      socket.emit("LIKE", {
        post_id: id,
        user_like: this.username_id,
        profile: this.$route.params.id,
      });
    },
    hide_img(e) {
      if (e.target.className == "modal_img") {
        this.img_show = false;
      }
      this.focus_post = "";
    },
    show_img(post) {
      this.focus_post = post;
      this.image = post.images_url;
      this.img_show = true;
      this.single_post_show = true;
       
   

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
            name: "home",
          });
        }
      });
      this.loading_upload = true;
      document.getElementById("uploadFile").value = "";
    },
    get(id) {
      for (let i = 0; i < this.user_post.length; i++) {
        if (this.user_post[i]._id == id) {
          if (this.user_post[i].likes.includes(this.username_id)) {
            const index = this.user_post[i].likes.indexOf(this.username_id);
            if (index > -1) {
              this.user_post[i].likes.splice(index, 1);
            }
          } else {
            this.user_post[i].likes.push(this.username_id);
          }
        }
      }
    },
  },
  mounted() {
    var new_btn = document.querySelector("#new_btn");
    var file = document.querySelector(".input_file");
    if (new_btn && file) {
      new_btn.onclick = (e) => {
        e.preventDefault();
        console.log(e.target.className);
        if (e.target.className == "fas fa-window-close") {
          this.file = "";
        } else {
          file.click();
        }
        file.onchange = () => {
          this.file = this.$refs.file.files[0];
          console.log(this.file);
        };
      };
    }
  },
  created() {

    socket.on("FRIENDS_ACCEPTED",(data)=>{
        console.log(data)
        this.$router.push({
        path: "/home",
      });
          this.$nextTick(() => {
        this.$router.push({
          name: "profile",
          params: { id: data },
        });
      });
    })
    socket.on("COMMENT", (data) => {
   
      for (let i = 0; i < this.user_post.length; i++) {
        if (this.user_post[i]._id == data._id) {
          this.user_post[i].comments = data.comments;
          this.scroll_comment = !this.scroll_comment;
          break;
        }
      }
    });

    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
    if (this.username == null || this.username == "") {
      this.$router.push({
        name: "home",
        params: { username_empty: true, room: this.$route.params.username },
      });
    }

   socket.emit("GET_POSTS_BY_USER", this.$route.params.id);
    socket.on("GET_POSTS_BY_USER", (posts) => {
      this.user_post = posts;
    });

    socket.emit("GET_FRIEND", this.$route.params.id);
    socket.on("GET_FRIEND", (data) => {
       
      this.user_profile = data;
      this.friends = data.friends;
       this.request = data.request
      if (!this.user_profile.friends.includes(this.username_id) && this.$route.params.id != this.username_id) {
           this.user_post  = []
      }
        
    });

    socket.on("GET_FRIEND_FALSE", () => {
      this.$router.push({
        name: "home",
      });
    });
     
     socket.emit("GET_CONNECTED_USER",this.username_id)
      socket.on("GET_CONNECTED_USER", (user) => {
        
         
          this.connected_user = user[0]
    });
     socket.on("REQUEST_ERR",()=>{
         socket.emit("GET_CONNECTED_USER",this.username_id)
        console.log('err')
        // this.connected_user = data[0]
        
     })
   
  },
};
</script>

<style scoped>
.fa-ellipsis-h:hover {
  background: transparent !important;
}
.red_image_pofile {
  width: 70%;
}
.stat {
  display: flex;
  justify-content: center;
  align-items: center;
}
.share_div {
  margin-left: auto;
  width: 69px;
  display: flex;
  display: flex;
  align-items: center;
  justify-content: center;
}
.liked_div {
  color: #e67d5a !important;
}
.likes:hover {
  background: #e5e5e51e;
}

.likes:focus {
  background: none;
}

.like_div {
  z-index: 99999999999999999999;
  position: relative;
  width: 100%;
  height: 50px;
}
.likes {
  cursor: pointer;
  position: relative;
  height: 100%;
  color: #818181;
  width: 65px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 3px;
  border-right: 0px;
  border-top: 0px;
}

.likes > span {
  margin-left: 3px;
  font-size: 15px;
  font-weight: bold;
  text-align: left;
  padding-left: 3px;
}
.fa-thumbs-up {
  font-size: 22px;
  transform: translate(1px, -2px);
}
.image {
  transition: 0.3s;
  position: absolute;
  width: 100%;
  height: 100;
  height: 100%;
}
/* .grid-img > img  {
 transition: 0.2s;
} */
.grid-img {
  transition: 0.3s;
  filter: brightness(0.8);
}
.grid-img:hover {
  filter: brightness(1);
}
/* .img-profile:hover{
 filter: brightness(0.8);
} */

.profile-head {
  transform: translateY(5rem);
}

.cover {
  background-image: url(https://images.unsplash.com/photo-1530305408560-82d13781b33a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80);
  background-size: cover;
  background-repeat: no-repeat;
}

body {
  background: #654ea3;
  background: linear-gradient(to right, #e96443, #904e95);
  min-height: 100vh;
}
body {
  font-family: "Open Sans", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 930px;
  margin-right: auto;
  margin-left: auto;
}

.column {
  width: 33.33%;
  margin-right: 30px;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 28px;
}

.column > img {
  width: 100%;
  height: 100%;
}

@media (max-width: 760px) {
  .row {
    margin-bottom: 3px;
  }

  .column {
    margin-right: 3px;
  }
}

@media (max-width: 450px) {
  .row {
    flex-direction: column;
    justify-content: center;
  }

  .column {
    width: 100%;
    margin-bottom: 6px;
  }
}

img {
  max-width: 100%;
  display: block;
}

figure {
  position: relative;
  margin: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  margin-bottom: 10px;
  break-inside: avoid;
}

figure > img {
  grid-row: 1 / -1;
  grid-column: 1;
}
.btn_show:hover {
  background: #3f3f3f;
  border-radius: 5px;
  cursor: pointer;
}
</style>