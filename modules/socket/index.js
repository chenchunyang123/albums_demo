var socket = require("socket.io");
var http = require("http");

// 定义数组存储对象
var arr = [];
// 定义方法
var findUserById = function(id) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id === id) {
			return arr[i]
		}
	}
}

module.exports = function(app) {
    var server = http.Server(app);
    var io = socket(server);
    // 后端监听事件
    io.on("connection", function(socket) {
        // 监听报道事件
		socket.on("coming", function(msg) {
			msg.id = socket.id;
			arr.push(msg);
			// 通知所有人
			io.sockets.emit("someonelogin", arr)
		})
		// 监听离开事件
		socket.on("disconnect", function(msg) {
			// 通过socket.id删除数组中的成员
			for (var i = 0; i < arr.length; i++) {
				if (socket.id === arr[i].id) {
					arr.splice(i, 1);
					break;
				}
			}
			io.sockets.emit("someoneout", arr);
		})
        // 监听msg事件
		socket.on("msg", function(text) {
			// 获取当前的用户的socket.id
			var id = socket.id;
			// 去数组中查询
			var obj = findUserById(id);
			// 通知所有用户 有人说话了
			io.sockets.emit("listen", {
				username: obj.username,
				head_pic_path: obj.head_pic_path,
				text: text,
				text_color: obj.text_color
			})
		})
    })
    return server;
}