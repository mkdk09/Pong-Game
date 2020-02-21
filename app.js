const fieldHeight = 400
const fieldWidth = 500

class Platform { //バー
    constructor(x) {
        this.x = x
        this.y = (fieldHeight - Platform.height) / 2
    }

    draw(ctx) {
        ctx.fillStyle = Platform.color
        ctx.fillRect(
            this.x,
            this.y,
            Platform.width,
            Platform.height,
        )
    }
}

Platform.width = 10 //バーの横幅
Platform.height = 100 //バーの縦幅
Platform.color = 'red' //バーの色
Platform.speed = 20 //バーの動くスピード

class Player extends Platform { //プレイヤー Platformを継承
    constructor(x, keyUpCode, keyDownCode) {
        const y = (fieldHeight - Platform.height) / 2
        super(x, y)
        this.keyUpCode = keyUpCode
        this.keyDownCode = keyDownCode
    }

    movePlatformByEvent(e) { //バーの移動
        switch(e.keyCode) {
            case this.keyUpCode: {
                if (this.y > 0) {
                    this.y -= Platform.speed
                }
                break
            }
            case this.keyDownCode: {
                if (this.y < fieldHeight - Platform.height) {
                    this.y += Platform.speed
                }
                break
            }
        }
    }
}

class Ball { //ボール
    constructor() {
        this.setInitialProps()
    }

    setInitialProps(direction) { //ボールの設定
        const directionCoef = (direction === 'right') ? 1 : -1 //最初のボールの方法を決める
        //console.log(directionCoef)
        this.x = fieldWidth / 2
        this.y = fieldHeight / 2
        this.angle = Math.random() * (Math.PI / 2) - (Math.PI / 4) //角度
        this.speed = directionCoef * Math.abs(Ball.initialSpeed) //スピード
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(
            this.x,
            this.y,
            Ball.radius,
            0,
            2 * Math.PI,
            false
        )
        ctx.fillStyle = Ball.color
        ctx.fill()
    }
}

Ball.initialSpeed = 4 //ボールのスピード
Ball.color = 'yellowgreen' //ボールの色
Ball.radius = 5 //ボールの半径

const core = (pong) => { //反射
    const {
        player1,
        player2,
        ball,
        score,
    } = pong

    if ( //壁にぶつかった時
        (ball.y <= Ball.radius) || 
        (ball.y + Ball.radius >= fieldHeight)
    ) {
        ball.speed = -ball.speed
        ball.angle = Math.PI - ball.angle
        return
    }

    if (ball.x - Ball.radius <= Platform.width) { //左のバーにぶつかった時
        if (
            (ball.y + Ball.radius >= player1.y) &&
            (ball.y - Ball.radius <= player1.y + Platform.height) && //バーに当たっているか
            (ball.speed * Math.cos(ball.angle) < 0)
        ) {
            const shift = (player1.y + (Platform.height / 2) - ball.y) / (Platform.height / 2)
            const shiftCoef = (shift / 2) + 0.5

            ball.angle = -(shiftCoef * (Math.PI / 2) - Math.PI / 4)
            ball.speed = -ball.speed
            return
        }
    }

    if (ball.x + Ball.radius >= fieldWidth - Platform.width) { //右のバーにぶつかった時
        if (
            (ball.y - Ball.radius >= player2.y) &&
            (ball.y + Ball.radius <= player2.y + Platform.height) && //バーに当たっているか
            (ball.speed * Math.cos(ball.angle) > 0)
        ) {
            const shift = (player2.y + (Platform.height / 2) - ball.y) / (Platform.height / 2)
            const shiftCoef = (shift / 2) + 0.5

            ball.angle = (shiftCoef * (Math.PI / 2) - Math.PI / 4)
            ball.speed = -ball.speed
            return
        }
    }

    if (ball.x <= Ball.radius) { //左の壁にぶつかった時
        score.player2 += 1
        ball.setInitialProps('left')
        return
    }

    if (ball.x >= fieldWidth - Ball.radius) { //右の壁にぶつかった時
        score.player1 += 1
        ball.setInitialProps('right')
        return
    }
}

const renderScore = (ctx, {player1, player2}) => { //スコアを表示
    ctx.fillStyle = 'red'
    ctx.textAlign = 'center'
    ctx.font = '35px Comic Sans MS'
    ctx.fillText(`${player1}:${player2}`, fieldWidth / 2, 50)
}

const requestAnimationFrame = window.requestAnimationFrame
const render = (ctx, pong) => {
    const {
        player1,
        player2,
        ball,
        score,
    } = pong

    core(pong)
    
    ball.y += Math.round(ball.speed * Math.sin(ball.angle))
    ball.x += Math.round(ball.speed * Math.cos(ball.angle))

    ctx.clearRect(0, 0, fieldWidth, fieldHeight)

    renderScore(ctx, score)
    
    player1.draw(ctx)
    player2.draw(ctx)
    ball.draw(ctx)

    requestAnimationFrame(() => render(ctx, pong)) //何度も実行
}

window.onload = () => {
    const canvas = document.getElementById('field')
    const ctx = canvas.getContext('2d')

    const player1 = new Player(0, 87, 83) //左のプレイヤー
    const player2 = new Player(fieldWidth - Platform.width, 38, 40) //右のプレイヤー

    const pong = {
        player1, 
        player2, 
        ball: new Ball(),
        score: {
            player1: 0,
            player2: 0,
        },
    }

    addEventListener(
        'keydown',
        (e) => {
            player1.movePlatformByEvent.bind(player1)(e)
            player2.movePlatformByEvent.bind(player2)(e)
        }
    )

    render(ctx, pong)
}