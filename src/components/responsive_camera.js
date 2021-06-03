export const resonsive = function responsive(video1,video2){
 
    if (window.innerWidth > 0 && window.innerWidth <= 500) {
        video1.style.width = "250px";
        video2.style.width = "350px";
      }
      if (window.innerWidth > 500 && window.innerWidth < 800) {
        video1.style.width = "250px";
        video2.style.width = "420px";
      }
         if (window.innerWidth > 800 && window.innerWidth <= 1200) {
        video1.style.width = "280px";
        video2.style.width = "500px";
      }
  
      window.addEventListener("resize", () => {
        if (window.innerWidth > 0 && window.innerWidth <= 500) {
          video1.style.width = "250px";
          video2.style.width = "350px";
        }
        if (window.innerWidth > 500 && window.innerWidth < 800) {
          video1.style.width = "250px";
          video2.style.width = "450px";
        }
               if (window.innerWidth > 800 && window.innerWidth <= 1200) {
        video1.style.width = "280px";
        video2.style.width = "500px";
      }
      });
}