import './misc/polyfills';
// import './components/top-bar';
// import './components/nav-bar';
// import './components/generic-button';
// import './components/toggle-button';
import { chartData } from './globals';
import { CandleStickChart } from 'candlestick-chart';
// import { VerticalChartAxis } from './components/vertical-chart-axis';
// import { HorizontalChartAxis } from './components/horizontal-chart-axis';
import { EzSurface } from 'ez-surface';
// import { WebSocketService } from './network/web-socket';

// const pageId = (window as any).pageId || null;
// const holdingsText = document.getElementById('holdings')?.innerText;
// Object.assign(window, { holdings: JSON.parse(holdingsText || '{}') });

export function candleStickChart(surface: EzSurface) {
  const chart = new CandleStickChart(
    surface,
    chartData,
    {
      bearish: "rgb(232,59,63)",
      bullish: "rgb(36,152,136)",
      line1: "rgb(22,134,254)",
      line2: "rgb(254,233,58)",
      controls: {
        autoScale: true,
        zoomEnabled: true,
        scrollEnabled: true,
      },
      onViewChanged(minX: number, maxX: number, minY: number, maxY: number, zoomY: number) {
        // ws.push("push-view-changes", { minX, maxX, minY, maxY, zoomY });
        console.log('view changed', minX, maxX, minY, maxY, zoomY);
      },
    }
  );

  window.addEventListener("blur", () => {
    chart.controls.keyboardShift = false;
    chart.controls.keyboardMeta = false;
  });

  window.addEventListener("keyup", (evt: Event) => {
    if (evt instanceof KeyboardEvent) {
      const prop = `keyboard${evt.key}`;
      if (chart.controls.hasOwnProperty(prop)) {
        Object.assign(chart.controls, { [prop]: false });
      }
    }
  });

  window.addEventListener("keydown", (evt: Event) => {
    if (evt instanceof KeyboardEvent) {
      const prop = `keyboard${evt.key}`;
      if (chart.controls.hasOwnProperty(prop)) {
        Object.assign(chart.controls, { [prop]: true });
      }
    }
  });

  chart.onready();

  // const vAxis = new VerticalChartAxis(chart);
  // const hAxis = new HorizontalChartAxis(chart);
  // const ws = new WebSocketService();
}

// ws.connect(ws => {
//   if (!pageId) throw "pageId not found";
//   ws
//   .join(`price-chart:${pageId}`)
//   .then(channel => {
//     channel.on("view-changed", ({ minX, maxX, minY, maxY, zoomY }) => {
//       chart.surface.setMinMaxY(minY, maxY);
//       chart.surface.setMinMaxX(minX, maxX);
//       chart.surface.zoomY = zoomY;

//       vAxis.surface.setMinMaxY(minY, maxY);
//       hAxis.surface.setMinMaxX(minX, maxX);
//     });
//   })
//   .catch(err => console.error(err));
// });

// if ((window as any).canvasComponents["price-chart"]) {
//   chart.onready({
//     detail: {
//       surface: (window as any).canvasComponents["price-chart"],
//     },
//   });
// } else {
//   window.addEventListener("canvas-ready", (evt: EventListenerOrEventListenerObject) => {
//     if (evt.detail.name === "price-chart") chart.onready(evt);
//   });
// }

// if ((window as any).canvasComponents["vertical-rule"]) {
//   vAxis.onready({
//     detail: {
//       surface: (window as any).canvasComponents["vertical-rule"],
//     },
//   });
// } else {
//   addEventListener("canvas-ready", evt => {
//     if (evt.detail.name === "vertical-rule") vAxis.onready(evt);
//   });
// }

// if ((window as any).canvasComponents["horizontal-rule"]) {
//   hAxis.onready({
//     detail: {
//       surface: (window as any).canvasComponents["horizontal-rule"],
//     },
//   });
// } else {
//   addEventListener("canvas-ready", evt => {
//     if (evt.detail.name === "horizontal-rule") hAxis.onready(evt);
//   });
// }

// Object.entries({
//   "toggle-driver-mode": () => {
//     if (!ws.connected) {
//       throw "socket not connected";
//     }

//     ws
//     .push("toggle-driver-role")
//     .receive("ok", data => {
//       chart.controls.scrollEnabled = data.driving;
//       chart.controls.zoomEnabled = data.driving;
//     })
//     .receive("error", data => console.error(data));
//   },
//   "blur": () => {
//     chart.controls.keyboardShift = false;
//     chart.controls.keyboardMeta = false;
//   },
//   "keyup": (evt: any) => {
//     const prop = `keyboard${evt.key}`;
//     if (chart.controls.hasOwnProperty(prop)) {
//       chart.controls[prop] = false;
//     }
//   },
//   "keydown": (evt: any) => {
//     const prop = `keyboard${evt.key}`;
//     if (chart.controls.hasOwnProperty(prop)) {
//       chart.controls[prop] = true;
//     }
//   },
//   "toggle-auto-scale": ({ detail: { active } }) => {
//     chart.controls.autoScale = active;
//   },
//   "reset-zoom": () => {
//     if (chart.surface) {
//       chart.surface.zoomY = 0;
//     }
//   },
// }).forEach(([ev, fn]) => addEventListener(ev, fn));
