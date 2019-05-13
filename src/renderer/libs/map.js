const ak = 'E4805d16520de693a3fe707cdc962045';

var map = null;

export const getMap = () => {
    return map;
}

export const init = (id, option) => {
    return new Promise(resolve => {
        loadJs(() => {
            createMap(id, option)
            resolve(map)
        })
    })
}

const loadJs = callback => {
    if(window.BMap) {
        callback()
    }
    else {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `http://api.map.baidu.com/getscript?v=2.0&ak=${ak}&services=&t=20190123111209`;
        document.head.appendChild(script);
        script.onload = callback;
    }
}

const createMap = (id, option) => {
    map = new BMap.Map(id, { enableMapClick: false });
    map.enableScrollWheelZoom(true);
    let offset = new BMap.Size(20, 20);
    let navigationControl = new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_TOP_LEFT,
        offset
    });
    map.addControl(navigationControl);
    map.addControl(new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
        offset
    }));
    // map.setMapStyle({ style: MAP_THEME });
    map.addControl(new BMap.MapTypeControl());
    setPosition(option);
    return map;
}

export const setPosition = option => {
    let { lng, lat, zoom } = option;
    let point = createPoint(lng, lat);
    map.centerAndZoom(point, zoom);
}

export const setMapStyle = style => {
    map.setMapStyle({ style });
}

const createPoint = (lat, lng) => {
    return new BMap.Point(lat, lng);
}

export const bindEvent = (ev, target, callback) => {
    let tar = target || map;
    tar.addEventListener(ev, callback)
}
