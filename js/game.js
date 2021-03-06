function Create(){
    objectGroup()
    addBackgroundColor('#ad1764')
    generateLanes('road', 0.5)
    generateCars('car', 0.4, 2)
    generateObstacle(10, 'obstacle', 'target', 2)
    scorePoints()
    updateScore()
    carSmoke(2)
    //keyboardControl('left', 'right')
    game.input.onUp.add(tapUp, this)
    game.input.onDown.add(tapDown, this)
}

function Update(){
    arrowKeyboardControl('left', 'right')
    keyboardControl('left', 'right')
    if(mouseIsDown= true){
        let distX= Math.abs(game.input.x-startX)
        if (distX > 50){
            swipe()
        }
    }
    collisionObstacles(0.1, 0.3)
    targetCollector(1)
    updateScore()
    if(isGameOver){
        gameOver()
    }
}