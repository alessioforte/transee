import Store from 'electron-store';

const store = new Store();

export default store


// TODO handle init store ???
// const initialStore = {
//   version: '2.1.0',
//   startAtLogin: true,
//   checkUpdates: true,
//   showWelcome: true,
//   shortcut: 'Ctrl+Alt+T',
//   langs: {
//     threesome: {
//       from: [
//         {
//           value: 'en',
//           label: 'English',
//         },
//         {
//           value: 'it',
//           label: 'Italian',
//         },
//         {
//           value: 'es',
//           label: 'Spanish',
//         },
//       ],
//       to: [
//         {
//           value: 'it',
//           label: 'Italian',
//         },
//         {
//           value: 'en',
//           label: 'English',
//         },
//         {
//           value: 'es',
//           label: 'Spanish',
//         },
//       ],
//     },
//     selected: {
//       from: 'en',
//       to: 'it',
//     },
//   },
// };
