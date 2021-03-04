<template>
  <section class="audio-cap-container" v-if="isValid">
    <div v-show="!isUploading" class="stream-container">
      <audio ref="audioRecorded" v-show="showRecordedPlayer" />
      <div class="audio-actions-wrapper">
        <template v-if="!isFinished">
          <button v-if="!isRecording" @click="record" class="btn flex-center">
            {{ recordBtnContent }}
          </button>
          <button v-else @click="stop" class="btn">
            {{ stopBtnContent }}
          </button>
        </template>
      </div>
    </div>
    <Loader v-show="isUploading" />
    <div class="controls" v-if="isFinished && !isUploading">
      <button type="button" class="btn" @click.prevent="resetAudio">
        {{ cancelBtnContent }}
      </button>
      <button type="button" class="btn" @click.prevent="upload">
        {{ uploadBtnContent }}
      </button>
      <button type="button" class="btn" @click.prevent="playRecorded">
        {{ playBtnContent }}
      </button>
    </div>
    <h1 class="error-video">{{ errText }}</h1>
  </section>
</template>

<script>
import Loader from "./Loader.vue";
export default {
  name: "AudioCapture",
  props: {
    recordBtnContent: {
      default: "Record",
    },
    stopBtnContent: {
      default: "◼",
    },
    playBtnContent: {
      default: "➤",
    },
    cancelBtnContent: {
      default: "Cancel",
    },
    uploadBtnContent: {
      default: "Upload",
    },
  },
  components: {
    Loader,
  },
  data() {
    return {
      containerType: "audio/webm",
      errText: null,
      isValid: true,
      isUploading: false,
      isRecording: false, // recording mode identifier
      isFinished: false, // finished recording - action buttons indicator
      recorder: null, // component wide MediaRecorder
      connection: null, // component wide WebSocket
      stream: null,
      recordedBlobs: null,
      recordedUrl: null,
      showRecordedPlayer: false,
    };
  },
  mounted() {
    this.resetAudio();
  },
  methods: {
    resetAudio() {
      this.showRecordedPlayer = false;
      this.recorderBlobs = null;
      this.isFinished = false;
      this.isRecording = false;
      this.isLoading = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
    },
    playRecorded() {
      this.showRecordedPlayer = true;
      const superBuffer = new Blob(this.recordedBlobs, {
        type: this.containerType,
      });
      this.$refs.audioRecorded.src = null;
      this.$refs.audioRecorded.srcObject = null;
      this.$refs.audioRecorded.src = window.URL.createObjectURL(superBuffer);
      this.$refs.audioRecorded.controls = true;
      this.$refs.audioRecorded.play();
    },
    // start recoording
    record() {
      this.recordedBlobs = [];
      this.recorder.start();
      this.isRecording = true;
    },
    // stop recording
    stop() {
      this.recorder.stop();
      this.isRecording = false;
      this.isFinished = true;
    },
    upload() {
      this.isUploading = true;
    },
    // initialize MediaRecorder and video element source
    gotStream(mediaStream) {
      this.stream = mediaStream;
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.audioContext = new AudioContext();
      } catch (e) {
        console.error("Web Audio API not supported.");
      }
      if (typeof MediaRecorder.isTypeSupported == "function") {
        let options;
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          this.containerType = "audio/ogg";
          options = { mimeType: "audio/ogg" };
        } else {
          this.containerType = "audio/wav";
          options = { mimeType: "audio/wav" };
        }
        this.recorder = new MediaRecorder(mediaStream, options);
      } else {
        this.recorder = new MediaRecorder(mediaStream);
      }
      this.recorder.ondataavailable = this.audioDataHandler;
    },
    audioDataHandler(event) {
      this.recordedBlobs.push(event.data);
    },
  },
  unmounted() {
    this.stream.getTracks().forEach(function (track) {
      track.stop();
    });
  },
};
</script>
<style scoped>
.controls button {
  margin: 0 5px;
}
.video-cap-container {
  max-width: 100%;
}
video {
  width: 400px;
}
button.btn {
  border: 2px solid #000;
  border-radius: 5px;
  padding: 5px;
  background: #fff;
  color: #000;
}
</style>