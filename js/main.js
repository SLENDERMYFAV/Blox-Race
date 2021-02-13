let car = []
let carGroup
let carTurnSpeed = 100
let obstacleGroup
let objectColors = [0xFF0000, 0x0000FF]
let obstacle
let obstacleDelay= 1500
let obstaclePool
let target
let targetGroup
let obstacleExplode
let GameState = {}
let game
let points
let pointsText
let emitter = []
let isGameOver= false
let mouseIsDown
let startX
let endX



setUpCanvas()
gameInitialization()

function setUpCanvas(){
    GameState = {
        init: function() {
            scaleManager()
        },
        preload: function () {
            loadAssets()
        },
        create: function () {
            Create()
        },
        update: function () {
            Update()
        }
    }
    game = new Phaser.Game(400, 767, Phaser.CANVAS)
}

function gameInitialization() {
    game.state.add('GameState', GameState)
    game.state.start('GameState')
}

function scaleManager() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignHorizontally = true
    game.scale.pageAlignVertically = true
}

function loadAssets() {
    game.load.image("bomb", "assets/images/bomb.png")
    game.load.image("candy", "assets/images/candy.png")
    game.load.image("car1", "assets/images/car1.png")
    game.load.image("car2", "assets/images/car2.png")
    game.load.image("gameover", "assets/images/gameover.png")
    game.load.image("obstacle", "assets/images/obstacle.png")
    game.load.image("particle", "assets/images/particle.png")
    game.load.image("fireboom", "assets/images/fireboom.png")
    game.load.image("smoke", "assets/images/smoke.png")
    game.load.bitmapFont("font", "assets/images/font.png", "assets/font/font.fnt")
    game.load.image("road", "assets/images/road.png")
    game.load.image("target", "assets/images/target.png")
    game.load.image("unicorn1", "assets/images/unicorn1.png")
    game.load.image("unicorn2", "assets/images/unicorn2.png")

    
}

function addBackgroundColor(color){
    game.stage.backgroundColor= color
}

function generateLanes(image, visibility){
    let road = game.add.image(game.width/2, game.height/2, image)
    road.anchor.setTo(0.5, 0.5)
    road.alpha = visibility
    road.height= game.height
    road.width= game.width
}

function generateCars(image, size, number){
    number = number||1
    for (let i = 0; i < number; i++){
        car[i]= game.add.sprite(0, game.height-80, (typeof image === 'object' ? image[i] : image + (i+1))) 
        car[i].positions= [game.width*(i*4+1)/8, game.width*(i*4+3)/8]
        car[i].anchor.set(0.5, 0.5)
        car[i].scale.set(size, size)
        car[i].canMove= true
        game.physics.enable(car[i], Phaser.Physics.ARCADE)
        car[i].body.allowRotation= false
        car[i].body.moves= false
        car[i].side= i
        car[i].x= car[i].positions[car[i].side]
        carGroup.add(car[i])
    }
       
}

function objectGroup(){
    carGroup= game.add.group();
    obstacleGroup= game.add.group();
    targetGroup = game.add.group();
}

function keyboardControl(leftKey, rightKey){
    let keyBinders={'left':Phaser.KeyCode.A, 'right': Phaser.KeyCode.D}
    keyA= game.input.keyboard.addKey(keyBinders[leftKey])
    keyA.onDown.add(()=> {this.moveCar({}, 0, 0)})
    keyD= game.input.keyboard.addKey(keyBinders[rightKey])
    keyD.onDown.add(()=> {this.moveCar({}, 0, 1)})
}

function moveCar(e, _carIndex, _carPosition){
    let carToMove
    if(Object.keys(e).length == 0){
        carToMove = _carIndex
    }
    else{
        carToMove = Math.floor(e.position.x/(game.width/2))
    }
    if(car[carToMove].canMove){
        car[carToMove].canMove= false
        let steerTween= game.add.tween(car[carToMove]).to({angle: 20-40*car[carToMove].side},
            carTurnSpeed, Phaser.Easing.Linear.None,true)
        steerTween.onComplete.add(() => {
            game.add.tween(car[carToMove]).to({angle: 0},
            carTurnSpeed, Phaser.Easing.Linear.None,true)})
    }
    if(_carPosition == 0||_carPosition == 1){
        car[carToMove].side= _carPosition
    }
    else{
        car[carToMove].side= 1-car[carToMove].side
    }
    let moveTween= game.add.tween(car[carToMove]).to({
        x: car[carToMove].positions[car[carToMove].side]
    }, carTurnSpeed, Phaser.Easing.Linear.None,true)
    moveTween.onComplete.add(() => {
        car[carToMove].canMove= true
    })
}

function arrowKeyboardControl(leftKey, rightKey){
    let keyBinders={'left':Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT}
    keyLeft= game.input.keyboard.addKey(keyBinders[leftKey])
    keyLeft.onDown.add(()=> {this.moveCar({}, 1, 0)})
    keyRight= game.input.keyboard.addKey(keyBinders[rightKey])
    keyRight.onDown.add(()=> {this.moveCar({}, 1, 1)})
}

