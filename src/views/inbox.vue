<template>
  <div>
     
        <div style="transform: translateY(49px);overflow:auto" v-if="username" class="rooms">
      <ul style="position: relative;    width: max-content;">
        <div
          @click="private_room(user._id)"
          v-for="user in all_users"
          :key="user._id"
          class="single_room"
         
        >
    <!-- <router-link  v-if="username != user.username" tag="li" :to="{ path: 'inbox/_chat', params: { id: user._id }}"> -->
          <li   v-bind:class="{ active_conv: user._id == $route.params.id }" v-if="username != user.username">
    {{ user.username }}
        
          </li>
        
    <!-- </router-link> -->
        </div>
      </ul>
    </div>
    <div class="inbox_home" v-if="!$route.params.id">
     <i   class="fas fa-paper-plane"></i>
     <br>
      <h1>INBOX</h1>
    </div>
    <router-view v-if="render" ></router-view>
  
  </div>
</template>


<script>
import io from "socket.io-client";
 var socket = io("");
// var socket = io("http://localhost:3000");
// import { v4 as uuidv4 } from "uuid";
export default {
  name: "inbox",
  props: ["username_general"],
  data() {
    return {
      render : true,
      user: "",
      username: "",
      username_id:"",
      success_msg: "",
      all_users: [],
    };
  },
  watch: {
    login_show() {
      this.alert_msg = "";
    },
    username_general(val) {
      this.username = val;
    },
  },
  methods: {
    private_room(user2_id) {
        
       this.$router.push({
        name: "_chat",
        params: { id: user2_id },
      });
      this.render = false
      this.$nextTick(()=>{
           this.render = true
          
      })
      
    },
  
  
    },
   
  created() {

     this.username = localStorage.getItem("username");
     this.username_id = localStorage.getItem("username_id");
 


  if (this.username == null || this.username == "") {
      this.$router.push({
        name: "home",
        params: { username_empty: true, room: this.$route.params.username },
      });
    }

    // Display_User
    socket.emit("DISPLAY_USERS", () => {});
    socket.on("DISPLAY_USERS", (users) => {
      this.all_users = users;
    });
 

    if (this.$route.params.username_empty) {
      this.alert_msg = "you have to enter a username !";
    }
  },
};
</script>

<style scoped>
 /* width */
::-webkit-scrollbar {
  width: 5px;
  height: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
 
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(136 141 147);
  border-radius: 0px;
}
</style>