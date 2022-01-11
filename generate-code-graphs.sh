#!/bin/sh

madge --image website-graph.svg --exclude '.css|Icon|Button.js|utilities.js|Route.js|Switch.js|SliderControl.js'  src
madge --image server-graph.svg --exclude 'utils.js|constants.js'  server
