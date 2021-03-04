import Vue from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faRecordVinyl, faWindowClose, faVideo, faImage, faMicrophone, faCamera, faPlay, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faRecordVinyl, faWindowClose, faVideo, faImage, faMicrophone, faCamera, faPlay, faStopCircle)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
