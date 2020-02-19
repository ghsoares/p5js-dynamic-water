class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    static add(vec1, vec2) {
        return new Vector2(
            vec1.x + vec2.x,
            vec1.y + vec2.y
        )
    }
    static zero() {
        return new Vector2(0, 0)
    }
    static array(arr = [[0, 0]]) {
        arr = arr.slice()
        let length = arr.length
        for (let idx = 0; idx < length; idx++) {
            arr[idx] = new Vector2(arr[idx][0], arr[idx][1])
        }
        return arr
    }
    static arrayAdd(arr1 = [Vector2.zero()], arr2 = [Vector2.zero()]) {
        if (arr1.length != arr2.length) {
            console.error("It's not possible to add two array of diferent sizes!")
            return;
        }
        let arr = []
        let length = arr1.length
        for (let idx = 0; idx < length; idx++) {
            arr[idx] = Vector2.add(arr1[idx], arr2[idx])
        }

        return arr
    }
    static shiftArray(arr = [Vector2.zero()], offset = Vector2.zero()) {
        arr = arr.slice()
        let length = arr.length
        for (let idx = 0; idx < length; idx++) {
            arr[idx] = Vector2.add(arr[idx], offset)
        }
        return arr
    }
    static toP5VectorArray(arr = [Vector2.zero()]) {
        arr = arr.slice()
        let length = arr.length
        for (let idx = 0; idx < length; idx++) {
            let vec = arr[idx]
            arr[idx] = vec.toP5Vector()
        }
        return arr
    }
    static distance(vec1, vec2) {
        let x = vec2.x - vec1.x
        let y = vec2.y - vec1.y
        return Math.sqrt(x*x + y*y)
    }
    toP5Vector() {
        return createVector(this.x, this.y)
    }
}

class Polygon {
    constructor(position = Vector2.zero(), vertices = [Vector2.zero()]) {
        this.vertices = vertices
        this.position = position
    }
    update() {
        let vertIdx = 0;
        let vertLength = this.vertices.length
        beginShape()
        for (vertIdx; vertIdx < vertLength; vertIdx++) {
            let pos = Vector2.add(this.position, this.vertices[vertIdx])
            vertex(
                pos.x, pos.y
            )
        }
        endShape(CLOSE)
    }
    closestPoint(pos = Vector2.zero()) {
        let vertLength = this.vertices.length
        let closestVec = Vector2.add(this.position, this.vertices[0])
        let closestDist = Vector2.distance(pos, Vector2.add(this.position, this.vertices[0]))
        for (let vertIdx = 0; vertIdx < vertLength; vertIdx++) {
            let distance = Vector2.distance(pos, Vector2.add(this.position, this.vertices[vertIdx]))
            if (distance <= closestDist) {
                closestVec = Vector2.add(this.position, this.vertices[vertIdx])
                closestDist = distance
            }
        }
        return closestVec
    }
}

class PolyLine {
    constructor(position = Vector2.zero(), vertices = [Vector2.zero()]) {
        this.vertices = vertices
        this.position = position
    }
    update() {
        let vertIdx = 0;
        let vertLength = this.vertices.length
        beginShape()
        for (vertIdx; vertIdx < vertLength; vertIdx++) {
            let pos = Vector2.add(this.position, this.vertices[vertIdx])
            vertex(
                pos.x, pos.y
            )
        }
        endShape()
    }
}

class Circle {
    constructor(position = Vector2.zero(), radius = 32) {
        this.position = position
        this.radius = radius
    }
    update() {
        ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
    }
}

class SurfacePoint {
    constructor(position = Vector2.zero()) {
        this.position = position
        this.velocity = Vector2.zero()
    }
    update(targetOffset, k, damp) {
        let y = this.position.y - targetOffset;
        let acceleration = -k * y - this.velocity.y * damp;
    
        this.position.y += this.velocity.y;
        this.velocity.y += acceleration;
    }
}

class Stone {
    constructor(position = Vector2.zero(), radius = 32, gravity = 0.098) {
        this.circle = new Circle(position, radius)
        this.speed = Vector2.zero()
        this.gravity = gravity
    }
    update() {
        this.speed.y += this.gravity
        this.circle.position.y += this.speed.y
        this.circle.position.x += this.speed.x
        ellipse(this.circle.position.x, this.circle.position.y, this.circle.radius * 2, this.circle.radius * 2);
    }
}

