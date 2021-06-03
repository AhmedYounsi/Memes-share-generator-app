const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const fs = require("fs");
var mongoose = require("mongoose");
const app = express();
const server = require("http").createServer(app);

// import multer
const multer = require("multer");

//db connection
const connectDB = require("./connection/db");
connectDB();

// body parser
app.use(bodyparser.json({ limit: "50mb" }));
app.use(
  bodyparser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

//use bcrypt
const bcrypt = require("bcrypt");

// use cors
app.use(cors());

// include models
const Message = require("./model/model");
const Username = require("./model/user_model");
const Room = require("./model/room_model");
const Private = require("./model/private");
const Post = require("./model/post_modal");
const Notifs = require("./model/notifs");

// INIT PORT
const PORT = process.env.PORT || 3000;

// RUNNIG THE SERVER
server.listen(PORT, function() {
  console.log("server running on port 3000");
});

// handle production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));

  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });
}

// INIT cloudinary
const cloudinary = require("cloudinary").v2;
// cloudinary set
cloudinary.config({
  cloud_name: "dwunw0hyt",
  api_key: "877398276436192",
  api_secret: "sdhuy48bU7tNTOxLIrBw9tSpie4",
});

// inti sokcet

const io = require("socket.io")(server);

// storage multer
const storage = multer.diskStorage({
  destination: function(req, res, callback) {
    callback(null, "uploads/images");
  },
  // extension
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname + ".jpg");
  },
});

// init multer
const upload = multer({
  storage: storage,
});

// init size-of => get imaage dimensions
var sizeOf = require("image-size");
const Notif = require("./model/notifs");
const { execFileSync } = require("child_process");

app.post("/facebook_login", (req, res) => {
  res.status(200).json({ msg: "You have logged in" });
});

// STORAGE IMG ON Cloudinary AND CREATE NEW POST
app.post("/image", upload.single("file"), async (req, res) => {
  if (req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path);
    var dimensions = sizeOf(req.file.path); // replace with your image
    console.log(dimensions.width, dimensions.height);
    const post = new Post({
      description: "new post",
      posted_by_id: req.body.user,
      posted_by: req.body.username,
      images: req.file.filename,
      cloud_id: result.public_id,
      images_url: result.secure_url,
      date: req.body.date,
      time: req.body.time,
      dim: dimensions,
    });
    post.save(post).then(() => {
      console.log("saved");
      res.status(200).json({ msg: "image saved !" });
    });
  }
});

