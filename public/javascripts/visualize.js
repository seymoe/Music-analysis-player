function Visualize(obj) {
	this.source = null;
	this.count = 0;
	this.size = obj.size;

	this.gainNode = Visualize.ac[Visualize.ac.createGain?"createGain":"createGainNode"]();
	this.analyser = Visualize.ac.createAnalyser();
	this.analyser.fftSize = this.size * 2;
	this.gainNode.connect(Visualize.ac.destination);
	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest() || new ActiveXObject('Microsoft.XMLHTTP');

	this.draw = obj.draw;
	this.visualizer();
}

Visualize.ac = new (window.AudioContext || window.webkitAudioCOntext || window.mozAudioContext)();

Visualize.prototype.play = function(url) {
	var n = ++this.count;
	this.source && this.source[this.source.stop?"stop":"noteOff"]();
	var self = this;
	this.load(url,function (arraybuffer) {
		if (n !== self.count) return;
		self.decode(arraybuffer,function (buffer) {
			if (n !== self.count) return;
			var bufferSource = Visualize.ac.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.connect(self.analyser);
			bufferSource.loop = true;
			bufferSource.start(0);
			document.getElementById('canvasbox').removeChild(document.getElementById('load_icon'));
			self.source = bufferSource;
		});
	});
};

Visualize.prototype.load = function (url,callback) {
	this.xhr.abort();
	this.xhr.open("GET",url);
	this.xhr.responseType = 'arraybuffer';
	var self = this;
	this.xhr.onload = function () {
		callback(self.xhr.response);
	};
	this.xhr.send();
}

Visualize.prototype.decode = function (arraybuffer,fun) {
	Visualize.ac.decodeAudioData(arraybuffer,function (buffer) {
		fun(buffer);
	},function (err) {
		console.log(err);
	});
}

Visualize.prototype.visualizer = function () {
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	var requestAnimationFrame = window.requestAnimationFrame ||
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimationFrame;
	var self = this;
	function v() {
		self.analyser.getByteFrequencyData(arr);
		self.draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}

Visualize.prototype.changeVolume = function (percent) {
	this.gainNode.gain.value = percent *percent;
}