class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static add(vec1, vec2) {
        return new Vector2(
            vec1.x + vec2.x,
            vec1.y + vec2.y
        )
    }
}

class Polygon {
    constructor(position = new Vector2(0, 0), vertices = [new Vector2(0, 0)]) {
        this.vertices = vertices
        this.position = position
    }
    update() {
        let vertIdx = 0;
        let vertLength = this.vertices.length
        beginShape()
        for (vertIdx; vertIdx < vertLength; vertIdx++) {
            console.log(this.position, " / ", this.vertices[vertIdx])
            vertex(
                Vector2.add(this.position, this.vertices[vertIdx])
            )
        }
        endShape(CLOSE)
    }
}

class PolyLine {
    constructor(position = new Vector2(0, 0), vertices = [new Vector2(0, 0)]) {
        this.vertices = vertices
        this.position = position
    }
    update() {
        let vertIdx = 0;
        let vertLength = this.vertices.length
        beginShape()
        for (vertIdx; vertIdx < vertLength; vertIdx++) {
            vertex(
                Vector2.add(this.position, this.vertices[vertIdx])
            )
        }
        endShape()
    }
}

class SurfacePoint {
    constructor(position = new Vector2(0, 0)) {
        this.position = position
        this.velocity = new Vector2(0, 0)
    }
    update(targetOffset, k, damp) {
        let y = this.position.y - targetOffset;
        let acceleration = -k * y - this.velocity.y * damp;
    
        //this.position.y += this.velocity.y;
        this.velocity.y += acceleration;
    }
}

class Water {
    constructor(options = {
        position: new Vector2(0, 0), width: 300, height: 100,
        surfaceQuality: 32, k: 0.025, damp: 0.1
    }) {
        options.position = options.position || new Vector2(0, 0)
        options.width = options.width || 300
        options.height = options.height || 100
        options.surfaceQuality = options.surfaceQuality || 32
        options.k = options.k || 0.025
        options.damp = options.damp || 0.1

        this.width = options.width
        this.height = options.height
        this.surfacePoints = []
        
        for (let index = 0; index <= options.surfaceQuality; index++) {
            this.surfacePoints.push(
                new SurfacePoint(
                    new Vector2( (this.width / options.surfaceQuality) * index, Math.random() * 10 )
                )
            )
        }

        this.k = options.k
        this.damp = options.damp

        this.poly = new Polygon(options.position, this.vertices())
    }
    vertices() {
        let finalPoints = []
        let length = this.surfacePoints.length
        
        for (let idx = 0; idx < length; idx++) {
            finalPoints.push(this.surfacePoints[idx].position)
        }
  
        finalPoints.push(new Vector2(this.width, this.height))
        finalPoints.push(new Vector2(0, this.height))

        return finalPoints
    }
    physics() {
        let length = this.surfacePoints.length
        
        for (let idx = 0; idx < length; idx++) {
            this.surfacePoints[idx].update(0, this.k, this.damp)
        }
    }
    update() { 
        //this.physics()
        this.poly.vertices = this.vertices()
        for (let idx = 0; idx < this.poly.vertices.length; idx++) {
            //console.log(this.poly.vertices[idx])
            point(this.poly.vertices[idx].x, this.poly.vertices[idx].y)
        }
        this.poly.update()
    }
}

let water

function setup() {
    createCanvas(1024, 768);
    background(153)
    fill(color('rgb(0, 255, 255)'))
    stroke(color('rgba(0, 0, 0, 0)'))
    water = new Water({position: new Vector2(128, 256)})
    water.update()
}

function draw() {
    //background(153)
    //fill(color('rgb(0, 255, 255)'))
    //stroke(color('rgba(0, 0, 0, 0)'))
    //water.update()
}

