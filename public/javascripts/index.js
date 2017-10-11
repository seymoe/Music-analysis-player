var height = 0,width = 0,size = 256,ctime = 0,type = 'dot',line;
var app = {
	dots: [],
	cVolume: 50,
	$: function (id){
		if('querySelector' in document){
			return document.querySelector('#'+id);
		}else{
			return document.getElementById(id);
		}
	},
	select: function (list,callback) {
		var len = list.length;
		for (var i = 0; i < len; i++) {
			list[i].onclick = function () {
				for (var j = 0; j < len; j++) {
					list[j].className = "";
				}
				this.className = "selected";
				var _this = this;
				callback && callback(_this);
			}
		}
	},
	random: function (m,n) {
		return Math.round(Math.random() * (n-m) + m);
	},
	getDots: function () {
		this.dots = [];
		for (var i = 0; i < size; i++) {
			var x = this.random(0,width);
			var y = this.random(0,height);
			var color = 'rgb('+this.random(0,255)+',' + this.random(0,255)+ ',' + this.random(0,255)+ ')';
			this.dots.push({
				x: x,
				dx: this.random(1,3),
				y: y,
				color: color,
				cap: 0
			});
		}
	},
	draw: function (arr) {
		ctx.clearRect(0,0,width,height);
		ctx.fillStyle = line;
		ctx.globalAlpha = 1;
		var w = width / 40;
		var cw = w * 0.6;
		var capH = cw > 8 ? 8 : cw;
		for (var i = 0; i < size; i++) {
			var a = app.dots[i];
			if (type === 'dot') {
				var r = arr[i] / 256 * 50;
				ctx.beginPath();
				ctx.arc(a.x,a.y,r,0,Math.PI * 2,true);
				ctx.fillStyle = '#fff';
				ctx.globalAlpha = 0.5;
				ctx.fill();
				if (mv.source && Visualize.ac.state === 'running') {
					a.x += a.dx;
					if (a.x > width) a.x = 0;
				}
			} else if (type === 'column') {
				var h = arr[i] / 256 * height;
				ctx.fillRect(w * i+3,height -h,cw, h);
				ctx.fillRect(w * i+3,height - (a.cap + capH),cw, capH);
				a.cap--;
				if (a.cap < 0) {
					a.cap = 0;
				}
				if (h > 0 && a.cap < h + 40) {
					a.cap = h + 40 > height - capH ? height - capH : h + 40;
				}
			}
		}
	}
}
//初始化Visualize对象实例
var mv = new Visualize({
	size: size,
	draw: app.draw
});


//canvas
var box = app.$("canvasbox"),
	musicList = document.querySelectorAll("#music_list li"),
	drawtype = document.querySelectorAll(".draw-type li"),
	canvas = document.createElement("canvas"),
	ctx = canvas.getContext('2d');
box.appendChild(canvas);

//选择切换样式
app.select(musicList,function (_this) {
	mv.play("/media/" + _this.title);
	app.$("pause_music").className = 'icon-pause';
	if (app.$('load_icon')) {
		document.getElementById('canvasbox').removeChild(document.getElementById('load_icon'));
	}
	var loadIcon = document.createElement('span');
	loadIcon.className = 'icon-spinner9';
	loadIcon.id = 'load_icon';
	box.appendChild(loadIcon);
});
app.select(drawtype,function (_this) {
	type = _this.getAttribute('data-type');
});

//调整窗口大小
function resize() {
	width = box.clientWidth;
	height = box.clientHeight;
	canvas.width = width;
	canvas.height = height;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	app.getDots();
}
resize();
window.onresize = resize;

//control the player
var iconVolume = app.$("icon_volume");
var ctl = app.$("volume_control");
var timer = null;
app.$("volume_control").onchange = function (){
	if (this.value === '0') {
		iconVolume.className = 'icon-volume-mute2';
	}else {
		iconVolume.className = 'icon-volume-medium';
	}
	app.cVolume = this.value;
	mv.changeVolume(this.value/this.max);
}
app.$("volume_control").onchange();
iconVolume.onclick = function () {
	if (this.className === 'icon-volume-medium') {
		ctl.value = '0';
		this.className = 'icon-volume-mute2';
		mv.changeVolume(ctl.value/ctl.max);
	} else if (this.className === 'icon-volume-mute2'){
		ctl.value = app.cVolume;
		this.className = 'icon-volume-medium';
		mv.changeVolume(app.cVolume/ctl.max);
	}
}
iconVolume.onmouseover = function () {
	ctl.style.display = 'block';
	clearTimeout(timer);
}
iconVolume.onmouseout= function () {
	timer = setTimeout(function () {
		ctl.style.display = 'none';
	},3000);
}

app.$("pause_music").onclick = function () {
	if (mv.source && Visualize.ac.state === 'running') {
		Visualize.ac.suspend();
		this.className = "icon-play2";
	} else if (Visualize.ac.state === 'suspended') {
		Visualize.ac.resume();
		this.className = "icon-pause";
	}
}

//调整界面大小
app.$("changepage").onclick = function () {
	var wrapper = app.$("wrapper");
	if (wrapper.className === 'fullpage') {
		wrapper.className = 'normalpage';
		app.$('author_info').style.display = 'block';
	}else if (wrapper.className === 'normalpage') {
		wrapper.className = 'fullpage';
		app.$('author_info').style.display = 'none';
	}
	resize();
};

//prev music
app.$("prev_music").onclick = function () {
	var cnum = 0;
	for (var i = 0; i < musicList.length; i++) {
		if (musicList[i].className === 'selected') {
			cnum = i - 1;
			if (cnum < 0) return;
		}
		musicList[i].className = '';
	}
	mv.play("/media/" + musicList[cnum].title);
	Visualize.ac.resume();
	musicList[cnum].className = 'selected';
	app.$("pause_music").className = 'icon-pause';
	if (app.$('load_icon')) {
		document.getElementById('canvasbox').removeChild(document.getElementById('load_icon'));
	}
	var loadIcon = document.createElement('span');
	loadIcon.className = 'icon-spinner9';
	loadIcon.id = 'load_icon';
	box.appendChild(loadIcon);
}

app.$("next_music").onclick = function () {
	var cnum = 0;
	for (var i = 0; i < musicList.length; i++) {
		if (musicList[i].className === 'selected') {
			cnum = i + 1;
			if (cnum === musicList.length) return;
		}
		musicList[i].className = '';
	}
	mv.play("/media/" + musicList[cnum].title);
	Visualize.ac.resume();
	musicList[cnum].className = 'selected';
	app.$("pause_music").className = 'icon-pause';
	if (app.$('load_icon')) {
		document.getElementById('canvasbox').removeChild(document.getElementById('load_icon'));
	}
	var loadIcon = document.createElement('span');
	loadIcon.className = 'icon-spinner9';
	loadIcon.id = 'load_icon';
	box.appendChild(loadIcon);
}