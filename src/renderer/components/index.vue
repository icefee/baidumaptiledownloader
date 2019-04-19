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
            </div>
            <!-- <div class="path">
                <input type="file" webkitdirectory directory/>
            </div> -->
            <div class="actions">
                <a href="javascript:" class="btn" :class="{ disabled: downloading }" @click="download">
                    <span class="label">{{ downloading ? '下载中(' + progress.toFixed(2) + '%)' : '开始下载' }}</span>
                    <span class="bar" :style="{ width: progress + '%' }"></span>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import { setTimeout } from 'timers';
const map = require('./../libs/map');
const { MapTool } = require('./../libs/maptool');
const { DownloadTiles } = require('./../libs/download');
let types = ['街道图', '卫星图'], theme = '';
const downloader = new DownloadTiles({ types, theme });

export default {
    data() {
        return {
            map: null,
            lng: 116.4133870000,
            lat: 39.9109240000,
            zoom: 12,
            points: [],
            tiles: 0,
            loading: false,
            downloading: false,
            progress: 0
        }
    },
    methods: {
        async init() {
            let { lng, lat, zoom } = this;
            let option = { lng, lat, zoom };
            this.map = await map.init('map', option);
            this.map.setMinZoom(12);
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
                    this.compute()
                })
            })
            this.compute()
        },
        compute() {
            this.loading = true;
            setTimeout(this.computeTiles, 0);
        },
        computeTiles() {
            let points = [];
            let area = this.map.getBounds();
            let left_bottom = area.getSouthWest();
            let right_top = area.getNorthEast();
            let mapTool = new MapTool();
            let range = [8, 19];
            for(let z = range[0]; z <= range[1]; z ++) {
                let left_bottom_tile = mapTool.lngLatToTile(left_bottom.lng, left_bottom.lat, z);
                let right_top_tile = mapTool.lngLatToTile(right_top.lng, right_top.lat, z);
                for(let x = left_bottom_tile.x; x <= right_top_tile.x; x ++) {
                    for(let y = left_bottom_tile.y; y <= right_top_tile.y; y ++) {
                        points.push({
                            x,
                            y,
                            z
                        })
                    }
                }
            }
            this.tiles = points.length;
            this.points = points;
            this.loading = false;
        },
        download() {
            this.loading = true;
            setTimeout(this.downloadTiles, 0);
        },
        downloadTiles() {
            let that = this;
            that.downloading = true;
            that.loading = false;
            downloader.downloadTiles(this.points, {
                success() {
                    that.downloading = false;
                    that.progress = 0;
                },
                process(val) {
                    if(!that.downloading) return;
                    ipcRenderer.send('handle-process', val)
                    that.progress = val * 100;
                }
            })
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

