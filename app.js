// url text argument
const querystr = window.location.search;
const urlparams = new URLSearchParams(querystr);
const default_text = 'xKond3i'
const default_scale = 10
const url_text = urlparams.get('text')
const url_scale = parseInt(urlparams.get('scale'))
let text = url_text ? url_text : default_text

// basic setup
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let scale = url_scale ? url_scale : default_scale
let font_size = 30
let colors = ['#604bc9', '#604bc9', '#604bc9', '#a39bc9', '#8173c9', '#3e22c9']
// let colors = ['#6fd154', '#499932', '#76cf5d', '#a7ed93']

let particles = []
let text_coords = []
let text_width = null
let text_height = null

// mouse handling
const mouse = {
    x: null,
    y: null,
    radius: 50
}

// easter egg
const image = new Image()
image.src = 'logo.png'
image.onload = () => { if (text === default_text) init() }

window.addEventListener('mousemove', event => {
    mouse.x = event.x
    mouse.y = event.y
})

window.addEventListener('resize', event => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    init()
})

// particle class
class PARTICLE {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.size = 3
        this.start_x = this.x
        this.start_y = this.y
        this.speed = Math.random() * 40 + 10 // 10 to 50
        this.color = colors[Math.round(Math.random() * colors.length)]
    }
    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
    }
    update() {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx**2 + dy**2)
        let max_distance = mouse.radius
        let force = (max_distance - distance) / max_distance
        if (distance < mouse.radius) {
            this.x -= (dx / distance) * force * this.speed
            this.y -= (dy / distance) * force * this.speed
        } else {
            if (this.x !== this.start_x) {
                dx = this.x - this.start_x
                this.x -= dx / this.speed
            }
            if (this.y !== this.start_y) {
                dy = this.y - this.start_y
                this.y -= dy / this.speed
            }
        }
    }
}

// generate and scan text
function generate_text() {
    ctx.fillStyle = 'white'
    ctx.font = `${font_size}px arial`

    text_width = ctx.measureText(text).width
    text_height = ctx.measureText(text).actualBoundingBoxAscent

    if (text_width * scale > window.outerWidth - 32) { 
        text = default_text
        generate_text()
    }

    ctx.fillText(text, 0, text_height)

    text_coords = ctx.getImageData(0, 0, canvas.width, text_height * 2)
}

// init function
function init() {
    if (text === default_text) {
        ctx.drawImage(image, 0, 0, 92, 52)
        text_coords = ctx.getImageData(0, 0, 92, 52)
        text_width = 92
        text_height = 52
    } else {
        generate_text()
    }
    particles = []
    for (let y = 0, y_max = text_coords.height; y < y_max; y++) {
        for (let x = 0, x_max = text_coords.width; x < x_max; x++) {
            if (text_coords.data[(y * x_max * 4) + (x * 4) + 3] < 128) continue

            particles.push(
                new PARTICLE(
                    x * scale + (canvas.width / 2 - text_width * scale / 2),
                    y * scale + (canvas.height / 2 - text_height * scale / 2))
            )
        }
    }
}

// animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(particle => {
        particle.update()
        particle.draw()
    })
    requestAnimationFrame(animate)
}

// start :)
init()
animate()