function createObstacles(lane, image){
  let position= Phaser.Math.between(0, 1)+2*lane
  obstacle= game.add.sprite(game.width*(position*2+1)/8, -20, image)
  game.physics.enable(obstacle, Phaser.Physics.ARCADE)
  obstacle.anchor.setTo(0.5, 0.5)
  obstacle.tint= objectColors[Math.floor(position/2)]
  game.add.existing(obstacle)
  obstacleGroup.add(obstacle)
  obstacleGroup.setAll("body.velocity.y", 200)
  obstacleGroup.setAll("body.immovable", true)
}

function createTargets(lane, image){
    let position= Phaser.Math.between(0, 1)+2*lane
    target= game.add.sprite(game.width*(position*2+1)/8, -20, image)
    game.physics.enable(target, Phaser.Physics.ARCADE)
    target.anchor.setTo(0.5, 0.5)
    target.tint= objectColors[Math.floor(position/2)]
    game.add.existing(target)
    targetGroup.add(target)
    targetGroup.setAll("body.velocity.y", 200)
    
}
function generateObstacle(obstacleSpeed, obstacleImage, targetImage, obstacleSide){
    obstacleSide= obstacleSide||1
    objectPool= game.time.events.loop(obstacleDelay, () => {
        for(let i = 0; i < obstacleSide; i++){
            if(Phaser.Math.between(0, 1) == 1){
                this.createObstacles(i, obstacleImage)
            }
            else{
                this.createTargets(i, targetImage)
            }
        }
    })
    game.time.events.loop(Phaser.Timer.SECOND*3, this.removeObjects)

    if(obstacleDelay >= 800){
        game.time.events.loop(Phaser.Timer.SECOND*obstacleSpeed, function(){
            obstacleSpeed+= 100
            obstacleDelay-= 100
        })
    }
}

function removeObjects(){
    Object.values(obstacleGroup.children).forEach(element =>{
        if(element.y >= game.height){
            element.destroy();
        }
    })

    Object.values(targetGroup.children).forEach(element =>{
        if(element.y >= game.height){
            element.destroy();
        }
    })

}

function collisionObstacles(minimum, maximum){
    game.physics.arcade.collide(carGroup, obstacleGroup, function(_car, _obstacle){
        obstacleGroup.setAll('body.moves', false)
        carGroup.setAll('body.moves', false)
        game.time.events.remove(objectPool)
        _obstacle.destroy()

        obstacleExplode= game.add.emitter(0, 0, 200)
        obstacleExplode.makeParticles('fireboom')
        obstacleExplode.minParticleScale= minimum
        obstacleExplode.maxParticleScale= maximum
        obstacleExplode.setXSpeed(500)
        obstacleExplode.setYSpeed(500)
        obstacleExplode.x= _obstacle.x
        obstacleExplode.y= _obstacle.y
        obstacleExplode.start(true, 2000, null, 10)
        isGameOver= true


    },null, this)

}

function targetCollector(numOfPoints){
    game.physics.arcade.collide(carGroup, targetGroup, function(_car, _target){
    _target.destroy()
    points+=numOfPoints
   },null, this)
}

function scorePoints(){
    points= 0
    pointsText= game.add.bitmapText(game.width-50, game.height/15, "font", "", 45)
    pointsText.anchor.setTo(0.5, 0.8)
}

function updateScore(){
    pointsText.text= points
}

function gameOver() {
    isGameOver=  false
    gameover = game.add.sprite(game.width / 2, game.height / 2, "gameover")
    gameover.anchor.setTo(0.5, 0.5)
    gameover.alpha = 0.7
    gameover.inputEnabled = true
    gameover.events.onInputDown.add(this.restartGame, this)

    gameoverText = game.add.bitmapText(game.width / 2, game.height / 3, "font", "GAME OVER", 60)
    gameoverText.anchor.setTo(0.5, 0.5)

    restartText = game.add.bitmapText(game.width / 2, game.height / 2, "font", "TAP TO RESTART", 40)
    restartText.anchor.setTo(0.5, 0.5)

    scoreText = game.add.bitmapText(game.width / 2, game.height / 1.5, "font", "", 40)
    scoreText.anchor.setTo(0.5, 0.5)
    scoreText.text= 'Score: '+points


    game.world.bringToTop(this.gameover)
    game.world.bringToTop(this.gameoverText)
    game.world.bringToTop(this.restartText)
    game.world.bringToTop(this.scoreText)
}

function restartGame() {
    game.state.start("GameState")
}

function carSmoke(numOfCars){
    numOfCars= numOfCars||1
    for(let i= 0; i< numOfCars; i++){
        emitter[i]=game.add.emitter(0, 170, 5)
        emitter[i].setYSpeed(50, 100)
        emitter[i].minParticleScale= 0.5
        emitter[i].maxParticleScale= 1
        emitter[i].minRotation= 0
        emitter[i].maxRotation= 0
        emitter[i].makeParticles('smoke', 1, 200)
        emitter[i].start(false, 600, 20)
        car[i].addChild(emitter[i])
    }
}

function tapDown(){
    mouseIsDown= true
    startX= game.input.x
}

function tapUp(){
    mouseIsDown= false
}

function swipe(){
    endX= game.input.x
    if(endX < startX){
        if(game.input.x < game.width/2){
            this.moveCar({}, 0, 0)
        }
        else{
            this.moveCar({}, 1, 0)
        }
        console.log('swipeLeft')
    }
    else{
        console.log('swipeRight')
        if(game.input.x < game.width/2){
            this.moveCar({},0, 1)
        }
        else{
            this.moveCar({}, 1, 1)
        }
    }
}