const fs = require('fs')

let tracks =  fs.readFileSync('./tracks.json', 'utf-8')
tracks = JSON.parse(tracks)


console.log(tracks)