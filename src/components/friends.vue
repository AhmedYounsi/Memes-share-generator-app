<template>
  <div class="friends">
    <div
      :class="{ w_22: show_friends , loading : !loading_home }"
      style="color: white"
      class="friends_list"
    >
      <div v-show="loading_home">
        <h4 @click="show_friend()" class="title">
          <img class="icone_fr" src="/images/friends.png" alt="" />
          Friends
        </h4>
     <div v-show="loading_home">

    
        <div
          class="one_friend"
          v-for="friend in friends"
          :key="friend._id"
          @click="to_message(friend._id)"
        >
          <i
            v-if="!friend.picture"
            style="font-size: 40px; color: #deb887bf"
            class="far fa-user-circle"
          ></i>
          <img v-else :src="friend.picture" alt="" />
          <p class="m-0">{{ friend.username }}</p>

          <img class="btn_msg" src="/images/msg_icone.png" alt="" />
        </div>
         </div>
      </div>
      
    </div>
  </div>
<!-- 
<div v-show="loading_home">
        <div   class="loading_title">
          <div class="icon_friends">
            <div></div>
          </div>
          <div class="title_friends">
            <div></div>
          </div>
        </div>
        
         <div   class="loading_title">
          <div class="icon_friends">
            <div></div>
          </div>
          <div style="width: 50%;" class="title_friends">
            <div class="name_chat"></div>
          </div>
          <div style="width: 30%;" class="title_friends">
            <div class="name_chat"></div>
          </div>
        </div>
      </div> -->

</template>

<script>
import { socket } from "../init_socket";
export default {
  name: "Friends",
  props: ["show_friends","loading_home"],
  data() {
    return {
 
      connected_user: [],
      friends: [],
      username: "",
      username_id: "",
    };
  },
  methods: {
    show_friend() {
      this.$emit("show_friend");
    },
    random_image() {
      var img = Math.floor(Math.random() * Math.floor(30));
      return `https://randomuser.me/api/portraits/men/${img}.jpg`;
    },
    to_message(id) {
      this.$router.push({
        path: `/inbox/_chat/${id}`,
      });
    },
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
    this.$nextTick(() => {
      if (this.username_id) {
        socket.emit("GET_CONNECTED_USER", this.username_id);
        socket.on("GET_CONNECTED_USER", (user) => {
          this.connected_user = user[0];
        });

        socket.emit("GET_FRIENDS_LIST", this.username_id);
        socket.on("GET_FRIENDS_LIST", (friends) => {
          this.friends = friends;
        });
      }
    });
  },
};
</script>

<style scoped>
@keyframes example {
  from {
    filter: invert(0);

  }
  to {
    filter: invert(0.08);

  }
}
.loading{
  animation: example 1s infinite alternate;
}
 
.name_chat {
  width: 100% !important;
      height: 21px !important;
    margin-left: auto;
    margin-right: 14px;
}
.loading_title {
  width: 100%;
  height: 55px;
  display: flex;
  padding-bottom: 4px;
}
.icon_friends {
  width: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon_friends > div {
  width: 40px;
  height: 40px;
  background: #353535;
  border-radius: 17px;
  margin-left: -7px;
}
.title_friends {
  width: 80%;
  display: flex;
  align-items: center;
}
.title_friends > div {
  width: 54%;
  height: 26px;
  background: #353535;
  border-radius: 15px;
  margin-left: -7px;
}
.title:hover {
  background: rgba(49, 49, 49, 0.377);
}
.title {
  cursor: pointer;
  filter: drop-shadow(2px 4px 6px black);
  display: flex;
  padding-top: 10px;
  padding-bottom: 7px;
  margin-bottom: 10px;
  color: rgb(208, 208, 208);
  text-align: left;
  padding-left: 15px;
}
.icone_fr {
  margin-right: 5px;
  width: 32px;
  transform: translate(-4px, -2px);
}
.friends {
  border-radius: 14px;
  position: relative;
  display: flex;
  justify-content: center;
}
.friends_list {
  overflow: hidden;
  padding: 0;
  position: fixed;
  color: white;
  background: #00000057;
  border-radius: 14px;
  height: 100%;
  margin-top: 30px;
}

.btn_msg {
  margin-left: auto;
  width: 35px;
  transform: translateY(1px);
}
.fa-user-circle {
  font-size: 30px;
  margin-right: 13px;
}
.one_friend:hover {
  background: #60606047;
}
.one_friend > p {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 5px;
}
.one_friend > img:first-child {
  width: 43px;
  margin-right: 10px;
  border-radius: 50%;
  filter: drop-shadow(2px 4px 6px black);
}
.one_friend {
  transition: 0.3s;

  padding: 10px 7px;

  cursor: pointer;
  display: flex;
  align-items: center;
}
.trans {
  transform: translateX(0) !important;
}
</style>
