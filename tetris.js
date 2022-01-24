const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
var theme = new Audio('Audio/TetrisTheme.mp3');

context.scale(30,30);

function audioPlay(audio){
    audio.play();
}
function audioStop(audio){
    audio.pause();
}
function arenaSweep(){
    let rowCount=1;

    outer: for(let y=arena.length-1; y>0; --y){
        for(let x=0;x<arena[y].length;++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }

        const row = arena.splice(y,1)[0].fill(0);
        arena.unshift(row);
        ++y;
        if(rowCount>4){
            tetrisAlert();
            context.fillStyle = 'yellow';
            setTimeout(function(){
                document.getElementById('tetrisAlert').innerText = '';
                context.fillStyle = '#000';
            },2000)
        }
        player.score+=rowCount*10;
        rowCount*=2;
    }
}

function tetrisAlert(){
    document.getElementById('tetrisAlert').innerText = 'TETRIS';
}

function collide(arena,player){
    const [m, o] = [player.matrix, player.pos];
    for(let y=0;y<m.length;++y){
        for(let x=0;x<m[y].length;++x){
            if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w,h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type){
    if(type === 'T'){
        return [
            [0,0,0],
            [1,1,1],
            [0,1,0]
        ]
    }
    else if(type === 'O'){
        return [
            [2,2],
            [2,2]
        ]
    }
    else if(type === 'L'){
        return [
            [0,0,3],
            [3,3,3],
            [0,0,0]
        ]
    }
    else if(type === 'J'){
        return [
            [4,0,0],
            [4,4,4],
            [0,0,0]
        ]
    }
    else if(type === 'I'){
        return [
            [0,0,0,0],
            [5,5,5,5],
            [0,0,0,0],
            [0,0,0,0]
        ]
    }
    else if(type === 'S'){
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0]
        ]
    }
    else if(type === 'Z'){
        return [
            [7,7,0],
            [0,7,7],
            [0,0,0]
        ]
    }
}

function draw(){
    context.fillStyle = '#000';
    context.fillRect(0,0,canvas.width,canvas.height);

    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x+ offset.x, y+ offset.y, 1,1);
            }
        });
    });   
}

function merge(arena,player){
    player.matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value!==0){
                arena[y+player.pos.y][x+player.pos.x]=value;
            }
        })
    })
}

function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena,player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter=0;
}

function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena,player)){
        player.pos.x-=dir;
    }
}

function gameReset(){
    theme.currentTime=0;
    const pieces = 'ILJOTSZ';
    arena.forEach(row => row.fill(0));
    player.score=0;
    player.pos.y=0;
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    updateScore();
}

function playerReset(){
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y=0;
    player.pos.x = (arena[0].length/2|0) - (player.matrix[0].length/2|0);
    if(collide(arena,player)){
        arena.forEach(row => row.fill(0));
        player.score=0;
        updateScore();
    }
}

function storePiece(){
    const buffer = null;
    if(buffer === null){
        buffer = player.matrix;
        playerReset();
    }else{
        let temp = player.matrix;
        player.matrix = buffer;
        buffer = temp;
    }
}

function playerRotate(){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    while(collide(arena,player)){
        player.pos.x += offset;
        offset=-(offset+(offset>0?1:-1));
        if(offset>player.matrix[0].length){
            rotate(player.matrix);
            rotate(player.matrix);
            rotate(player.matrix);
            player.pos.x=pos;
            return;
        }
    }
}

function rotate(matrix){
    for(let y=0;y<matrix.length;++y){
        for(let x=0;x<y;++x){
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ]
        }
    }
    matrix.forEach(row=>row.reverse());
}

let dropCounter = 0;
let dropInterval = null;

let lastTime=0;

function highScore(){
    if(player.score<=500){
        dropInterval=1000;
    }
    if(player.score>500){
        dropInterval=800;
    }
    if(player.score>750){
        dropInterval=500;
    }
    if(player.score>1000){
        dropInterval=300;
    }
    if(player.score>150){
        dropInterval=200;
    }
    if(player.score>2000){
        dropInterval=100;
    }
    if(player.score>3000){
        dropInterval=50;
    }
}

function update(time = 0){
    highScore();
    const deltaTime = time - lastTime;
    lastTime=time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event=>{
    if(event.keyCode === 37){
        playerMove(-1);
    }
    else if(event.keyCode === 39){
        playerMove(+1);
    }
    else if(event.keyCode === 40){
        playerDrop();
    }
    else if(event.keyCode === 38){
        playerRotate();
    }
    else if(event.keyCode === 67){
        storePiece();
    }
    else if(event.keyCode === 27){
        gameReset();
    }
});

const colors = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
]

const arena = createMatrix(12,22);

const player={
    pos:{x:5,y:0},
    matrix: null,
    score: 0
}

playerReset();
updateScore();
update();