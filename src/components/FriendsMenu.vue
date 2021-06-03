<template>
  <div class="FriendsMenu">
    <div class="friends_container">
        <div v-if="loafing_friend" class="lds-facebook"><div></div><div></div><div></div></div>
      <div
        v-else
        v-for="friends in all_friends"
        :key="friends._id"
        class="single_friend"
        @click="friend_clicked(friends._id, $event)"
      >
        <div class="image">
          <img v-if="friends.picture" :src="friends.picture" alt="" />
          <i class="far fa-user-circle" v-else></i>
        </div>
        <div class="name">
          <p class="m-0">{{ friends.username }}</p>
          <br />
          <p class="m-0 friends_numbers">
            {{ friends.friends.length }} friends
          </p>
        </div>

        <div class="action">
          <i
            v-if="my_friend(friends._id) == 'is_friend'"
            class="fas fa-paper-plane"
            style="font-size: 30px"
          ></i>
          <i
            v-if="my_friend(friends._id) == 'not_friend'"
            class="fas fa-user-plus"
            style="color: burlywood; font-size: 30px"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../init_socket";
export default {
  props: ["user_profile", "connected_user", "username_id"],
  name: "FriendsMenu",
  data() {
    return {
      all_friends: [],
      loafing_friend : true
    };
  },
  methods: {
    friend_clicked(id_user, event) {
      if (event.target.className == "fas fa-paper-plane") {
        this.$router.push({
          name: "_chat",
          params: { id: id_user },
        });
      } else {
        this.$router.push({ name: "home" });
        this.$nextTick(() => {
          this.$router.push({
            name: "profile",
            params: { id: id_user },
          });
        });
      }
    },
    my_friend(id) {
      if (id == this.username_id) {
        return false;
      }
      const is_friend = this.connected_user?.friends?.find((el) => el == id);
      if (is_friend) {
        return "is_friend";
      } else {
        return "not_friend";
      }
    },
  },
  created() {
    socket.emit("GET_FRIENDS_DATA", this.user_profile.friends);
    socket.on("GET_FRIENDS_DATA", (data) => {
      this.all_friends = data;
      this.loafing_friend = false
    });
  },
  mounted() {},
};
</script>

<style scoped>
.FriendsMenu{
  
    position: relative;
}
.friends_numbers {
  color: #b9b9b9;
  font-size: 15px;
}
div {
  align-items: center;
}
.friends_container {
  display: flex;
}
.single_friend:hover {
  background: #5d5d5d8e;
  filter: drop-shadow(2px 4px 6px black);
}
.single_friend {
  filter: drop-shadow(2px 4px 6px black);
  cursor: pointer;
  display: flex;
  color: wheat;
  background: #5d5d5d4a;
  margin: 10px;
  padding: 5px;
  border-radius: 15px;
}
.image > i {
  font-size: 60px;
}

.image > img {
  width: 60px;
  border-radius: 30px;
}
.image {
  text-align: center;
  width: 30%;
}
.name {
  padding: 10px;
  width: 60%;
}
.action {
  text-align: center;
  width: 20%;
}
@media screen and (min-width: 800px) {
  .single_friend {
    width: 33%;
  }
}
@media screen and (min-width: 500px) and (max-width: 800px) {
  .single_friend {
    width: 50%;
  }
}
@media screen and (max-width: 500px) {
  .friends_container {
    display: flex;
    flex-wrap: wrap;
  }
  .single_friend {
    width: 100%;
  }
  .name {
       padding: 5px;
    font-size: 18px;
  }
 
}
.lds-facebook {
    position: absolute;
    left: 50%;
    top: 20px;
    transform: translateX(-50%) scale(.7);
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-facebook div {
  display: inline-block;
  position: absolute;
  left: 8px;
  width: 16px;
  background: #fff;
  animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.lds-facebook div:nth-child(1) {
  left: 8px;
  animation-delay: -0.24s;
}
.lds-facebook div:nth-child(2) {
  left: 32px;
  animation-delay: -0.12s;
}
.lds-facebook div:nth-child(3) {
  left: 56px;
  animation-delay: 0;
}
@keyframes lds-facebook {
  0% {
    top: 8px;
    height: 64px;
  }
  50%, 100% {
    top: 24px;
    height: 32px;
  }
}

</style>