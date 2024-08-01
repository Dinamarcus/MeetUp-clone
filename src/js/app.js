(function () {
    if (document.querySelector(".alertas")) {
       const alertas = document.querySelectorAll(".alerta");
       
        alertas.forEach(alerta => {
            alerta.classList.add("translate-y-0")
            setTimeout(() => {
                alerta.classList.remove("-translate-y-20")
            }, 10);
        })
    }
})();