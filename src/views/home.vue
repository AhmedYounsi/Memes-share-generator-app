<template>
  <div style="width: 100%; height: 100%" class="text-center">
    <!-- SIGN_IN -->
    <div
      v-if="(username == '' || username == null) && login_show"
      class="sign-in"
    >
      <div class="title">
        <div class="icone"><i class="far fa-user"></i></div>
        <div class="title-text">
          <h1 class="mt-3">SIGN IN</h1>
          <p @click="login_show = !login_show">You have an acount ?</p>
        </div>
      </div>

      <!-- alert -->

      <p class="alert" v-if="alert_msg != ''">
        <i class="fas fa-exclamation-triangle"></i>
        {{ alert_msg }}
      </p>
      <!-- alert -->
      <div class="form">
        <input placeholder="Username" v-model="user_sign" type="text" /><br />
        <input placeholder="Password" v-model="password" type="text" /><br />
        <input
          placeholder="Confirm Password"
          v-model="password_confirm"
          type="text"
        /><br />
        <button v-if="!loading_input" class="btn" @click="sign_in()">
          <p class="m-0">SIGN-IN</p>
        </button>
        <div v-else class="spinner-border text-light" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <br />
      </div>
    </div>
    <!-- SIGN_IN -->

    <!-- LOGIN -->
    <div
      v-if="(username == '' || username == null) && !login_show"
      class="login"
    >
      <div class="title">
        <div class="icone"><i class="far fa-user"></i></div>
        <div class="title-text">
          <h1 class="mt-3">LOGIN</h1>
          <p @click="login_show = !login_show">Create an acount ?</p>
        </div>
      </div>
      <!-- alert -->
      <p class="success" v-if="success_msg != ''">
        <i class="fas fa-check-circle"></i>
        {{ success_msg }}
      </p>
      <p class="alert" v-if="alert_msg != ''">
        <i class="fas fa-exclamation-triangle"></i>
        {{ alert_msg }}
      </p>
      <!-- alert -->
      <div style="padding-top: 70px" class="form">
        <input placeholder="Username" v-model="user" type="text" /><br />
        <input placeholder="Password" v-model="password" type="text" /><br />
        <button v-if="!loading_input" class="btn" @click="Login()">
          <p class="m-0">LOGIN</p>
        </button>
        <div v-else class="spinner-border text-light" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <br />
      </div>
    </div>
    <!-- LOGIN -->

    <!-- HOME -->
    <div
      v-if="username != '' && username != null"
      style="padding-bottom: 25px; padding-top: 50px"
      class="logged my-5"
    >
      <div v-if="loading_home">
        <!-- Post   -->
        >

        <div v-for="post in all_posts" :key="post._id" class="all_posts">
          <div
            class="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4 p-0 single_poste"
            style="margin: auto"
          >
            <!-- Comments Form -->
            <div class="card dark_post">
              <router-link
                class="card-header dark_title"
                tag="div"
                style="display: flex; align-items: center; padding: 8px 15px"
                :to="{ name: 'profile', params: { id: post.posted_by_id } }"
              >
                <i style="font-size: 30px" class="far fa-user-circle"></i>
                <h4
                  style="
                    transform: translate(10px, 0px);
                    width: 100%;
                    text-align: left;
                    font-size: 17px;
                  "
                  class="m-0"
                >
                  {{ post.posted_by }}
                </h4>
                <p style="font-weight: bold; font-size: 14px" class="m-0 date">
                  {{ gatDate(post.date) }}
                </p>
              </router-link>

              <div
                class="dark_img post-img"
                v-lazy-container="{ selector: 'img' }"
              >
                <!-- <img class="images-post" :data-src="getImgUrl(post.images)"   v-bind:alt="pic">   -->
                <img
                  v-bind:class="{ red_image_home: post.dim[0].height > 800 }"
                  class=" "
                  :data-src="post.images_url"
                  alt=""
                />
              </div>

              <div></div>
              <Likes
                :scroll_comment="scroll_comment"
                :all_posts="all_posts"
                :post="post"
              />

              <hr class="m-0" />
            </div>
          </div>
          <br />
        </div>

        <div style="margin-top: 20px" class="show">
          <div v-if="next_pag">
            <i
              v-if="loading_scroll"
              @click="Show_More()"
              class="fas fa-chevron-circle-down"
            ></i>

            <div
              style="color: #dd6e69"
              v-else
              class="spinner-border"
              role="status"
            >
              <span class="sr-only">Loading...</span>
            </div>
          </div>
          <p style="color: #dd6e69; font-weight: 900" v-else>No more posts</p>
        </div>

        <!-- Post   -->
      </div>

      <div v-if="!loading_home" class="loading_home">
        <div style="filter: invert(1)" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>

    <!-- HOME -->
  </div>