class Water {
    constructor(options = {
        position: Vector2.zero(), width: 300, height: 100,
        surfaceQuality: 32, k: 0.025, damp: 0.025, spread: 0.1
    }) {
        options.position = options.position || Vector2.zero()
        options.width = options.width || 300
        options.height = options.height || 100
        options.surfaceQuality = options.surfaceQuality || 32
        options.k = options.k || 0.025
        options.damp = options.damp || 0.025
        options.damp = options.k + options.damp
        options.spread = options.spread || 0.1

        this.width = options.width
        this.height = options.height
        this.surfacePoints = []

        for (let index = 0; index <= options.surfaceQuality; index++) {
            this.surfacePoints.push(
                new SurfacePoint(
                    new Vector2( (this.width / options.surfaceQuality) * index, 0 )
                )
            )
        }

        this.k = options.k
        this.damp = options.damp
        this.spread = options.spread

        this.poly = new Polygon(options.position, this.vertices())
    }
    vertices() {
        let finalPoints = []
        let length = this.surfacePoints.length
        
        for (let idx = 0; idx < length; idx++) {
            finalPoints.push(this.surfacePoints[idx].position)
        }
  
        finalPoints.push(
            new Vector2(this.width, this.height)
        )
        finalPoints.push(
            new Vector2(0, this.height)
        )

        return finalPoints
    }
    splash(pointIdx, force = new Vector2(0, 50)) {
        pointIdx = Math.max(0, Math.min(pointIdx, this.surfacePoints.length - 1))
        this.surfacePoints[pointIdx].velocity = force
    }
    physics() {
        let length = this.surfacePoints.length
        
        for (let idx = 0; idx < length; idx++) {
            this.surfacePoints[idx].update(0, this.k, this.damp)
        }

        let leftDeltas = new Array(length)
        let rightDeltas = new Array(length)

        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < length; i++) {
                if (i > 0) {
                    leftDeltas[i] = this.spread * (this.surfacePoints[i].position.y - this.surfacePoints[i - 1].position.y);
                    this.surfacePoints[i - 1].velocity.y += leftDeltas[i];
                }
                if (i < length - 1)
                {
                    rightDeltas[i] = this.spread * (this.surfacePoints[i].position.y - this.surfacePoints[i + 1].position.y);
                    this.surfacePoints[i + 1].velocity.y += rightDeltas[i];
                }
            }
            for (let i = 0; i < length; i++) {
                if (i > 0)
                    this.surfacePoints[i - 1].position.y += leftDeltas[i];
                if (i < length - 1)
                    this.surfacePoints[i + 1].position.y += rightDeltas[i];
            }
        }
    }
    update() { 
        this.physics()
        this.poly.vertices = this.vertices()
        for (let idx = 0; idx < this.poly.vertices.length; idx++) {
            point(this.poly.vertices[idx].x, this.poly.vertices[idx].y)
        }
        this.poly.update()
    }
}

function detectCollision(shapeA, shapeB) {
    let shapePair = [
        shapeA.constructor.name,
        shapeB.constructor.name
    ].toString()
    let colliding = false

    switch (shapePair) {
        case "Circle,Polygon":
            colliding = collideCirclePoly(
                shapeA.position.x,
                shapeA.position.y,
                shapeA.radius * 2,
                Vector2.toP5VectorArray(
                    Vector2.shiftArray(shapeB.vertices, shapeB.position)
                )
            )
            break
        case "Polygon,Circle":
            colliding = collideCirclePoly(
                shapeB.position.x,
                shapeB.position.y,
                shapeB.radius * 2,
                Vector2.toP5VectorArray(
                    Vector2.shiftArray(shapeA.vertices, shapeA.position)
                )
            )
            break
        default:
            shapePair = Array.from(shapePair)
            console.error("Invalid shape combination: ", shapePair[0], " / ", shapePair[1])
            break
    }
    return colliding
}

let water

let stones = []

function setup() {
    createCanvas(1024, 768);
    water = new Water({width: 640, height: 100, position: new Vector2(100, 320), surfaceQuality: 256})
    water.splash(128, new Vector2(0, 100))
}

function draw() {
    background(153)
    fill(100)
    stroke(color('rgba(0, 0, 0, 0)'))
    for (let stone of stones) {
        stone.update()
        if (detectCollision(stone.circle, water.poly)) {
            let point = water.poly.closestPoint(stone.circle.position)
            //console.log(point, " / ", stone.circle.position)
        }
    }
    fill(color('rgba(0, 255, 255, 0.75)'))
    water.update()
}

function mouseClicked() {
    stones.push(
        new Stone(
            new Vector2(mouseX, mouseY), map(Math.random(), 0, 1, 5, 10)
        )
    )
}