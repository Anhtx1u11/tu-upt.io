document.getElementById("tinh").onclick = function(){
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let box = document.getElementById("box");
    let ketqua = document.getElementById("ketqua");
    let result;

    if(isNaN(a) || isNaN(b)){
        ketqua.textContent = "Lỗi";
        box.style.display = "block";
        return;
    }
    else if(pheptinh.value = "cong"){
        result = a + b;
    }

        ketqua.textContent= "Kết Quả: ==> "+ result;
      box.style.display = "block";
}

document.getElementById("ok").onclick = function() {
    document.getElementById("box").style.display = "none";
}



  AOS.init();

