/*the timeline vdeio part start*/
var ones = document.querySelectorAll('.about .one');
var goPreBtn = document.querySelector('.about #Prev');
var goNextBtn = document.querySelector('.about #Next');
var pointLists = document.querySelectorAll('.about .point');
var wrap = document.querySelector('.about .area');
var index = 0;
var time = 0;
var lock = true; 

function clearIndex() {
    for (var i = 0; i < ones.length; i++) {
        ones[i].className = 'one';
        pointLists[i].className = 'point';
    }
}

function goIndex() {
    clearIndex();
    ones[index].className = 'one active';
    pointLists[index].className = 'point current';
}
goIndex();

function goNext() {
    index++;
    if (index > 4) {
        index = 0;
    }
    goIndex();
}

function goPre() {
    index--;
    if (index < 0) {
        index = 4;
    }
    goIndex();
}

function rest() {
    time++;
    if (time == 100) {
        time = 0;
        goNext();  
    }
}

function openLock() {
    lock = true;
}

function startLock(){
    lock = true;
}

goNextBtn.addEventListener('click', function() {
    if (!lock) return; 
    goNext();
    time = 0;
    lock = false;
    setTimeout(openLock, 1000);
});

goPreBtn.addEventListener('click', function() {
    if (!lock) return;
    goPre();
    lock = false;
    time = 0;
    setTimeout(openLock, 1000);
});

for (var j = 0; j < pointLists.length; j++) {
    pointLists[j].setAttribute('pointIndex', j);

    pointLists[j].addEventListener('click', function() {
        var pIndex = this.getAttribute('pointIndex');
        index = pIndex;
        goIndex();
        time = 0;
    })
}
/*the timeline vdeio part ends*/