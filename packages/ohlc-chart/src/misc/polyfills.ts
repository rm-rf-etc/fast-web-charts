// import "@webcomponents/webcomponentsjs";
// import "geometry-polyfill";
// import "canvas-5-polyfill";

export {}

if (!Array.prototype.at) {
  Array.prototype.at = function(i) {
    return this[i < 0 ? this.length + i : i];
  }
}

// if (!Object.entries) {
//   Object.entries = function(obj) {
//     const ownProps = Object.keys(obj);
//     let i = ownProps.length;
//     const resArray = new Array(i); // preallocate the Array
//     while (i--) {
//       resArray[i] = [ownProps[i], obj[ownProps[i]]];
//     }
//     return resArray;
//   };
// }
