<template>
    <div class="index">
        <div class="map-wrap">
            <div id="map"></div>
            <transition name="fade">
                <div class="loading" v-show="loading">
                    <span>加载中...</span>
                </div>
            </transition>
        </div>
        <div class="tool-bar">
            <div class="status">
                <p>当前位置：{{ lng }}, {{ lat }}</p>
                <p>当前缩放：{{ zoom }}</p>
            </div>
            <div class="tiles">
                <p>视野贴图：{{ tiles }}</p>
                <p :style="{ margin: '0 20px' }">
                    地图类型：
                    <input type="checkbox" name="type" id="street" value="街道图" v-model="types" :disabled="downloading"/>
                    <label for="street" :style="{ marginRight: '5px' }">街道图</label>
                    <input type="checkbox" name="type" id="sate" value="卫星图" v-model="types" :disabled="downloading"/>
                    <label for="sate">卫星图</label>
                </p>
                <p>主题：</p>
                <p>
                    <select name="theme" v-model="theme" :disabled="downloading">
                        <option value="">常规</option>
                        <option value="light">清新蓝</option>
                        <option value="dark">黑夜</option>
                        <option value="redalert">红色警戒</option>
                        <option value="googlelite">精简</option>
                        <option value="grassgreen">自然绿</option>
                        <option value="midnight">午夜蓝</option>
                        <option value="pink">浪漫粉</option>
                        <option value="darkgreen">青春绿</option>
                        <option value="bluish">清新蓝</option>
                        <option value="grayscale">高端灰</option>
                        <option value="hardedge">强边界</option>
                    </select>
                </p>
            </div>
            <!-- <div class="path">
                <input type="file" webkitdirectory directory/>
            </div> -->
            <div class="actions">
                <a href="javascript:" class="btn" :class="{ disabled: loading || downloading }" @click="downloadTiles">
                    <span class="label">{{ downloading ? '下载中(' + progress.toFixed(2) + '%)' : '开始下载' }}</span>
                    <span class="bar" :style="{ width: progress + '%' }"></span>
                </a>
                <a href="javascript:" class="btn danger" v-if="downloading" :style="{ marginLeft: '10px' }" @click="stopDownload">停止</a>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer, shell } = require('electron');
const cp = require('child_process');
const map = require('./../libs/map');
const { DownloadTiles } = require('./../libs/download');
const home = `${process.resourcesPath}\\tiles\\`;

export default {
    data() {
        return {
            child: null,
            map: null,
            lng: 116.4133870000,
            lat: 39.9109240000,
            zoom: 12,
            points: [],
            types: ['街道图'],
            theme: '',
            loading: false,
            downloading: false,
            progress: 0,
            downloader: null
        }
    },
    methods: {
        async init() {
            let { lng, lat, zoom } = this;
            let option = { lng, lat, zoom };
            this.map = await map.init('map', option);
            [
                'zoomend',
                'moveend'
            ].forEach(d => {
                map.bindEvent(d, null, e => {
                    if(e.type == 'onzoomend') {
                        this.zoom = this.map.getZoom()
                    }
                    else {
                        let { lng, lat } = this.map.getCenter();
                        this.lng = lng;
                        this.lat = lat;
                    }
                    this.computeTiles()
                })
            })
            this.child = cp.fork(`${__static}\\worker.js`);
            this.child.on('message', result => {
                this.points = result;
                this.loading = false;
            })
            this.computeTiles()
        },
        computeTiles() {
            this.loading = true;
            let area = this.map.getBounds();
            let left_bottom = area.getSouthWest();
            let right_top = area.getNorthEast();
            let range = [8, 18];
            this.child.send({
                map: { left_bottom, right_top },
                range
            })
        },
        downloadTiles() {
            if(!this.types.length) {
                ipcRenderer.send('app-showMessageBox', {
                    type: 'info',
                    message: '请至少选择一种地图类型'
                })
                return;
            }
            let that = this;
            that.downloading = true;
            let { types, theme } = this;
            this.downloader = new DownloadTiles({ types, theme }, home);
            this.downloader.downloadTiles(this.points, {
                success() {
                    that.downloading = false;
                    that.progress = 0;
                    shell.openItem(home);
                },
                process(val) {
                    if(!that.downloading) return;
                    that.setProcess(val);
                    that.progress = val * 100;
                }
            })
        },
        setProcess(val) {
            ipcRenderer.send('handle-process', val)
        },
        stopDownload() {
            this.downloader.stop();
            this.downloading = false;
            this.progress = 0;
            this.setProcess(0);
        }
    },
    computed: {
        tiles() {
            return this.points.length * this.types.length;
        }
    },
    mounted() {
        this.init()
    },
}
</script>

<style scoped>
.map-wrap {
    position: relative;
    height: calc(100% - 40px);
}

.loading {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, .5);
    z-index: 1200;
}

.loading span {
    color: #fff;
    font-size: 14px;
}

#map {
    height: 100%;
}

.tool-bar {
    position: relative;
    display: flex;
    height: 40px;
    padding: 0 5px;
    justify-content: space-between;
    align-items: center;
}

.tool-bar p {
    font-size: 12px;
}

.tiles, .actions {
    display: flex;
}

select[name=theme] {
    background: #001529;
    color: #fff;
    font-family: 'microsoft yahei', 'helvetica', 'simhei', 'simsun', 'sans-serif';
    font-size: 11px;
}

input[type=checkbox] {
    vertical-align: middle;
}

.actions .btn {
    position: relative;
    display: block;
    text-decoration: none;
    color: #fff;
    font-size: 13px;
    border: 1px solid #fff;
    padding: 5px 25px;
}

.actions .btn:hover {
    background: rgba(255, 255, 255, .2);
}

.btn .label {
    position: relative;
    z-index: 30;
}

.btn .bar {
    display: block;
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    background: #1890ff;
    z-index: 20;
}

.btn.disabled {
    pointer-events: none;
}
</style>

