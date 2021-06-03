<template >
    <div style="    height: 100vh;">
            <!-- SIGN_IN -->
    <div 
      v-if="(username == '' || username == null) && login_show"
      class="sign-in"
    >
      <div class="title">
        <div class="icone"><i class="far fa-user"></i></div>
        <div class="title-text">
          <h1 class="mt-3">SIGN UP</h1>
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
          <p class="m-0">SIGN-UP</p>
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
      <div class="form">
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
    </div>
</template>
<script>
import io from "socket.io-client";
var socket = io("http://localhost:3000");
export default {
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
  methods:{
         sign_in() {
      this.success_msg = "";
      this.alert_msg = "";
      if (this.user_sign == "" || this.password == "") {
        this.alert_msg = "Username and password required ";
        this.user_sign = "";
        this.password_confirm = "";
        this.password = "";
      } else {
        if (this.password_confirm != this.password) {
          this.alert_msg = "Passwords don't match";
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
        this.alert_msg = "Username and password required";
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
  },
  created(){
       this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
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
        localStorage.setItem("username", data.username);
        localStorage.setItem("username_id", data._id);
        
      window.location.href = "/";
      } else {
        this.loading_input = false;
        this.alert_msg = data;
      }
    });

    if (this.$route.params.username_empty) {
      this.alert_msg = "you have to enter a username !";
    }
  },
  
}
</script>
<style scoped >
    @import url("../../public/css/media.css");
.create_post {
  padding: 20px 0px;
  border-radius: 0px;
  margin-top: 29px;
  position: relative;
  background: #00000057;
  border-radius: 14px;
}

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