</template>

<script>
window.onclick = () => {};

import Likes from "../components/likes";
import io from "socket.io-client";
var socket = io("http://localhost:3000");
import { v4 as uuidv4 } from "uuid";
export default {
  components: {
    Likes,
  },
  name: "home",
  props: ["username_general", "pro"],
  data() {
    return {
      show: false,
      username_id: "",
      loading_input: false,
      loading_home: false,
      login_show: false,
      user_sign: "",
      password: "",
      password_confirm: "",
      user: "",
      username: "",
      alert_msg: "",
      // all_rooms: [],
      success_msg: "",
      all_users: [],
      all_posts: [],
      page_num: 0,
      next_pag: true,
      loading_scroll: true,
      comment_text: "",
      scroll_comment: false,
    };
  },
  watch: {
    pro() {
      alert("dddd");
    },
    login_show() {
      this.alert_msg = "";
    },
    username_general(val) {
      this.username = val;
    },
  },
  methods: {
    Show_More() {
      this.loading_scroll = false;
      this.page_num++;
      socket.emit("GET_POSTS", this.page_num);
    },
    gatDate(date) {
      return date;
    },
    getImgUrl(pic) {
      return require("../../server/uploads/images/" + pic);
    },
    private_room(user2_id, username2) {
      var id_room = uuidv4();
      var user1 = localStorage.getItem("username_id");
      var user2 = user2_id;
      var username1 = this.username;
      let private_room = {
        id_room,
        user1,
        user2,
        username1,
        username2,
      };

      this.$router.push({
        name: "_chat",
        params: { id: user2, private_room },
      });
    },
    room_enter(id_room) {
      this.$router.push({
        name: "chat",
        params: { id: id_room, username: this.username },
      });
    },
    new_room() {
      var id_room = uuidv4();
      let room = {
        room_name: "ROOM_1",
        password: "",
        user: this.username,
        room_id: id_room,
      };
      socket.emit("NEW_ROOM", room);
    },
    sign_in() {
      this.success_msg = "";
      this.alert_msg = "";
      if (this.user_sign == "" || this.password == "") {
        this.alert_msg = "required username and password";
        this.user_sign = "";
        this.password_confirm = "";
        this.password = "";
      } else {
        if (this.password_confirm != this.password) {
          this.alert_msg = "Password don't match";
          this.password_confirm = "";
          this.password = "";
          return;
        }
        this.loading_input = true;
        let data = {
          user: this.user_sign,
          password: this.password,
        };
        socket.emit("SIGN_IN", data);
        this.user_sign = "";
        this.password = "";
        this.password_confirm = "";
      }
    },
    Login() {
      this.success_msg = "";
      this.alert_msg = "";
      if (this.user == "" || this.password == "") {
        this.alert_msg = "required username and password";
        this.user = "";

        this.password = "";
      } else {
        this.loading_input = true;
        let data = {
          user: this.user,
          password: this.password,
        };
        socket.emit("LOGIN", data);
        this.user = "";
        this.password = "";
      }
    },
    scroll() {
      socket.emit("GET_POSTS", this.page_num);
    },
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");

    // GET COMMENT & UPDATE
    socket.on("COMMENT", (data) => {
      for (let i = 0; i < this.all_posts.length; i++) {
        if (this.all_posts[i]._id == data._id) {
          this.all_posts[i].comments = data.comments;
          this.scroll_comment = !this.scroll_comment;
          break;
        }
      }
    });

    // GET_POSTS
    socket.emit("GET_POSTS", this.page_num);
    socket.on("GET_POSTS", (data) => {
      this.next_pag = data.next_pag;
      data.post.forEach((element) => {
        this.all_posts.push(element);
      });

      this.loading_home = true;
      this.loading_scroll = true;
    });

    // GET ALL USERS
    socket.emit("DISPLAY_USERS", () => {});
    socket.on("DISPLAY_USERS", (users) => {
      this.all_users = users;
    });
    // //  room created
    // socket.on("DISPLAY_ROOMS", (data) => {
    //   this.all_rooms = data;
    //   this.loading_home = true;
    // });
    // socket.emit("GET_ALL_ROOMS");

    // IF USERNAME EXISIT
    socket.on("USERNAME_EXIST", () => {
      this.alert_msg = "username already used";
      this.loading_input = false;
    });

    //  IF SIGN UP IS DONE SUCCESSFULY
    socket.on("SIGN_IN_DONE", (data) => {
      this.user = data.username;
      this.login_show = false;
      this.loading_input = false;
      this.success_msg = "Successful Sign-up !";
    });

    //  IF USER IS LOGGED SUCCESSFULY
    socket.on("LOGGED", (data) => {
      if (data.username) {
        this.loading_input = false;
        localStorage.setItem("username", data.username);
        localStorage.setItem("username_id", data._id);
        this.username = data.username;
        this.$emit("updateStatus", data);
      } else {
        this.loading_input = false;
        this.alert_msg = data;
      }
    });

    if (this.$route.params.username_empty) {
      this.alert_msg = "you have to enter a username !";
    }
  },
  mounted() {
    window.scrollTo(0, 0);
  },
};
</script>

