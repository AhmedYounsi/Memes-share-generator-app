<template>
  <div>
    <div style="display: flex" class="like_div">
      <!-- LIKE -->
      <div
        v-bind:class="{ liked_div: post.likes.includes(username_id) }"
        @click="like(post, post.likes)"
        class="likes  like_thumbs"
      >
        <i class="fas fa-thumbs-up"></i>
        <span>{{ post.likes.length }}</span>
      </div>
      <!-- COMMNETS -->
      <div
        @click="show_comment()"
        v-bind:class="{
          commented: post.comments.length > 0,
          commented: post.comments.length > 0,
        }"
        class="comment"
      >
        <i class="fas fa-comment-dots"></i>
        <span>{{ post.comments.length }}</span>
      </div>

      <div @click="download(post._id)" class="share">
        <i class="fas fa-download"></i>
      </div>

      <hr />
    </div>
    <!-- display comments -->
    <div
      :class="{ show_comment: comment_section == true }"
      v-bind:id="post._id"
      class="comm all_comment"
    >
      <div v-for="comment in post.comments" :key="comment.id" class="m-0">
        <div style="display: flex;align-items: center;" class="nav-item">
          <div style="    width: 70px;">

         
          <i v-if="!comment.comment_img" style="width: 100%" class="far fa-user-circle"></i>
          <img style="    width: 50px;
    border-radius: 20px;
    margin: 0 9px;
    height: 51px;" v-else  :src="comment.comment_img" alt="">
     </div>
          <div style="position: relative; width: 90%" class="comment-section">
            <div>
              <p style="color: burlywood;" class="commented_by m-0">{{ comment.comment_by }}</p>
              <i
                v-if="comment.comment_by_id == username_id"
                @click="delete_comment(comment.post_id, comment.comment_id)"
                class="fas fa-trash-alt"
                style="
                  top: 8px;
                  position: absolute;
                  right: 20px;
                color: burlywood;
                "
              ></i>
            </div>
            <p class="comment-text">{{ comment.comment_text }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="pr-0 card-body py-0">
      <form style="display: flex" class="">
        <textarea
          @keypress="send_comment($event, post._id)"
          slot-scope=""
          v-model="comment_text"
          style="color: white; margin-right: 5px; background: transparent"
          placeholder="comment..."
          class="comment-input"
          cols="1"
        ></textarea>
        <i @click="Comment(post._id)" class="comment-btn fas fa-ellipsis-h"></i>
        <!-- <i  class="fas fa-comment-dots"></i> -->
      </form>
    </div>
  </div>
</template>

<script>
import { socket } from "../init_socket";
import { v4 as uuidv4 } from "uuid";
export default {
  data() {
    return {
      username: "",
      username_id: "",
      comment_section: false,
      comment_text: "",
    };
  },
  props: ["post", "all_posts", "scroll_comment","connected_user"],
  watch: {
    scroll_comment() {
      this.$nextTick(() => {
        var element = document.getElementById(this.post._id);
        element.scrollTop = element.scrollHeight - element.clientHeight;
      });
    },
  },
  name: "likes",
  methods: {
    send_comment(e, post_id) {
      if (e.keyCode === 13) {
        e.preventDefault();
        this.Comment(post_id);
      }
    },
    download(id) {
      this.$emit("download", id);
    },
    delete_comment(post_id, id_comm) {
      let data = {
        post_id: post_id,
        comment_id: id_comm,
      };
      socket.emit("DELETE_COMM", data);
    },
    show_comment() {
      this.comment_section = !this.comment_section;
      var element = document.getElementById(this.post._id);
      element.scrollTop = element.scrollHeight - element.clientHeight;
    },
    Comment(post_id) {
      var element = document.getElementById(post_id);
      element.scrollTop = element.scrollHeight - element.clientHeight;

      // this.$emit("comment",)

      if (this.comment_text == "") return;
      let comment = {
        post_id,
        comment_text: this.comment_text,
        comment_by: this.username,
        comment_by_id: this.username_id,
        comment_id: uuidv4(),
        comment_img : this.connected_user?.picture
      };

      this.comment_text = "";

      socket.emit("COMMENT", comment);
      this.comment_section = true;
    },
    like(post) {
      this.get(post._id);
      socket.emit("LIKE", {posted_by:post.posted_by_id, post_id: post._id, user_like: this.username_id });
    },
    get(id) {
      for (let i = 0; i < this.all_posts.length; i++) {
        if (this.all_posts[i]._id == id) {
          if (this.all_posts[i].likes.includes(this.username_id)) {
            const index = this.all_posts[i].likes.indexOf(this.username_id);
            if (index > -1) {
              this.all_posts[i].likes.splice(index, 1);
            }
          } else {
            this.all_posts[i].likes.push(this.username_id);
          }
        }
      }
      for (let i = 0; i < this.post.length; i++) {
        console.log[this.post.length[i]];
      }
    },
  },
  mounted() {},
  created() {
    //  UPDATE COMMENT POSTS

    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
  },
};
</script>

<style scoped>

.nav-item {
   margin-top: 8px;
}
.nav-item > div > .fa-user-circle {
         padding-bottom: 3px;
    color: burlywood;
    width: 10%;
    font-size: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.comment-section {
  position: relative;
  width: 90%;
 
  background: #212121b3;
  margin-right: 10px;
  border-radius: 16px;
}
.share:hover {
  background: #262626;
}
.share {
  border-bottom: 3px solid transparent;

  cursor: pointer;
  position: absolute;
  right: 0;
  height: 100%;
  color: #818181;
  width: 58px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 3px;
}
.share > i {
  font-size: 25px;
}
.commented {
  color: #e67d5a !important;
}
.liked_div {
  color: #e67d5a !important;
  border-bottom: 3px solid #e67d5a !important;
}

.like_div {
  position: relative;
  width: 100%;
  height: 50px;
}
.likes {
  border-bottom: 3px solid transparent;

  cursor: pointer;
  position: relative;
  height: 100%;
  color: #818181;
  width: 75px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 3px;
}
.comment {
  border-bottom: 3px solid transparent;

  cursor: pointer;
  position: relative;
  height: 100%;
  color: #818181;
  width: 60px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 3px;
}
.comment:hover,
.likes:hover {
  background: #262626;
}
.comment > span {
  margin-left: 3px;
  font-size: 15px;
  font-weight: bold;
  text-align: left;
  padding-left: 3px;
}
.likes > span {
  margin-left: 3px;
  font-size: 15px;
  font-weight: bold;
  text-align: left;
  padding-left: 3px;
}
.fa-comment-dots {
  font-size: 25px;
  transform: translateY(0);
}
.fa-thumbs-up {
  font-size: 22px;
  transform: translate(1px, -2px);
}
/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>