// SOCKET LISTEN
io.on("connection", (socket) => {
  socket.on("UPDATES_IMG", (data) => {
    cloudinary.uploader.upload(data.dataUrl, async (err, result) => {
      const image_updated = await Username.findOneAndUpdate(
        { _id: data.user_id },
        { $set: { picture: result.secure_url } },
        { new: true }
      );
      io.emit(`updated_img${data.user_id}`, image_updated);
    });
  });

  //  UPDATES USER
  socket.on("UPDATE_USER", async (data) => {
    //  UPDATE USERNAME
    const username_check = await Username.findOne({ username: data.username });
    if (username_check) {
      if (username_check._id == data.username_id) {
        console.log("no need tu update username");
      } else {
        socket.emit("UPDATE_USER", "Username Already taken");
        return;
      }
    }
    //  UPDATE EMAIL
    if (data.email) {
      const email_check = await Username.findOne({ email: data.email });
      if (email_check) {
        if (email_check._id == data.username_id) {
          console.log("no need tu update email");
        } else {
          socket.emit("UPDATE_USER", "Username Already taken");
          return;
        }
      }
    }

    console.log("UPDATING...");
    const user_uptdated = await Username.findOneAndUpdate(
      { _id: data.username_id },
      { $set: { username: data.username, full_name: data.full_name } },
      { new: true }
    );
    if (user_uptdated) {
      const res = await Post.updateMany(
        { posted_by_id: user_uptdated._id },
        { posted_by: user_uptdated.username }
      );
      io.emit(`UPDATE_USERNAME${user_uptdated._id}`, user_uptdated);
      socket.emit("UPDATE_USER", user_uptdated);
    }
  });

  // GET_FRIENDS_DATA
  socket.on("GET_FRIENDS_DATA", async (data) => {
    let ids = data;
    const records = await Username.find()
      .where("_id")
      .in(ids)
      .exec();
    socket.emit("GET_FRIENDS_DATA", records);
  });

  socket.on("get_back_peer", (data) => {
    io.emit(`get_back_peer${data[0]}`, data);
  });
  // END_CALL
  socket.on("get_peer", (data) => {
    io.emit(`get_peer${data[1]}`, data);
  });

  // END_CALL
  socket.on("END_CALL", (data) => {
    io.emit(`END_CALL${data.to}`, data);
    io.emit(`END_CALL${data.from.id}`, data);
  });

  // ACCEPT_CALL
  socket.on("ACCEPT_CALL", (data) => {
    io.emit(`ACCEPT_CALL${data[0].from.id}`, data);
  });
  //
  socket.on("VIDEO_CALL_RING", (data) => {
    io.emit(`VIDEO_CALL_RING${data.to}`, data);
    io.emit(`SAVE_CALL${data.from.id}`, data);
  });

  socket.on("requestPeerId", (data) => {
    io.emit(`Get_Peer_Id${data[0]}`, data[1]);
  });

  socket.on("SendPeerId", (data) => {
    io.emit(`ReceivePeerId${data.chat_id}`, data.peerId);
  });

  // IS_typing
  socket.on("is_typing", (data) => {
    var id = data[1];
    io.emit(`IS_TYPING${id}`, data);
  });

  // GET_MSG_NOTIF
  socket.on("GET_MSG_NOTIF", (data) => {
    Private.find({ users: { $in: [data] } })
      .sort({ last_update: "desc" })
      .then((conversation) => {
        socket.emit("GET_MSG_NOTIF", conversation);
      });
  });

  // GET_CONVERSATION_MESSAGES
  socket.on("GET_CONV_MSG", (data) => {
    Private.find({ users: { $in: [data] } })
      .sort({ last_update: "desc" })
      .then((conversation) => {
        socket.emit("GET_CONV_MSG", conversation);
      });
  });

  socket.on("MSG_SEEN", (data) => {
    Private.find({ users: { $in: [data] } })
      .sort({ last_update: "desc" }, { new: true })
      .then((conversation) => {
        socket.emit("MSG_SEEN", conversation);
      });
  });

  // GET_FRIENDS_LIST
  socket.on("GET_FRIENDS_LIST", (data) => {
    Username.find({ friends: { $in: [data] } }).then((friends) => {
      socket.emit("GET_FRIENDS_LIST", friends);
    });
  });

  //  DELETE POST
  socket.on("DELETE_POST", async (data) => {
    await cloudinary.uploader.destroy(data.cloud_id);

    const post_deleted = await Post.findOneAndDelete({ _id: data.id_post });
    if (post_deleted) {
      const posts = await Post.find({ posted_by_id: data.id_user });

      socket.emit("GET_POSTS_BY_USER", posts.reverse());
    }

    const path = `uploads/images/${data.path_img}`;
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });

  // SEARCH USER
  socket.on("SEARCH", (data) => {
    if (data.length > 0) {
      Username.find({ username: { $regex: data, $options: "i" } }).then(
        (result) => {
          if (result.length > 0) {
            socket.emit("SEARCH", result);
          } else socket.emit("SEARCH", "No Results");
        }
      );
    }
  });

  // DELETE FRIEND
  socket.on("DELETE_FRIEND", async (data) => {
    const user = await Username.findOneAndUpdate(
      { _id: data.user },
      { $pull: { friends: data.new_friend } },
      { new: true }
    );
    const user2 = await Username.findOneAndUpdate(
      { _id: data.new_friend },
      { $pull: { friends: data.user } },
      { new: true }
    );
    socket.emit("GET_FRIEND", user2);
  });

  // SEE_NOTif
  socket.on("see_notif", (data) => {
    var arr = [];
    Notifs.find({ id_user: data }).then(async (rsl) => {
      if (rsl.length < 1) return;
      rsl[0].notif.forEach((item) => {
        item.seen = true;
        arr.push(item);
      });

      const updated_notif = await Notifs.findOneAndUpdate(
        { id_user: data },
        { $set: { notif: arr } },
        { new: true }
      );
      io.emit(`see_notif${data}`, updated_notif);
    });
  });

  // GET_NOTIF
  socket.on("GET_NOTIF", async (data) => {
    const notif = await Notifs.find({ id_user: data });
    socket.emit(`GET_NOTIF${data}`, notif[0]);
  });

  socket.on("REQ", async (data) => {
    const verify = await Username.findById(data);
    io.emit(`UPDATE_REQ2${data}`, verify);
  });

  // DELETE_REQUEST
  socket.on("delete_req", async (data) => {
    const user1 = await Username.findOneAndUpdate(
      { _id: data[0] },
      { $pull: { request: { _id: data[1] } } },
      { new: true }
    );
    let rsl = [];
    rsl.push(user1);
    socket.emit("GET_CONNECTED_USER", rsl);
    io.emit("UPDATE_REQ", rsl);
  });

  // CONFIRM FRIEND ******************************************
  socket.on("CONFIRM_FRIEND", async (data) => {
    // VERIFY IF ALREADY FRIENDS
    const verify = await Username.findById(data.user);
    if (verify.friends.includes(data.sender)) {
      socket.emit("REQUEST_ERR", "ALREADY_FRIEND");
    } else {
      // VERIFY IF REQUEST EXISTED WHEN ACCEPTING
      var req = verify.request.find((x) => x.sender_id == data.sender);
      if (req) {
        const user = await Username.findOneAndUpdate(
          { _id: data.user },
          { $push: { friends: data.sender } },
          { new: true }
        );

        const user1 = await Username.findOneAndUpdate(
          { _id: data.user },
          { $pull: { request: { sender_id: data.sender } } },
          { new: true }
        );
        let rsl = [];
        rsl.push(user1);
        socket.emit("GET_CONNECTED_USER", rsl);
        io.emit("UPDATE_REQ", rsl);
        const user2 = await Username.findOneAndUpdate(
          { _id: data.sender },
          { $push: { friends: data.user } },
          { new: true }
        );

        socket.emit("GET_FRIEND", user2);
        socket.emit("FRIENDS_ACCEPTED", data.sender);

        // PUSH NOTIFICATION & SEND TO USER
        var date = new Date().getTime();
        let notif_arr = {
          _from: data.user,
          _from_name: data.user_name,
          seen: false,
          date,
          img_notif: data.img_notif,
        };
        const verif_notif_exist = await Notifs.find({ id_user: data.sender });

        if (verif_notif_exist.length > 0) {
          const notifs = await Notifs.findOneAndUpdate(
            { id_user: data.sender },
            { $push: { notif: notif_arr }, $set: { seen: false } },
            { new: true }
          );

          io.emit(`see_notif${notifs.id_user}`, notifs);
        } else {
          const notif = new Notifs({
            id_user: data.sender,
            notif: notif_arr,
            seen: false,
          });

          notif.save(notif).then((data) => {
            io.emit(`see_notif${data.id_user}`, data);
          });
        }
      }
      // REQUEST DELETED
      else {
        socket.emit("REQUEST_ERR", "REQUEST NOT FOUND");
      }
    }
  });

  const { v4: uuidv4 } = require("uuid");
  // HANDLE REQUEST ADD
  socket.on("ADD_FREIND", async (data) => {
    if (data.req == "add") {
      //  VERIFY IF REQUEST SEND BY NEW FRIEND
      const verif = await Username.findById(data.sender_id);
      var req = verif.request.find((x) => x.profile_id == data.sender_id);
      if (req) {
        socket.emit("REQUEST_ERR", "ERR");
      } else {
        let request = {
          profile_id: data.profile_id,
          sender: data.sender,
          sender_id: data.sender_id,
          _id: uuidv4(),
        };
        const user = await Username.findOneAndUpdate(
          { _id: data.profile_id },
          { $push: { request: request } },
          { new: true }
        );
        socket.emit("GET_FRIEND", user);
        io.emit(data.profile_id, user);
      }
    }

    if (data.req == "del") {
      const verif = await Username.findById(data.profile_id);
      var req = verif.request.find((x) => x.sender_id == data.sender_id);

      const user = await Username.findOneAndUpdate(
        { _id: data.profile_id },
        { $pull: { request: { sender_id: data.sender_id } } },
        { new: true }
      );

      socket.emit("GET_FRIEND", user);

      io.emit(data.profile_id, user);
    } else {
      socket.emit("REQUEST_ERR", "REQUEST NO LONGER EXIXST");
    }
  });

  // DELETE_COMMENT
  socket.on("DELETE_COMM", async (data) => {
    const post = await Post.findOneAndUpdate(
      { _id: data.post_id },
      { $pull: { comments: { comment_id: data.comment_id } } },
      { new: true }
    );
    io.emit("COMMENT", post);
  });
  // HANDLE POST "COMMENTS"
  socket.on("COMMENT", async (data) => {
    const post = await Post.findOneAndUpdate(
      { _id: data.post_id },
      { $push: { comments: data } },
      { new: true }
    );
    Post.findById(data.post_id).then((post) => {
      io.emit("COMMENT", post);
    });
  });

  // HANDLE POST "LIKES"
  socket.on("LIKE", (data) => {
    Post.findById(data.post_id).then((post) => {
      //if user already liked the post => LIKE POST
      if (post.likes.includes(data.user_like)) {
        Post.findByIdAndUpdate(
          data.post_id,
          { $pull: { likes: data.user_like } },
          { new: true }
        ).then((data) => {
          io.emit("LIKED", data);
        });
        //if user first like => DISLIKE POST
      } else {
        Post.findByIdAndUpdate(
          data.post_id,
          { $push: { likes: data.user_like } },
          { new: true }
        ).then((data) => {
          io.emit("LIKED", data);
        });
      }
    });
  });

  // GET GET_CONNECTED_USER
  socket.on("GET_CONNECTED_USER", async (user_id) => {
    const user = await Username.find({ _id: user_id });
    socket.emit("GET_CONNECTED_USER", user);
  });

  // GET ALL POSTS BY USER => SEND TO PROFILE
  socket.on("GET_POSTS_BY_USER", async (user_id) => {
    const posts = await Post.find({ posted_by_id: user_id });
    socket.emit("GET_POSTS_BY_USER", posts.reverse());
  });

  // GET_ALL_POSTS => SEND TO HOME PAGE
  socket.on("GET_POSTS", async (page_num) => {
    // VERIFY THE PAGINATIO
    var count = await Post.countDocuments();
    var next_pag = true;
    if (count - page_num * 10 < 10) {
      var next_pag = false;
    }

    Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip(page_num * 10)
      .then((post) => {
        if (post) {
          socket.emit("GET_POSTS", { post, next_pag });
        }
      });
  });

  // GET_PROFILE_INFO BY USER
  socket.on("GET_FRIEND", (data) => {
    if (mongoose.Types.ObjectId.isValid(data)) {
      Username.findById(data).then((user) => {
        if (user) {
          socket.emit("GET_FRIEND", user);
        } else {
          socket.emit("GET_FRIEND_FALSE");
        }
      });
    } else {
      socket.emit("GET_FRIEND_FALSE");
    }
  });

  // SEEN_MESSAGE
  socket.on("SEE_MESSAGE", (data) => {
    var id_user = data[2];
    Private.findOneAndUpdate(
      { $or: [{ id_conv: data[0] }, { id_conv: data[1] }] },
      { $set: { seen: true } },
      { new: true }
    ).then((rsl) => {
      Private.find({ users: { $in: [id_user] } })
        .sort({ last_update: "desc" })
        .then((conversation) => {
          socket.emit("GET_CONV_MSG", conversation);

          var id = data[3];
          io.emit(`NOTIF${id_user}`, conversation);
          io.emit(`SEEN_MSG${id}`, rsl);
        });
    });
  });

  // SEE_NOTIF_MESSAGE
  notif_msg = (id) => {
    Private.find({ users: { $in: [id] } })
      .sort({ last_update: "desc" })
      .then((conversation) => {
        io.emit(`NOTIF${id}`, conversation);
      });
  };

  // SEND MESSAGE TO SINGLE USER #PRIVATE
  socket.on("VERIFY_CONV_EXIST", (data) => {
    let notified_user = data.notified_user;
    //GET IDs for the sender and receiver
    var id_2 = data.users[0] + data.users[1];
    var id_1 = data.users[1] + data.users[0];

    //VERIFY IF ALREADY HAVE CONVERSATION
    Private.findOneAndUpdate(
      { $or: [{ id_conv: id_1 }, { id_conv: id_2 }] },

      {
        $push: { messages: data.message },
        $set: {
          last_update: Date.now(),
          seen: false,
          last_sender: data.message.sender,
          last_sender_id: data.message.sender_id,
        },
      },
      { new: true }
    ).then((updated) => {
      if (updated) {
        // Private.findOne({
        //   $or: [{ id_conv: id_1 }, { id_conv: id_2 }],
        // }).then((data) => {
        io.emit(id_2, updated);
        io.emit(id_1, updated);
        notif_msg(updated.users[0]);
        notif_msg(updated.users[1]);
        io.emit(`SOUND_NOTIF${notified_user}`);
        // });
        //CREATE NEW CONVERSATION AND SAVE IT
      } else {
        console.log(data.message);
        const private = new Private({
          id_conv: data.id_room,
          messages: data.message,
          users: data.users,
          usernames: data.usernames,
          last_update: Date.now(),
          last_sender: data.message.sender,
          last_sender_id: data.message.sender_id,
          seen: false,
          is_typing: false,
        });
        private.save(private).then(() => {
          Private.findOne({
            $or: [{ id_conv: id_1 }, { id_conv: id_2 }],
          }).then((data) => {
            io.emit(id_2, data);
            io.emit(id_1, data);
            notif_msg(data.users[0]);
            notif_msg(data.users[1]);
          });
        });
      }
      io.emit(data.users[0], data);
    });
  });

  // GET MESSAGES FROM CONVERSATION
  socket.on("GET_PRIVATE", (data1, data2) => {
    Private.findOne({ $or: [{ id_conv: data1 }, { id_conv: data2 }] }).then(
      (data) => {
        io.emit(data1, data);
        io.emit(data2, data);
      }
    );
  });

  // ADD MESSAGE
  socket.on("SEND_MESSAGE", (data) => {
    const message = new Message({
      message: data.message,
      id_room: data.room_id,
      sender: data.sender,
    });

    message.save(message).then(() => {
      Message.find().then((message) => {
        io.emit("DISPLAY_MESSAGE", message);
      });
    });
  });
  // GET MESSAGE
  socket.on("GET_ALL_MESSAGES", () => {
    Message.find().then((message) => {
      io.emit("DISPLAY_MESSAGE", message);
    });
  });

  // DELETE
  socket.on("delete", (id) => {
    Message.findByIdAndDelete(id).then(() => {
      Message.find().then((message) => {
        io.emit("DISPLAY_MESSAGE", message);
      });
    });
  });

  // ADD_USER
  //   socket.on("ADD_USER", (data) => {
  //     Username.find({ username: data }).then((result) => {
  //       if (result.length == 0) {
  //         const username = new Username({
  //           username: data,
  //         });
  //         username.save(username).then((user) => {
  //           socket.emit("USERNAME_LOGIN", user);
  //         });
  //       } else {
  //         socket.emit("USERNAME_EXIST");
  //       }
  //     });
  //   });

  //  SIGN_UP FOR NEW USER

  socket.on("FB_SIGN", (data) => {
    var facebook_profile = data.facebook_profile;
    Username.find({ facebook_profile: data.facebook_profile }).then(
      async (result) => {
        //  check if user exist
        if (result.length == 0) {
          let str = data.name.replace(/\s+/g, "").toLowerCase();
          //  check username is inique or not
          await Username.find().then((users) => {
            let index = users.find((el) => el.username == str);
            if (index) {
              str = data.name.replace(/\s+/g, ".").toLowerCase();
              index = users.find((el) => el.username == str);
              if (index) {
                str = data.name.replace(/\s+/g, "_").toLowerCase();
              }
            } else {
              str = data.name.replace(/\s+/g, "").toLowerCase();
            }
          });

          const img = await cloudinary.uploader.upload(data.picture);

          const username = new Username({
            full_name: data.name,
            username: str.toLowerCase(),
            email: data.email,
            picture: img.secure_url,
            facebook_profile: facebook_profile,
          });
          username.save(username).then((user) => {
            console.log(user);
            socket.emit("LOGGED", user);
          });
        } else {
          socket.emit("LOGGED", result[0]);
        }
      }
    );
  });

  socket.on("SIGN_IN", (data) => {
    bcrypt.hash(data.password, 10).then(function(hash) {
      Username.find({ username: data.user }).then((result) => {
        if (result.length == 0) {
          const username = new Username({
            username: data.user,
            password: hash,
          });
          username.save(username).then((user) => {
            socket.emit("SIGN_IN_DONE", user);
          });
        } else {
          socket.emit("USERNAME_EXIST");
        }
      });
    });
  });

  // LOGIN
  socket.on("LOGIN", (data) => {
    Username.findOne({ username: data.user }).then((result) => {
      if (result) {
        if (result.facebook_profile) {
          socket.emit("LOGGED", "Incorrect username or password");
          return;
        }
        if (bcrypt.compareSync(data.password, result.password)) {
          socket.emit("LOGGED", result);
        } else {
          socket.emit("LOGGED", "Incorrect username or password");
        }
      } else socket.emit("LOGGED", "Incorrect username or password");
    });
  });

  // NEW_ROOM
  socket.on("NEW_ROOM", (data) => {
    const room = new Room({
      room_name: data.room_name,
      password: data.password,
      user: data.user,
      room_id: data.room_id,
    });

    room.save(room).then(() => {
      Room.find().then((rooms) => {
        io.emit("DISPLAY_ROOMS", rooms);
      });
    });
  });

  // ALL_ROOM
  socket.on("GET_ALL_ROOMS", () => {
    Room.find().then((rooms) => {
      io.emit("DISPLAY_ROOMS", rooms);
    });
  });

  // DISPLAY_USERS
  socket.on("DISPLAY_USERS", () => {
    Username.find().then((users) => {
      io.emit("DISPLAY_USERS", users);
    });
  });
});