<style scoped>
textarea {
  color: white;
}
@media screen and (min-width: 500px) and (max-width: 3000px) {
  .red_image_home {
    width: 70% !important;
    margin: auto;
    height: 70vh;
  }
}

@media screen and (min-width: 200px) and (max-width: 500px) {
  .red_image_home {
    width: 70% !important;
    margin: auto;
    height: 70vh;
  }
}

.fa-chevron-circle-down {
  font-size: 40px;
  cursor: pointer;
  color: #e47a5d;
}
.fa-chevron-circle-down:hover {
  color: #e47a5dbd;
}
@import url("../../public/css/style.css");
.active-conv {
  background: #e98255;
  color: white;
}
.btn {
  outline: none;
  background: white;
  color: black;
}
.btn:focus {
  border: none;
  outline: none;
}
.alert {
  font-weight: 900;
  margin: 0px;
  padding: 0;
  color: tomato;
  margin-bottom: 9px;
}
.success {
  font-weight: 900;
  margin: 0px;
  padding: 0;
  color: #008a00;
  margin-bottom: 9px;
}
::placeholder {
  color: rgb(143, 143, 143);
  font-size: 15px;
}
.sign-in,
.login {
  width: 300px;
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
}
.fa-user {
  font-size: 80px;
}
.title {
  display: flex;
  justify-content: center;
}
.title-text {
  margin-left: 10px;
}

.title-text > p {
  font-size: 13px;
  cursor: pointer;
}
.form {
  margin-top: 30px;
  height: 245px;
  padding: 40px;
  filter: drop-shadow(5px 10px 8px black);
  background: rgb(0 3 24 / 79%);
  border-bottom-left-radius: 30px;
  border-top-right-radius: 30px;
}
.form > input {
  width: 100%;
  margin-bottom: 15px;
  outline: none;
  border-radius: 20px;
  font-size: 19px;
  color: #515151;
  border: none;
  text-align: center;
}
.title > .icone {
  display: flex;
  align-items: center;
}
.card:hover .card-header {
  color: white;
  background: linear-gradient(to right, #ec8650, #cf5881);
}
</style>