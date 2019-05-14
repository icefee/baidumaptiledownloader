<template>
    <div class="header">
        <div class="title">百度地图贴图下载工具</div>
        <div class="control">
            <a class="minimize" @click="minimize">
                <svg>
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="xlink + '#minimize-window'"></use>
                </svg>
            </a>
            <a class="maximize" @click="toggleMaximize">
                <svg v-if="isMax">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="xlink + '#restore-window'"></use>
                </svg>
                <svg v-else>
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="xlink + '#maximize-window'"></use>
                </svg>
            </a>
            <a class="close" @click="close">
                <svg>
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="xlink + '#close-window'"></use>
                </svg>
            </a>
        </div>
        <div class="drag"></div>
    </div>
</template>

<style scoped>
.header {
    position: relative;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drag {
    position: absolute;
    top: 0;
    left: 0;
    right: 120px;
    bottom: 0;
    z-index: 1;
    -webkit-app-region: drag;
}

.title {
    font-size: 18px;
    line-height: 40px;
    padding: 0 15px;
}

.control {
    position: relative;
    z-index: 5;
    display: flex;
    padding-right: 5px;
}

.control a {
    display: block;
}

.control a svg {
    display: block;
    width: 40px;
    height: 34px;
    padding: 12px 15px;
    cursor: pointer;
    opacity: .6;
    transition: all .4s;
}

.control a:hover svg {
    opacity: 1;
}
</style>

<script>
const { ipcRenderer } = require('electron')

export default {
    data() {
        return {
            xlink: 'static/assets/icons.svg',
            isMax: false
        }
    },
    methods: {
        close() {
            ipcRenderer.send('app-ctrl', 0)
        },
        minimize() {
            ipcRenderer.send('app-ctrl', 1)
        },
        getMaxState() {
            this.isMax = ipcRenderer.sendSync('app-ismax');
        },
        toggleMaximize() {
            ipcRenderer.send('app-ctrl', this.isMax ? 3 : 2)
        }
    },
    created() {
        window.onresize = this.getMaxState;
    },
}
</script>
