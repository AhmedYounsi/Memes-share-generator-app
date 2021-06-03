<template>
  <div style="width: 100%; height: 100vh" class="text-center">

    <!-- LOGIN -->

    <!-- HOME -->
    <div
      v-if="username != '' && username != null"
      style="padding-bottom: 25px"
      class="logged my-5"
    >
      <div v-if="loading_home">
        <!-- Post   -->

        <!-- ROW HOME -->
        <div
          style="
            width: 100%;
            margin: 0px;
            display: flex;
            justify-content: center;
          "
          class="row"
        >
          <div class="best_memes"></div>

          <div :class="{ w_1: show_friends }" class="content_posts">
            <CreatePost
              class="create_post"
              :username="username"
              :username_id="username_id"
            />
            <div
              style="position: relative"
              v-for="post in all_posts"
              :key="post._id"
              class="all_posts mt-5"
            >
              <div class="p-0 single_poste" style="margin: auto">
                <!-- Comments Form -->
                <div class="card dark_post">
                  <router-link
                    class="card-header dark_title"
                    tag="div"
                    style="
                      display: flex;
                      align-items: center;
                      padding: 8px 15px;
                    "
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
                    <p
                      style="font-size: 14px; font-family: 'Heebo'"
                      class="m-0 date"
                    >
                      {{ gatDate(post.date) }}
                    </p>
                  </router-link>

                  <div
                    :id="post._id"
                    class="dark_img post-img"
                    v-lazy-container="{ selector: 'img' }"
                  >
                    <!-- <img class="images-post" :data-src="getImgUrl(post.images)"   v-bind:alt="pic">   -->
                    <img
                      v-bind:class="{
                        red_image_home: post.dim[0].height > 800,
                      }"
                      class="image_posted"
                      :data-src="post.images_url"
                      alt=""
                    />
                  </div>

                  <div></div>
                  <Likes
                    @download="download_img($event)"
                    :scroll_comment="scroll_comment"
                    :all_posts="all_posts"
                    :post="post"
                  />

                  <hr class="m-0" />
                </div>
              </div>
              <br />

              <!-- Post   -->
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
              <p style="color: rgb(150 150 150); font-weight: 900" v-else>
                No more posts
              </p>
            </div>
          </div>

          <div :class="{ w_2: show_friends }" class="friends_row">
            <Friends
              :loading_home="loading_home"
              @show_friend="show_friend"
              :show_friends="show_friends"
              :username="username"
              :username_id="username_id"
            />
          </div>
        </div>
        <!-- ROW HOME -->

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
// import domtoimage from "dom-to-image";
import Friends from "../components/friends";
import CreatePost from "../components/create_post";
import Likes from "../components/likes";
import io from "socket.io-client";
var socket = io("http://localhost:3000");
import { v4 as uuidv4 } from "uuid";
export default {
  components: {
    Friends,
    Likes,
    CreatePost,
  },
  name: "home",
  props: ["username_general", "id_general", "pro"],
  data() {
    return {
      show_friends: false,
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
    id_general(val) {
      this.username_id = val;
    },
    username_general(val) {
      this.username = val;
    },
  },
  methods: {
    toDataURL(url) {
      return fetch(url)
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          return URL.createObjectURL(blob);
        });
    },
    async download_img(id) {
      const img = this.all_posts.find((el) => el._id == id);
      const a = document.createElement("a");
      a.href = await this.toDataURL(img.images_url);
      a.download = `MEMES-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    show_friend() {
      this.show_friends = !this.show_friends;
    },
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

  },
  mounted() {
    window.scrollTo(0, 0);
  },
};
</script>

<style scoped>
@import url("../../public/css/media.css");
.create_post {
  padding: 20px 0px;
  border-radius: 0px;
  margin-top: 29px;
  position: relative;
  background: #00000057;
  border-radius: 14px;
}
/* .friends_list{
  position: absolute;
    right: 0;
    width: 250px;
} */
.dark_post {
  background: #0000009c;
}
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
  background: #ea8353;
  color: white;
  width: 100%;
  margin-top: 12px;
}
.btn:focus {
  border: none;
  outline: none;
}
.alert {
  margin: 0px;
  padding: 0;
  color: #ea8353;
  margin-bottom: 9px;
  font-size: 14px;
}
.success {
  font-size: 14px;
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
  top: 50%;
  transform: translate(-50%, -50%);
}
.fa-user {
  font-size: 80px;
}
.title {
  color: burlywood;
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
  height: 300px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 30px;
  padding: 40px;
  /* filter: drop-shadow(5px 10px 8px black); */
  background: rgb(0 0 0 / 35%);
  border-bottom-left-radius: 30px;
  border-top-right-radius: 30px;
}
.form > input {
  width: 100%;
  color: silver;
  margin-bottom: 15px;
  outline: none;
  height: 45px;
  font-size: 19px;
  border: none;
  text-align: center;
  background: transparent;
  border-bottom: 4px solid grey;
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
