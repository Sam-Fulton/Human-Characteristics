importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.4/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  { url: '../main.html', revision: '1' },
]);

workbox.routing.registerRoute(
  new RegExp('https://raw.githubusercontent.com/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'github-images',
  })
);