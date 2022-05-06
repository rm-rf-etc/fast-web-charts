export {};

// import '~/includes/polyfills.js';
// import '~/components/top-bar/top-bar.js';
// import '~/components/nav-bar/nav-bar.js';
// import '~/components/generic-button/generic-button.js';
// import '~/components/toggle-button/toggle-button.js';
// import { chartData } from './globals.ts';
// import { CandleStickChart } from '~/components/candlestick-chart.js';
// import { VerticalChartAxis } from '~/components/vertical-chart-axis.js';
// import { HorizontalChartAxis } from '~/components/horizontal-chart-axis.js';
// import { WebSocketService } from '~/services/web-socket/web-socket.js';

// const pageId = (window as any).pageId || null;
// const holdingsText = document.getElementById('holdings')?.innerText;
// Object.assign(window, { holdings: JSON.parse(holdingsText || '') });

// const chart = new CandleStickChart(chartData, {
//   bearish: "rgb(232,59,63)",
//   bullish: "rgb(36,152,136)",
//   line1: "rgb(22,134,254)",
//   line2: "rgb(254,233,58)",
//   onViewChanged(minX, maxX, minY, maxY, zoomY) {
//     ws.push("push-view-changes", { minX, maxX, minY, maxY, zoomY });
//   },
// });

// const vAxis = new VerticalChartAxis(chart);
// const hAxis = new HorizontalChartAxis(chart);
// const ws = new WebSocketService();

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

// if (window.canvasComponents["price-chart"]) {
//   chart.onready({
//     detail: {
//       surface: window.canvasComponents["price-chart"],
//     },
//   });
// } else {
//   addEventListener("canvas-ready", evt => {
//     if (evt.detail.name === "price-chart") chart.onready(evt);
//   });
// }

// if (window.canvasComponents["vertical-rule"]) {
//   vAxis.onready({
//     detail: {
//       surface: window.canvasComponents["vertical-rule"],
//     },
//   });
// } else {
//   addEventListener("canvas-ready", evt => {
//     if (evt.detail.name === "vertical-rule") vAxis.onready(evt);
//   });
// }

// if (window.canvasComponents["horizontal-rule"]) {
//   hAxis.onready({
//     detail: {
//       surface: window.canvasComponents["horizontal-rule"],
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
//   "keyup": evt => {
//     const prop = `keyboard${evt.key}`;
//     if (chart.controls.hasOwnProperty(prop)) {
//       chart.controls[prop] = false;
//     }
//   },
//   "keydown": evt => {
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
